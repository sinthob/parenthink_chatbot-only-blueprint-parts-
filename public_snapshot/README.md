# LINE Chatbot — "พลังสมองสร้างได้ที่บ้าน" (Brain Power Built at Home)

[EN](#english) | [TH](#ภาษาไทย)

> [!IMPORTANT]
> **Portfolio Snapshot Notice (EN/TH):** This folder is a **portfolio snapshot / architecture showcase** (not the full production project).
> - Business-specific content, data, and real integrations are **removed or stubbed** to keep them confidential.
> - DB / LLM / RAG / Embedding / external forms may be disabled or simulated.
> - No secrets/credentials are included.

## English

### Why this matters (problem → solution)

Understanding a child’s development (especially **Executive Function / EF**) is important, but traditional learning methods—like scheduled workshops or in-person training—can be inconvenient for many parents due to **time constraints** and **travel**.

**Parenthink** (a LINE Chatbot) helps parents learn and apply child-development knowledge at home, without having to block out large chunks of time. The program is designed to fit into daily life: parents can learn and do short guided activities in about **3–7 minutes per day**, directly in a chat interface—making learning more accessible and time-efficient.

> [!IMPORTANT]
> **Portfolio Snapshot Notice:** โฟลเดอร์นี้เป็น **ตัวอย่างเพื่อโชว์แนวคิด/สถาปัตยกรรม** เท่านั้น ไม่ใช่โปรเจคทั้งหมดแบบ production-ready.
>
> - ส่วนที่เป็น **business logic / content / data / integration จริง** ถูกตัดออกหรือทำเป็น **stub** เพื่อเก็บเป็นความลับ
> - โค้ดฝั่ง **DB / LLM / RAG / Embedding / external forms** ใน snapshot อาจถูกปิด/จำลองพฤติกรรม (ไม่ใช่ระบบจริง)
> - ไม่มีการใส่ secret/credential ใน snapshot นี้

> [!NOTE]
> **Language:** This chatbot is currently only available in **Thai**.
>
> **Research Status:** This bot is currently in the data collection phase for research.
> You may receive frequent notifications for data logging purposes,
> but please feel free to continue your testing.

> [!IMPORTANT]
> **Repository Disclosure:** This repository has been authorized by the client to be publicly visible.
> Only non-sensitive source code is shared here — **no research data, participant records, or database contents are included**.
> All credentials and secrets are managed via environment variables and are not committed to this repo.
>
> **Refactor Status:** This repository is currently undergoing a structural refactor (extracting `handleEvent` into modular handlers).
> The **production system runs a separate pre-refactor branch**; this repo will be merged back after a full regression test pass post-refactor.

## TL;DR (Above the Fold)

- **What it is:** A research-grade LINE chatbot that delivers a structured 6-week parent-child activity program (Thai-only).
- **What problem it solves:** Keeps users on a controlled timeline, persists multi-step activity state, and provides research-aligned AI feedback per answer.
- **Technical highlights:** RAG pipeline with dual-axis similarity + LLM reformulation, per-user mutex lock for race-free state, and modular handler architecture for maintainability.

**Impact / usage proof**

- Used by real participants during the research period (≈50 parents/guardians), with progress persisted and resumed across sessions.

## Demo (Screenshots)

Short, visual walkthrough of key UI/behavior (Thai UI).

### 1) Pre-activity lock state (guard before starting)

![Demo 1 — Lock state before activity](readme_pictures/lockState_before_activity.jpg)

- What this shows: If the user has not pressed “เริ่มกิจกรรมวันนี้”, then no matter what they type, the bot replies with a safe greeting + quick-reply menu.
- Why it matters: Prevents users from burning AI credits outside the intended flow, and reduces the risk of corrupting conversation state in a timeline-driven activity program.

### 2) Rich menu overview

![Demo 2 — Rich menu](readme_pictures/rich_menu.jpg)

- What this shows: The clickable rich menu entry points used to navigate the bot.

### 3) External EF knowledge website (via rich menu)

![Demo 3 — External EF website](readme_pictures/outsource_website_ef.jpg)

- What this shows: Tapping the rich menu button “สาระน่ารู้ EF” opens an external website with additional EF learning resources.

### 4) Contact channel (content owner)

![Demo 4 — Contact info](readme_pictures/richmenu_contact.jpg)

- What this shows: A contact card/image with the official contact channel for the content owner (Burapha University faculty).

### 5) Quick menu examples before starting activity

![Demo 5 — Quick menu before activity](readme_pictures/quickMenu_example_before_activity.jpg)

- What this shows: Users can still access informational views (e.g., number of completed activity days, child name that the user registered) even before starting today’s activity.

### 6) Start today’s activity (enter the daily flow)

![Demo 6 — Start daily activity](readme_pictures/start_daily_activity_01.png)

- What this shows: Tapping “เริ่มกิจกรรมวันนี้” transitions the user into the daily activity flow.
- Why it matters: Confirms the bot sets the right activity flags/pointers and starts serving questions.

### 7) Research-period guard: force “Start answering” via button-only input

![Demo 7 — Button-only guard (research period)](readme_pictures/start_daily_activiry_02_fallback.png)

- What this shows: If the user sends any other input instead of pressing the “เริ่มตอบคำถาม” button, the bot asks the user to choose from the provided buttons only.
- Why it matters: During the research period, the flow is intentionally constrained to keep participants on-track and to prevent state corruption from unexpected free-text input.
- Note: In a future public version, a “ย้อนกลับ” (Back) button can be added to improve navigation while keeping the state machine safe.

### 8) Activity question example (how prompts are served)

![Demo 8 — Activity question example](readme_pictures/activiry_example_01.png)

- What this shows: An example of the bot serving an activity question to the user.

### 9) Answer + AI feedback + “Next activity” CTA

![Demo 9 — Answer and feedback](readme_pictures/activity_example_answer_and_feedback.png)

- What this shows: A user answer followed by the bot’s feedback, plus a “กิจกรรมถัดไป” (Next activity) button to continue the program.

### 10) Fast-answer prevention (mutex lock to protect state)

![Demo 10 — Prevent fast input while processing](readme_pictures/fast_answer_prevent_lock.png)

- What this shows: If a user sends messages too quickly while the backend model is still processing, the bot prevents concurrent handling to avoid breaking question order/state.
- Why it matters: Protects `current_question_number` / `current_sub_question_order` from race conditions caused by rapid-fire user input.

### 11) Game-style activities (common from Week 2 onward)

![Demo 11 — Game activity overview](readme_pictures/game_activity_example_01.png)

- What this shows: Many activities (especially from Week 2 onward) run like a “game”: the bot explains the activity first, the parent/child completes it offline, then the user returns to answer the follow-up prompts.
- Why it matters: This structure keeps the activity instructions clear and prevents the conversation from mixing “instruction” vs “answer” steps.

### 12) Sub-questions → accumulate answers → generate one consolidated feedback

![Demo 12 — Sub-question answers accumulated](readme_pictures/game_activity_example_02.png)

- What this shows: For some activities, the bot does not generate feedback immediately after each sub-question. Instead, it stores each sub-answer (per `sub_question`) and generates feedback once at the end of the game / end of the main activity.
- Why it matters (technical): By aggregating sub-answers and referencing each `sub_question` in a single prompt, the model receives one complete activity context — improving coherence and reducing fragmented feedback.

![QR Code — Parenthink LINE Chatbot](readme_pictures/QR_Code_for_Parenthink.png)

> Scan to add the Parenthink LINE chatbot and try it out.

A research-grade LINE chatbot developed in collaboration with the **Faculty of Nursing, Burapha University**, as part of an academic research project aimed at promoting **Executive Function (EF)** development in young children. The chatbot delivers structured daily activities and educational content derived directly from the research team's clinical and pedagogical documentation, ensuring that all responses and feedback align with the ethically reviewed materials.

Parents/guardians interact daily with structured activities, receive personalized AI-driven feedback, and are guided through a full 6-week program timeline managed centrally by the research team.

---

## Tech Stack

| Layer              | Technology                                         |
| ------------------ | -------------------------------------------------- |
| Runtime            | Node.js                                            |
| Messaging Platform | LINE Messaging API (`@line/bot-sdk`)               |
| Database           | PostgreSQL (`pg`)                                  |
| Generative AI      | OpenAI GPT-4o-mini / Google Vertex AI (switchable) |
| Thai Embedding     | WangchanBERTa (custom Python microservice)         |
| Scheduler          | `node-cron`                                        |
| Deployment         | PM2 (`ecosystem.config.cjs`)                       |

---

## Section 1 — General Features

What the chatbot does from a user perspective:

### 1. User Registration & Pre-Program Survey

When a user first adds the LINE bot, the system registers them in the database (stored by LINE User ID), then sends questions to store users' information (such as the kid's name, kid's age).

### 2. Structured 6-Week Daily Program

The program runs over **6 weeks × 5 weekdays**, totaling 30 activity days. Each day has one or more questions tied to EF (Executive Functions) concepts. The chatbot guides users through each day's activity in order, and progress is saved so users can pause and return at any time.

- Users begin by pressing **"เริ่มกิจกรรมวันนี้"** (Start Today's Activity)
- Questions are served sequentially based on the user's current `week` and `day` pointers (using the database to store pointers as a table column to make these pointers become the source of truth)
- Additional info about EF is sent to users on weekends (Saturday-Sunday) since there aren't activities for users like on weekdays.

### 3. Instant AI-Powered Feedback per Answer

After the user answers a daily open-ended question, the chatbot:

1. Retrieves the most relevant pre-approved expert answer from the FAQ database (via RAG)
2. Sends it through a generative AI model to rephrase it contextually
3. Delivers personalized, research-validated feedback

### 4. Interactive Activities

Certain activity days use a **game mode** with multi-step sub-questions. Sub-questions can be:

- **Open-ended** — free text answers
- **Yes/No** — rendered as quick-reply buttons ("เคย" / "ไม่เคย")
- **Multiple choice** — rendered as quick-reply buttons from database choices
- **Describe** — informational text with a "ไปยังคำถามถัดไป" (Next Question) prompt

At the end of a game, collective feedback summarizing all sub-answers is generated via AI.

### 5. Daily Reminders via Scheduled Jobs

`node-cron` fires daily reminder messages to all active users who have not yet started their day's activity. Failed deliveries are queued and retried within a configurable time window.

### 6. Central Timeline Control [*Only in "Research period" (Late April to early June)]

Controls the program's current week/day through a single `central_timeline` table. All users follow this master timeline, ensuring synchronized program delivery across all participants. Users cannot proceed beyond the current central timeline, but if they fall behind, they can catch up on all missed activities in one go (or gradually complete activities at their own pace when they have free time).

---

## Section 2 — Technical & Functional Highlights

What makes this chatbot non-trivial under the hood:

---

### RAG Pipeline — Dual-Axis Similarity Matching + Generative Reformulation

Most RAG implementations embed the user's query, find the nearest document, and return it. This chatbot uses a **two-stage pipeline** designed specifically to satisfy research ethics requirements (using wording as similar to the research document as possible) — approved answer phrasings must be preserved, while responses still feel natural for each individual user's phrasing.

#### Stage 1 — Structured FAQ Retrieval (Multi-Fallback)

The system searches for the best-matching FAQ through a cascading strategy:

```
Exact string match
        ↓ (miss)
Embedding cosine similarity on (question_text × 0.8) + (user_answer × 0.2)
        ↓ (score < threshold 0.85)
String similarity fallback (same weighted formula)
        ↓ (still no match)
Broader search across all questions in the same day/week
        ↓ (still no match)
Day-wide FAQ pool search (lowest threshold, last resort)
```

The key design decision is scoring **both axes simultaneously**:

- `question_text` similarity (80% weight) — is this the right question context?
- `user_answer` similarity (20% weight) — does the user's answer pattern match this FAQ entry?

This matters because the same question can have very different appropriate responses depending on how the user answers (e.g., "เคย / 3" vs "ไม่เคย / 1" trigger different feedback).

Thai text embeddings are computed by a locally hosted **WangchanBERTa** microservice (`/Embedding_Server_wangchanberta/`), chosen for its strong Thai-language semantic understanding. An **in-memory embedding cache** (`embeddingClient.js`) avoids redundant API calls for repeated FAQ texts.

#### Stage 2 — Generative AI Reformulation

After the best-matching FAQ answer is retrieved, it is **not returned using exract words as the similar RAG**. Instead, it is sent to a generative AI model (OpenAI `gpt-4o-mini` or Google Vertex AI, switchable via `LLM_PROVIDER` env var) with a prompt that instructs the model to:

- **Preserve the structure and key information** of the approved answer (required for research ethics compliance)
- **Adjust the tone and phrasing** to naturally fit the user's specific input

> This approach was chosen because the researcher needed chatbot responses to closely resemble the ethically reviewed answer forms while still feeling personalized — a direct template match would be too rigid for users whose phrasing varies significantly.

---

### Per-User Mutex Lock — Handling Rapid-Fire Messages

LINE users can send multiple messages faster than the bot can process them (especially while waiting for AI responses that may take 2–5 seconds). Without protection, this causes:

- Duplicate DB writes
- Race conditions on user state fields
- Corrupted `current_question_number` or `current_sub_question_order`

**Solution (`utils/userLock.js`):** An in-memory per-user mutex with TTL and auto-refresh.

```
User sends message → tryAcquireUserLock(userId)
      ↓ success              ↓ already locked
  Process event         Silently drop/ignore
  (AI call, DB writes)
      ↓
  releaseUserLock(userId)
```

Key implementation details:

- Lock TTL defaults to **120 seconds** — covers even slow AI roundtrips
- `startUserLockAutoRefresh()` extends the TTL on a timer so the lock does not expire mid-processing for very long operations
- The interval timer calls `.unref()` so it does not keep the Node.js process alive unnecessarily
- Lock is released in a `finally` block to guarantee release on error paths

---

### Persistent Activity State & Resumption

All user progress is stored in PostgreSQL on every step:

| Field                        | Purpose                                        |
| ---------------------------- | ---------------------------------------------- |
| `current_week`               | Which program week the user is on              |
| `current_day`                | Which weekday within that week                 |
| `current_question_number`    | Which main question within the day             |
| `current_sub_question_order` | Which sub-question within a game/self-activity |
| `is_in_activity`             | Whether the user is mid-activity right now     |
| `has_started_today`          | Whether the user started today's activity      |

If a user closes the chat mid-activity and returns hours later, the bot restores exactly where they left off — no data loss, no restart required.

---

### Stuck State Detection & Recovery

A subtle edge case: the daily cron job resets `has_started_today = false` and `is_in_activity = false` at midnight, but the user's `current_question_number` or `current_sub_question_order` may still point to a mid-activity position. This creates a "stuck" state where the user cannot proceed because the activity flags say they haven't started, but the question pointer is already past question 1.

`hasStuckActivityPointers(user)` detects this condition:

```js
// Stuck if question pointer is past default (1) OR sub-question pointer is set
// while daily flags have been reset
const hasNonDefaultQuestion = qNum !== 1;
const hasSubPointer = user.current_sub_question_order != null;
return hasNonDefaultQuestion || hasSubPointer;
```

When detected, the bot automatically re-presents the pending question to the user so they can continue seamlessly.

---

### Central Timeline Gating

The research coordinator advances the program day/week via the `central_timeline` table rather than automatic time-based progression. This gives the team full control over the program pace.

- Users **cannot advance beyond** the current central timeline day (prevents users from rushing ahead)
- Users who are **behind** the central timeline receive a message showing how many days they are behind, plus a quick-reply button to continue immediately
- The system calculates the timeline index as `(week - 1) * 5 + day` (Mon–Fri, 5 activity days per week), correctly handling weekend skipping via `Intl.DateTimeFormat`

---

### LINE API Safety Layer

All outgoing messages pass through a sanitization pipeline before hitting the LINE API:

- **Message text sanitization** — strips/truncates content that would cause LINE API rejections
- **Quick Reply label truncation** — LINE enforces a 20-character limit on quick-reply button labels; `truncateLineLabel()` handles this automatically
- **Batch splitting** — LINE allows max 5 messages per API call; `replyThenPushInBatches()` automatically splits larger message arrays
- **Reply-token fallback** — reply tokens expire after ~30 seconds; if `replyMessage()` fails with a token error, the bot falls back to `pushMessage()` using the stored LINE User ID so the user still receives the response

---

## Project Structure

```
index.js                  — Main webhook handler and event router (orchestration core)
cronJob.js                — Daily reminders, timeline auto-advance, retry queue
feedback.js               — Per-answer feedback delivery logic
adminNotifications.js     — Admin progress report scheduler
handlers/
  onboardingHandler.js    — User registration flow (name / birthday / child-code steps)
  menuHandler.js          — Static info commands (about, calendar, research, contact)
  adminHandler.js         — Admin-only day/week selection flow
  activityHandler.js      — Activity lifecycle (start / resume / next / summary / game sub-questions)
  gameHandler.js          — Game-mode sub-question flow and collective feedback
utils/
  ragFeedback.js          — Full RAG pipeline (retrieval + AI reformulation)
  embeddingClient.js      — WangchanBERTa client with in-memory cache
  llmClient.js            — Unified LLM abstraction (OpenAI / Vertex AI)
  userLock.js             — Per-user in-flight mutex
  lineClient.js           — LINE API helpers, sanitization, reply-fallback
  dateHelpers.js          — Timezone-aware date utilities (Intl-based)
  weeklySurveys.js        — Weekly check-in survey push logic
Embedding_Server_wangchanberta/
  main.py                 — FastAPI embedding server
  wangchanberta_embedding.py — WangchanBERTa model loader
```

---

## Folder Architecture

The project is organized around a **Chain-of-Responsibility + Modular Handler** pattern.
`handleEvent` in `index.js` acts as the orchestrator: it calls each handler in priority order and returns early on the first one that handles the message. Handlers that do not own the current message return `null` and pass control to the next handler in the chain.

| Folder / File                     | Architectural Role                                                                                              | Separation Rationale                                                                                                                   |
| --------------------------------- | --------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `index.js`                        | **Orchestrator** — webhook entry point, user lock, central timeline gating, stuck-state recovery, handler chain | Owns cross-cutting concerns (auth, locking, gating) that must run before any domain handler                                            |
| `handlers/`                       | **Domain Handlers** — each file owns one user-facing flow                                                       | Separated by _user intent / conversation state_, not by question type; one handler = one conversation context                          |
| `handlers/onboardingHandler.js`   | Handles `profile_step` registration flow (multi-turn)                                                           | Isolated because it must interrupt all other flows when `profile_step` is active                                                       |
| `handlers/menuHandler.js`         | Handles stateless info commands (about, calendar, contact…)                                                     | Pure read-only replies with no DB side-effects; safe to call at two points in the chain (buttons stage + fallback stage)               |
| `handlers/adminHandler.js`        | Handles admin-only day/week selection                                                                           | Gated by `user.is_admin`; separated to avoid polluting the main user flow with admin state                                             |
| `handlers/activityHandler.js`     | Handles the full activity lifecycle (start → answer loop → summary → pending confirm → game sub-questions)      | Largest domain; owns all activity-state mutations (`has_started_today`, `is_in_activity`, `current_question_number`)                   |
| `handlers/gameHandler.js`         | Handles game sub-question fan-out and collective AI feedback generation                                         | Separated because game flow requires its own sub-question pointer (`current_sub_question_order`) and multi-step DB state               |
| `utils/`                          | **Infrastructure / Cross-cutting Utilities**                                                                    | Separated by _technical capability_, not by feature; each util is stateless or manages a single shared resource                        |
| `utils/ragFeedback.js`            | RAG retrieval + generative reformulation pipeline                                                               | Isolated as a pure async function; has no knowledge of LINE or user state                                                              |
| `utils/embeddingClient.js`        | WangchanBERTa HTTP client + in-memory cache                                                                     | Separated to allow cache lifetime to be controlled independently of request lifetime                                                   |
| `utils/llmClient.js`              | Unified LLM abstraction (OpenAI / Vertex AI)                                                                    | Provider-switching logic stays in one place; callers are provider-agnostic                                                             |
| `utils/userLock.js`               | Per-user in-flight mutex (TTL + auto-refresh)                                                                   | Separated because locking must be acquired before any business logic runs                                                              |
| `utils/lineClient.js`             | LINE API helpers — sanitization, label truncation, batch splitting, reply-fallback                              | Centralizes all LINE API safety rules so no handler needs to duplicate them                                                            |
| `utils/dateHelpers.js`            | Timezone-aware date utilities (`Intl`-based, no external deps)                                                  | Separated to avoid duplicating timezone logic across cron, gating, and handlers                                                        |
| `Embedding_Server_wangchanberta/` | **External Microservice** — Python/FastAPI embedding server                                                     | Deployed independently; decoupled from Node.js runtime so the embedding model can be upgraded or swapped without touching the main bot |

---

## Validation / Quality (Draft)

This repository is a production-derived codebase with a **manual-first validation approach** (LINE + PostgreSQL + external AI services make full public reproduction non-trivial). The bot has been used by real participants during the research period.

### Validation approach

- **Primary:** Manual testing on real conversation flows (message → DB state update → reply/push).
- **Secondary:** Basic runtime safety checks (syntax checks, linting where applicable) and staged refactor sessions with behavior-preserving extraction.

### Manual test checklist (8–12 key flows)

Use this as a regression checklist after each refactor session.

1. **Onboarding start**
   **Precondition:** New user (no DB row) or user has `profile_step` set.  
   **Input:** Follow event or any text.  
   **Expected:** Bot prompts for the next required profile field and does not enter activity flow.
   - to make sure user put all neccessary infomation before start the program \*

2. **Start today’s activity**
   **Precondition:** Registered user, not in activity.  
   **Input:** `เริ่มกิจกรรมวันนี้`  
   **Expected:** Sets daily flags (`has_started_today`, `is_in_activity`) and replies with the first question / start prompt.

3. **Guard: answer requires activity started**
   **Precondition:** Registered user, `has_started_today=false` and `is_in_activity=false`.  
   **Input:** Any answer-like text to a question type that requires activity state.  
   **Expected:** Bot replies with “กรุณากด "เริ่มกิจกรรมวันนี้" ก่อนค่ะ” plus a quick reply button.
   - to make sure users has to check which activities they're currently on (which day and whcich week) since backend have to check whatever user answer to which question, this ensure the state users are in.

4. **Confirm pending answer — yes**
   **Precondition:** Pending confirmation is shown.  
   **Input:** `ใช่ ส่งเลย`  
   **Expected:** Pending answer is persisted to the correct table, feedback is generated/sent if applicable, and the bot advances pointers.

5. **Game flow — Yes/No sub-question**
   **Precondition:** User is in a game question (`question_type=game`) and `current_sub_question_order` points to a Yes/No sub-question.  
   **Input:** Tap quick reply (e.g., “เคย/ไม่เคย”).  
   **Expected:** Sub-answer is saved, pointer advances to the next sub-question, and the bot replies with the next sub prompt.

6. **Game flow — Describe/Next**
   **Precondition:** User is in a game sub-question of type describe.  
   **Input:** `ไปยังคำถามถัดไป`  
   **Expected:** Bot advances without requiring a text answer and serves the next sub-question.
   - sometimes put all describe about the question in one buble can be hard to read, but if separate to another bubble bot can confuse if it another question or not. We can set that bubble into "descrivbe" type so bot know it just information and ready for the next real question.

7. **Stuck-state recovery after midnight reset**
   **Precondition:** User has question pointers (e.g., `current_question_number != 1` or `current_sub_question_order != null`) but daily flags were reset.  
   **Input:** Any text message.  
   **Expected:** Bot offers resume vs restart; resume restores flags and replays the current pending question/sub-question.

   when users do the activities, bot have to check many flags to ensure which question users are currently on. ( such as current_question_number, current_sub_question_order, is_in_activity, has_started_today ). But sometimes users just leave the activities and there will be many problems later (such as, user comeback later and forget the activity and want to restart or some update affect users flags and it can be crash)
   so i added logic to always check users'flags
   to prevent bugs and give users chocies to resume or restart the activity in the same time.

8. [ only for reserch period, will remove this after fully lunch to public ]
   **Central timeline gating (ahead of schedule)**
   **Precondition:** User is ahead of `central_timeline` and is not admin.  
   **Input:** Activity-related commands (start/next/summary).  
   **Expected:** Bot blocks progression and resets activity state to a safe baseline.

9. **Menu/info commands are stateless**
   **Precondition:** Any registered user.  
   **Input:** Menu commands (about/calendar/research/contact).  
   **Expected:** Bot replies with informational text and does not mutate activity pointers.

---

## ภาษาไทย

### ทำไมโปรเจกต์นี้ถึงสำคัญ (ปัญหา → วิธีแก้)

การเข้าใจพัฒนาการของลูก โดยเฉพาะด้าน **Executive Function (EF)** เป็นเรื่องสำคัญมากสำหรับผู้ปกครอง แต่รูปแบบการเรียนรู้แบบเดิม ๆ เช่น การนัดทำกิจกรรม หรือการเข้าอบรมแบบเจอตัว มักมีข้อจำกัดเรื่อง **เวลา** และ **การเดินทาง** ทำให้หลายคนทำต่อเนื่องได้ยาก

**Parenthink** (LINE Chatbot) จึงเข้ามาช่วยแก้ปัญหานี้ โดยทำให้ผู้ปกครองสามารถเรียนรู้และนำความรู้เรื่องพัฒนาการเด็กไปใช้กับลูกได้ **จากที่บ้าน** ผ่านแชต โดยใช้เวลาเพียงประมาณ **วันละ 3–7 นาที** ช่วยเพิ่มความสะดวก ลดภาระเวลา และทำให้การเรียนรู้ทำได้จริงในชีวิตประจำวัน

### หมายเหตุ (Portfolio Snapshot)

- โฟลเดอร์นี้เป็น **ตัวอย่างเพื่อโชว์แนวคิด/สถาปัตยกรรม** ไม่ใช่โปรเจค production-ready ทั้งหมด
- รายละเอียดที่เป็น **business logic / content / data / integration จริง** ถูกตัดออกหรือทำเป็น **stub** เพื่อเก็บเป็นความลับ

---

> [!NOTE]
> **ภาษา:** แชตบอทนี้เปิดให้ใช้งานเป็น **ภาษาไทย** เท่านั้น
>
> **สถานะงานวิจัย:** ระบบนี้อยู่ในช่วงเก็บข้อมูลเพื่อการวิจัย
> ผู้ใช้อาจได้รับการแจ้งเตือนบ่อย (เพื่อการบันทึกข้อมูล/ติดตามผล)
> แต่สามารถใช้งานทดสอบต่อได้ตามปกติ

> [!IMPORTANT]
> **การเปิดเผย Repository:** Repo นี้ได้รับอนุญาตจากผู้ว่าจ้างให้เปิดเป็นสาธารณะ
> โดยแชร์เฉพาะซอร์สโค้ดที่ไม่อ่อนไหวเท่านั้น — **ไม่มีข้อมูลวิจัย ข้อมูลผู้เข้าร่วม หรือข้อมูลในฐานข้อมูล** อยู่ใน repo นี้
> Credentials/Secrets ทั้งหมดถูกจัดการผ่าน environment variables และ **ไม่ถูก commit** ขึ้น repo
>
> **สถานะ Refactor:** Repo นี้อยู่ระหว่างการ refactor โครงสร้าง (แยก `handleEvent` ออกเป็น modular handlers)
> โดย **ระบบ production จริงรันอยู่ใน branch ก่อน refactor** และจะ merge กลับหลัง regression test ผ่านครบถ้วน

## TL;DR (สรุปแบบอ่านไว)

- **มันคืออะไร:** LINE Chatbot สำหรับงานวิจัย ที่ส่งกิจกรรมผู้ปกครอง-เด็กแบบมีโครงสร้างเป็นเวลา 6 สัปดาห์ (รองรับภาษาไทย)
- **แก้ปัญหาอะไร:** คุมไทม์ไลน์การทำกิจกรรม, เก็บสถานะกิจกรรมแบบหลายขั้นตอน (multi-step) ให้กลับมาทำต่อได้, และให้ AI feedback ต่อคำตอบแบบสอดคล้องแนวทางงานวิจัย
- **ไฮไลต์เชิงเทคนิค:** RAG แบบวัด similarity 2 แกน + LLM ปรับสำนวน, per-user mutex lock กัน state พังจากข้อความซ้อน, และสถาปัตยกรรม handler แบบแยกโมดูลเพื่อดูแลง่าย

**ผลกระทบ / หลักฐานการใช้งาน**

- มีการใช้งานจริงโดยผู้เข้าร่วมในช่วงงานวิจัย (ประมาณ ≈50 ผู้ปกครอง/ผู้ดูแล) พร้อมการบันทึกความคืบหน้า และกลับมาทำต่อได้ข้าม session

## Demo (ภาพหน้าจอ)

ตัวอย่างภาพเพื่อสรุป UI/พฤติกรรมสำคัญ (หน้าจอภาษาไทย)

### 1) สถานะก่อนเริ่มกิจกรรม (กันผู้ใช้พิมพ์มั่วก่อนเริ่ม)

![Demo 1 — Lock state before activity](readme_pictures/lockState_before_activity.jpg)

- ภาพนี้แสดงอะไร: ถ้าผู้ใช้ยังไม่กด “เริ่มกิจกรรมวันนี้” ไม่ว่าพิมพ์อะไรก็ตาม บอทจะตอบกลับแบบปลอดภัย (ทักทาย + quick-reply menu)
- ทำไมสำคัญ: ป้องกันการเผา AI credits นอก flow ที่ตั้งใจ และลดความเสี่ยงที่ state จะเสีย/เพี้ยนในระบบที่ต้องคุมไทม์ไลน์

### 2) ภาพรวม Rich menu

![Demo 2 — Rich menu](readme_pictures/rich_menu.jpg)

- ภาพนี้แสดงอะไร: rich menu ที่เป็นจุดเริ่มต้นให้ผู้ใช้กดเข้าฟีเจอร์ต่าง ๆ

### 3) เว็บไซต์ความรู้ EF ภายนอก (ผ่าน rich menu)

![Demo 3 — External EF website](readme_pictures/outsource_website_ef.jpg)

- ภาพนี้แสดงอะไร: กดปุ่ม “สาระน่ารู้ EF” แล้วเปิดเว็บไซต์ภายนอกที่รวมสื่อความรู้เพิ่มเติม

### 4) ช่องทางติดต่อ (เจ้าของคอนเทนต์)

![Demo 4 — Contact info](readme_pictures/richmenu_contact.jpg)

- ภาพนี้แสดงอะไร: การ์ด/รูปสำหรับช่องทางติดต่อของเจ้าของคอนเทนต์ (คณาจารย์ ม.บูรพา)

### 5) ตัวอย่าง Quick menu ก่อนเริ่มกิจกรรม

![Demo 5 — Quick menu before activity](readme_pictures/quickMenu_example_before_activity.jpg)

- ภาพนี้แสดงอะไร: ผู้ใช้ยังดูข้อมูลเชิงสรุปได้ (เช่น ทำกิจกรรมไปกี่วันแล้ว, ชื่อเด็กที่ลงทะเบียน)
  แม้ยังไม่เริ่มกิจกรรมของวันนั้น

### 6) เริ่มกิจกรรมของวันนี้ (เข้า daily flow)

![Demo 6 — Start daily activity](readme_pictures/start_daily_activity_01.png)

- ภาพนี้แสดงอะไร: กด “เริ่มกิจกรรมวันนี้” แล้วเข้าสู่ flow ของกิจกรรมประจำวัน
- ทำไมสำคัญ: ยืนยันว่าระบบตั้งค่า activity flags/pointers ถูกต้อง และเริ่มส่งคำถามตามลำดับ

### 7) ตัวกันในช่วงวิจัย: บังคับให้เริ่มตอบผ่านปุ่มเท่านั้น

![Demo 7 — Button-only guard (research period)](readme_pictures/start_daily_activiry_02_fallback.png)

- ภาพนี้แสดงอะไร: ถ้าผู้ใช้ส่งข้อความอื่น ๆ แทนการกดปุ่ม “เริ่มตอบคำถาม” บอทจะบอกให้เลือกจากปุ่มที่ให้ไว้เท่านั้น
- ทำไมสำคัญ: ในช่วงวิจัย flow ตั้งใจทำให้ “คุมได้” เพื่อกัน state พังจาก free-text ที่ไม่คาดคิด และกันผู้ใช้หลุดจากไทม์ไลน์
- หมายเหตุ: ในเวอร์ชันสาธารณะในอนาคต สามารถเพิ่มปุ่ม “ย้อนกลับ” เพื่อใช้งานง่ายขึ้นโดยยังคุม state machine ได้

### 8) ตัวอย่างคำถามกิจกรรม (การเสิร์ฟ prompt)

![Demo 8 — Activity question example](readme_pictures/activiry_example_01.png)

- ภาพนี้แสดงอะไร: ตัวอย่างหน้าจอบอทส่งคำถามกิจกรรมให้ผู้ใช้

### 9) คำตอบ + AI feedback + ปุ่มไป “กิจกรรมถัดไป”

![Demo 9 — Answer and feedback](readme_pictures/activity_example_answer_and_feedback.png)

- ภาพนี้แสดงอะไร: ผู้ใช้ตอบคำถาม → บอทให้ feedback → มีปุ่ม “กิจกรรมถัดไป” เพื่อไปต่อ

### 10) กันตอบรัว (mutex lock ป้องกัน state เพี้ยน)

![Demo 10 — Prevent fast input while processing](readme_pictures/fast_answer_prevent_lock.png)

- ภาพนี้แสดงอะไร: ถ้าผู้ใช้ส่งข้อความเร็วเกินไปขณะ backend ยังประมวลผล (เช่น รอ AI) ระบบจะกันไม่ให้ handle ซ้อนกัน
- ทำไมสำคัญ: ป้องกัน race condition ของ `current_question_number` / `current_sub_question_order` จาก rapid-fire input

### 11) กิจกรรมแบบเกม (พบมากตั้งแต่สัปดาห์ที่ 2 เป็นต้นไป)

![Demo 11 — Game activity overview](readme_pictures/game_activity_example_01.png)

- ภาพนี้แสดงอะไร: หลายกิจกรรมทำเหมือน “เกม” — บอทอธิบายก่อน ผู้ปกครอง/เด็กทำกิจกรรมออฟไลน์ แล้วกลับมาตอบ follow-up
- ทำไมสำคัญ: ทำให้คำแนะนำอ่านชัดเจน และลดการปนกันระหว่าง “คำสั่ง/คำอธิบาย” กับ “คำตอบ”

### 12) คำถามย่อย → เก็บคำตอบ → สรุป feedback ครั้งเดียว

![Demo 12 — Sub-question answers accumulated](readme_pictures/game_activity_example_02.png)

- ภาพนี้แสดงอะไร: บางกิจกรรมจะไม่สร้าง feedback หลังคำถามย่อยทุกข้อ แต่จะเก็บคำตอบแต่ละ `sub_question` แล้วสร้าง feedback ครั้งเดียวตอนจบ
- ทำไมสำคัญ (เชิงเทคนิค): การรวมคำตอบหลายข้อไว้ใน prompt เดียว ทำให้โมเดลเห็นบริบทครบ ช่วยให้ feedback ต่อเนื่องและไม่กระจัดกระจาย

![QR Code — Parenthink LINE Chatbot](readme_pictures/QR_Code_for_Parenthink.png)

> สแกนเพื่อเพิ่ม Parenthink LINE Chatbot และทดลองใช้งาน

LINE Chatbot สำหรับงานวิจัยที่พัฒนาร่วมกับ **คณะพยาบาลศาสตร์ มหาวิทยาลัยบูรพา** ภายใต้โครงการวิชาการที่มุ่งส่งเสริม **Executive Function (EF)** ในเด็กเล็ก โดยระบบส่งกิจกรรมรายวันและคอนเทนต์ความรู้ที่อ้างอิงจากเอกสารทางคลินิก/การสอนของทีมวิจัย เพื่อให้คำตอบและ feedback สอดคล้องกับเนื้อหาที่ผ่านการพิจารณาด้านจริยธรรมแล้ว

ผู้ปกครอง/ผู้ดูแลทำกิจกรรมรายวัน ได้รับ AI feedback แบบเฉพาะบุคคล และถูกนำทางผ่านไทม์ไลน์โปรแกรม 6 สัปดาห์ที่ทีมวิจัยควบคุมส่วนกลาง

---

## Tech Stack

| Layer              | Technology                                         |
| ------------------ | -------------------------------------------------- |
| Runtime            | Node.js                                            |
| Messaging Platform | LINE Messaging API (`@line/bot-sdk`)               |
| Database           | PostgreSQL (`pg`)                                  |
| Generative AI      | OpenAI GPT-4o-mini / Google Vertex AI (switchable) |
| Thai Embedding     | WangchanBERTa (custom Python microservice)         |
| Scheduler          | `node-cron`                                        |
| Deployment         | PM2 (`ecosystem.config.cjs`)                       |

---

## Section 1 — General Features

มุมมองฝั่งผู้ใช้: แชตบอททำอะไรได้บ้าง

### 1. การลงทะเบียนผู้ใช้ & แบบสอบถามก่อนเริ่มโปรแกรม

เมื่อผู้ใช้เพิ่ม LINE bot ครั้งแรก ระบบจะลงทะเบียนผู้ใช้ในฐานข้อมูล (อิงจาก LINE User ID) แล้วส่งคำถามเพื่อเก็บข้อมูลจำเป็น (เช่น ชื่อเด็ก อายุเด็ก)

### 2. โปรแกรมรายวันแบบมีโครงสร้าง 6 สัปดาห์

โปรแกรมถูกออกแบบเป็น **6 สัปดาห์ × 5 วันทำกิจกรรม (วันธรรมดา)** รวม 30 วันกิจกรรม แต่ละวันมีคำถามอย่างน้อย 1 ข้อที่เชื่อมโยงแนวคิด EF (Executive Functions) ระบบนำผู้ใช้ทำกิจกรรมตามลำดับ และบันทึกความคืบหน้าเพื่อให้หยุดแล้วกลับมาทำต่อได้

- ผู้ใช้เริ่มด้วยการกด **"เริ่มกิจกรรมวันนี้"** (Start Today's Activity)
- ระบบส่งคำถามตามลำดับจาก pointer `week` และ `day` ของผู้ใช้ (เก็บในฐานข้อมูลให้เป็น source of truth)
- ช่วงวันเสาร์-อาทิตย์จะส่งความรู้เกี่ยวกับ EF เพิ่มเติม (เพราะไม่มี “กิจกรรม” เหมือนวันธรรมดา)

### 3. AI Feedback ต่อคำตอบแบบทันที

หลังผู้ใช้ตอบคำถามแบบปลายเปิดในแต่ละวัน ระบบจะ:

1. ดึง “คำตอบตัวอย่าง/คำตอบผู้เชี่ยวชาญ” ที่เหมาะที่สุดจากฐาน FAQ (ผ่าน RAG)
2. ส่งให้โมเดล Generative AI ช่วยปรับสำนวนให้เข้ากับบริบท
3. ส่ง feedback แบบเฉพาะบุคคลที่ยังสอดคล้องกับแนวทางงานวิจัย

### 4. กิจกรรมเชิงโต้ตอบ (Interactive Activities)

บางวันจะเป็น **โหมดเกม** ที่มีคำถามย่อยหลายขั้น (sub-questions) ซึ่งอาจเป็น:

- **Open-ended** — ตอบเป็นข้อความอิสระ
- **Yes/No** — ปุ่ม quick reply ("เคย" / "ไม่เคย")
- **Multiple choice** — ปุ่ม quick reply จากตัวเลือกในฐานข้อมูล
- **Describe** — ข้อความอธิบาย + ปุ่ม "ไปยังคำถามถัดไป" (Next Question)

เมื่อจบเกม ระบบจะสรุป feedback แบบรวมจากคำตอบย่อยทั้งหมดผ่าน AI

### 5. การแจ้งเตือนรายวันด้วย Scheduled Jobs

`node-cron` จะส่งข้อความเตือนรายวันไปยังผู้ใช้ที่ยังไม่เริ่มทำกิจกรรมของวันนั้น หากส่งไม่สำเร็จ ระบบจะนำไปเข้าคิวและ retry ภายในช่วงเวลาที่ตั้งค่าได้

### 6. การควบคุมไทม์ไลน์จากส่วนกลาง [*เฉพาะช่วง “งานวิจัย” (ปลายเมษายน–ต้นมิถุนายน)]

การควบคุม week/day ของโปรแกรมจะอ้างอิงจากตาราง `central_timeline` เพียงจุดเดียว ผู้ใช้ทุกคนเดินตามไทม์ไลน์เดียวกัน เพื่อให้ทีมวิจัย “คุมความเร็ว” ของโปรแกรมได้

ผู้ใช้จะไม่สามารถข้ามไปเกินวันปัจจุบันของไทม์ไลน์กลางได้ แต่ถ้าผู้ใช้ตามหลัง ก็สามารถตามเก็บกิจกรรมที่พลาดได้ (รวดเดียวหรือทยอยทำเมื่อมีเวลา)

---

## Section 2 — Technical & Functional Highlights

จุดที่ทำให้ระบบนี้ไม่ trivial ในเชิงเทคนิค

---

### RAG Pipeline — Dual-Axis Similarity Matching + Generative Reformulation

RAG ทั่วไปมักจะ embed คำถามของผู้ใช้ → หาเอกสารที่ใกล้สุด → ส่งกลับคำตอบ แต่ระบบนี้ใช้ pipeline แบบ **สองขั้น** เพื่อรองรับข้อกำหนดด้านจริยธรรมงานวิจัย (ต้องใช้ถ้อยคำที่ใกล้เคียงกับเอกสารวิจัย/คำตอบที่ผ่านการอนุมัติ) โดยยังต้องทำให้คำตอบอ่านธรรมชาติและเข้ากับข้อความของผู้ใช้แต่ละคน

#### Stage 1 — ดึง FAQ ที่เหมาะที่สุด (มี fallback หลายชั้น)

ระบบค้นหา FAQ ที่ match ที่สุดด้วยกลยุทธ์ไล่ fallback ดังนี้:

```
Exact string match
        ↓ (miss)
Embedding cosine similarity on (question_text × 0.8) + (user_answer × 0.2)
        ↓ (score < threshold 0.85)
String similarity fallback (same weighted formula)
        ↓ (still no match)
Broader search across all questions in the same day/week
        ↓ (still no match)
Day-wide FAQ pool search (lowest threshold, last resort)
```

จุดตัดสินใจสำคัญคือการให้คะแนน “สองแกนพร้อมกัน”:

- similarity ของ `question_text` (น้ำหนัก 80%) — คำถามอยู่ในบริบทที่ถูกต้องไหม
- similarity ของ `user_answer` (น้ำหนัก 20%) — pattern ของคำตอบใกล้กับ FAQ ตัวนั้นไหม

สิ่งนี้สำคัญเพราะ “คำถามเดียวกัน” อาจต้องให้ feedback ต่างกันมากตามคำตอบที่ผู้ใช้ให้ (เช่น "เคย / 3" vs "ไม่เคย / 1")

embedding ภาษาไทยถูกคำนวณด้วย microservice **WangchanBERTa** ที่โฮสต์เอง (`/Embedding_Server_wangchanberta/`) เพราะเหมาะกับภาษาไทย และมี **in-memory embedding cache** (`embeddingClient.js`) เพื่อลดการเรียกซ้ำสำหรับข้อความ FAQ ที่เดิม ๆ

#### Stage 2 — Generative AI ปรับสำนวน (Reformulation)

เมื่อได้คำตอบ FAQ ที่ดีที่สุดแล้ว ระบบจะ **ไม่ส่งกลับตรง ๆ แบบลอกคำ** แต่จะส่งเข้าโมเดล (OpenAI `gpt-4o-mini` หรือ Google Vertex AI สลับได้ด้วย env `LLM_PROVIDER`) พร้อม prompt ที่สั่งให้:

- **คงโครงสร้างและข้อมูลสำคัญ** ของคำตอบที่ได้รับอนุมัติ (เพื่อความสอดคล้องด้านจริยธรรมงานวิจัย)
- **ปรับโทนและสำนวน** ให้เข้ากับบริบทคำตอบของผู้ใช้

> เหตุผลที่เลือกแนวทางนี้ เพราะทีมวิจัยต้องการให้คำตอบใกล้กับรูปแบบที่ผ่านการพิจารณาแล้ว แต่ถ้าตอบแบบ template ตายตัวจะดูแข็งและไม่เข้ากับภาษาของผู้ใช้แต่ละคน

---

### Per-User Mutex Lock — กันข้อความซ้อน/ตอบรัว

ผู้ใช้ LINE สามารถส่งข้อความหลายอันเร็วกว่าเวลาที่บอทประมวลผลได้ (โดยเฉพาะช่วงรอ AI ที่อาจใช้ 2–5 วินาที) ถ้าไม่มีตัวกัน จะเกิด:

- เขียน DB ซ้ำ
- race condition ของ state ผู้ใช้
- pointer เพี้ยน เช่น `current_question_number` หรือ `current_sub_question_order`

**แนวทางแก้ (`utils/userLock.js`):** ทำ per-user mutex ในหน่วยความจำ (in-memory) พร้อม TTL และ auto-refresh

```
User sends message → tryAcquireUserLock(userId)
      ↓ success              ↓ already locked
  Process event         Silently drop/ignore
  (AI call, DB writes)
      ↓
  releaseUserLock(userId)
```

รายละเอียดที่ตั้งใจทำ:

- TTL ของ lock ค่าเริ่มต้น **120 วินาที** — ครอบคลุมกรณี AI ช้า
- `startUserLockAutoRefresh()` จะยืด TTL ด้วย timer เพื่อกัน lock หมดอายุระหว่างประมวลผลยาว ๆ
- timer เรียก `.unref()` เพื่อไม่ให้มันรั้ง process ของ Node.js ไว้โดยไม่จำเป็น
- release lock ใน `finally` เพื่อให้ปล่อย lock แน่นอนแม้เกิด error

---

### บันทึกสถานะกิจกรรมแบบถาวร & กลับมาทำต่อได้

ความคืบหน้าทั้งหมดถูกเก็บลง PostgreSQL ทุก step:

| Field                        | Purpose                                        |
| ---------------------------- | ---------------------------------------------- |
| `current_week`               | ผู้ใช้อยู่สัปดาห์ที่เท่าไร                    |
| `current_day`                | ผู้ใช้อยู่วันไหนของสัปดาห์นั้น                |
| `current_question_number`    | ผู้ใช้อยู่ข้อคำถามหลักข้อที่เท่าไร            |
| `current_sub_question_order` | ผู้ใช้อยู่คำถามย่อยข้อที่เท่าไร (โหมดเกม)     |
| `is_in_activity`             | ขณะนี้ผู้ใช้อยู่ระหว่างทำกิจกรรมหรือไม่        |
| `has_started_today`          | ผู้ใช้เริ่มกิจกรรมของ “วันนี้” แล้วหรือยัง     |

ถ้าผู้ใช้ปิดแชตกลางกิจกรรม แล้วกลับมาอีกหลายชั่วโมง ระบบจะพากลับไปที่ตำแหน่งเดิมได้ทันที — ไม่ต้องเริ่มใหม่

---

### ตรวจจับ stuck state & กู้คืนอัตโนมัติ

edge case ที่เจอได้จริง: cron job ตอนเที่ยงคืนรีเซ็ต `has_started_today = false` และ `is_in_activity = false` แต่ `current_question_number` หรือ `current_sub_question_order` ยังชี้ไปที่กลางกิจกรรมอยู่ ทำให้เกิด “สภาพติดค้าง” — flag บอกว่ายังไม่เริ่ม แต่ pointer บอกว่าไปไกลแล้ว

`hasStuckActivityPointers(user)` จะตรวจจับดังนี้:

```js
// Stuck if question pointer is past default (1) OR sub-question pointer is set
// while daily flags have been reset
const hasNonDefaultQuestion = qNum !== 1;
const hasSubPointer = user.current_sub_question_order != null;
return hasNonDefaultQuestion || hasSubPointer;
```

ถ้าตรวจเจอ ระบบจะ re-present คำถามที่ค้างอยู่ให้ผู้ใช้ เพื่อไปต่อได้แบบไม่สะดุด

---

### Central Timeline Gating

ทีมวิจัยขยับวัน/สัปดาห์ของโปรแกรมผ่านตาราง `central_timeline` แทนการปล่อยให้มันวิ่งตามเวลาอัตโนมัติ ช่วยให้ทีมคุม pace ได้ละเอียด

- ผู้ใช้ **ไปเกินวันปัจจุบัน** ของไทม์ไลน์กลางไม่ได้ (กันผู้ใช้รีบทำล่วงหน้า)
- ผู้ใช้ที่ **ตามหลัง** จะได้รับข้อความบอกว่าตามหลังอยู่กี่วัน พร้อมปุ่ม quick reply ให้ทำต่อได้ทันที
- ระบบคำนวณ index ไทม์ไลน์เป็น `(week - 1) * 5 + day` (จันทร์–ศุกร์ 5 วัน/สัปดาห์) และข้าม weekend ถูกต้องด้วย `Intl.DateTimeFormat`

---

### ชั้นความปลอดภัยของ LINE API (Safety Layer)

ข้อความขาออกทั้งหมดจะผ่านขั้น sanitize ก่อนส่งไป LINE API:

- **sanitize ข้อความ** — ตัด/ย่อส่วนที่อาจทำให้ LINE API reject
- **ตัด label ของ quick reply** — LINE จำกัด label 20 ตัวอักษร; `truncateLineLabel()` จัดการให้
- **แบ่ง batch** — LINE จำกัดสูงสุด 5 ข้อความต่อ 1 API call; `replyThenPushInBatches()` แบ่งให้อัตโนมัติ
- **fallback เมื่อ reply token หมดอายุ** — reply token มักหมดอายุราว ~30 วินาที; ถ้า `replyMessage()` fail ด้วย token error จะ fallback ไป `pushMessage()` โดยใช้ LINE User ID เพื่อให้ผู้ใช้ยังได้รับข้อความ

---

## Project Structure

```
index.js                  — Main webhook handler and event router (orchestration core)
cronJob.js                — Daily reminders, timeline auto-advance, retry queue
feedback.js               — Per-answer feedback delivery logic
adminNotifications.js     — Admin progress report scheduler
handlers/
  onboardingHandler.js    — User registration flow (name / birthday / child-code steps)
  menuHandler.js          — Static info commands (about, calendar, research, contact)
  adminHandler.js         — Admin-only day/week selection flow
  activityHandler.js      — Activity lifecycle (start / resume / next / summary / game sub-questions)
  gameHandler.js          — Game-mode sub-question flow and collective feedback
utils/
  ragFeedback.js          — Full RAG pipeline (retrieval + AI reformulation)
  embeddingClient.js      — WangchanBERTa client with in-memory cache
  llmClient.js            — Unified LLM abstraction (OpenAI / Vertex AI)
  userLock.js             — Per-user in-flight mutex
  lineClient.js           — LINE API helpers, sanitization, reply-fallback
  dateHelpers.js          — Timezone-aware date utilities (Intl-based)
  weeklySurveys.js        — Weekly check-in survey push logic
Embedding_Server_wangchanberta/
  main.py                 — FastAPI embedding server
  wangchanberta_embedding.py — WangchanBERTa model loader
```

---

## Folder Architecture

โปรเจกต์นี้จัดโครงแบบ **Chain-of-Responsibility + Modular Handler**
`handleEvent` ใน `index.js` จะทำหน้าที่เป็น orchestrator: เรียก handler ตามลำดับความสำคัญ และหยุดทันทีเมื่อ handler ใดรับผิดชอบ message นั้น ๆ แล้ว (handler ที่ไม่เกี่ยวจะคืน `null` เพื่อส่งต่อให้ตัวถัดไป)

| Folder / File                     | Architectural Role                                                                                              | Separation Rationale                                                                                                                   |
| --------------------------------- | --------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `index.js`                        | **Orchestrator** — webhook entry point, user lock, central timeline gating, stuck-state recovery, handler chain | รวม cross-cutting concerns (auth/locking/gating) ที่ต้องรันก่อน logic อื่นเสมอ                                                         |
| `handlers/`                       | **Domain Handlers** — แต่ละไฟล์ดูแล flow ฝั่งผู้ใช้หนึ่งบริบท                                                     | แยกตาม _user intent / conversation state_ ไม่ใช่ตามชนิดคำถาม; 1 handler = 1 context การสนทนา                                          |
| `handlers/onboardingHandler.js`   | ดูแล flow ลงทะเบียน `profile_step` (multi-turn)                                                                | แยกเพื่อให้มัน “ขัดจังหวะ” flow อื่นได้เสมอเมื่อผู้ใช้ยังลงทะเบียนไม่ครบ                                                           |
| `handlers/menuHandler.js`         | ดูแลคำสั่งข้อมูลคงที่ (about/calendar/research/contact…)                                                         | เป็น read-only ไม่มี side-effects ฝั่ง DB; ปลอดภัยที่จะเรียกได้ทั้งช่วง buttons stage และ fallback stage                              |
| `handlers/adminHandler.js`        | ดูแล flow ของ admin (เลือกวัน/สัปดาห์)                                                                          | กันไม่ให้ logic admin ไปรบกวนผู้ใช้ทั่วไป; gated ด้วย `user.is_admin`                                                                  |
| `handlers/activityHandler.js`     | ดูแล lifecycle กิจกรรม (start → answer loop → summary → pending confirm → game sub-questions)                  | โดเมนใหญ่ที่สุด; เป็นเจ้าของการ mutate state สำคัญ (`has_started_today`, `is_in_activity`, `current_question_number`)                |
| `handlers/gameHandler.js`         | ดูแล flow โหมดเกม + สรุป feedback รวม                                                                            | แยกเพราะเกมใช้ pointer เพิ่ม (`current_sub_question_order`) และมี DB state หลายขั้น                                                   |
| `utils/`                          | **Infrastructure / Cross-cutting Utilities**                                                                    | แยกตาม _ความสามารถทางเทคนิค_ ไม่ใช่ฟีเจอร์; แต่ละ util จะ stateless หรือคุม resource ร่วมอย่างเดียว                                 |
| `utils/ragFeedback.js`            | pipeline RAG (retrieval + AI reformulation)                                                                     | แยกเป็นฟังก์ชัน async ที่ไม่รู้จัก LINE และไม่ยุ่ง state ผู้ใช้                                                                         |
| `utils/embeddingClient.js`        | client WangchanBERTa + in-memory cache                                                                          | แยกเพื่อคุมอายุ cache ให้เป็น lifecycle ของ service ไม่ผูกกับ request                                                                   |
| `utils/llmClient.js`              | abstraction ของ LLM (OpenAI / Vertex AI)                                                                        | logic สลับ provider อยู่ที่เดียว ทำให้ caller ไม่ผูกกับ provider                                                                        |
| `utils/userLock.js`               | mutex ต่อผู้ใช้ (TTL + auto-refresh)                                                                             | แยกเพราะต้อง acquire lock ก่อน logic ธุรกิจทุกอย่างเสมอ                                                                                |
| `utils/lineClient.js`             | helper ของ LINE API — sanitize, truncate label, batch split, reply fallback                                     | รวมกฎความปลอดภัยของ LINE API ไว้จุดเดียว เพื่อไม่ให้ handler ต้องเขียนซ้ำ                                                                |
| `utils/dateHelpers.js`            | util เวลา/เขตเวลา (`Intl`-based ไม่มี deps เพิ่ม)                                                                 | แยกเพื่อไม่ต้องทำซ้ำ logic timezone ระหว่าง cron/gating/handlers                                                                       |
| `Embedding_Server_wangchanberta/` | **External Microservice** — Python/FastAPI embedding server                                                     | deploy แยกจาก Node.js เพื่ออัปเกรด/สลับโมเดล embedding ได้โดยไม่ต้องแตะตัวบอทหลัก                                                      |

---

## Validation / Quality (Draft)

Repo นี้มาจากระบบ production และใช้แนวทาง validation แบบ **manual-first** (LINE + PostgreSQL + external AI services ทำให้ reproducible แบบสาธารณะได้ยาก) โดยระบบถูกใช้งานจริงในช่วงงานวิจัย

### แนวทาง validation

- **หลัก:** manual testing กับ flow สนทนาจริง (message → อัปเดต DB state → reply/push)
- **รอง:** ตรวจความปลอดภัยพื้นฐานของ runtime (เช็ค syntax, lint เท่าที่ทำได้) และ refactor แบบค่อยเป็นค่อยไปโดยคงพฤติกรรมเดิม

### Manual test checklist (8–12 flow หลัก)

ใช้เป็นรายการ regression หลัง refactor แต่ละรอบ

1. **เริ่ม onboarding**
   **เงื่อนไขก่อนเริ่ม:** ผู้ใช้ใหม่ (ยังไม่มี row ใน DB) หรือผู้ใช้มีค่า `profile_step` ค้างอยู่
   **อินพุต:** follow event หรือข้อความใด ๆ
   **ผลที่คาดหวัง:** บอทถามข้อมูลโปรไฟล์ที่ต้องการถัดไป และไม่พาเข้าสู่ activity flow
   - เพื่อให้แน่ใจว่าผู้ใช้กรอกข้อมูลครบก่อนเริ่มโปรแกรม

2. **เริ่มกิจกรรมของวันนี้**
   **เงื่อนไขก่อนเริ่ม:** ผู้ใช้ลงทะเบียนแล้ว และยังไม่อยู่ใน activity
   **อินพุต:** `เริ่มกิจกรรมวันนี้`
   **ผลที่คาดหวัง:** เซ็ต flag รายวัน (`has_started_today`, `is_in_activity`) และตอบกลับด้วยคำถามแรก/ข้อความเริ่มต้น

3. **Guard: ต้องเริ่มกิจกรรมก่อนถึงตอบได้**
   **เงื่อนไขก่อนเริ่ม:** ผู้ใช้ลงทะเบียนแล้ว และ `has_started_today=false`, `is_in_activity=false`
   **อินพุต:** ข้อความที่ดูเหมือนกำลังตอบคำถาม (แต่ยังไม่เริ่มกิจกรรม)
   **ผลที่คาดหวัง:** บอทตอบ “กรุณากด "เริ่มกิจกรรมวันนี้" ก่อนค่ะ” พร้อมปุ่ม quick reply
   - เพื่อให้ระบบรู้ว่าผู้ใช้อยู่วัน/สัปดาห์ไหน และผูกคำตอบเข้ากับคำถามที่ถูกต้อง ลดความเสี่ยง state พัง

4. **ยืนยันคำตอบที่ค้าง — กดใช่**
   **เงื่อนไขก่อนเริ่ม:** แสดงหน้าคอนเฟิร์มคำตอบแล้ว
   **อินพุต:** `ใช่ ส่งเลย`
   **ผลที่คาดหวัง:** บันทึกคำตอบลงตาราง/ตำแหน่งที่ถูกต้อง สร้างและส่ง feedback (ถ้ามี) และเลื่อน pointer ไปข้อถัดไป

5. **เกม — คำถามย่อยแบบ Yes/No**
   **เงื่อนไขก่อนเริ่ม:** ผู้ใช้อยู่ในคำถามแบบเกม (`question_type=game`) และ `current_sub_question_order` ชี้ไปที่คำถามย่อย Yes/No
   **อินพุต:** กด quick reply (เช่น “เคย/ไม่เคย”)
   **ผลที่คาดหวัง:** บันทึกคำตอบย่อย เลื่อน pointer ไปคำถามย่อยถัดไป และบอทส่ง prompt ของคำถามถัดไป

6. **เกม — คำถามย่อยแบบ Describe/Next**
   **เงื่อนไขก่อนเริ่ม:** ผู้ใช้อยู่ในคำถามย่อยประเภท describe
   **อินพุต:** `ไปยังคำถามถัดไป`
   **ผลที่คาดหวัง:** เลื่อน pointer โดยไม่ต้องมีคำตอบข้อความ แล้วส่งคำถามย่อยถัดไป
   - บางครั้งใส่คำอธิบายยาว ๆ ใน bubble เดียวอ่านยาก แต่ถ้าแยกหลาย bubble จะทำให้ผู้ใช้สับสนว่าเป็นคำถามหรือไม่ จึงใช้ type describe เพื่อบอกว่าเป็น “ข้อมูล” และพร้อมไปคำถามจริงถัดไป

7. **กู้ stuck state หลังรีเซ็ตตอนเที่ยงคืน**
   **เงื่อนไขก่อนเริ่ม:** pointer ของผู้ใช้ยังค้าง (เช่น `current_question_number != 1` หรือ `current_sub_question_order != null`) แต่ daily flags ถูกรีเซ็ตแล้ว
   **อินพุต:** ส่งข้อความใด ๆ
   **ผลที่คาดหวัง:** บอทเสนอให้ resume หรือ restart; ถ้า resume จะเซ็ต flag กลับและ replay คำถาม/คำถามย่อยที่ค้าง

   เวลา user ทำกิจกรรม ระบบต้องตรวจหลาย flag เพื่อรู้ว่าผู้ใช้อยู่ข้อไหน (เช่น `current_question_number`, `current_sub_question_order`, `is_in_activity`, `has_started_today`) แต่บางครั้งผู้ใช้ออกจากกิจกรรมไปนาน ทำให้เกิดปัญหาทีหลัง (เช่น กลับมาแล้วอยากเริ่มใหม่ หรือมีการอัปเดตบางอย่างทำให้ flag เพี้ยน)
   ดังนั้นจึงเพิ่ม logic ตรวจ flag เสมอ เพื่อลด bug และให้ตัวเลือก resume/restart ได้พร้อมกัน

8. [ เฉพาะช่วงวิจัย — จะเอาออกหลังเปิดสาธารณะเต็มรูปแบบ ]
   **Central timeline gating (ผู้ใช้ทำล่วงหน้าเกินกำหนด)**
   **เงื่อนไขก่อนเริ่ม:** ผู้ใช้ “นำหน้า” ตาราง `central_timeline` และไม่ใช่ admin
   **อินพุต:** คำสั่งที่เกี่ยวกับกิจกรรม (start/next/summary)
   **ผลที่คาดหวัง:** บอทบล็อกไม่ให้ไปต่อ และรีเซ็ต activity state ให้ปลอดภัย

9. **คำสั่งเมนู/ข้อมูลต้องเป็น stateless**
   **เงื่อนไขก่อนเริ่ม:** ผู้ใช้ลงทะเบียนแล้ว
   **อินพุต:** คำสั่งเมนู (about/calendar/research/contact)
   **ผลที่คาดหวัง:** บอทตอบข้อมูล และไม่ไปเปลี่ยน pointer ของกิจกรรม
