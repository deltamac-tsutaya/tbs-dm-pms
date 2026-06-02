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

無框架、無建置工具。所有邏輯內嵌於 HTML 檔案中（Vanilla JS + CSS）。
Firebase SDK 透過 CDN 載入（版本 9.23.0 compat 模式）。

## 檔案結構

```
index.html          前台主要頁面（2429 行，含所有 CSS/JS）
admin.html          後台管理頁面（1982 行，上傳班表、員工資料管理、帳號管理）
firebase-config.js  Firebase 設定（含 Firestore 安全規則說明）
sw.js               Service Worker（PWA 離線快取，目前版本 schedule-v8）
manifest.json       PWA manifest
create-admin.js     Node.js 腳本，用於在 Firebase Auth 建立管理員帳號
8th-printing.html   ⚠️ 獨立檔案，與排班 app 無關 — Nexus Life 品牌印刷物覽頁
DESIGN.md           設計規格（色彩、字型、間距、元件行為）
assets/             圖片與 SVG 素材（logo、選單縮圖等）
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
    title:            "店長"       ← 職稱（選填，前台 badge 用）
    empName:          "王小明"
    empId:            "123456"
    dept:             "TSUTAYA BOOKSTORE 信義店"
    departments:      [...]        ← 可選，部門列表
    role:             "admin"      ← admin 才有此欄位，決定後台登入權限
    store:            "信義店"     ← staff 角色指定門市
    phone:            "0912345678"
    email:            "..."
    address:          "..."
    contractType:     "全職"
    emergencyContact: { name, phone, relationship }
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

對照在 `normDept()` 正規化後比對（移除空白、轉大寫、CAFÉ→CAFE），
以防 Excel 欄位有全形空格或特殊字元。

## 前台分類邏輯（index.html）

**getStore(dept)** — 從部門名稱判斷門市：
- 含「信義」→ `'信義店'`
- 含「台中」或「臺中」→ `'臺中市政店'`（Firestore 存簡體「台」，顯示用繁體「臺」，getStore 兩者皆識別）

**getDeptType(dept, empId)** — 判斷部門類型：
- empId === `'107066'` → 行政（`ADMIN_EMP_ID`，硬碼單一行政人員）
- 含「BOOKSTORE」→ 書店（`dtype-book`）
- 含「外場」→ 外場（`dtype-floor`）
- 含「內場」→ 內場（`dtype-kitchen`）
- 其他 → `null`（不顯示 badge）

部門顏色對照：

| 類型 | CSS class | 背景 | 文字 |
|---|---|---|---|
| 行政 | `dtype-admin` | `#ede9fe` | `#6d28d9` |
| 書店 | `dtype-book` | `#dcfce7` | `#15803d` |
| 外場 | `dtype-floor` | `#dbeafe` | `#1d4ed8` |
| 內場 | `dtype-kitchen` | `#ffedd5` | `#c2410c` |

## 班表格式

Excel 中的班次值（shiftRaw）：
- `B-0900~1800` 或 `C-0900~1800`（B/C 為班別代碼，實際只解析時間）
- `例假日` → status: `holiday`
- `休息日` → status: `rest`
- 其他任何值 → status: `working`，isValidTime: false

## 頁籤結構（TABS 物件）

| tab key | 頁面 id | 按鈕 id | 說明 |
|---|---|---|---|
| dashboard | pageDashboard | navDashboard | 行事曆 + 戰情儀表板（主頁） |
| marketing | pageMarketing | navMarketing | 行銷商品活動（開發中） |
| employees | pageEmployees | navEmployees | 員工名冊（可搜尋、篩選門市） |
| announcements | pageAnnouncements | navAnnouncements | 公告通知（開發中） |
| settings | pageSettings | navSettings | 設定（含門市資訊、快取清除） |

`switchTab(key)` 統一管理頁面顯示與導覽列 active 狀態。

## 前台狀態機（stateMain 等）

`showState(id)` 控制下列四個互斥狀態區塊：
- `stateNotConfigured` — firebase-config.js 尚未設定
- `stateNoData` — Firebase 連線成功但無任何月份資料
- `stateError` — 連線或載入失敗（顯示錯誤訊息 + 重試按鈕）
- `stateMain` — 正常顯示資料（月份選擇、行事曆、人力總覽、班表清單）

