export const GAS_CODE = `/**
 * QUESTFLOW BACKEND v19.2.2 - RESILIENT REGISTRY PROTOCOL
 * 
 * ACTIONS SUPPORTED:
 * - GET: login, getTests, getUsers, getResponses, getQuestions, getSettings, getVersion, getActivity, getBugReports
 * - POST: submitResponse, saveTest, deleteTest, saveUser, deleteUser, saveQuestion, saveQuestions, saveUsers, saveSetting, deleteResponse, logEvent, logActivity, saveBugReport, updateBugStatus
 */

const GAS_VERSION = "19.2.2";
const ACTIVITY_SHEET_NAME = "System_Activity";
const BUG_REPORTS_SHEET = "BugReports";

// SECURITY PROTOCOL: This must match APPS_SCRIPT_API_KEY in your .env file
const INTERNAL_API_KEY = "dntrng_apikey_123";

/**
 * IDENTITY HANDSHAKE VALIDATOR
 * Guards against malformed or missing event objects.
 */
function validateAuth(e) {
  if (!e) return false;
  let apiKey = '';
  
  if (e.parameter && e.parameter.apiKey) {
    apiKey = e.parameter.apiKey;
  } 
  else if (e.postData && e.postData.contents) {
    try {
      const payload = JSON.parse(e.postData.contents);
      apiKey = payload.apiKey || '';
    } catch (err) {
      apiKey = '';
    }
  }

  return apiKey === INTERNAL_API_KEY;
}

/**
 * SCHEMA RESILIENCE HELPER
 * Ensures a sheet exists and contains the required headers.
 */
function ensureSheetHeaders(ss, name, requiredHeaders) {
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    sheet.appendRow(requiredHeaders);
    sheet.getRange(1, 1, 1, requiredHeaders.length).setFontWeight("bold").setBackground("#f8fafc");
    sheet.setFrozenRows(1);
    return sheet;
  }
  
  const currentHeaders = sheet.getRange(1, 1, 1, Math.max(1, sheet.getLastColumn())).getValues()[0];
  let headerAdded = false;
  
  requiredHeaders.forEach(h => {
    if (currentHeaders.indexOf(h) === -1) {
      sheet.getRange(1, sheet.getLastColumn() + 1).setValue(h);
      headerAdded = true;
    }
  });
  
  if (headerAdded) {
    sheet.getRange(1, 1, 1, sheet.getLastColumn()).setFontWeight("bold").setBackground("#f8fafc");
  }
  
  return sheet;
}

/**
 * DATA SANITIZATION HELPER
 */
function sanitize(val) {
  if (val === null || val === undefined) return "";
  if (typeof val === 'string') return val.trim();
  if (typeof val === 'object') return JSON.stringify(val);
  return val;
}

function doGet(e) {
  if (!e || !e.parameter) return createResponse({ error: 'Malformed Request: Missing parameters' }, 400);
  if (!validateAuth(e)) return createResponse({ error: 'Unauthorized: API Key Mismatch' }, 401);
  
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const action = e.parameter.action;

  try {
    if (action === 'getVersion') {
      return createResponse({ version: GAS_VERSION });
    }

    if (action === 'getBugReports') {
      const sheet = ss.getSheetByName(BUG_REPORTS_SHEET);
      if (!sheet) return createResponse([]);
      return createResponse(getRowsAsObjects(sheet).reverse());
    }

    if (action === 'getActivity') {
      const sheet = ss.getSheetByName(ACTIVITY_SHEET_NAME);
      if (!sheet) return createResponse([]);
      const limit = parseInt(e.parameter.limit || "2000");
      let data = getRowsAsObjects(sheet).reverse();
      return createResponse(data.slice(0, limit));
    }

    if (action === 'login') {
      const email = e.parameter.email;
      const password = e.parameter.password;
      const sheet = ss.getSheetByName('Users');
      if (!sheet) return createResponse({ error: 'Users tab not found' }, 404);
      const data = sheet.getDataRange().getValues();
      const headers = data.shift();
      const emailIdx = headers.indexOf('email');
      const passIdx = headers.indexOf('password');
      const userRow = data.find(row => String(row[emailIdx]).toLowerCase() === String(email).toLowerCase());
      if (userRow && String(userRow[passIdx]) === String(password)) {
        const obj = {};
        headers.forEach((h, i) => { if (h !== 'password') obj[h] = userRow[i]; });
        return createResponse(obj);
      }
      return createResponse({ error: 'Invalid credentials' }, 401);
    }

    if (action === 'getTests') {
      const sheet = ss.getSheetByName('Tests');
      if (!sheet) return createResponse([]);
      const tests = getRowsAsObjects(sheet);
      return createResponse(tests.map(t => {
        const qSheet = ss.getSheetByName(t.id);
        t.questions_count = qSheet ? Math.max(0, qSheet.getLastRow() - 1) : 0;
        return t;
      }));
    }

    if (action === 'getResponses') {
      const sheet = ss.getSheetByName('Responses');
      if (!sheet) return createResponse([]);
      const email = e.parameter.email;
      const allData = sheet.getDataRange().getValues();
      if (allData.length < 2) return createResponse([]);
      
      const headers = allData.shift();
      const emailIdx = headers.indexOf('User Email');
      
      if (email) {
        const normalizedEmail = String(email).toLowerCase().trim();
        const filtered = allData
          .filter(row => String(row[emailIdx] || '').toLowerCase().trim() === normalizedEmail)
          .map(row => {
            const obj = {};
            headers.forEach((h, i) => obj[h] = row[i]);
            return obj;
          });
        return createResponse(filtered.reverse());
      }
      
      return createResponse(getRowsAsObjects(sheet).reverse().slice(0, 2000));
    }

    if (action === 'getSettings') {
      const sheet = ss.getSheetByName('Settings');
      if (!sheet) return createResponse({});
      const data = getRowsAsObjects(sheet);
      const settings = {};
      data.forEach(row => { if (row.key) settings[row.key] = row.value; });
      return createResponse(settings);
    }

    if (action === 'getQuestions') {
      const testId = e.parameter.id;
      const sheet = ss.getSheetByName(testId);
      if (!sheet) return createResponse([]);
      return createResponse(getRowsAsObjects(sheet));
    }

    return createResponse({ error: 'Unknown action: ' + action }, 400);
  } catch (err) {
    return createResponse({ error: err.toString() }, 500);
  }
}

function doPost(e) {
  if (!e || !e.postData || !e.postData.contents) return createResponse({ error: 'Malformed Request: Missing payload' }, 400);
  if (!validateAuth(e)) return createResponse({ error: 'Unauthorized: API Key Mismatch' }, 401);

  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const payload = JSON.parse(e.postData.contents);
    const action = payload.action;

    if (action === 'saveBugReport') {
      const headers = ['id', 'timestamp', 'user_name', 'user_email', 'category', 'description', 'page_url', 'test_id', 'browser', 'device', 'status', 'admin_note'];
      const sheet = ensureSheetHeaders(ss, BUG_REPORTS_SHEET, headers);
      
      const currentHeaders = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
      const rowData = currentHeaders.map(h => {
        if (h === 'id') return sanitize(payload.id);
        if (h === 'timestamp') return new Date();
        if (h === 'status') return 'new';
        if (h === 'admin_note') return '';
        return sanitize(payload[h]);
      });
      
      sheet.appendRow(rowData);
      return createResponse({ status: 'success' });
    }

    if (action === 'updateBugStatus') {
      const sheet = ss.getSheetByName(BUG_REPORTS_SHEET);
      if (!sheet) return createResponse({ error: 'BugReports sheet not found' }, 404);
      
      const data = sheet.getDataRange().getValues();
      const headers = data[0];
      const idIdx = headers.indexOf('id');
      const statusIdx = headers.indexOf('status');
      const noteIdx = headers.indexOf('admin_note');
      
      for (let i = 1; i < data.length; i++) {
        if (String(data[i][idIdx]) === String(payload.id)) {
          sheet.getRange(i + 1, statusIdx + 1).setValue(sanitize(payload.status));
          if (payload.note !== undefined) {
            sheet.getRange(i + 1, noteIdx + 1).setValue(sanitize(payload.note));
          }
          return createResponse({ status: 'success' });
        }
      }
      return createResponse({ error: 'Report not found' }, 404);
    }

    if (action === 'logEvent' || action === 'logActivity') {
      const headers = ['timestamp', 'user_name', 'user_email', 'user_role', 'event_type', 'context', 'details', 'ip_address', 'device', 'browser', 'status', 'session_id'];
      const sheet = ensureSheetHeaders(ss, ACTIVITY_SHEET_NAME, headers);
      
      const currentHeaders = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
      const rowData = currentHeaders.map(h => {
        let val = payload[h];
        if (h === 'timestamp' && !val) val = new Date();
        if (h === 'user_name' && !val) val = payload.name || payload.user_name;
        if (h === 'user_email' && !val) val = payload.email || payload.user_email;
        if (h === 'event_type' && !val) val = payload.event || payload.event_type;
        if (h === 'ip_address' && !val) val = payload.ip || payload.ip_address;
        if (h === 'user_role' && !val) val = payload.Role || payload.user_role || 'user';
        if (h === 'context' && !val) val = payload.page || 'System';
        if (h === 'status' && !val) val = 'VERIFIED';
        
        return sanitize(val);
      });
      
      sheet.appendRow(rowData);
      return createResponse({ status: 'success' });
    }

    if (action === 'saveSetting') {
      const headers = ['key', 'value'];
      const sheet = ensureSheetHeaders(ss, 'Settings', headers);
      upsertRow(sheet, 'key', payload.key, { key: payload.key, value: payload.value });
      return createResponse({ status: 'success' });
    }

    if (action === 'submitResponse') {
      const headers = ['Timestamp', 'User Name', 'User Email', 'Test ID', 'Score', 'Total', 'Duration (ms)', 'Raw Responses', 'Certificate ID'];
      const sheet = ensureSheetHeaders(ss, 'Responses', headers);
      
      const currentHeaders = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
      const rowData = currentHeaders.map(h => {
        if (h === 'Timestamp') return new Date();
        if (h === 'User Name') return sanitize(payload.userName || 'Guest User');
        if (h === 'User Email') return sanitize(payload.userEmail || 'Anonymous');
        if (h === 'Test ID') return sanitize(payload.testId);
        if (h === 'Score') return payload.score || 0;
        if (h === 'Total') return payload.total || 0;
        if (h === 'Duration (ms)') return payload.duration || 0;
        if (h === 'Raw Responses') return JSON.stringify(payload.responses || []);
        if (h === 'Certificate ID') return sanitize(payload.certificateId);
        return "";
      });
      
      sheet.appendRow(rowData);
      return createResponse({ status: 'success' });
    }

    if (action === 'saveTest') {
      const headers = ['id', 'title', 'description', 'category', 'difficulty', 'duration', 'image_url', 'certificate_enabled', 'passing_threshold'];
      const sheet = ensureSheetHeaders(ss, 'Tests', headers);
      const data = payload.data;
      upsertRow(sheet, 'id', data.id, data);
      
      if (!ss.getSheetByName(data.id)) {
        const qSheet = ss.insertSheet(data.id);
        qSheet.appendRow(['id', 'question_text', 'question_type', 'options', 'correct_answer', 'order_group', 'image_url', 'metadata', 'required']);
        qSheet.getRange(1, 1, 1, 9).setFontWeight("bold").setBackground("#f8fafc");
      }
      return createResponse({ status: 'success' });
    }

    if (action === 'deleteTest') {
      const sheet = ss.getSheetByName('Tests');
      if (sheet) deleteRow(sheet, 'id', payload.id);
      const qSheet = ss.getSheetByName(payload.id);
      if (qSheet) ss.deleteSheet(qSheet);
      return createResponse({ status: 'success' });
    }

    if (action === 'saveUser') {
      const headers = ['id', 'name', 'email', 'role', 'password', 'image_url'];
      const sheet = ensureSheetHeaders(ss, 'Users', headers);
      upsertRow(sheet, 'email', payload.data.email, payload.data);
      return createResponse({ status: 'success' });
    }

    if (action === 'deleteUser') {
      const sheet = ss.getSheetByName('Users');
      if (sheet) deleteRow(sheet, 'email', payload.email);
      return createResponse({ status: 'success' });
    }

    if (action === 'saveQuestion') {
      const headers = ['id', 'question_text', 'question_type', 'options', 'correct_answer', 'order_group', 'image_url', 'metadata', 'required'];
      const sheet = ensureSheetHeaders(ss, payload.testId, headers);
      upsertRow(sheet, 'id', payload.question.id, payload.question);
      return createResponse({ status: 'success' });
    }

    return createResponse({ error: 'Unknown action: ' + action }, 400);
  } catch (err) {
    return createResponse({ error: err.toString() }, 500);
  }
}

function getRowsAsObjects(sheet, excludeKeys = []) {
  const range = sheet.getDataRange();
  if (range.getNumRows() < 1) return [];
  const data = range.getValues();
  const headers = data.shift();
  return data.map(row => {
    const obj = {};
    headers.forEach((h, i) => { if (!excludeKeys.includes(h)) obj[h] = row[i]; });
    return obj;
  });
}

function upsertRow(sheet, idKey, idValue, data) {
  const range = sheet.getDataRange();
  if (range.getNumRows() === 0) return;
  const values = range.getValues();
  const headers = values[0];
  const idIdx = headers.indexOf(idKey);
  if (idIdx === -1) return;

  let rowIndex = -1;
  let existingRow = null;
  for (let i = 1; i < values.length; i++) {
    if (String(values[i][idIdx]).trim().toLowerCase() === String(idValue).trim().toLowerCase()) {
      rowIndex = i + 1;
      existingRow = values[i];
      break;
    }
  }
  
  const rowData = headers.map((h, i) => {
    if (h in data) {
      const val = data[h];
      return (val !== undefined && val !== null) ? val : "";
    }
    return (rowIndex > -1) ? existingRow[i] : "";
  });

  if (rowIndex > -1) {
    sheet.getRange(rowIndex, 1, 1, headers.length).setValues([rowData]);
  } else {
    sheet.appendRow(rowData);
  }
}

function deleteRow(sheet, idKey, idValue) {
  const range = sheet.getDataRange();
  if (range.getNumRows() < 2) return;
  const values = range.getValues();
  const headers = values[0];
  const idIdx = headers.indexOf(idKey);
  if (idIdx === -1) return;

  for (let i = values.length - 1; i >= 1; i--) {
    if (String(values[i][idIdx]).trim().toLowerCase() === String(idValue).trim().toLowerCase()) {
      sheet.deleteRow(i + 1);
    }
  }
}

function createResponse(data, code = 200) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
`;
