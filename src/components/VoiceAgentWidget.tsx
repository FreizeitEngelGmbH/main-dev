import { useEffect, useRef, useState } from "react";
import { Mic, MicOff, Phone, PhoneOff, X, Sparkles, Loader2 } from "lucide-react";

type CallState = "idle" | "connecting" | "active" | "ended" | "error";

interface TranscriptLine {
  role: "user" | "assistant";
  text: string;
  ts: number;
}

export function VoiceAgentWidget() {
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<CallState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [muted, setMuted] = useState(false);
  const [transcript, setTranscript] = useState<TranscriptLine[]>([]);
  const [agentSpeaking, setAgentSpeaking] = useState(false);
  const [seconds, setSeconds] = useState(0);

  const pcRef = useRef<RTCPeerConnection | null>(null);
  const dcRef = useRef<RTCDataChannel | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const audioElRef = useRef<HTMLAudioElement | null>(null);
  const sessionIdRef = useRef<string>("");
  const startTsRef = useRef<number>(0);
  const timerRef = useRef<any>(null);
  const partialUserRef = useRef<string>("");
  const partialAssistantRef = useRef<string>("");

  useEffect(() => () => { void hangup(); }, []);

  function pushLine(role: "user" | "assistant", text: string) {
    setTranscript(prev => [...prev, { role, text, ts: Date.now() }]);
    fetch("/api/voice-agent/transcript", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId: sessionIdRef.current, role, text }),
    }).catch(() => {});
  }

  async function handleToolCall(callId: string, name: string, argsJson: string) {
    let args: any = {};
    try { args = JSON.parse(argsJson || "{}"); } catch {}
    let result: any;
    try {
      const r = await fetch("/api/voice-agent/tool", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: sessionIdRef.current, name, args }),
      });
      const data = await r.json();
      result = data.result ?? { error: data.error };
    } catch (e: any) {
      result = { error: e.message || "Tool-Fehler" };
    }
    const dc = dcRef.current;
    if (dc && dc.readyState === "open") {
      dc.send(JSON.stringify({
        type: "conversation.item.create",
        item: {
          type: "function_call_output",
          call_id: callId,
          output: JSON.stringify(result),
        },
      }));
      dc.send(JSON.stringify({ type: "response.create" }));
    }
  }

  function handleServerEvent(evt: any) {
    switch (evt.type) {
      case "response.audio_transcript.delta":
        partialAssistantRef.current += evt.delta || "";
        break;
      case "response.audio_transcript.done":
        if (partialAssistantRef.current.trim()) {
          pushLine("assistant", partialAssistantRef.current.trim());
        }
        partialAssistantRef.current = "";
        break;
      case "conversation.item.input_audio_transcription.completed":
        if (evt.transcript?.trim()) pushLine("user", evt.transcript.trim());
        break;
      case "response.audio.delta":
        setAgentSpeaking(true);
        break;
      case "response.audio.done":
      case "response.done":
        setAgentSpeaking(false);
        break;
      case "response.function_call_arguments.done":
        void handleToolCall(evt.call_id, evt.name, evt.arguments);
        break;
      case "error":
        console.error("Realtime error:", evt);
        setError(evt.error?.message || "Realtime-Fehler");
        break;
    }
  }

  async function startCall() {
    setError(null);
    setTranscript([]);
    setState("connecting");
    try {
      // 1. Get ephemeral session
      const sessRes = await fetch("/api/voice-agent/session", { method: "POST" });
      if (!sessRes.ok) {
        const j = await sessRes.json().catch(() => ({}));
        throw new Error(j.error || "Sitzung konnte nicht gestartet werden");
      }
      const sess = await sessRes.json();
      sessionIdRef.current = sess.sessionId;
      if (!sess.clientSecret) throw new Error("Kein Client-Secret erhalten");

      // 2. Mic
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      localStreamRef.current = stream;

      // 3. Peer connection
      const pc = new RTCPeerConnection();
      pcRef.current = pc;

      pc.ontrack = (e) => {
        if (audioElRef.current) {
          audioElRef.current.srcObject = e.streams[0];
          audioElRef.current.play().catch(() => {});
        }
      };

      stream.getTracks().forEach(t => pc.addTrack(t, stream));

      // 4. Data channel for events
      const dc = pc.createDataChannel("oai-events");
      dcRef.current = dc;
      dc.addEventListener("message", (e) => {
        try { handleServerEvent(JSON.parse(e.data)); } catch {}
      });
      dc.addEventListener("open", () => {
        // Kick off the greeting
        dc.send(JSON.stringify({ type: "response.create" }));
      });

      // 5. SDP handshake with OpenAI
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      const sdpRes = await fetch(`https://api.openai.com/v1/realtime/calls?model=${encodeURIComponent(sess.model)}`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${sess.clientSecret}`,
          "Content-Type": "application/sdp",
        },
        body: offer.sdp || "",
      });
      if (!sdpRes.ok) {
        const txt = await sdpRes.text();
        throw new Error("OpenAI-Verbindung fehlgeschlagen: " + txt.slice(0, 200));
      }
      const answer = { type: "answer" as const, sdp: await sdpRes.text() };
      await pc.setRemoteDescription(answer);

      setState("active");
      startTsRef.current = Date.now();
      timerRef.current = setInterval(() => {
        setSeconds(Math.floor((Date.now() - startTsRef.current) / 1000));
      }, 1000);
    } catch (e: any) {
      console.error(e);
      setError(e.message || "Verbindung fehlgeschlagen");
      setState("error");
      void hangup(true);
    }
  }

  async function hangup(silent = false) {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    try { dcRef.current?.close(); } catch {}
    try { pcRef.current?.close(); } catch {}
    try { localStreamRef.current?.getTracks().forEach(t => t.stop()); } catch {}
    dcRef.current = null;
    pcRef.current = null;
    localStreamRef.current = null;

    if (sessionIdRef.current && !silent) {
      const duration = startTsRef.current ? Math.floor((Date.now() - startTsRef.current) / 1000) : 0;
      fetch("/api/voice-agent/end", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: sessionIdRef.current, durationSeconds: duration }),
      }).catch(() => {});
    }
    if (!silent) setState("ended");
  }

  function toggleMute() {
    const stream = localStreamRef.current;
    if (!stream) return;
    const next = !muted;
    stream.getAudioTracks().forEach(t => t.enabled = !next);
    setMuted(next);
  }

  const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  return (
    <>
      <audio ref={audioElRef} autoPlay playsInline className="hidden" />

      {/* Floating launcher */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 left-6 z-50 flex items-center gap-2 pl-3 pr-4 py-3 rounded-full text-white shadow-xl hover:scale-105 transition-transform"
          style={{ background: "linear-gradient(135deg,#6C2BD9,#3D1A78)" }}
          data-testid="button-open-voice"
        >
          <span className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center">
            <Phone className="h-4 w-4" />
          </span>
          <span className="text-sm font-semibold">Mit Engel sprechen</span>
        </button>
      )}

      {/* Modal */}
      {open && (
        <div className="fixed bottom-6 left-6 z-50 w-[380px] max-w-[calc(100vw-2rem)] h-[560px] max-h-[calc(100vh-6rem)] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="px-5 py-4 flex items-center justify-between flex-shrink-0" style={{ background: "linear-gradient(135deg,#6C2BD9,#3D1A78)" }}>
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-white" />
                {state === "active" && (
                  <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#3D1A78] ${agentSpeaking ? "bg-[#FFC83D] animate-pulse" : "bg-emerald-400"}`} />
                )}
              </div>
              <div>
                <h3 className="text-white font-bold text-sm">Engel – Voice-Assistent</h3>
                <p className="text-white/70 text-xs">
                  {state === "idle" && "Bereit zum Sprechen"}
                  {state === "connecting" && "Verbinde…"}
                  {state === "active" && (agentSpeaking ? "Engel spricht…" : `Im Gespräch · ${fmt(seconds)}`)}
                  {state === "ended" && "Gespräch beendet"}
                  {state === "error" && "Fehler"}
                </p>
              </div>
            </div>
            <button
              onClick={() => { void hangup(); setOpen(false); }}
              className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center"
            >
              <X className="h-4 w-4 text-white" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-4 py-4 bg-gray-50">
            {state === "idle" && (
              <div className="text-center pt-8 px-2">
                <div className="w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-4" style={{ background: "linear-gradient(135deg,#A78BFA,#6C2BD9)" }}>
                  <Phone className="h-9 w-9 text-white" />
                </div>
                <h4 className="font-bold text-gray-900 mb-2">Hallo! Ich bin Engel.</h4>
                <p className="text-sm text-gray-600 leading-relaxed mb-6">
                  Ich helfe dir gerne bei Fragen zu Kindergeburtstagen, Gruppenbuchungen, Buchungsstatus oder wie du Partner wirst.
                </p>
                <div className="grid grid-cols-2 gap-2 text-left mb-6">
                  {["🎂 Kindergeburtstag", "👥 Gruppenanfrage", "🎟️ Buchung prüfen", "🏪 Partner werden"].map(t => (
                    <div key={t} className="text-xs text-gray-700 bg-white rounded-lg px-3 py-2 border border-gray-200">{t}</div>
                  ))}
                </div>
                <p className="text-[11px] text-gray-400">Mikrofon-Zugriff wird einmalig abgefragt.</p>
              </div>
            )}

            {state === "connecting" && (
              <div className="text-center pt-16">
                <Loader2 className="h-10 w-10 animate-spin mx-auto text-[#6C2BD9] mb-3" />
                <p className="text-sm text-gray-600">Verbinde mit dem Voice-Assistenten…</p>
              </div>
            )}

            {(state === "active" || state === "ended") && (
              <div className="space-y-3">
                {transcript.length === 0 && state === "active" && (
                  <p className="text-center text-xs text-gray-400 py-4">Sprich einfach drauf los – Engel hört zu.</p>
                )}
                {transcript.map((line, i) => (
                  <div key={i} className={`flex ${line.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-sm ${
                      line.role === "user"
                        ? "bg-[#6C2BD9] text-white rounded-br-sm"
                        : "bg-white border border-gray-200 text-gray-800 rounded-bl-sm"
                    }`}>
                      {line.text}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {state === "error" && (
              <div className="text-center pt-12">
                <div className="w-14 h-14 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-3">
                  <PhoneOff className="h-6 w-6 text-red-600" />
                </div>
                <p className="text-sm text-red-700 font-medium mb-1">Verbindung fehlgeschlagen</p>
                <p className="text-xs text-red-600/80 px-4">{error}</p>
              </div>
            )}
          </div>

          {/* Footer / Controls */}
          <div className="border-t border-gray-100 p-3 bg-white flex items-center justify-center gap-3">
            {state === "idle" || state === "ended" || state === "error" ? (
              <button
                onClick={startCall}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full text-white font-semibold shadow"
                style={{ background: "linear-gradient(135deg,#6C2BD9,#3D1A78)" }}
                data-testid="button-start-call"
              >
                <Phone className="h-4 w-4" />
                {state === "ended" || state === "error" ? "Neu starten" : "Gespräch starten"}
              </button>
            ) : (
              <>
                <button
                  onClick={toggleMute}
                  className={`w-11 h-11 rounded-full flex items-center justify-center border ${muted ? "bg-gray-200 border-gray-300 text-gray-700" : "bg-white border-gray-200 text-[#6C2BD9]"}`}
                  data-testid="button-mute"
                >
                  {muted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                </button>
                <button
                  onClick={() => void hangup()}
                  className="w-12 h-12 rounded-full bg-red-600 text-white flex items-center justify-center hover:bg-red-700 shadow"
                  data-testid="button-hangup"
                >
                  <PhoneOff className="h-5 w-5" />
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