## 角色系統（index.html）

前台的 `currentProfile` 目前**永遠為 null**（前台無 Firebase Auth）。
角色邏輯是管理員用的 UI 模擬功能（role-switcher），方便預覽不同視角：

| 角色 | CSS class | 行為 |
|---|---|---|
| 管理員（預設） | `rs-admin` | 顯示全部門市、可切換視角 |
| 主管 | `rs-manager` | 顯示全部門市 |
| 員工 · 信義 | `rs-staff` | 隱藏門市篩選列，只顯示信義店 |
| 員工 · 市政 | `rs-staff` | 隱藏門市篩選列，只顯示市政店 |

`getEffectiveRole()` / `getEffectiveStore()` 讀取 `currentProfile`（null）和 `viewRole`/`viewStore`。
由於 currentProfile 為 null，`getEffectiveRole()` 目前永遠回傳 `'staff'`（除非 viewRole 覆蓋）。

## 後台（admin.html）認證流程

admin.html 使用 Firebase Auth（`firebase-auth-compat.js`）：
1. `initAdmin()` 初始化 Firebase，監聽 `onAuthStateChanged`
2. 已登入 → `showDashboard(user)` 顯示管理介面
3. 未登入 → `showLogin()` 顯示登入表單
4. `login()` 呼叫 `signInWithEmailAndPassword(email, password)`
5. 密碼重設：`forgotPassword()` 呼叫 `sendPasswordResetEmail(email)`
6. `logout()` 呼叫 `auth.signOut()`

## 後台上傳流程

1. **班表上傳**：拖曳或點選 Excel（xlsx/xls），使用 SheetJS（xlsx.js v0.18.5）解析
2. `parseScheduleData(rawData)` — 將每列轉為 record 物件，部門名稱透過 `mapDept()` 轉換
3. 按 `yearMonth` 分組，`showPreview()` 顯示預覽（含「將覆蓋舊資料」提示）
4. `confirmUpload()` 逐月上傳到 Firestore，完成後 `syncEmployees()` 同步員工名冊
5. **員工資料批次上傳**：Excel 欄位包含工號、姓名、部門、職稱、電話、電子郵件、地址、聘僱日期、合約類型、緊急聯絡人資訊
6. **職稱清冊上傳**：較輕量，只更新 `employees/{empId}.title`

## 已知 Mockup / 尚未串接真實資料

`pageDashboard` 裡有以下區塊是靜態假資料，標示 badge 說明來源：
- **營運指標**（badge: Mockup）：業績達成率、來客數 — 數值寫死
- **活動與任務**（badge: Notion）：預計串接 Notion API
- **場地與課程**（badge: Notion）：預計串接 Notion API

`pageMarketing` 和 `pageAnnouncements` 目前為空白（開發中）。

人力排班區塊（stateMain 內）是唯一真實接 Firestore 的資料。

## 設計規格（DESIGN.md）

完整色彩、字型、間距、元件規格請查閱 `DESIGN.md`。重點摘要：
- 背景：`#F8F7F2`（暖米白，仿紙感）
- 唯一互動色：`#2563eb`（藍）
- 字型系統：系統 sans-serif（主）/ Inter 300（數字）/ Noto Serif TC（店名）/ Menlo（時間）
- 基準間距：8px 倍數

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

### 前台無 Firebase Auth
index.html 不載入 `firebase-auth-compat.js`，`currentProfile` 永遠為 null。
Firestore 安全規則（firebase-config.js 內的文件說明）要求 `isAuthenticated()`，
但前台依賴 Firestore 規則設為開放讀取，或使用測試模式規則。
若未來要加入前台認證，需整合 Firebase Auth 並設定 `currentProfile`。

### 8th-printing.html 是獨立檔案
與排班 app 完全無關，是 Nexus Life 品牌的印刷物覽頁（A4/A3 standee 預覽）。
改動排班功能時勿誤觸此檔案。

### admin.html 部門 normDept 正規化
`mapDept()` 在比對前會正規化 key（移除所有空白、轉大寫、CAFÉ→CAFE）。
若新增部門對照，key 不需要空格，但實際的 Excel 欄位可能有全形空格，
`normDept()` 會一併處理，不需手動清理。
