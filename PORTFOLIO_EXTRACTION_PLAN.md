# Portfolio Extraction Plan (Reference)

> เป้าหมาย: คัด “โค้ดที่แสดงวิธีคิด/สถาปัตยกรรม” จาก repo นี้ ไปทำเป็น repo public สำหรับ portfolio โดย **ห้ามมี secret / credential / dump / prompt-train data / ข้อมูลผู้ใช้จริง**

## 0) Constraints (ล็อกขอบเขต)
- ทำแบบ **read-only audit + plan** ใน repo ต้นฉบับ (ยังไม่ refactor โค้ดจริงในรอบนี้)
- ส่วน **LLM/RAG/Embedding** ต้องทำเป็น **stub** ใน repo portfolio (คง interface/flow แต่ไม่ใส่ prompt จริง/logic จริง)
- DB schema อนุญาตเป็น **dummy** (table/column ชื่อทั่วไป) และตัวอย่าง data ต้องเป็น dummy
- ห้ามคัดลอก: ข้อมูลผู้ใช้, backup SQL, .env จริง, service account, ไฟล์เทรน/พรอมต์, เอกสารภายใน

## 1) Safety Preflight Checklist (ก่อน public)
### 1.1 เช็คว่าไม่มี secret เคยถูก commit
- รันคำสั่ง (ใน repo ต้นฉบับ):
  - `git log --all --oneline -- gcloud .history Milk_ChatBot_Asset plain_document_for_reading` (ควรไม่มี output)
  - `git ls-files gcloud .history Milk_ChatBot_Asset plain_document_for_reading` (ควรว่าง)
  - `git check-ignore -v gcloud/* .history/* Milk_ChatBot_Asset/* plain_document_for_reading/*` (ควร match .gitignore)

> ถ้าเคย commit ไปแล้ว: ต่อให้ลบไฟล์ตอนนี้ก็ยังอยู่ใน history ต้อง rotate key + purge history (เช่น filter-repo) ก่อนเปิด public

### 1.2 โฟลเดอร์/ไฟล์ที่ต้อง “ห้าม” โผล่ใน repo public
- `gcloud/` (service account JSON มี private_key)
- `.history/` (มี .env/keys เก่า)
- `Milk_ChatBot_Asset/` (DB backup)
- `plain_document_for_reading/` (prompt/training/เอกสารภายใน)
- `Embedding_Server_wangchanberta/` (model server / assets)
- `*.sql` ที่เป็น dump/real schema, `database.json` ถ้ามีข้อมูลจริง

## 2) File Marking: INCLUDE / STUB / EXCLUDE
> หมายเหตุ: “INCLUDE/STUB” หมายถึงการคัดไป repo portfolio (ไม่ใช่การแก้ใน repo นี้)

### 2.0 Root-level files (ภาพรวม)
- STUB: `index.js` (มี Google Form routes/URL hardcode, log ที่พิมพ์ payload/คำตอบ, wiring หลายส่วน)
- STUB: `cronJob.js` (มีข้อความ/URL แบบสอบถาม, logic retry/DB)
- STUB: `db.js` (DB adapter มี startup connection test + logging; ใน portfolio ควรทำเป็น mock/adapter ตัวอย่าง)
- STUB: `feedback.js` (สร้าง prompt + query EF skills จาก DB + เรียก RAG/LLM)
- STUB: `adminNotifications.js` (cron รายงาน admin + schema เฉพาะ)
- EXCLUDE: `.env` (ไฟล์ local secret แม้ไม่ถูก track ก็ห้ามคัดไป)
- EXCLUDE: `database.json` (มี DB password แบบ hardcode)
- EXCLUDE: `answerFeedbackLog.js` (มี FAQ/คำตอบจริง; ใน portfolio ให้ใช้ dummy/sample เท่านั้น)
- EXCLUDE: `gcloud/`, `.history/`, `Milk_ChatBot_Asset/`, `plain_document_for_reading/`, `Embedding_Server_wangchanberta/`
- EXCLUDE: `add_super_admin_column.sql`, `setup_fresh_database.sql`, `migrations/` (ยกเว้นจะทำ dummy schema ใหม่แทน)
- REVIEW: `README.md`, `REFACTOR_PLAN.md`, `DATABASE_CHANGES_NEEDED.md` (คัดได้บางส่วนถ้าไม่มีข้อมูลภายใน)
 - EXCLUDE: `migrate-faqs.js` (สคริปต์ migration ที่อิง FAQ content จริง)

