// handlers/adminHandler.js (portfolio snapshot)

export async function handleAdmin({ event, user, userMessage, client }) {
  const msg = String(userMessage || "").trim();
  if (!msg) return null;

  if (msg !== "เลือกวันทำกิจกรรม") return null;

  if (!user?.is_admin) {
    return await client.replyMessage(event.replyToken, {
      type: "text",
      text: "【PORTFOLIO STUB】เมนูนี้สำหรับผู้ดูแลระบบเท่านั้นค่ะ",
    });
  }

  return await client.replyMessage(event.replyToken, {
    type: "text",
    text: "【PORTFOLIO STUB】Admin flow ถูกย่อ/ปิดบังใน repo สาธารณะค่ะ",
  });
}
