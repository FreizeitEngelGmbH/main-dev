import { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send, Bot, User, Star, Sparkles, ChevronDown, Zap, Shield, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface AISupportWidgetProps {
  context?: {
    partnerName?: string;
    city?: string;
    category?: string;
  };
}

const quickActions = [
  { label: "Wie buche ich?", icon: Zap },
  { label: "Stornierung", icon: Clock },
  { label: "Zahlungsmethoden", icon: Shield },
  { label: "Gruppenrabatte", icon: Star },
];

export function AISupportWidget({ context }: AISupportWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).slice(2)}`);
  const [showRating, setShowRating] = useState(false);
  const [rated, setRated] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMsg: Message = { role: "user", content: text.trim(), timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/support/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, message: text.trim(), context }),
      });
      const data = await res.json();
      const botMsg: Message = { role: "assistant", content: data.reply, timestamp: new Date() };
      setMessages(prev => [...prev, botMsg]);

      if (data.escalated) {
        setTimeout(() => setShowRating(true), 2000);
      }
    } catch {
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "Entschuldige, es gab ein technisches Problem. Bitte versuche es erneut oder kontaktiere uns unter support@freizeitplus.de",
        timestamp: new Date(),
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRate = async (rating: number) => {
    setRated(true);
    try {
      await fetch("/api/support/end", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, satisfaction: rating }),
      });
    } catch {}
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full shadow-lg shadow-blue-500/30 flex items-center justify-center text-white hover:shadow-xl hover:scale-110 transition-all duration-300 group"
        >
          <Bot className="h-6 w-6 group-hover:scale-110 transition-transform" />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full border-2 border-white animate-pulse" />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-[380px] max-w-[calc(100vw-2rem)] h-[560px] max-h-[calc(100vh-6rem)] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-5 py-4 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <Bot className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-white font-bold text-sm">FreizeitEngel Support</h3>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-emerald-400 rounded-full" />
                  <span className="text-white/70 text-xs">KI-Assistent online</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center transition-colors"
              >
                <ChevronDown className="h-4 w-4 text-white" />
              </button>
              <button
                onClick={() => { setIsOpen(false); setMessages([]); setShowRating(false); setRated(false); }}
                className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center transition-colors"
              >
                <X className="h-4 w-4 text-white" />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 bg-gray-50/50">
            {messages.length === 0 && (
              <div className="text-center py-6">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="h-8 w-8 text-indigo-500" />
                </div>
                <h4 className="font-bold text-gray-900 mb-1">Hallo! Ich bin Engel</h4>
                <p className="text-gray-500 text-sm mb-5">Dein KI-Assistent für alle Fragen rund um FreizeitEngel. Wie kann ich dir helfen?</p>
                <div className="grid grid-cols-2 gap-2">
                  {quickActions.map((action) => {
                    const Icon = action.icon;
                    return (
                      <button
                        key={action.label}
                        onClick={() => sendMessage(action.label)}
                        className="flex items-center gap-2 px-3 py-2.5 bg-white rounded-xl border border-gray-100 text-sm text-gray-700 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 transition-all text-left"
                      >
                        <Icon className="h-3.5 w-3.5 flex-shrink-0" />
                        <span className="text-xs font-medium">{action.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {messages.map((msg, idx) => (
              <div key={idx} className={`flex gap-2.5 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                {msg.role === "assistant" && (
                  <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Bot className="h-3.5 w-3.5 text-white" />
                  </div>
                )}
                <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                  msg.role === "user"
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-br-md"
                    : "bg-white text-gray-800 border border-gray-100 shadow-sm rounded-bl-md"
                }`}>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                  <span className={`text-[10px] mt-1 block ${msg.role === "user" ? "text-white/60" : "text-gray-400"}`}>
                    {msg.timestamp.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
                {msg.role === "user" && (
                  <div className="w-7 h-7 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <User className="h-3.5 w-3.5 text-gray-600" />
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-2.5">
                <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Bot className="h-3.5 w-3.5 text-white" />
                </div>
                <div className="bg-white rounded-2xl rounded-bl-md px-4 py-3 border border-gray-100 shadow-sm">
                  <div className="flex gap-1.5">
                    <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}

            {showRating && !rated && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center">
                <p className="text-sm text-gray-600 mb-2">Wie zufrieden bist du mit dem Support?</p>
                <div className="flex gap-1 justify-center">
                  {[1, 2, 3, 4, 5].map(r => (
                    <button key={r} onClick={() => handleRate(r)} className="p-1 hover:scale-125 transition-transform">
                      <Star className="h-6 w-6 text-amber-400 hover:fill-amber-400" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {rated && (
              <div className="bg-emerald-50 rounded-2xl border border-emerald-100 p-3 text-center">
                <p className="text-sm text-emerald-700 font-medium">Danke für dein Feedback!</p>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-gray-100 p-3 bg-white flex-shrink-0">
            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Schreibe eine Nachricht..."
                disabled={isLoading}
                className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-300 focus:bg-white transition-all disabled:opacity-50"
              />
              <Button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl px-3 shadow-md disabled:opacity-50"
                size="sm"
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
            <div className="flex items-center justify-center gap-1 mt-2">
              <Sparkles className="h-3 w-3 text-gray-300" />
              <span className="text-[10px] text-gray-400">Powered by FreizeitEngel AI</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
