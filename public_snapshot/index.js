// Portfolio snapshot entrypoint.
//
// Public-safe orchestrator that demonstrates the core architecture:
// webhook → per-user lock → handler chain → safe reply.
//
// All DB/AI/form integrations are stubbed/disabled in this snapshot.

import express from "express";
import * as line from "@line/bot-sdk";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";

dotenv.config();

import dbClient from "./db.js";
import {
  sanitizeLineMessages,
  getLineUserIdFromEvent,
  safeReplyOrPush,
} from "./utils/lineClient.js";
import {
  tryAcquireUserLock,
  releaseUserLock,
  startUserLockAutoRefresh,
} from "./utils/userLock.js";

import { handleOnboarding } from "./handlers/onboardingHandler.js";
import { handleMenu } from "./handlers/menuHandler.js";
import { handleAdmin } from "./handlers/adminHandler.js";
import { handleActivity } from "./handlers/activityHandler.js";

const config = {
  // Real values must be provided via env vars in a private deployment.
  channelAccessToken:
    process.env.LINE_CHANNEL_ACCESS_TOKEN || "PORTFOLIO_DUMMY_TOKEN",
  channelSecret: process.env.LINE_CHANNEL_SECRET || "PORTFOLIO_DUMMY_SECRET",
};

const app = express();
const client = new line.Client(config);

// Wrap replyMessage to apply sanitization centrally.
const _replyMessage = client.replyMessage.bind(client);
client.replyMessage = async (replyToken, messages, notificationDisabled) => {
  return _replyMessage(
    replyToken,
    sanitizeLineMessages(messages),
    notificationDisabled,
  );
};

app.use(cors());
app.use(bodyParser.json());

app.get("/webhook", (_req, res) => {
  res.status(200).send("Webhook endpoint is ready (portfolio snapshot)");
});

// Portfolio snapshot: external form ingestion is disabled.
app.post("/api/save_ranking_answers", async (_req, res) => {
  res.status(501).json({ error: "Not implemented in portfolio snapshot" });
});
app.post("/api/save_form_answers", async (_req, res) => {
  res.status(501).json({ error: "Not implemented in portfolio snapshot" });
});

app.post("/webhook", line.middleware(config), async (req, res) => {
  const events = Array.isArray(req?.body?.events) ? req.body.events : [];

  const settled = await Promise.allSettled(
    events.map(async (event) => {
      try {
        return await handleEvent(event);
      } catch (err) {
        // Keep logs shape-only; do not print message content.
        console.error("[EVENT ERROR]", {
          type: event?.type,
          messageType: event?.message?.type,
          hasUserId: Boolean(event?.source?.userId),
          error: String(err?.message || err),
        });
        return null;
      }
    }),
  );

  res.json(settled.map((s) => (s.status === "fulfilled" ? s.value : null)));
});

async function handleEvent(event) {
  const lineUserId = getLineUserIdFromEvent(event);

  // Synthetic user object for portfolio snapshot (DB is stubbed).
  // In private deployment this would be loaded from a real DB.
  const user = {
    id: null,
    line_user_id: lineUserId,
    display_name: null,
    is_admin: false,
    is_in_activity: false,
    has_started_today: false,
  };

  const isTextMessage =
    event?.type === "message" && event?.message?.type === "text";
  const rawUserMessage = isTextMessage
    ? String(event?.message?.text || "")
    : "";
  const userMessage = rawUserMessage.trim();

  // Acquire a strict per-user lock to avoid concurrent event processing.
  const lockKey = lineUserId || `event:${event?.timestamp || Date.now()}`;
  const lock = tryAcquireUserLock(lockKey);
  if (!lock) {
    // Drop silently (same principle as production lock).
    return { skipped: true, reason: "locked" };
  }

  const stopRefresh = startUserLockAutoRefresh(lockKey);

  try {
    // 1) Onboarding (follow/register)
    const onboarding = await handleOnboarding({
      event,
      user,
      userId: lineUserId,
      isTextMessage,
      rawUserMessage,
      userMessage,
      client,
      dbClient,
    });
    if (onboarding) return { handledBy: "onboarding" };

    // 2) Buttons/menu stage (does not interrupt activity)
    const menuButtons = await handleMenu({
      stage: "buttons",
      event,
      user,
      userMessage,
      client,
    });
    if (menuButtons) return { handledBy: "menu.buttons" };

    // 3) Admin commands
    const admin = await handleAdmin({
      event,
      user,
      userMessage,
      client,
      dbClient,
    });
    if (admin) return { handledBy: "admin" };

    // 4) Activity flow
    const activity = await handleActivity({
      event,
      user,
      userMessage,
      client,
      dbClient,
      userId: lineUserId,
    });
    if (activity) return { handledBy: "activity" };

    // 5) Fallback menu
    const menuFallback = await handleMenu({
      stage: "fallback",
      event,
      user,
      userMessage,
      client,
    });
    if (menuFallback) return { handledBy: "menu.fallback" };

    // Default: safe greeting (no data mutation)
    await safeReplyOrPush({
      client,
      event,
      replyToken: event?.replyToken,
      messages: {
        type: "text",
        text: "【PORTFOLIO STUB】สวัสดีค่ะ ระบบตัวอย่างพร้อมใช้งานค่ะ",
      },
    });

    return { handledBy: "default" };
  } finally {
    try {
      stopRefresh?.();
    } catch {
      // ignore
    }
    releaseUserLock(lockKey);
  }
}

const port = Number(process.env.PORT || 3000);
app.listen(port, "0.0.0.0", () => {
  console.log(`[PORTFOLIO] Server listening on 0.0.0.0:${port}`);
});
