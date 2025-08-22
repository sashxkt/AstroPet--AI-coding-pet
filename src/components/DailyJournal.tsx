import { useEffect, useState, useMemo } from "react";

export type JournalEntry = {
  date: string;
  problems: string[];
  notes: string;
};

export interface DailyJournalProps {
  solvedToday: string[];
  selectedDate?: Date | null;
}

export default function DailyJournal({ solvedToday, selectedDate }: DailyJournalProps) {
  const [notes, setNotes] = useState("");
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const today = useMemo(() => (selectedDate ? new Date(selectedDate) : new Date()).toISOString().slice(0, 10), [selectedDate]);

  useEffect(() => {
    const saved = localStorage.getItem("leetcodeJournal");
    if (saved) setEntries(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("leetcodeJournal", JSON.stringify(entries));
  }, [entries]);

  useEffect(() => {
    // Auto-log solved problems for today
    if (solvedToday.length > 0) {
      setEntries(prev => {
        const existing = prev.find(e => e.date === today);
        if (existing) {
          return prev.map(e => e.date === today ? { ...e, problems: solvedToday } : e);
        } else {
          return [...prev, { date: today, problems: solvedToday, notes: "" }];
        }
      });
    }
  }, [solvedToday, today]);

  const saveNotes = () => {
    setEntries(prev => prev.map(e => e.date === today ? { ...e, notes } : e));
  };

  const todayEntry = entries.find(e => e.date === today);

  return (
    <div className="w-full max-w-2xl mx-auto bg-white/5 backdrop-blur-2xl rounded-2xl shadow-lg border border-[#232536]/50 p-6 flex flex-col gap-4">
      <h2 className="text-xl font-bold text-[#7fd7ff] mb-2 tracking-widest" style={{fontFamily: 'Orbitron, sans-serif'}}>Daily Journal</h2>
      <div className="text-[#43cea2] text-sm mb-2">Solved today: {todayEntry?.problems.length || 0}</div>
      <textarea
        className="w-full min-h-[60px] bg-[#181e2a] text-[#7fd7ff] border border-[#232536]/60 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-[#43cea2] shadow-inner resize-none font-mono text-sm"
        placeholder="Add your notes for today..."
        value={todayEntry?.notes || notes}
        onChange={e => setNotes(e.target.value)}
        onBlur={saveNotes}
      />
      <div className="text-xs text-[#7fd7ff] mt-2">{today}</div>
    </div>
  );
}
