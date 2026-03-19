/**
 * QUESTFLOW BACKEND v4.0 - SIMPLE SHEET AUTH
 * 
 * SETUP INSTRUCTIONS:
 * 1. Create a Google Sheet.
 * 2. Create THREE tabs with these EXACT names:
 *    - "Questions"
 *    - "Users"
 *    - "Responses"
 * 
 * 3. Add Headers to "Questions": 
 *    test_id, id, question_text, question_type, options, correct_answer, order_group, image_url, metadata, required
 * 
 * 4. Add Headers to "Users":
 *    email, role
 * 
 * 5. Add Headers to "Responses":
 *    Timestamp, Test ID, Score, Total, Duration (ms), Raw Responses
 * 
 * 6. Replace 'YOUR_SPREADSHEET_ID' below with your actual ID from the URL.
 * 7. Deploy as Web App (Execute as: Me, Access: Anyone).
 */

const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID_HERE';

function doGet(e) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const action = e.parameter.action;

  // --- ACTION: login / getRole ---
  if (action === 'getRole' || action === 'login') {
    const email = e.parameter.email;
    if (!email) return createResponse({ error: 'Email required' }, 400);

    const usersSheet = ss.getSheetByName('Users');
    if (!usersSheet) return createResponse({ error: 'Users tab not found' }, 404);
    
    const data = usersSheet.getDataRange().getValues();
    const headers = data.shift();
    
    const userRow = data.find(row => String(row[0]).toLowerCase() === email.toLowerCase());
    
    if (userRow) {
      return createResponse({ 
        email: userRow[0], 
        role: userRow[1] || 'user'
      });
    } else {
      return createResponse({ error: 'User not authorized' }, 403);
    }
  }

  // --- DEFAULT ACTION: Get Questions ---
  const testId = e.parameter.id;
  const sheet = ss.getSheetByName('Questions');
  
  if (!sheet) return createResponse({ error: 'Questions tab not found' }, 404);

  const data = sheet.getDataRange().getValues();
  const headers = data.shift();
  
  const questions = data
    .map(row => {
      const obj = {};
      headers.forEach((h, i) => obj[h] = row[i]);
      return obj;
    })
    .filter(q => {
      if (!testId) return true;
      return String(q.test_id) === String(testId);
    });
  
  return createResponse(questions);
}

function doPost(e) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    let responsesSheet = ss.getSheetByName('Responses');
    
    if (!responsesSheet) {
      responsesSheet = ss.insertSheet('Responses');
      responsesSheet.appendRow(['Timestamp', 'Test ID', 'Score', 'Total', 'Duration (ms)', 'Raw Responses']);
    }
    
    const payload = JSON.parse(e.postData.contents);
    const { testId, score, total, duration, responses } = payload;
    
    responsesSheet.appendRow([
      new Date(),
      testId || 'N/A',
      score || 0,
      total || 0,
      duration || 0,
      JSON.stringify(responses)
    ]);
    
    return createResponse({ status: 'success' });
  } catch (err) {
    return createResponse({ error: err.toString() }, 500);
  }
}

function createResponse(data, code = 200) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}