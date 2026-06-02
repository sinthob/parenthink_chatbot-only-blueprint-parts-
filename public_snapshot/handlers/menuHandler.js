// handlers/menuHandler.js (portfolio snapshot)

const MENU_COMMANDS = new Set([
  "เกี่ยวกับโปรแกรม",
  "ปฏิทินกิจกรรม",
  "ขั้นตอนการวิจัย",
  "ติดต่อเรา",
]);

export async function handleMenu({ stage, event, user, userMessage, client }) {
  const msg = String(userMessage || "").trim();
  if (!msg) return null;

  if (stage === "buttons") {
    // Menu/info buttons should not interrupt in-progress activities.
    if (user?.is_in_activity) return null;

    if (MENU_COMMANDS.has(msg)) {
      return await client.replyMessage(event.replyToken, {
        type: "text",
        text: "【PORTFOLIO STUB】ข้อมูลเมนูนี้ถูกย่อ/ปิดบังสำหรับ repo สาธารณะค่ะ",
      });
    }

    return null;
  }

  if (stage === "fallback") {
    // Fallback "choose menu" message.
    const quickReplies = [
      {
        type: "action",
        action: {
          type: "message",
          label: "เกี่ยวกับโปรแกรม",
          text: "เกี่ยวกับโปรแกรม",
        },
      },
      {
        type: "action",
        action: {
          type: "message",
          label: "ปฏิทินกิจกรรม",
          text: "ปฏิทินกิจกรรม",
        },
      },
      {
        type: "action",
        action: {
          type: "message",
          label: "ขั้นตอนการวิจัย",
          text: "ขั้นตอนการวิจัย",
        },
      },
      {
        type: "action",
        action: { type: "message", label: "ติดต่อเรา", text: "ติดต่อเรา" },
      },
    ];

    if (user?.is_admin) {
      quickReplies.push({
        type: "action",
        action: {
          type: "message",
          label: "เลือกวันทำกิจกรรม",
          text: "เลือกวันทำกิจกรรม",
        },
      });
    }

    return await client.replyMessage(event.replyToken, {
      type: "text",
      text: "【PORTFOLIO STUB】สวัสดีค่ะ กรุณาเลือกเมนูที่ต้องการค่ะ",
      quickReply: { items: quickReplies },
    });
  }

  return null;
}
