import { useState, useEffect } from "react";
import { fetchLeetCodeQuestionsByTag, LeetCodeQuestion } from "../data/leetcodeCommunityApi";

const TAGS = [
  { slug: "array", label: "Array" },
  { slug: "string", label: "String" },
  { slug: "hash-table", label: "Hash Table" },
  { slug: "dynamic-programming", label: "Dynamic Programming" },
  { slug: "math", label: "Math" },
  { slug: "sorting", label: "Sorting" },
  { slug: "greedy", label: "Greedy" },
  { slug: "tree", label: "Tree" },
  { slug: "binary-search", label: "Binary Search" },
  { slug: "graph", label: "Graph" },
  { slug: "two-pointers", label: "Two Pointers" },
  { slug: "stack", label: "Stack" },
  { slug: "heap-priority-queue", label: "Heap" },
  { slug: "backtracking", label: "Backtracking" },
  { slug: "sliding-window", label: "Sliding Window" },
  // ...add more as needed
];

export type LeetCodeProblem = {
  id: string;
  title: string;
  url: string;
  solved: boolean;
};

export default function Playlist({ onSolvedChange }: { onSolvedChange?: (solved: string[]) => void }) {
  const [problems, setProblems] = useState<LeetCodeProblem[]>([]);
  const [category, setCategory] = useState(TAGS[0].slug);
  const [categoryQuestions, setCategoryQuestions] = useState<LeetCodeQuestion[]>([]);
  const [loading, setLoading] = useState(false);

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("leetcodePlaylist");
    if (saved) setProblems(JSON.parse(saved));
  }, []);

  // Save to localStorage and notify parent of solved changes
  useEffect(() => {
    localStorage.setItem("leetcodePlaylist", JSON.stringify(problems));
    if (onSolvedChange) {
      onSolvedChange(problems.filter(p => p.solved).map(p => p.id));
    }
  }, [problems, onSolvedChange]);

  // Fetch questions for selected category
  useEffect(() => {
    setLoading(true);
    fetchLeetCodeQuestionsByTag(category)
      .then(setCategoryQuestions)
      .finally(() => setLoading(false));
  }, [category]);

  const addProblem = (q: LeetCodeQuestion) => {
    if (problems.some(p => p.id === q.id)) return;
    setProblems([...problems, { id: q.id, title: q.title, url: q.url, solved: false }]);
  };

  const toggleSolved = (id: string) => {
    setProblems(problems => problems.map(p => p.id === id ? { ...p, solved: !p.solved } : p));
  };

  const removeSolved = () => {
    setProblems(problems => problems.filter(p => !p.solved));
  };

  const openProblem = (url: string) => {
    window.open(url, "_blank");
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-white/5 backdrop-blur-2xl rounded-2xl shadow-lg border border-[#232536]/50 p-6 flex flex-col gap-6">
      <h2 className="text-xl font-bold text-[#7fd7ff] mb-2 tracking-widest" style={{fontFamily: 'Orbitron, sans-serif'}}>LeetCode Playlist</h2>
      <div>
        <label className="block text-[#7fd7ff] font-semibold mb-1">Browse by Category:</label>
        <select
          className="w-full px-3 py-2 rounded-lg bg-[#181e2a] text-[#7fd7ff] border border-[#232536]/60 focus:outline-none focus:ring-2 focus:ring-[#43cea2] mb-2"
          value={category}
          onChange={e => setCategory(e.target.value)}
        >
          {TAGS.map(tag => (
            <option key={tag.slug} value={tag.slug}>{tag.label}</option>
          ))}
        </select>
        <div className="max-h-64 overflow-y-auto bg-[#10131a]/60 rounded-lg p-2 border border-[#232536]/40">
          {loading ? (
            <div className="text-[#43cea2] text-center py-4">Loading questions...</div>
          ) : (
            categoryQuestions.length === 0 ? (
              <div className="text-[#7fd7ff]/60 text-center py-4">No questions found for this category.</div>
            ) : (
              <ul className="divide-y divide-[#232536]/30">
                {categoryQuestions.slice(0, 50).map(q => (
                  <li key={q.id} className="flex items-center gap-2 py-1">
                    <span className="flex-1 text-[#7fd7ff] text-sm cursor-pointer hover:underline" onClick={() => openProblem(q.url)}>{q.title}</span>
                    <button
                      className="px-2 py-1 text-xs bg-[#232536] text-[#43cea2] rounded hover:bg-[#185a9d]"
                      onClick={() => addProblem(q)}
                      disabled={problems.some(p => p.id === q.id)}
                    >{problems.some(p => p.id === q.id) ? "Added" : "Add"}</button>
                  </li>
                ))}
              </ul>
            )
          )}
        </div>
      </div>
      <div>
        <div className="flex justify-between items-center mb-1">
          <span className="block text-[#7fd7ff] font-semibold">Your Playlist</span>
          <button
            className="px-3 py-1 text-xs bg-[#232536] text-[#ff7f7f] rounded hover:bg-[#185a9d]"
            onClick={removeSolved}
            disabled={problems.every(p => !p.solved)}
          >Remove Completed</button>
        </div>
        <div className="max-h-64 overflow-y-auto bg-[#10131a]/60 rounded-lg p-2 border border-[#232536]/40">
          {problems.length === 0 ? (
            <div className="text-[#7fd7ff]/60 text-center py-4">No problems in your playlist.</div>
          ) : (
            <ul className="divide-y divide-[#232536]/30">
              {problems.map(p => (
                <li key={p.id} className="flex items-center gap-2 py-1">
                  <input type="checkbox" checked={p.solved} onChange={() => toggleSolved(p.id)} />
                  <span className={`flex-1 text-[#7fd7ff] text-sm cursor-pointer hover:underline ${p.solved ? 'line-through opacity-60' : ''}`} onClick={() => openProblem(p.url)}>{p.title}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
