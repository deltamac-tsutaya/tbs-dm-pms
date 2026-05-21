# CLAUDE.md — 12-rule template

These rules apply to every task in this project unless explicitly overridden.
Bias: caution over speed on non-trivial work. Use judgment on trivial tasks.

## Rule 1 — Think Before Coding
State assumptions explicitly. If uncertain, ask rather than guess.
Present multiple interpretations when ambiguity exists.
Push back when a simpler approach exists.
Stop when confused. Name what's unclear.

## Rule 2 — Simplicity First
Minimum code that solves the problem. Nothing speculative.
No features beyond what was asked. No abstractions for single-use code.
Test: would a senior engineer say this is overcomplicated? If yes, simplify.

## Rule 3 — Surgical Changes
Touch only what you must. Clean up only your own mess.
Don't "improve" adjacent code, comments, or formatting.
Don't refactor what isn't broken. Match existing style.

## Rule 4 — Goal-Driven Execution
Define success criteria. Loop until verified.
Don't follow steps. Define success and iterate.
Strong success criteria let you loop independently.

## Rule 5 — Use the model only for judgment calls
Use me for: classification, drafting, summarization, extraction.
Do NOT use me for: routing, retries, deterministic transforms.
If code can answer, code answers.

## Rule 6 — Token budgets are not advisory
Per-task: 4,000 tokens. Per-session: 30,000 tokens.
If approaching budget, summarize and start fresh.
Surface the breach. Do not silently overrun.

## Rule 7 — Surface conflicts, don't average them
If two patterns contradict, pick one (more recent / more tested).
Explain why. Flag the other for cleanup.
Don't blend conflicting patterns.

## Rule 8 — Read before you write
Before adding code, read exports, immediate callers, shared utilities.
"Looks orthogonal" is dangerous. If unsure why code is structured a way, ask.

## Rule 9 — Tests verify intent, not just behavior
Tests must encode WHY behavior matters, not just WHAT it does.
A test that can't fail when business logic changes is wrong.

## Rule 10 — Checkpoint after every significant step
Summarize what was done, what's verified, what's left.
Don't continue from a state you can't describe back.
If you lose track, stop and restate.

## Rule 11 — Match the codebase's conventions, even if you disagree
Conformance > taste inside the codebase.
If you genuinely think a convention is harmful, surface it. Don't fork silently.

## Rule 12 — Fail loud
"Completed" is wrong if anything was skipped silently.
"Tests pass" is wrong if any were skipped.
Default to surfacing uncertainty, not hiding it.

---

# 得利蔦屋 營運管理系統 — 開發指引

## 專案概覽

單頁 PWA（Progressive Web App），讓門市人員查看當日班表與人力狀況。
後台（admin.html）負責從 Excel 上傳班表資料到 Firebase Firestore，前台（index.html）即時讀取顯示。

## 檔案結構

```
index.html        前台主要頁面（單一 HTML 檔，含所有 CSS/JS）
admin.html        後台管理頁面（上傳班表、管理員工職稱）
firebase-config.js  Firebase 設定（含 Firestore 安全規則說明）
sw.js             Service Worker（PWA 離線快取，目前版本 schedule-v8）
manifest.json     PWA manifest
```

## Firebase Firestore 資料結構

```
schedules/
  {yearMonth}/               e.g. "2026-04"
    yearMonth: "2026-04"
    dateRange: { start: "2026-04-01", end: "2026-04-30" }
    departments: [...]
    employees: [...]
    dates: [...]

    days/
      {date}/                e.g. "2026-04-26"
        date: "2026-04-26"
        yearMonth: "2026-04"
        records: [           每筆為一名員工當天的班表
          {
            empId:       "123456"
            empName:     "王小明"
            dept:        "TSUTAYA BOOKSTORE 信義店"   ← 已轉換的正式名稱
            date:        "2026-04-26"
            yearMonth:   "2026-04"
            shiftRaw:    "B-0900~1800"               ← Excel 原始值
            startTime:   "09:00"
            endTime:     "18:00"
            sortValue:   900                          ← 用於排序（HHMM 數值）
            status:      "working" | "holiday" | "rest"
            isValidTime: true | false
          }
        ]

employees/
  {empId}/
    title: "店長"            ← 員工職稱（選填，前台顯示用）
```

