// Portfolio snapshot embedding client.
//
// The original project used a local embedding microservice. For the public
// snapshot we keep the interface but return deterministic pseudo-embeddings.

function normalizeText(text) {
  return (text || '').toString().trim().toLowerCase();
}

function hash32(str) {
  // FNV-1a 32-bit
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

function pseudoEmbedding(text, dim = 32) {
  const s = normalizeText(text);
  const seed = hash32(s);
  const out = new Array(dim);
  let x = seed || 1;
  for (let i = 0; i < dim; i++) {
    // xorshift32
    x ^= x << 13;
    x ^= x >>> 17;
    x ^= x << 5;
    // Map to [-1, 1]
    out[i] = ((x >>> 0) / 0xffffffff) * 2 - 1;
  }
  return out;
}

export async function getEmbeddings(texts) {
  const inputs = Array.isArray(texts) ? texts : [texts];
  return inputs.map((t) => pseudoEmbedding(t));
}

// Simple in-memory cache for static FAQ texts' embeddings
const embeddingCache = new Map(); // key: normalized text, value: number[]

function normalizeKey(text) {
  return (text || '').toString().trim().toLowerCase();
}

export async function getEmbeddingsCached(texts) {
  const inputs = Array.isArray(texts) ? texts : [texts];
  const results = new Array(inputs.length);

  // Collect misses and build unique set to fetch minimally
  const uniqueToFetch = [];
  const seen = new Set();
  const positionsByKey = new Map();

  inputs.forEach((t, idx) => {
    const key = normalizeKey(t);
    if (embeddingCache.has(key)) {
      results[idx] = embeddingCache.get(key);
    } else {
      if (!seen.has(key)) {
        seen.add(key);
        uniqueToFetch.push(t);
      }
      if (!positionsByKey.has(key)) positionsByKey.set(key, []);
      positionsByKey.get(key).push(idx);
    }
  });

  if (uniqueToFetch.length > 0) {
    const fetched = await getEmbeddings(uniqueToFetch);
    uniqueToFetch.forEach((t, i) => {
      const key = normalizeKey(t);
      const vec = Array.isArray(fetched[i]) ? fetched[i] : [];
      embeddingCache.set(key, vec);
      const positions = positionsByKey.get(key) || [];
      positions.forEach((pos) => {
        results[pos] = vec;
      });
    });
  }

  return results;
}

export function cosineSimilarity(vecA, vecB) {
  if (!Array.isArray(vecA) || !Array.isArray(vecB) || vecA.length === 0 || vecB.length === 0) {
    return 0;
  }
  const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
  const normA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
  const normB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
  return normA && normB ? dotProduct / (normA * normB) : 0;
}


export async function selectBestFaqByEmbedding(userObj, candidateFaqs) {
  // กรอง null/undefined/'' ออกจาก userAnswer และ user_answer
  const cleanFaqs = candidateFaqs.filter(faq => faq.user_answer !== null && faq.user_answer !== undefined && faq.user_answer !== '');
  const texts = [userObj.userAnswer, ...cleanFaqs.map(faq => faq.user_answer)].filter(x => x !== null && x !== undefined && x !== '');

  const embeddings = await getEmbeddingsCached(texts);

  // เช็คว่า embeddings ถูกต้อง
  if (!Array.isArray(embeddings) || embeddings.length < cleanFaqs.length + 1) {
    return cleanFaqs[0] || candidateFaqs[0];
  }

  const userVec = embeddings[0];
  let bestScore = -1;
  let bestFaq = cleanFaqs[0];
  for (let i = 0; i < cleanFaqs.length; i++) {
    const faqVec = embeddings[i + 1];
    if (!Array.isArray(userVec) || !Array.isArray(faqVec)) {
      continue;
    }
    const score = cosineSimilarity(userVec, faqVec);
    if (score > bestScore) {
      bestScore = score;
      bestFaq = cleanFaqs[i];
    }
  }
  return bestFaq;
}
