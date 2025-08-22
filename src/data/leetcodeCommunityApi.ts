// Community API fetcher for LeetCode questions by type/tag
// Example API: https://leetcode-api-faisalshohag.vercel.app/problems/all
// Docs: https://github.com/faisal-shohag/leetcode-api

import mockQuestions from "./leetcodeMockQuestions.json";

export type LeetCodeQuestion = {
  id: string;
  title: string;
  titleSlug: string;
  difficulty: string;
  tags: string[];
  url: string;
};

export async function fetchLeetCodeQuestionsByTag(tag: string): Promise<LeetCodeQuestion[]> {
  try {
    const res = await fetch("https://leetcode-api-faisalshohag.vercel.app/problems/all");
    if (!res.ok) throw new Error("API down");
    const data = await res.json();
    return data.stat_status_pairs
      .filter((q: { topicTags: { slug: string }[] }) => q.topicTags.some((t: { slug: string }) => t.slug === tag))
      .map((q: { stat: { question_id: number, question__title: string, question__title_slug: string }, difficulty: { level: number }, topicTags: { slug: string }[] }) => ({
        id: q.stat.question_id.toString(),
        title: q.stat.question__title,
        titleSlug: q.stat.question__title_slug,
        difficulty: q.difficulty.level === 1 ? "Easy" : q.difficulty.level === 2 ? "Medium" : "Hard",
        tags: q.topicTags.map((t: { slug: string }) => t.slug),
        url: `https://leetcode.com/problems/${q.stat.question__title_slug}/`,
      }));
  } catch {
    // fallback to mock data
    return (mockQuestions as LeetCodeQuestion[]).filter((q) => q.tags.includes(tag));
  }
}
