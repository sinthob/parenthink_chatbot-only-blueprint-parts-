// handlers/gameHandler.js (portfolio snapshot)

export async function handleGameNext(clientInstance, _user, _currentQ, event) {
  return clientInstance.replyMessage(event.replyToken, {
    type: 'text',
    text: '【PORTFOLIO STUB】Game sub-question flow ถูกย่อ/ปิดบังใน repo สาธารณะค่ะ'
  });
}

export async function handleCollectiveFeedback(clientInstance, _user, _currentQ, event) {
  return clientInstance.replyMessage(event.replyToken, {
    type: 'text',
    text: '【PORTFOLIO STUB】Collective feedback ถูกปิดบังใน repo สาธารณะค่ะ'
  });
}

export async function generateCollectiveGameFeedback(_args = {}) {
  return '【PORTFOLIO STUB】collective feedback';
}