### 2.1 INCLUDE (คัดไปได้เกือบตรง ๆ)
- `config/lineConfig.js` — อ่าน env + สร้าง LINE client (ปลอดภัยถ้าไม่มีค่า secret จริง)
- `utils/lineClient.js` — sanitize + safeReplyOrPush (แสดงแนวคิด reliability)
- `utils/userLock.js` — per-user in-memory lock (แสดงแนวคิดกัน race)
- `utils/dateHelpers.js` — timezone/date helpers
- `handlers/menuHandler.js` — โครงสร้างเมนู + quickReply (อาจลดข้อความ/URL ถ้าไม่อยากเผย content)

### 2.2 STUB (คง interface/flow แต่ลบเนื้อหา/logic/DB specifics)
- `index.js` — คง architecture: webhook entry, stage routing, lock usage, LINE send wrappers; ตัด routes/URL ของ Google Form + ตัด verbose logs + ตัด dependency กับ FAQ content จริง
- `cronJob.js` — คง structure การ register cron + retry, แต่ตัด logic ที่อิง DB จริง/ข้อความจริง
- `db.js` — ทำเป็น DB adapter ตัวอย่าง (mock pool / interface) ไม่ต้อง connect DB จริง
- `feedback.js` — คง interface `getFeedbackForAnswer` แต่ใช้ dummy prompt และ dummy response
- `adminNotifications.js` — คงแนวคิด “admin report cron” แต่ใช้ dummy rows/adapter
- `handlers/onboardingHandler.js` — คง flow follow/registration แต่ stub SQL + ข้อความยาว
- `handlers/activityHandler.js` — คง state machine/branching แต่ตัด query/ตารางจริง/ข้อความจริง
- `handlers/gameHandler.js` — คง flow sub-question แต่ตัด content + DB table names
- `handlers/adminHandler.js` — คงแนวคิด “admin flow” แต่ stub DB update
- `utils/llmClient.js` — คง provider factory แต่ **ลบ systemInstruction/prompt จริง** (ใช้ placeholder)
- `utils/ragFeedback.js` — คง function signature + แนวคิด similarity/threshold แต่ตัด keyword map/FAQ content/DB access
- `utils/embeddingClient.js` — คง client shape แต่ stub endpoint/return fixed vector หรือ mock
- `utils/weeklySurveys.js` — คง “send once per week” logic แต่ลบ Google Forms URL จริง/ข้อความจริง
- `utils/richMenuManager.js` — ส่วนใหญ่ปลอดภัย แต่ใน portfolio ควรทำเป็น placeholder IDs และอย่าอิง client แบบ global ถ้าไม่จำเป็น

### 2.3 EXCLUDE (ห้ามคัดไป)
- `gcloud/`, `.history/`, `Milk_ChatBot_Asset/`, `plain_document_for_reading/`, `Embedding_Server_wangchanberta/`
- DB dumps / user data logs: เช่น `line_chatbot_milk_db_backup.sql`, ไฟล์ log ที่มี payload จริง
- `answerFeedbackLog.js` (ใน portfolio ให้ replace ด้วย dummy FAQs)
- `database.json`
- สคริปต์ปฏิบัติการ: `scripts/` (มักมี logic ส่ง message/แก้ DB จริง)
- ไฟล์เชิง ops ที่อาจเฉพาะโปรดักชัน: `ecosystem.config.*`, `render.yaml` (จะคัดเฉพาะถ้าต้องการโชว์ deployment แบบไม่เผยค่า)

## 3) Portfolio Repo Shape (โครงใน repo ใหม่)
- `src/`
  - `index.js` (server/webhook)
  - `handlers/` (stub + include)
  - `utils/` (include + stub)
  - `config/`
