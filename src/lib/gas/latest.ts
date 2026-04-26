export const GAS_CODE = `/**
 * QUESTFLOW BACKEND v18.9 - PUBLIC TELEMETRY & SUMMARY PROTOCOL
 * 
 * ACTIONS SUPPORTED:
 * - GET: login, getTests, getUsers, getResponses, getQuestions, getActivity, getSettings, getVersion, getEvents, getPublicStats
 * - POST: submitResponse, saveTest, deleteTest, saveUser, deleteUser, saveQuestion, saveQuestions, saveUsers, logActivity, saveSetting, deleteResponse, logEvent, cleanDuplicates
 */

const GAS_VERSION = "18.9";

function doGet(e) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const action = e.parameter.action;

  try {
    if (action === 'getVersion') {
      return createResponse({ version: GAS_VERSION });
    }

    if (action === 'getPublicStats') {
      const eventSheet = ss.getSheetByName('Events');
      const responseSheet = ss.getSheetByName('Responses');
      const testSheet = ss.getSheetByName('Tests');
      const userSheet = ss.getSheetByName('Users');

      const stats = {
        learningSessions: eventSheet ? Math.max(0, eventSheet.getLastRow() - 1) : 0,
        studentsTrained: userSheet ? Math.max(0, userSheet.getLastRow() - 1) : 0,
        assessmentsDone: responseSheet ? Math.max(0, responseSheet.getLastRow() - 1) : 0,
        practiceModules: testSheet ? Math.max(0, testSheet.getLastRow() - 1) : 0
      };
      return createResponse(stats);
    }

    if (action === 'getEvents') {
      const sheet = ss.getSheetByName('Events');
      if (!sheet) return createResponse([]);
      const limit = parseInt(e.parameter.limit || "200");
      const type = e.parameter.event_type;
      let data = getRowsAsObjects(sheet).reverse();
      if (type && type !== 'all') {
        data = data.filter(ev => ev.event_type === type);
      }
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

    if (action === 'getUsers') {
      const sheet = ss.getSheetByName('Users');
      if (!sheet) return createResponse([]);
      return createResponse(getRowsAsObjects(sheet));
    }

    if (action === 'getResponses') {
      const sheet = ss.getSheetByName('Responses');
      if (!sheet) return createResponse([]);
      return createResponse(getRowsAsObjects(sheet).reverse().slice(0, 500));
    }

    if (action === 'getActivity') {
      const sheet = ss.getSheetByName('Activity');
      if (!sheet) return createResponse([]);
      return createResponse(getRowsAsObjects(sheet).reverse().slice(0, 200));
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

    return createResponse({ error: 'Unknown action' }, 400);
  } catch (err) {
    return createResponse({ error: err.toString() }, 500);
  }
}

function doPost(e) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const payload = JSON.parse(e.postData.contents);
    const action = payload.action;

    if (action === 'logEvent') {
      let sheet = ss.getSheetByName('Events') || ss.insertSheet('Events');
      const headers = ['timestamp', 'session_id', 'user_id', 'user_name', 'user_role', 'event_type', 'page', 'test_id', 'test_name', 'question_id', 'score', 'details', 'device', 'browser'];
      if (sheet.getLastRow() === 0) sheet.appendRow(headers);
      
      const lastRowIdx = sheet.getLastRow();
      if (lastRowIdx > 1) {
        const lastData = sheet.getRange(lastRowIdx, 1, 1, 6).getValues()[0];
        const lastTime = new Date(lastData[0]).getTime();
        const lastSess = String(lastData[1]);
        const lastType = String(lastData[5]);
        const now = new Date().getTime();
        
        if (lastSess === payload.session_id && lastType === payload.event_type && (now - lastTime < 2000)) {
          return createResponse({ status: 'skipped_duplicate' });
        }
      }

      const rowData = headers.map(h => {
        let val = payload[h];
        if (h === 'details' && typeof val === 'object') val = JSON.stringify(val);
        return (val !== undefined && val !== null) ? val : "";
      });
      sheet.appendRow(rowData);
      return createResponse({ status: 'success' });
    }

    if (action === 'cleanDuplicates') {
      const sheet = ss.getSheetByName('Events');
      if (!sheet) return createResponse({ status: 'no_sheet' });
      const data = sheet.getDataRange().getValues();
      if (data.length < 3) return createResponse({ count: 0 });

      let removed = 0;
      for (let i = data.length - 1; i >= 2; i--) {
        const current = data[i];
        const prev = data[i-1];
        
        const currTime = new Date(current[0]).getTime();
        const prevTime = new Date(prev[0]).getTime();
        const currSess = current[1];
        const prevSess = prev[1];
        const currType = current[5];
        const prevType = prev[5];

        if (currSess === prevSess && currType === prevType && Math.abs(currTime - prevTime) < 2000) {
          sheet.deleteRow(i + 1);
          removed++;
        }
      }
      return createResponse({ status: 'success', count: removed });
    }

    if (action === 'logActivity') {
      let sheet = ss.getSheetByName('Activity') || ss.insertSheet('Activity');
      const headers = ['Timestamp', 'User Name', 'User Email', 'Event', 'IP Address', 'Device'];
      if (sheet.getLastRow() === 0) sheet.appendRow(headers);
      
      const rowData = [
        new Date(), 
        payload.name || 'Unknown', 
        payload.email || 'N/A', 
        payload.event || 'Unknown',
        payload.ip || 'N/A',
        payload.device || 'N/A'
      ];
      sheet.appendRow(rowData);
      return createResponse({ status: 'success' });
    }

    if (action === 'saveSetting') {
      let sheet = ss.getSheetByName('Settings') || ss.insertSheet('Settings');
      if (sheet.getLastRow() === 0) sheet.appendRow(['key', 'value']);
      upsertRow(sheet, 'key', payload.key, { key: payload.key, value: payload.value });
      return createResponse({ status: 'success' });
    }

    if (action === 'deleteResponse') {
      const sheet = ss.getSheetByName('Responses');
      if (sheet) {
        const data = sheet.getDataRange().getValues();
        const headers = data[0];
        const tsIdx = headers.indexOf('Timestamp');
        const emailIdx = headers.indexOf('User Email');
        
        for (let i = data.length - 1; i >= 1; i--) {
          const rowTs = new Date(data[i][tsIdx]).getTime();
          const targetTs = new Date(payload.timestamp).getTime();
          const rowEmail = String(data[i][emailIdx]).toLowerCase();
          const targetEmail = String(payload.email).toLowerCase();
          
          if (rowTs === targetTs && rowEmail === targetEmail) {
            sheet.deleteRow(i + 1);
            break; 
          }
        }
      }
      return createResponse({ status: 'success' });
    }

    if (action === 'submitResponse') {
      let sheet = ss.getSheetByName('Responses') || ss.insertSheet('Responses');
      const headers = ['Timestamp', 'User Name', 'User Email', 'Test ID', 'Score', 'Total', 'Duration (ms)', 'Raw Responses', 'Certificate ID'];
      if (sheet.getLastRow() === 0) sheet.appendRow(headers);
      
      const rowData = [
        new Date(), 
        payload.userName || 'Guest User',
        payload.userEmail || 'Anonymous', 
        payload.testId || 'Unknown', 
        payload.score || 0, 
        payload.total || 0, 
        payload.duration || 0, 
        JSON.stringify(payload.responses || []),
        payload.certificateId || ''
      ];
      sheet.appendRow(rowData);
      return createResponse({ status: 'success' });
    }

    if (action === 'saveTest') {
      const sheet = ss.getSheetByName('Tests') || ss.insertSheet('Tests');
      const data = payload.data;
      const headers = ['id', 'title', 'description', 'category', 'difficulty', 'duration', 'image_url', 'certificate_enabled', 'passing_threshold'];
      
      if (sheet.getLastRow() === 0) {
        sheet.appendRow(headers);
      } else {
        const currentHeaders = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
        headers.forEach(h => {
          if (currentHeaders.indexOf(h) === -1) {
            sheet.getRange(1, sheet.getLastColumn() + 1).setValue(h);
          }
        });
      }

      upsertRow(sheet, 'id', data.id, data);
      
      if (!ss.getSheetByName(data.id)) {
        const qSheet = ss.insertSheet(data.id);
        qSheet.appendRow(['id', 'question_text', 'question_type', 'options', 'correct_answer', 'order_group', 'image_url', 'metadata', 'required']);
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
      const sheet = ss.getSheetByName('Users') || ss.insertSheet('Users');
      if (sheet.getLastRow() === 0) sheet.appendRow(['id', 'name', 'email', 'role', 'password', 'image_url']);
      upsertRow(sheet, 'email', payload.data.email, payload.data);
      return createResponse({ status: 'success' });
    }

    if (action === 'saveUsers') {
      const sheet = ss.getSheetByName('Users') || ss.insertSheet('Users');
      if (sheet.getLastRow() === 0) sheet.appendRow(['id', 'name', 'email', 'role', 'password', 'image_url']);
      const users = payload.data;
      if (Array.isArray(users)) {
        users.forEach(user => {
          upsertRow(sheet, 'email', user.email, user);
        });
      }
      return createResponse({ status: 'success' });
    }

    if (action === 'deleteUser') {
      const sheet = ss.getSheetByName('Users');
      if (sheet) deleteRow(sheet, 'email', payload.email);
      return createResponse({ status: 'success' });
    }

    if (action === 'saveQuestion') {
      const sheet = ss.getSheetByName(payload.testId) || ss.insertSheet(payload.testId);
      if (sheet.getLastRow() === 0) {
        sheet.appendRow(['id', 'question_text', 'question_type', 'options', 'correct_answer', 'order_group', 'image_url', 'metadata', 'required']);
      }
      upsertRow(sheet, 'id', payload.question.id, payload.question);
      return createResponse({ status: 'success' });
    }

    if (action === 'saveQuestions') {
      const sheet = ss.getSheetByName(payload.testId) || ss.insertSheet(payload.testId);
      sheet.clear();
      const questions = payload.questions;
      const headers = ['id', 'question_text', 'question_type', 'options', 'correct_answer', 'order_group', 'image_url', 'metadata', 'required'];
      sheet.appendRow(headers);
      if (Array.isArray(questions) && questions.length > 0) {
        questions.forEach(q => {
          const row = headers.map(h => {
            const val = q[h];
            return (val !== undefined && val !== null) ? val : "";
          });
          sheet.appendRow(row);
        });
      }
      return createResponse({ status: 'success' });
    }

    return createResponse({ error: 'Unknown action' }, 400);
  } catch (err) {
    return createResponse({ error: err.toString() }, 500);
  }
}

function getRowsAsObjects(sheet, excludeKeys = []) {
  const data = sheet.getDataRange().getValues();
  if (data.length < 1) return [];
  const headers = data.shift();
  return data.map(row => {
    const obj = {};
    headers.forEach((h, i) => { if (!excludeKeys.includes(h)) obj[h] = row[i]; });
    return obj;
  });
}

function upsertRow(sheet, idKey, idValue, data) {
  const values = sheet.getDataRange().getValues();
  if (values.length === 0) return;
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
  const values = sheet.getDataRange().getValues();
  if (values.length < 2) return;
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
