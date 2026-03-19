
export const GAS_CODE = `
/**
 * QUESTFLOW BACKEND v16.0 - SUBMISSION SYNC FIX
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

    if (action === 'submitResponse') {
      let sheet = ss.getSheetByName('Responses') || ss.insertSheet('Responses');
      const headers = ['Timestamp', 'User Name', 'User Email', 'Test ID', 'Score', 'Total', 'Duration (ms)', 'Raw Responses'];
      
      if (sheet.getLastRow() === 0) {
        sheet.appendRow(headers);
      }
      
      const rowData = [
        new Date(), 
        payload.userName || 'Guest',
        payload.userEmail || 'Anonymous', 
        payload.testId || 'Unknown', 
        payload.score || 0, 
        payload.total || 0, 
        payload.duration || 0, 
        JSON.stringify(payload.responses || [])
      ];
      
      sheet.appendRow(rowData);
      return createResponse({ status: 'success' });
    }

    if (action === 'saveTest') {
      const sheet = ss.getSheetByName('Tests') || ss.insertSheet('Tests');
      const data = payload.data;
      if (sheet.getLastRow() === 0) sheet.appendRow(['id', 'title', 'description', 'category', 'difficulty', 'duration', 'image_url']);
      upsertRow(sheet, 'id', data.id, data);
      
      // Ensure questions sheet exists
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

    return createResponse({ error: 'Unknown POST action' }, 400);
  } catch (err) {
    return createResponse({ error: err.toString() }, 500);
  }
}

// --- HELPER FUNCTIONS ---

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
  for (let i = 1; i < values.length; i++) {
    if (String(values[i][idIdx]).trim().toLowerCase() === String(idValue).trim().toLowerCase()) {
      rowIndex = i + 1;
      break;
    }
  }
  
  const rowData = headers.map(h => {
    const val = data[h];
    return (val !== undefined && val !== null) ? val : "";
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
\`;
