// Portfolio snapshot RAG module.
//
// The original repository implemented a full RAG pipeline (DB lookup + embedding
// similarity + prompt assembly + generative reformulation).
//
// For a public portfolio repo we keep the same exported surface area used by the
// app, but remove:
// - real prompt templates / system instructions
// - real FAQ content / keyword maps
// - schema-specific SQL
// - verbose logs that could leak user data

import {
  defaultLLMClient,
  defaultModelName,
  generationConfig,
} from "./llmClient.js";

// Re-exports so index.js can keep the same imports.
export {
  defaultLLMClient as vertexAI,
  defaultModelName as modelName,
  generationConfig,
};

export async function searchRelevantContextForFeedback(_prompt, _opts = {}) {
  return {
    contextText: "",
    confidence: 0,
    source: "portfolio_stub",
  };
}

// In the original system this validated that the model output mentioned specific
// EF skills. For the snapshot we keep the function signature but do not enforce
// any domain-specific constraints.
export function validateEFSkillsInResponse(text, _expectedEfSkills = null) {
  return typeof text === "string" ? text : String(text ?? "");
}

export async function getRagFeedback(
  prompt,
  _dayNumber = null,
  _weekNumber = null,
  _questionOrder = null,
  _subQuestionId = null,
  _subOrder = null,
) {
  const safePrompt = typeof prompt === "string" ? prompt : String(prompt ?? "");
  const chat = defaultLLMClient.chats.create({
    model: defaultModelName,
    config: generationConfig,
  });

  // We intentionally do not return the prompt or any extracted content.
  let result = "";
  for await (const chunk of chat.sendMessageStream({ message: safePrompt })) {
    if (chunk?.text) result += chunk.text;
  }
  return (
    result ||
    "【PORTFOLIO STUB】RAG feedback is disabled in this public snapshot."
  );
}
