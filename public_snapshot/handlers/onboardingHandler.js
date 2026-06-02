// handlers/onboardingHandler.js (portfolio snapshot)
//
// The private repo performs DB-backed onboarding with multiple steps.
// This public snapshot keeps only a minimal shape to demonstrate control flow.

export async function handleOnboarding({ event, isTextMessage, userMessage, client }) {
  if (!event) return null;

  if (event.type === 'follow') {
    return await client.replyMessage(event.replyToken, {
      type: 'text',
      text: '【PORTFOLIO STUB】ขอบคุณที่เพิ่มเพื่อนค่ะ (ระบบตัวอย่าง)'
    });
  }

  if (!isTextMessage) return null;

  const msg = String(userMessage || '').trim();
  if (!msg) return null;

  if (msg === 'เริ่มลงทะเบียน') {
    return await client.replyMessage(event.replyToken, {
      type: 'text',
      text: '【PORTFOLIO STUB】ขั้นตอนลงทะเบียนถูกย่อ/ปิดบังใน repo สาธารณะค่ะ'
    });
  }

  return null;
}
