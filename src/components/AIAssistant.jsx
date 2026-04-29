"use client";
import { useState } from "react";
import { Send, Mic, Maximize2, Sparkles } from "lucide-react";

const suggestions = [
  "Show revenue trend",
  "Top churned members",
  "Best performing gym",
];

export default function AIAssistant() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    {
      role: "ai",
      text: "Hi! I'm your AI assistant. Ask me anything about your gym platform.",
    },
  ]);

  const send = () => {
    if (!input.trim()) return;
    setMessages((prev) => [
      ...prev,
      { role: "user", text: input },
      {
        role: "ai",
        text: "I'm analyzing your platform data. This feature will connect to your backend analytics engine.",
      },
    ]);
    setInput("");
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col">
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Sparkles size={13} className="text-white" />
          </div>
          <p className="text-sm font-semibold text-gray-800">AI Assistant</p>
        </div>
        <button className="text-gray-400 hover:text-gray-600">
          <Maximize2 size={15} />
        </button>
      </div>

      {/* Orb */}
      <div className="flex justify-center py-5">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 via-blue-600 to-purple-600 shadow-lg shadow-blue-200 animate-pulse" />
      </div>

      {/* Messages */}
      <div className="px-4 pb-2 space-y-2 max-h-28 overflow-y-auto">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`text-xs px-3 py-2 rounded-lg max-w-[90%] ${
              msg.role === "ai"
                ? "bg-gray-50 text-gray-600 self-start"
                : "bg-blue-600 text-white ml-auto"
            }`}
          >
            {msg.text}
          </div>
        ))}
      </div>

      {/* Suggestions */}
      <div className="px-4 py-2 flex gap-1.5 flex-wrap">
        {suggestions.map((s) => (
          <button
            key={s}
            onClick={() => setInput(s)}
            className="text-[10px] px-2 py-1 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 transition-colors font-medium"
          >
            {s}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="px-4 pb-4">
        <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="Ask me anything..."
            className="flex-1 text-xs bg-transparent outline-none text-gray-700 placeholder:text-gray-400"
          />
          <button className="text-gray-400 hover:text-gray-600">
            <Mic size={14} />
          </button>
          <button
            onClick={send}
            className="w-6 h-6 bg-blue-600 rounded-lg flex items-center justify-center hover:bg-blue-700 transition-colors"
          >
            <Send size={11} className="text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}
