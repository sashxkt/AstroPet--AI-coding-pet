import { useState, useEffect } from "react";
import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { firebaseConfig } from "../firebaseConfig";
import ReactMarkdown from "react-markdown";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const SYSTEM_PROMPT = `You are an AI LeetCode/DSA study buddy. When a user asks a question about a coding problem, respond with a helpful hint first. If the user asks for more, provide a step-by-step explanation, and only give the full solution if explicitly requested. Always encourage learning and problem-solving, and never give away the answer immediately unless asked. Format hints as bullet points if possible.`;

export default function AIChat() {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [userProfile, setUserProfile] = useState<{ name: string; level: number; email: string } | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) return;
      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          setUserProfile(userDoc.data() as { name: string; level: number; email: string });
        } else {
          const name = user.displayName || user.email?.split("@")[0] || "User";
          const level = 1;
          await saveUserProfile(name, level);
        }
      } catch {}
    };
    fetchProfile();
  }, []);

  const sendMessage = async () => {
    if (!input.trim()) return;
    setMessages([...messages, { role: "user", content: input }]);
    setLoading(true);
    try {
      const res = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: input })
      });
      const data = await res.json();
      setMessages(msgs => [...msgs, { role: "ai", content: data.text || "[AI] Sorry, I couldn't fetch a response right now." }]);
    } catch {
      setMessages(msgs => [...msgs, { role: "ai", content: "[AI] Sorry, I couldn't fetch a response right now." }]);
    }
    setLoading(false);
    setInput("");
  };

  async function saveUserProfile(name: string, level: number) {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) return;
    try {
      await setDoc(doc(db, "users", user.uid), { name, level, email: user.email }, { merge: true });
      setUserProfile({ name, level, email: user.email || "" });
    } catch {
      alert("Failed to save user profile. Check the console for details.");
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto bg-white/5 backdrop-blur-2xl rounded-2xl shadow-lg border border-[#232536]/50 p-6 flex flex-col gap-4">
      <h2 className="text-xl font-bold text-[#7fd7ff] mb-2 tracking-widest" style={{fontFamily: 'Orbitron, sans-serif'}}>
        AI Study Buddy
        {userProfile && (
          <span className="block text-xs font-normal text-[#43cea2] mt-1">{userProfile.name} (Level {userProfile.level})</span>
        )}
      </h2>
      <div className="flex-1 min-h-[120px] max-h-60 overflow-y-auto bg-[#181e2a] rounded-lg p-3 mb-2">
        {messages.length === 0 && <div className="text-[#7fd7ff]/60 text-sm">Ask for hints, explanations, or solutions!</div>}
        {messages.map((msg, i) => (
          msg.role === 'ai' ? (
            <div key={i} className="mb-2 text-sm text-[#7fd7ff] text-left prose prose-invert prose-a:text-[#43cea2] prose-pre:bg-[#10131a] prose-code:bg-[#232536] prose-code:text-[#43cea2]">
              <ReactMarkdown>{msg.content}</ReactMarkdown>
            </div>
          ) : (
            <div key={i} className="mb-2 text-sm text-[#43cea2] text-right">{msg.content}</div>
          )
        ))}
        {loading && <div className="text-[#43cea2] text-xs animate-pulse">AI is thinking...</div>}
      </div>
      <div className="flex gap-2">
        <input
          className="flex-1 px-3 py-2 rounded-lg bg-[#181e2a] text-[#7fd7ff] border border-[#232536]/60 focus:outline-none focus:ring-2 focus:ring-[#43cea2]"
          placeholder="Ask a question about a problem..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') sendMessage(); }}
        />
        <button
          className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#43cea2] to-[#185a9d] text-white font-bold shadow-md hover:from-[#185a9d] hover:to-[#43cea2] transition-colors"
          onClick={sendMessage}
          disabled={loading}
        >Send</button>
      </div>
    </div>
  );
}
