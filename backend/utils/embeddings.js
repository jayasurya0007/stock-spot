//utils/embeddings.js

// Dummy embedding generator - replace with a real model in production
export function getEmbedding(query) {
  // This is a placeholder - in a real implementation, you would use a model like SentenceTransformers
  // For now, we'll generate a random 4-dimensional vector
  return Array.from({length: 4}, () => Math.random());
}