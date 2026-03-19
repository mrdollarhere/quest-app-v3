
/**
 * QUESTFLOW BACKEND v10.0 - FULL CRUD ARCHITECTURE
 * 
 * ACTIONS SUPPORTED:
 * - GET: login, getTests, getUsers, getResponses, getQuestions
 * - POST: submitResponse, saveTest, deleteTest, saveUser, deleteUser, saveQuestions
 */

function doGet(e) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const action = e.parameter.action;

  try {
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
      return createResponse(getRowsAsObjects(sheet));
    }

    if (action === 'getUsers') {
      const sheet = ss.getSheetByName('Users');
      if (!sheet) return createResponse([]);
      return createResponse(getRowsAsObjects(sheet, ['password']));
    }

    if (action === 'getResponses') {
      const sheet = ss.getSheetByName('Responses');
      if (!sheet) return createResponse([]);
      return createResponse(getRowsAsObjects(sheet).reverse().slice(0, 100));
    }

    if (action === 'getQuestions') {
      const testId = e.parameter.id;
      const sheet = ss.getSheetByName(testId);
      if (!sheet) return createResponse({ error: 'Test sheet not found' }, 404);
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

    if (action === 'submitResponse') {
      let sheet = ss.getSheetByName('Responses') || ss.insertSheet('Responses');
      if (sheet.getLastRow() === 0) sheet.appendRow(['Timestamp', 'Test ID', 'Score', 'Total', 'Duration (ms)', 'Raw Responses']);
      sheet.appendRow([new Date(), payload.testId, payload.score, payload.total, payload.duration, JSON.stringify(payload.responses)]);
      return createResponse({ status: 'success' });
    }

    if (action === 'saveTest') {
      const sheet = ss.getSheetByName('Tests') || ss.insertSheet('Tests');
      const data = payload.data;
      upsertRow(sheet, 'id', data.id, data);
      // Create questions sheet if it doesn't exist
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
      if (sheet.getLastRow() === 0) sheet.appendRow(['id', 'name', 'email', 'role', 'password']);
      upsertRow(sheet, 'email', payload.data.email, payload.data);
      return createResponse({ status: 'success' });
    }

    if (action === 'deleteUser') {
      const sheet = ss.getSheetByName('Users');
      if (sheet) deleteRow(sheet, 'email', payload.email);
      return createResponse({ status: 'success' });
    }

    if (action === 'saveQuestions') {
      const sheet = ss.getSheetByName(payload.testId);
      if (!sheet) return createResponse({ error: 'Sheet not found' }, 404);
      sheet.clear();
      const questions = payload.questions;
      if (questions.length > 0) {
        const headers = Object.keys(questions[0]);
        sheet.appendRow(headers);
        questions.forEach(q => {
          const row = headers.map(h => q[h]);
          sheet.appendRow(row);
        });
      }
      return createResponse({ status: 'success' });
    }

    return createResponse({ error: 'Unknown POST action' }, 400);
  } catch (err) {
    return createResponse({ error: err.toString() }, 500);
  }
}

// --- HELPER FUNCTIONS ---

function getRowsAsObjects(sheet, excludeKeys = []) {
  const data = sheet.getDataRange().getValues();
  const headers = data.shift();
  return data.map(row => {
    const obj = {};
    headers.forEach((h, i) => { if (!excludeKeys.includes(h)) obj[h] = row[i]; });
    return obj;
  });
}

function upsertRow(sheet, idKey, idValue, data) {
  const values = sheet.getDataRange().getValues();
  const headers = values[0];
  const idIdx = headers.indexOf(idKey);
  let rowIndex = -1;
  for (let i = 1; i < values.length; i++) {
    if (String(values[i][idIdx]) === String(idValue)) {
      rowIndex = i + 1;
      break;
    }
  }
  const rowData = headers.map(h => data[h] !== undefined ? data[h] : "");
  if (rowIndex > -1) {
    sheet.getRange(rowIndex, 1, 1, headers.length).setValues([rowData]);
  } else {
    sheet.appendRow(rowData);
  }
}

function deleteRow(sheet, idKey, idValue) {
  const values = sheet.getDataRange().getValues();
  const headers = values[0];
  const idIdx = headers.indexOf(idKey);
  for (let i = values.length - 1; i >= 1; i--) {
    if (String(values[i][idIdx]) === String(idValue)) {
      sheet.deleteRow(i + 1);
    }
  }
}

function createResponse(data, code = 200) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
