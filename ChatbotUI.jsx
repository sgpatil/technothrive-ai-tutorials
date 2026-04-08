import { useEffect, useRef, useState } from "react";

/**
 * ChatbotUI Props (Configurable Parameters)
 * --------------------------------------------------
 * position: "left" | "right" | "top" | "bottom" | "left-top" | "left-bottom" | "right-top" | "right-bottom"
 * primaryColor: "auto" | "#hexcolor"
 * welcomeMessage: string
 * apiEndpoint: string (backend URL)
 * botName: string
 * placeholder: string
 * maxWidth: number (px)
 */

export default function ChatbotUI({
  position = "right-bottom",
  primaryColor = "auto",
  welcomeMessage = "Hi 👋 How can I help you today?",
  apiEndpoint = "",
  botName = "Chatbot",
  placeholder = "Type your message…",
  maxWidth = 360
}) {
  const [messages, setMessages] = useState([
    { role: "bot", text: welcomeMessage }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  /** Auto scroll */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /** Detect parent website color if auto */
  const resolvedColor =
    primaryColor === "auto"
      ? getComputedStyle(document.documentElement)
          .getPropertyValue("--primary-color") || "#2563eb"
      : primaryColor;

  /** Position styles */
  const positionStyles = {
    "left": "left-4 top-1/2 -translate-y-1/2",
    "right": "right-4 top-1/2 -translate-y-1/2",
    "top": "top-4 left-1/2 -translate-x-1/2",
    "bottom": "bottom-4 left-1/2 -translate-x-1/2",
    "left-top": "left-4 top-4",
    "left-bottom": "left-4 bottom-4",
    "right-top": "right-4 top-4",
    "right-bottom": "right-4 bottom-4"
  };

  /** Send message */
  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { role: "user", text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");

    if (!apiEndpoint) {
      setMessages(prev => [...prev, { role: "bot", text: "No API configured." }]);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(apiEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input })
      });

      const data = await res.json();
      setMessages(prev => [...prev, { role: "bot", text: data.reply || "No response" }]);
    } catch (err) {
      console.log("err", err);
      setMessages(prev => [...prev, { role: "bot", text: "Something went wrong." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`fixed z-50 ${positionStyles[position]}`}
      style={{ width: maxWidth }}
    >
      <div className="bg-white rounded-2xl shadow-xl flex flex-col overflow-hidden">
        {/* Header */}
        <div
          className="p-4 text-white font-semibold"
          style={{ backgroundColor: resolvedColor }}
        >
          {botName}
        </div>

        {/* Messages */}
        <div className="flex-1 p-4 space-y-3 overflow-y-auto text-sm">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className="px-4 py-2 rounded-2xl max-w-xs"
                style={{
                  backgroundColor: msg.role === "user" ? resolvedColor : "#e5e7eb",
                  color: msg.role === "user" ? "white" : "#111827"
                }}
              >
                {msg.text}
              </div>
            </div>
          ))}
          {loading && <div className="text-gray-400">Typing…</div>}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-3 border-t flex gap-2">
          <input
            className="flex-1 border rounded-xl px-3 py-2 focus:outline-none"
            placeholder={placeholder}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && sendMessage()}
          />
          <button
            onClick={sendMessage}
            className="px-4 rounded-xl text-white"
            style={{ backgroundColor: resolvedColor }}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