- `schema/`
  - `dummy_schema.sql`
- `.env.example` (ตัวแปร env ชื่อเท่านั้น ไม่มีค่า)
- `README.md` (อธิบาย architecture + sequence)

## 4) Dummy DB Schema (ใช้สำหรับอ่านโครง ไม่ใช่ข้อมูลจริง)
แนะนำ `schema/dummy_schema.sql` (ชื่อ table กลาง ๆ):
- `users` (id, line_user_id, display_name, current_week, current_day, flags)
- `questions` (id, week, day, order, type, text)
- `user_answers` (id, user_id, question_id, answer_text, created_at)
- `user_surveys` (id, user_id, survey_type, status, sent_at, completed_at)
- `message_retry_log` (id, line_user_id, payload_json, status, created_at)

## 5) Round Plan (ทำทีละรอบ)
### Round 1 — Deep scan & finalize mapping
- ไล่ดูไฟล์ใน `handlers/` และ `utils/` ทีละไฟล์ แล้วสรุป “จะคัด/จะ stub/จะ exclude” พร้อมเหตุผล 1 บรรทัด

### Round 1 — Findings (สรุปจากการสแกนครั้งนี้)
- `answerFeedbackLog.js` ถูก git track และมี FAQ/คำตอบจริง → ห้ามย้ายไป repo portfolio แบบตรง ๆ (ทำ dummy แทน)
- `database.json` มี password แบบ hardcode (แม้จะไม่ถูก track) → ห้ามคัดไป repo public
- `index.js` มี hardcode Google Form URL + routes + verbose logs ที่อาจพิมพ์ payload/คำตอบผู้ใช้ → ใน portfolio ต้อง stub/redact
- `utils/llmClient.js` มี systemInstruction ภาษาไทยของจริง → ใช้ placeholder ใน portfolio
- `utils/weeklySurveys.js` มี Forms URL ของจริง → ใช้ placeholder ใน portfolio

### Round 1 — Detailed file map (เหตุผล 1 บรรทัด/ไฟล์)

