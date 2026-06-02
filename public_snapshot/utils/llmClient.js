// Portfolio snapshot LLM adapter.
//
// In the public repo we keep the interface (streaming chat) but remove any real
// prompts, model selection, and provider credentials.

function asText(value) {
  return typeof value === "string" ? value : String(value ?? "");
}

/**
 * Creates an LLM client with the minimal compat surface used by this repo:
 * - client.chats.create({ model, config }).sendMessageStream({ message })
 */
export function createLLMClient() {
  return {
    chats: {
      create({ model }) {
        const chosenModel = asText(model || getDefaultModelName());
        return {
          async *sendMessageStream({ message }) {
            const _ignored = asText(message);
            yield {
              text:
                `【PORTFOLIO STUB】(model=${chosenModel}) ข้อความนี้เป็นผลลัพธ์จำลอง ` +
                `เพื่อโชว์การไหลของระบบ (ไม่มีการเรียก LLM จริง และไม่มี prompt จริงใน repo สาธารณะ)`,
            };
          },
        };
      },
    },
  };
}

export function getDefaultModelName() {
  return process.env.LLM_MODEL || "portfolio-stub-model";
}

export const generationConfig = {
  maxOutputTokens: 256,
  temperature: 0,
  topP: 1,
  seed: 0,
  systemInstruction: {
    parts: [{ text: "[SYSTEM_PROMPT_REDACTED_FOR_PORTFOLIO]" }],
  },
};

export const defaultLLMClient = createLLMClient();
export const defaultModelName = getDefaultModelName();
