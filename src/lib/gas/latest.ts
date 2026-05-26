export const GAS_CODE = `/**
 * QUESTFLOW BACKEND v19.2.4 - RESILIENT REGISTRY PROTOCOL
 * 
 * ACTIONS SUPPORTED:
 * - GET: login, getTests, getUsers, getResponses, getQuestions, getSettings, getVersion, getActivity, getBugReports
 * - POST: submitResponse, saveTest, deleteTest, saveUser, deleteUser, saveQuestion, saveQuestions, saveUsers, saveSetting, deleteResponse, logEvent, logActivity, saveBugReport, updateBugStatus
 */

const GAS_VERSION = "19.2.4";
const ACTIVITY_SHEET_NAME = "System_Activity";
const BUG_REPORTS_SHEET = "BugReports";

// SECURITY PROTOCOL: This must match APPS_SCRIPT_API_KEY in your .env file
const INTERNAL_API_KEY = "dntrng_apikey_123";

/**
 * IDENTITY HANDSHAKE VALIDATOR
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
  const action = (e.parameter.action || "").trim();

  try {
    // ROBUST LOGIC SWITCH
    switch (action.toLowerCase()) {
      case 'getversion':
        return createResponse({ version: GAS_VERSION });

      case 'getbugreports':
        const bugSheet = ss.getSheetByName(BUG_REPORTS_SHEET);
        return createResponse(bugSheet ? getRowsAsObjects(bugSheet).reverse() : []);

      case 'getactivity':
        const actSheet = ss.getSheetByName(ACTIVITY_SHEET_NAME);
        if (!actSheet) return createResponse([]);
        const limit = parseInt(e.parameter.limit || "2000");
        return createResponse(getRowsAsObjects(actSheet).reverse().slice(0, limit));

      case 'login':
        const email = e.parameter.email;
        const password = e.parameter.password;
        const userSheet = ss.getSheetByName('Users');
        if (!userSheet) return createResponse({ error: 'Users tab not found' }, 404);
        const userData = userSheet.getDataRange().getValues();
        const headers = userData.shift();
        const emailIdx = headers.indexOf('email');
        const passIdx = headers.indexOf('password');
        const userRow = userData.find(row => String(row[emailIdx]).toLowerCase() === String(email).toLowerCase());
        if (userRow && String(userRow[passIdx]) === String(password)) {
          const obj = {};
          headers.forEach((h, i) => { if (h !== 'password') obj[h] = userRow[i]; });
          return createResponse(obj);
        }
        return createResponse({ error: 'Invalid credentials' }, 401);

      case 'getusers':
        const usersSheet = ss.getSheetByName('Users');
        return createResponse(usersSheet ? getRowsAsObjects(usersSheet) : []);

      case 'gettests':
        const testsSheet = ss.getSheetByName('Tests');
        if (!testsSheet) return createResponse([]);
        const tests = getRowsAsObjects(testsSheet);
        return createResponse(tests.map(t => {
          const qSheet = ss.getSheetByName(t.id);
          t.questions_count = qSheet ? Math.max(0, qSheet.getLastRow() - 1) : 0;
          return t;
        }));

      case 'getresponses':
        const respSheet = ss.getSheetByName('Responses');
        if (!respSheet) return createResponse([]);
        const filterEmail = e.parameter.email;
        const allRespData = respSheet.getDataRange().getValues();
        if (allRespData.length < 2) return createResponse([]);
        
        const respHeaders = allRespData.shift();
        const emailIdxResp = respHeaders.indexOf('User Email');
        
        if (filterEmail) {
          const normalizedEmail = String(filterEmail).toLowerCase().trim();
          const filtered = allRespData
            .filter(row => String(row[emailIdxResp] || '').toLowerCase().trim() === normalizedEmail)
            .map(row => {
              const obj = {};
              respHeaders.forEach((h, i) => obj[h] = row[i]);
              return obj;
            });
          return createResponse(filtered.reverse());
        }
        return createResponse(getRowsAsObjects(respSheet).reverse().slice(0, 2000));

      case 'getsettings':
        const setSheet = ss.getSheetByName('Settings');
        if (!setSheet) return createResponse({});
        const setRows = getRowsAsObjects(setSheet);
        const settings = {};
        setRows.forEach(row => { if (row.key) settings[row.key] = row.value; });
        return createResponse(settings);

      case 'getquestions':
        const qSheet = ss.getSheetByName(e.parameter.id);
        return createResponse(qSheet ? getRowsAsObjects(qSheet) : []);

      default:
        return createResponse({ error: 'Unknown action: ' + action }, 400);
    }
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
    const action = (payload.action || "").trim();

    switch (action.toLowerCase()) {
      case 'savebugreport':
        const bugHeaders = ['id', 'timestamp', 'user_name', 'user_email', 'category', 'description', 'page_url', 'test_id', 'browser', 'device', 'status', 'admin_note'];
        const bSheet = ensureSheetHeaders(ss, BUG_REPORTS_SHEET, bugHeaders);
        const bRow = bugHeaders.map(h => {
          if (h === 'id') return sanitize(payload.id);
          if (h === 'timestamp') return new Date();
          if (h === 'status') return 'new';
          return sanitize(payload[h]);
        });
        bSheet.appendRow(bRow);
        return createResponse({ status: 'success' });

      case 'logevent':
      case 'logactivity':
        const actHeaders = ['timestamp', 'user_name', 'user_email', 'user_role', 'event_type', 'context', 'details', 'ip_address', 'device', 'browser', 'status', 'session_id'];
        const aSheet = ensureSheetHeaders(ss, ACTIVITY_SHEET_NAME, actHeaders);
        const aRow = actHeaders.map(h => {
          let val = payload[h];
          if (h === 'timestamp' && !val) val = new Date();
          if (h === 'user_name' && !val) val = payload.name || payload.user_name;
          if (h === 'user_email' && !val) val = payload.email || payload.user_email;
          if (h === 'event_type' && !val) val = payload.event || payload.event_type;
          return sanitize(val);
        });
        aSheet.appendRow(aRow);
        return createResponse({ status: 'success' });

      case 'submitresponse':
        const rHeaders = ['Timestamp', 'User Name', 'User Email', 'Test ID', 'Score', 'Total', 'Duration (ms)', 'Raw Responses', 'Certificate ID'];
        const rSheet = ensureSheetHeaders(ss, 'Responses', rHeaders);
        const rRow = rHeaders.map(h => {
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
        rSheet.appendRow(rRow);
        return createResponse({ status: 'success' });

      case 'savetest':
        const tSheet = ensureSheetHeaders(ss, 'Tests', ['id', 'title', 'category', 'difficulty', 'duration', 'image_url', 'certificate_enabled', 'passing_threshold']);
        upsertRow(tSheet, 'id', payload.data.id, payload.data);
        if (!ss.getSheetByName(payload.data.id)) {
          const qTab = ss.insertSheet(payload.data.id);
          qTab.appendRow(['id', 'question_text', 'question_type', 'options', 'correct_answer', 'order_group', 'image_url', 'metadata', 'required']);
        }
        return createResponse({ status: 'success' });

      case 'saveuser':
        const uSheet = ensureSheetHeaders(ss, 'Users', ['id', 'name', 'email', 'role', 'password', 'image_url']);
        upsertRow(uSheet, 'email', payload.data.email, payload.data);
        return createResponse({ status: 'success' });

      default:
        return createResponse({ error: 'Unknown POST action: ' + action }, 400);
    }
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
    if (h in data) return sanitize(data[h]);
    return (rowIndex > -1) ? existingRow[i] : "";
  });

  if (rowIndex > -1) sheet.getRange(rowIndex, 1, 1, headers.length).setValues([rowData]);
  else sheet.appendRow(rowData);
}

function createResponse(data, code = 200) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
`;
