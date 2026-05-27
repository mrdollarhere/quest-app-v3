export const GAS_CODE = `/**
 * QUESTFLOW BACKEND v19.2.5 - COMPREHENSIVE REGISTRY PROTOCOL
 * 
 * ACTIONS SUPPORTED:
 * - GET: login, getTests, getUsers, getResponses, getQuestions, getSettings, getVersion, getActivity, getBugReports, gettestbyid, getuserbyid, getuserstats, getpublicstats
 * - POST: submitResponse, saveTest, deleteTest, saveUser, deleteUser, saveQuestion, saveQuestions, saveUsers, saveSetting, deleteResponse, logEvent, logActivity, saveBugReport, updateBugStatus
 */

const GAS_VERSION = "19.2.5";
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
  const action = (e.parameter.action || "").trim().toLowerCase();

  try {
    switch (action) {
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

      case 'gettestbyid':
        const targetTestId = e.parameter.id;
        if (!targetTestId) return createResponse({ error: 'Missing id' }, 400);
        const singleTestSheet = ss.getSheetByName('Tests');
        if (!singleTestSheet) return createResponse({ error: 'Tests not found' }, 404);
        const allTests = getRowsAsObjects(singleTestSheet);
        const foundTest = allTests.find(t => String(t.id).toLowerCase() === String(targetTestId).toLowerCase());
        if (!foundTest) return createResponse({ error: 'Test not found' }, 404);
        const qCountSheet = ss.getSheetByName(foundTest.id);
        foundTest.questions_count = qCountSheet ? Math.max(0, qCountSheet.getLastRow() - 1) : 0;
        return createResponse(foundTest);

      case 'getuserbyid':
        const targetUserId = e.parameter.id || e.parameter.email;
        if (!targetUserId) return createResponse({ error: 'Missing id' }, 400);
        const singleUserSheet = ss.getSheetByName('Users');
        if (!singleUserSheet) return createResponse({ error: 'Not found' }, 404);
        const allUsers = getRowsAsObjects(singleUserSheet, ['password']);
        const foundUser = allUsers.find(u => 
          String(u.id).toLowerCase() === String(targetUserId).toLowerCase() ||
          String(u.email).toLowerCase() === String(targetUserId).toLowerCase()
        );
        if (!foundUser) return createResponse({ error: 'User not found' }, 404);
        return createResponse(foundUser);

      case 'getuserstats':
        const statsEmail = e.parameter.email || e.parameter.userId;
        if (!statsEmail) return createResponse({ error: 'Missing email' }, 400);
        const statsRespSheet = ss.getSheetByName('Responses');
        if (!statsRespSheet) return createResponse({ testsTaken: 0, bestScore: 0, perfectScores: 0, scoreHistory: [] });
        const statsData = getRowsAsObjects(statsRespSheet);
        const userResponses = statsData.filter(r => String(r['User Email'] || '').toLowerCase().trim() === String(statsEmail).toLowerCase().trim());
        const scores = userResponses.map(r => {
          const s = Number(r.Score) || 0;
          const t = Number(r.Total) || 1;
          return Math.round((s / t) * 100);
        });
        return createResponse({
          testsTaken: userResponses.length,
          bestScore: scores.length ? Math.max(...scores) : 0,
          perfectScores: userResponses.filter(r => Number(r.Score) >= Number(r.Total) && Number(r.Total) > 0).length,
          scoreHistory: userResponses.slice(-10).map(r => ({
            testId: r['Test ID'],
            score: Number(r.Score),
            total: Number(r.Total),
            date: r.Timestamp
          }))
        });

      case 'getpublicstats':
        const pEventSheet = ss.getSheetByName(ACTIVITY_SHEET_NAME);
        const pRespSheet = ss.getSheetByName('Responses');
        const pTestSheet = ss.getSheetByName('Tests');
        const pUserSheet = ss.getSheetByName('Users');
        return createResponse({
          learningSessions: pEventSheet ? Math.max(0, pEventSheet.getLastRow() - 1) : 0,
          studentsTrained: pUserSheet ? Math.max(0, pUserSheet.getLastRow() - 1) : 0,
          assessmentsDone: pRespSheet ? Math.max(0, pRespSheet.getLastRow() - 1) : 0,
          practiceModules: pTestSheet ? Math.max(0, pTestSheet.getLastRow() - 1) : 0
        });

      default:
        return createResponse({ error: 'Unknown GET action: ' + action }, 400);
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
    const action = (payload.action || "").trim().toLowerCase();

    switch (action) {
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

      case 'updatebugstatus':
        const buSheet = ss.getSheetByName(BUG_REPORTS_SHEET);
        if (buSheet) upsertRow(buSheet, 'id', payload.id, { status: payload.status, admin_note: payload.note });
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
        const rHeaders = ['Timestamp', 'User Name', 'User Email', 'Test ID', 'Score', 'Total', 'Duration (ms)', 'Raw Responses', 'Certificate ID', 'flagged', 'violationCount', 'flagReason'];
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
          if (h === 'flagged') return sanitize(payload.flagged);
          if (h === 'violationCount') return payload.violationCount || 0;
          if (h === 'flagReason') return sanitize(payload.flagReason);
          return "";
        });
        rSheet.appendRow(rRow);
        return createResponse({ status: 'success' });

      case 'deleteresponse':
        const resSheet = ss.getSheetByName('Responses');
        if (resSheet) {
          const rData = resSheet.getDataRange().getValues();
          const rHeaders = rData[0];
          const tsIdx = rHeaders.indexOf('Timestamp');
          const emailIdx = rHeaders.indexOf('User Email');
          for (let i = rData.length - 1; i >= 1; i--) {
            if (new Date(rData[i][tsIdx]).getTime() === new Date(payload.timestamp).getTime() && String(rData[i][emailIdx]).toLowerCase() === String(payload.email).toLowerCase()) {
              resSheet.deleteRow(i + 1);
              break;
            }
          }
        }
        return createResponse({ status: 'success' });

      case 'savetest':
        const tSheet = ensureSheetHeaders(ss, 'Tests', ['id', 'title', 'category', 'difficulty', 'duration', 'image_url', 'certificate_enabled', 'passing_threshold']);
        upsertRow(tSheet, 'id', payload.data.id, payload.data);
        if (!ss.getSheetByName(payload.data.id)) {
          const qTab = ss.insertSheet(payload.data.id);
          qTab.appendRow(['id', 'question_text', 'question_type', 'options', 'correct_answer', 'order_group', 'image_url', 'metadata', 'required']);
        }
        return createResponse({ status: 'success' });

      case 'deletetest':
        const detSheet = ss.getSheetByName('Tests');
        if (detSheet) deleteRow(detSheet, 'id', payload.id);
        const qTab = ss.getSheetByName(payload.id);
        if (qTab) ss.deleteSheet(qTab);
        return createResponse({ status: 'success' });

      case 'saveuser':
        const uSheet = ensureSheetHeaders(ss, 'Users', ['id', 'name', 'email', 'role', 'password', 'image_url']);
        upsertRow(uSheet, 'email', payload.data.email, payload.data);
        return createResponse({ status: 'success' });

      case 'saveusers':
        const usSheet = ensureSheetHeaders(ss, 'Users', ['id', 'name', 'email', 'role', 'password', 'image_url']);
        if (Array.isArray(payload.data)) payload.data.forEach(u => upsertRow(usSheet, 'email', u.email, u));
        return createResponse({ status: 'success' });

      case 'deleteuser':
        const duSheet = ss.getSheetByName('Users');
        if (duSheet) deleteRow(duSheet, 'email', payload.email);
        return createResponse({ status: 'success' });

      case 'savequestion':
        const sqSheet = ss.getSheetByName(payload.testId) || ss.insertSheet(payload.testId);
        if (sqSheet.getLastRow() === 0) sqSheet.appendRow(['id', 'question_text', 'question_type', 'options', 'correct_answer', 'order_group', 'image_url', 'metadata', 'required']);
        upsertRow(sqSheet, 'id', payload.question.id, payload.question);
        return createResponse({ status: 'success' });

      case 'savequestions':
        const squSheet = ss.getSheetByName(payload.testId) || ss.insertSheet(payload.testId);
        squSheet.clear();
        const qHeaders = ['id', 'question_text', 'question_type', 'options', 'correct_answer', 'order_group', 'image_url', 'metadata', 'required'];
        squSheet.appendRow(qHeaders);
        if (Array.isArray(payload.questions)) payload.questions.forEach(q => squSheet.appendRow(qHeaders.map(h => q[h] ?? "")));
        return createResponse({ status: 'success' });

      case 'savesetting':
        const seSheet = ensureSheetHeaders(ss, 'Settings', ['key', 'value']);
        upsertRow(seSheet, 'key', payload.key, { key: payload.key, value: payload.value });
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

function deleteRow(sheet, idKey, idValue) {
  const values = sheet.getDataRange().getValues();
  if (values.length < 2) return;
  const headers = values[0];
  const idIdx = headers.indexOf(idKey);
  if (idIdx === -1) return;
  for (let i = values.length - 1; i >= 1; i--) {
    if (String(values[i][idIdx]).trim().toLowerCase() === String(idValue).trim().toLowerCase()) sheet.deleteRow(i + 1);
  }
}

function createResponse(data, code = 200) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
`;