## 部門名稱對照（admin.html 上傳時轉換）

Excel 欄位 → Firestore 儲存的正式名稱：

| Excel 部門欄 | 儲存值 |
|---|---|
| 1部BOOK | TSUTAYA BOOKSTORE 信義店 |
| 1部CAFE外場 | WIRED TOKYO 信義店 外場 |
| 1部CAFE內場 | WIRED TOKYO 信義店 內場 |
| 2部BOOK | TSUTAYA BOOKSTORE 台中市政店 |
| 2部CAFE外場 | WIRED TOKYO 台中市政店 外場 |
| 2部CAFE內場 | WIRED TOKYO 台中市政店 內場 |

## 前台分類邏輯（index.html）

**getStore(dept)** — 從部門名稱判斷門市：
- 含「信義」→ `'信義店'`
- 含「台中」或「臺中」→ `'臺中市政店'`（注意：Firestore 存的是簡體「台」，顯示用繁體「臺」，getStore 兩者都能識別）

**getDeptType(dept, empId)** — 判斷部門類型：
- empId === `'107066'` → 行政（ADMIN_EMP_ID，硬碼單一行政人員）
- 含「BOOKSTORE」→ 書店
- 含「外場」→ 外場
- 含「內場」→ 內場

## 班表格式

Excel 中的班次值（shiftRaw）：
- `B-0900~1800` 或 `C-0900~1800`（B/C 為班別代碼，實際只解析時間）
- `例假日` → status: `holiday`
- `休息日` → status: `rest`
- 其他任何值 → status: `working`，isValidTime: false

## 頁籤結構

| 頁籤 id | 頁面 id | 說明 |
|---|---|---|
| navDashboard | pageDashboard | 行事曆 + 戰情儀表板（主頁） |
| navMarketing | pageMarketing | 行銷商品活動（開發中） |
| navAnnouncements | pageAnnouncements | 公告通知（開發中） |
| navSettings | pageSettings | 設定 |

## 已知 Mockup / 尚未串接真實資料

`pageDashboard` 裡有以下區塊是靜態假資料，標示 badge 說明來源：
- **營運指標**（badge: Mockup）：業績達成率、來客數 — 數值寫死
- **活動與任務**（badge: Notion）：預計串接 Notion API
- **場地與課程**（badge: Notion）：預計串接 Notion API

人力排班區塊（stateMain 內）是唯一真實接 Firestore 的資料。

## 重要陷阱 / 過去踩過的坑

### DOM 元素已移除，JS 需做 null guard
PR #5（2026-04-26）把舊版日期導覽 UI 換成行事曆格狀視圖，以下 DOM 元素已從 HTML 移除，
但部分 JS function 仍有參考。若未來新增功能請確認這些 id 不再被無條件存取：
- `dateSwitcher`、`dateCenterMain`、`dateCenterWeekday`
- `chipYesterday`、`chipToday`、`chipTomorrow`
- `datePicker`、`monthsBar`

相關 JS（`updateDateDisplay`、`onPickerChange`、swipe IIFE）已加 null guard，不會 crash。

### 錯誤訊息「連線失敗」不代表 Firebase 問題
`loadAvailableMonths()` 用一個 try-catch 包住整個初始化流程，包含後續的 DOM 操作。
若 JS 在 DOM 存取時拋出 TypeError，也會被捕獲並顯示「連線失敗」，容易誤導。
排查時先開 DevTools console 確認真正的 error 訊息。

### Service Worker 快取版本
`sw.js` 裡的 `CACHE_NAME = 'schedule-v8'`。
每次改動 HTML/JS 後若使用者看到舊版本，需將版本號碼往上 bump（v9、v10…）。

### 日期字串格式
所有日期統一使用本地時間 `YYYY-MM-DD`（透過 `localDateStr()` 產生）。
**不要** 用 `new Date().toISOString().slice(0,10)`，台灣 UTC+8 會造成日期偏差。
