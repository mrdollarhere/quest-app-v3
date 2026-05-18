export const GAS_CODE = `/**
 * QUESTFLOW BACKEND v18.9.9 - HARDENED AUDIT PROTOCOL
 * 
 * ACTIONS SUPPORTED:
 * - GET: login, getTests, getUsers, getResponses, getQuestions, getActivity, getSettings, getVersion, getEvents
 * - POST: submitResponse, saveTest, deleteTest, saveUser, deleteUser, saveQuestion, saveQuestions, saveUsers, logActivity, saveSetting, deleteResponse, logEvent
 */

const GAS_VERSION = "18.9.9";

function doGet(e) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const action = e.parameter.action;

  try {
    if (action === 'getVersion') {
      return createResponse({ version: GAS_VERSION });
    }

    if (action === 'getEvents') {
      const sheet = ss.getSheetByName('Events');
      if (!sheet) return createResponse([]);
      const limit = parseInt(e.parameter.limit || "1000");
      let data = getRowsAsObjects(sheet).reverse();
      return createResponse(data.slice(0, limit));
    }

    if (action === 'getActivity') {
      const sheet = ss.getSheetByName('Activity');
      if (!sheet) return createResponse([]);
      const limit = parseInt(e.parameter.limit || "1000");
      return createResponse(getRowsAsObjects(sheet).reverse().slice(0, limit));
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
      const headers = ['timestamp', 'session_id', 'user_id', 'user_name', 'user_role', 'event_type', 'page', 'test_id', 'test_name', 'question_id', 'score', 'details', 'device', 'browser', 'ip'];
      
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
      
      const rowData = headers.map(h => {
        let val = payload[h];
        if (h === 'details' && typeof val === 'object') val = JSON.stringify(val);
        return (val !== undefined && val !== null) ? val : "";
      });
      sheet.appendRow(rowData);
      return createResponse({ status: 'success' });
    }

    if (action === 'logActivity') {
      let sheet = ss.getSheetByName('Activity') || ss.insertSheet('Activity');
      const headers = ['Timestamp', 'User Name', 'User Email', 'Event', 'IP Address', 'Device', 'Role', 'Browser'];
      
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
      
      const rowData = headers.map(h => {
        let val = payload[h];
        if (h === 'Timestamp') val = new Date();
        if (h === 'User Name') val = payload.name;
        if (h === 'User Email') val = payload.email;
        if (h === 'IP Address') val = payload.ip;
        return (val !== undefined && val !== null) ? val : "";
      });
      
      sheet.appendRow(rowData);
      return createResponse({ status: 'success' });
    }

    if (action === 'saveSetting') {
      let sheet = ss.getSheetByName('Settings') || ss.insertSheet('Settings');
      if (sheet.getLastRow() === 0) sheet.appendRow(['key', 'value']);
      upsertRow(sheet, 'key', payload.key, { key: payload.key, value: payload.value });
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