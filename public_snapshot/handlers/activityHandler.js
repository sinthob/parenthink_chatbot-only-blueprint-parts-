// handlers/activityHandler.js (portfolio snapshot)
//
// The private repo contains a large DB-backed activity state machine.
// This snapshot keeps only a minimal public-safe example.

import { safeReplyOrPush } from "../utils/lineClient.js";

export async function handleActivity({ event, userMessage, client }) {
  const msg = String(userMessage || "").trim();
  if (!msg) return null;

  if (msg === "เริ่มกิจกรรมวันนี้") {
    await safeReplyOrPush({
      client,
      event,
      replyToken: event?.replyToken,
      messages: {
        type: "text",
        text: "【PORTFOLIO STUB】เริ่มกิจกรรม (ตัวอย่าง) — ในระบบจริงจะโหลดคำถาม/บันทึกสถานะผ่าน DB",
      },
    });
    return true;
  }

  if (msg === "ทำต่อกิจกรรม") {
    await safeReplyOrPush({
      client,
      event,
      replyToken: event?.replyToken,
      messages: {
        type: "text",
        text: "【PORTFOLIO STUB】ทำต่อกิจกรรม (ตัวอย่าง)",
      },
    });
    return true;
  }

  return null;
}
