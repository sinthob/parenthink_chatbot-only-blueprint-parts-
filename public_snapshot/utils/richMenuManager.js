// utils/richMenuManager.js (portfolio snapshot)
//
// Rich menu IDs and real client calls are omitted in the public snapshot.

export async function setRichMenu(_userId, _menuType, _client = null) {
  return { ok: true, applied: false, reason: "portfolio_stub" };
}

export async function syncRichMenuWithUserState(_user, _client = null) {
  return { ok: true, synced: false, reason: "portfolio_stub" };
}
