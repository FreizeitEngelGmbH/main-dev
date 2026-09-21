import { useState } from "react";
import { Send } from "lucide-react";
import { Card, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Textarea } from "../components/ui/textarea";
import { useDemoData } from "../context/demo-data-context";

export default function Messages() {
  const { messages, markMessageRead, replyToMessage } = useDemoData();
  const [selectedId, setSelectedId] = useState<number | null>(messages[0]?.id ?? null);
  const [draft, setDraft] = useState("");

  const selected = messages.find((m) => m.id === selectedId);

  function handleSelect(id: number) {
    setSelectedId(id);
    setDraft("");
    markMessageRead(id);
  }

  function handleSend() {
    if (!selected) return;
    replyToMessage(selected.id);
    setDraft("");
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Nachrichten</h1>
        <p className="text-muted-foreground">
          {messages.filter((m) => m.unread).length} ungelesen von {messages.length}
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
        <Card className="h-fit lg:sticky lg:top-20">
          <CardContent className="divide-y divide-border p-0">
            {messages.map((m) => (
              <button
                key={m.id}
                onClick={() => handleSelect(m.id)}
                className={`block w-full px-4 py-3 text-left transition-colors ${
                  selectedId === m.id ? "bg-primary/5" : "hover:bg-secondary/40"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className={`truncate text-sm ${m.unread ? "font-semibold text-foreground" : "font-medium text-foreground/80"}`}>
                    {m.customerName}
                  </span>
                  {m.unread && <span className="h-2 w-2 flex-shrink-0 rounded-full bg-primary" />}
                </div>
                <div className="truncate text-xs text-muted-foreground">{m.subject}</div>
              </button>
            ))}
          </CardContent>
        </Card>

        {selected ? (
          <Card>
            <CardContent className="space-y-4 p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-base font-semibold text-foreground">{selected.subject}</h2>
                  <p className="text-sm text-muted-foreground">
                    {selected.customerName} ·{" "}
                    {new Date(selected.date).toLocaleString("de-DE", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
                <Badge variant={selected.status === "answered" ? "success" : selected.status === "in_progress" ? "warning" : "secondary"}>
                  {selected.status === "answered" ? "Beantwortet" : selected.status === "in_progress" ? "In Bearbeitung" : "Neu"}
                </Badge>
              </div>

              <p className="rounded-lg bg-secondary/50 p-4 text-sm leading-relaxed text-foreground">
                {selected.body}
              </p>

              <div className="space-y-2 pt-2">
                <Textarea
                  placeholder="Antwort schreiben…"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                />
                <div className="flex justify-end">
                  <Button onClick={handleSend} disabled={!draft.trim()}>
                    <Send className="h-4 w-4" />
                    Antwort senden
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-10 text-center text-muted-foreground">
              Wähle eine Nachricht aus.
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