| Path | Mark | Rationale | Portfolio action notes |
|---|---|---|---|
| `index.js` | STUB | มี routes/URL/DB wiring + log ที่อาจพิมพ์ข้อมูลผู้ใช้/คำตอบ | ตัด Google Form API routes, ตัด hardcoded `forms.gle`, ลด logs ให้เหลือ event-shape เท่านั้น, แยก adapter interface (LINE/DB/LLM) |
| `cronJob.js` | STUB | มีข้อความ broadcast/แบบสอบถาม + retry/DB specifics | คงโครง schedule/retry, ลบข้อความยาว+URL, เปลี่ยน query เป็น adapter/mock |
| `db.js` | STUB | เป็น production DB adapter + startup connection test + logging environment | ทำเป็น `createDbClient()` แบบ mock หรือ interface-only, ห้าม log env/host |
| `feedback.js` | STUB | สร้าง prompt + query EF skills + เรียก RAG/LLM | คง signature, ใช้ placeholder prompt + dummy feedback |
| `adminNotifications.js` | STUB | Cron ส่งรายงานจากตารางผู้ใช้ (schema เฉพาะ) | คง table formatting + chunking, ทำ data source เป็น dummy |
| `answerFeedbackLog.js` | EXCLUDE | มี FAQ/คำตอบจริง และถูก git track | สร้าง `faqs.sample.js` ที่เป็น dummy 3–5 entries แทน |
| `database.json` | EXCLUDE | มี password hardcode | ใช้ `.env.example` เท่านั้น |
| `migrate-faqs.js` | EXCLUDE | สคริปต์ migration อิง FAQ content จริง | ไม่ต้องคัดไป portfolio |
| `package.json` | INCLUDE | ไว้โชว์ tech stack/deps และรันตัวอย่าง | ถ้าแยก repo ใหม่ อาจลด deps ให้เหลือเท่าที่ demo ต้องใช้ |
| `package-lock.json` | INCLUDE | Lockfile ไม่มี secret และช่วย reproducibility | ใน portfolio จะเก็บหรือ regenerate ก็ได้ |
| `README.md` | REVIEW | มีรายละเอียดโปรเจกต์จริง + อาจมีตัวเลข/รายละเอียดงานวิจัย | แนะนำเขียน README ใหม่แบบ portfolio (ไม่คัดทั้งไฟล์) |
| `embedding_service.py` | REVIEW | โค้ด microservice embeddings (ไม่มี secret) แต่เพิ่ม scope เป็น multi-service | ถ้าจะโชว์ “embedding boundary” ให้คงไว้/หรือ stub ให้ return dummy embeddings |
| `requirements.txt` | REVIEW | deps ของ embedding_service (ไม่มี secret) | คัดเฉพาะถ้ารวม Python service ใน portfolio |
| `config/lineConfig.js` | INCLUDE | อ่าน env และสร้าง LINE client (ไม่มี secret ในไฟล์) | ใน portfolio ใส่ `.env.example` ชื่อ var เท่านั้น |
| `handlers/menuHandler.js` | INCLUDE | โครง quickReply + non-interrupt guard ชัด | ถ้าไม่อยากเผย asset/URL ให้แทนรูปเป็น placeholder |
| `handlers/onboardingHandler.js` | STUB | มี SQL insert/update + ข้อความ onboarding ยาว | คง flow follow→register→profile_step, เปลี่ยน DB เป็น mock + ลดข้อความ |
| `handlers/activityHandler.js` | STUB | เป็น state machine หนัก + query หลายตาราง | เก็บเฉพาะ “branching pattern” + interface calls, ตัด schema/table names |
| `handlers/gameHandler.js` | STUB | อิง DB schema เกม/ซับคำถาม + feedback generation | คงแนวคิด sub-question pointer, ตัด content + DB specifics |
| `handlers/adminHandler.js` | STUB | อิง user flags + update week/day | คงแนวคิด multi-step selection, ใช้ mock DB |
| `utils/lineClient.js` | INCLUDE | Sanitization + reply→push fallback + batching เป็น reusable architecture | ปรับตัวอย่างให้ไม่มี payload จริง/PII ใน logs |
| `utils/userLock.js` | INCLUDE | แนวคิด per-user mutex ชัดและเป็น generic | ใช้ได้ตรง ๆ |
| `utils/dateHelpers.js` | INCLUDE | Pure timezone/date helpers | ใช้ได้ตรง ๆ |
| `utils/llmClient.js` | STUB | มี systemInstruction ของจริง + provider wiring | ลบ prompt จริงทั้งหมด, เหลือ factory + fake stream |
| `utils/ragFeedback.js` | STUB | มี prompt templates + keyword maps + DB queries | คง signature + pseudo steps (embed→match→fallback), ตัด prompt/text จริง |
| `utils/embeddingClient.js` | STUB | อิง embedding microservice endpoint | ใช้ mock embedding vector/PRNG, ห้ามเรียก service จริง |
| `utils/weeklySurveys.js` | STUB | มีข้อความ/Forms URL ของจริง | Replace URL + copy เป็น placeholder |
| `utils/richMenuManager.js` | STUB | มี menu IDs (แม้เป็น placeholder) + global client coupling | คง interface, ให้รับ client เป็น parameter, ใช้ placeholder IDs |

> Note: รายการ INCLUDE ข้างบน “ปลอดภัยเชิงโค้ด” แต่ถ้าข้อความ/URL เป็น content ภายในองค์กร ให้เปลี่ยนเป็น placeholder ก่อน public เสมอ

### Round 2 — Create portfolio snapshot folder (ใน repo นี้เพื่อเตรียมย้าย)
- สร้าง `portfolio/public_snapshot/` แล้ว copy เฉพาะไฟล์ที่ mark เป็น INCLUDE/STUB (ยังไม่ push)

### Round 3 — Stub pass
- Replace/blank-out:
  - prompt/systemInstruction
  - ข้อความยาว/URL เฉพาะกิจ
  - SQL table names ที่ชี้ schema จริง
  - payload ตัวอย่างที่ใกล้เคียงข้อมูลจริง

