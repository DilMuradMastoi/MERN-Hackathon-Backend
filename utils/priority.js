export const calculatePriority = (upvotes, createdAt) => {
  const daysSinceCreated = Math.max(
    0,
    Math.floor((Date.now() - new Date(createdAt).getTime()) / (1000*60*60*24))
  );
  const score = (upvotes || 0) * 2 + daysSinceCreated;
  if (score < 5) return {score, priority:"Low"};
  if (score <= 15) return {score, priority:"Medium"};
  if (score <= 30) return {score, priority:"High"};
  return {score, priority:"Critical"};
};
