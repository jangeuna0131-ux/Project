/**
 * Google Apps Script - Wedding Guest Book API
 *
 * 1) Google Sheets 새 문서를 만들고 시트명을 guestbook 으로 지정
 * 2) 아래 SPREADSHEET_ID에 시트 URL의 /d/ 와 /edit 사이 ID 입력
 * 3) Apps Script에서 웹 앱으로 배포
 *    - 실행 사용자: 나
 *    - 액세스 권한: 모든 사용자
 * 4) 배포 URL을 ./js/script.js 의 CONFIG.googleAppsScriptUrl 에 붙여넣기
 */

const SPREADSHEET_ID = "여기에_구글시트_ID_입력";
const SHEET_NAME = "guestbook";

function doGet(e) {
  try {
    const action = (e && e.parameter && e.parameter.action) || "list";
    if (action !== "list") return json_({ ok: false, message: "Invalid action" });

    const sheet = getSheet_();
    ensureHeader_(sheet);

    const lastRow = sheet.getLastRow();
    if (lastRow <= 1) return json_({ ok: true, items: [] });

    const values = sheet.getRange(2, 1, lastRow - 1, 4).getValues();
    const items = values
      .filter(row => row[0])
      .map(row => ({
        id: String(row[0]),
        name: String(row[1] || ""),
        message: String(row[2] || ""),
        createdAt: formatDate_(row[3])
      }))
      .reverse();

    return json_({ ok: true, items: items });
  } catch (error) {
    return json_({ ok: false, message: String(error) });
  }
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);

  try {
    const params = (e && e.parameter) || {};
    const action = params.action || "create";
    if (action !== "create") return json_({ ok: false, message: "Invalid action" });

    const name = sanitize_(params.name).slice(0, 20);
    const message = sanitize_(params.message).slice(0, 200);

    if (!name) return json_({ ok: false, message: "이름을 입력해주세요." });
    if (!message) return json_({ ok: false, message: "메시지를 입력해주세요." });

    const sheet = getSheet_();
    ensureHeader_(sheet);

    const now = new Date();
    const id = Utilities.getUuid();
    sheet.appendRow([id, name, message, now]);

    return json_({
      ok: true,
      item: {
        id: id,
        name: name,
        message: message,
        createdAt: formatDate_(now)
      }
    });
  } catch (error) {
    return json_({ ok: false, message: String(error) });
  } finally {
    lock.releaseLock();
  }
}

function getSheet_() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) sheet = ss.insertSheet(SHEET_NAME);
  return sheet;
}

function ensureHeader_(sheet) {
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(["ID", "NAME", "MESSAGE", "CREATED_AT"]);
    sheet.setFrozenRows(1);
  }
}

function sanitize_(value) {
  return String(value || "")
    .replace(/<[^>]*>/g, "")
    .replace(/[<>]/g, "")
    .trim();
}

function formatDate_(value) {
  if (!value) return "";
  const date = value instanceof Date ? value : new Date(value);
  return Utilities.formatDate(date, "Asia/Seoul", "yyyy.MM.dd HH:mm");
}

function json_(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