#### Round 3 — Status (Completed in `portfolio/public_snapshot/`)
- `db.js` เปลี่ยนเป็น DB client stub (ไม่ connect / ไม่ log env / ไม่เผย host)
- AI boundary stubs:
  - `utils/llmClient.js` เป็น LLM stub + `[SYSTEM_PROMPT_REDACTED_FOR_PORTFOLIO]`
  - `utils/ragFeedback.js` เป็น RAG stub (คง exports, ไม่มี prompt templates/DB)
  - `utils/embeddingClient.js` เป็น deterministic pseudo-embedding (ไม่เรียก service จริง)
- Surveys/forms:
  - `utils/weeklySurveys.js` ลบ Google Forms URL จริง + เพิ่ม compat exports
  - ปิด endpoints form ingestion ใน snapshot `index.js` (ตอบ 501)
- ลดการเผย schema/content:
  - `index.js` ใน snapshot ถูกย่อเป็น orchestrator ตัวอย่าง (webhook→lock→handler chain) และตัด SQL/routes/ข้อความยาวที่อิงระบบจริง
  - `handlers/*` ที่อิง DB หนัก ถูกแทนด้วย stubs ที่ยังโชว์ control-flow แต่ไม่มี SQL/schema
  - `adminNotifications.js`, `cronJob.js`, `utils/richMenuManager.js` ถูก stub เป็น no-op เพื่อไม่เผย IDs/schema
- เพิ่ม dummy content แทนไฟล์ที่ exclude:
  - `answerFeedbackLog.js` ใน snapshot เป็น sample dummy entries

#### Redaction rules (กติกา stub แบบชัด ๆ)
- Secrets: ห้ามมีค่า token/key ใด ๆ (แม้จะ mask แล้ว) ในไฟล์/README/ตัวอย่าง
- Prompts: ห้ามคัด systemInstruction/prompt ที่เป็นของจริง → ใช้ placeholder เช่น `"[SYSTEM_PROMPT_REDACTED]"`
- URLs: ลบ/แทนที่ URL แบบสอบถาม/ลิงก์ภายในองค์กร/asset เฉพาะกิจ
- DB: เปลี่ยน table/column ชื่อเฉพาะ (เช่น `game_sub_questions`, `feedback_messages`) เป็นชื่อ generic ใน portfolio
- Logs: หลีกเลี่ยงการ log payload ที่อาจมีข้อความผู้ใช้จริง; ใช้ snippet สั้น ๆ หรือ dummy

### Round 4 — README + diagrams
- เพิ่ม sequence diagram (Webhook flow, Cron flow, Locking)
- ระบุ boundary: LINE adapter / DB adapter / LLM adapter

#### Round 4 — Status (Completed)
- `portfolio/public_snapshot/README.md` ใช้เนื้อหาเดียวกับ README หลัก + เพิ่มกล่องหมายเหตุด้านบนชัดเจนว่าเป็น **portfolio snapshot / architecture showcase** (ไม่ใช่ทั้งโปรเจค และส่วน business/integration จริงถูกตัด/ทำ stub)
- ก็อปรูปทั้งหมดจาก `readme_pictures/` มาไว้ที่ `portfolio/public_snapshot/readme_pictures/` เพื่อให้แสดงผลบน GitHub เหมือนกัน

## 6) Decisions Log
- [ ] ยืนยันว่าจะเปิด public แบบ “architecture showcase” ไม่ใช่ “production deployable”
- [ ] LLM/RAG/Embedding = stub
- [ ] DB schema = dummy

---

## Appendix A: Architecture Notes (สรุปสั้น)
- Webhook เข้า `/callback` → route event → handlers ตาม stage
- Reliability: sanitize messages + fallback reply→push + batch sending
- Concurrency: per-user lock กัน event ซ้อน
- Cron: schedule reminders/admin reports + retry logs
- AI boundary: LLM client factory + RAG similarity pipeline (stub ใน portfolio)
