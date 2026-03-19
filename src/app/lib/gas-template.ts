
export const GAS_CODE = `
/**
 * QUESTFLOW BACKEND v6.0 - SECURE AUTH WITH PASSWORDS
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
 *    id, name, email, role, password
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
    const password = e.parameter.password;
    
    if (!email) return createResponse({ error: 'Email required' }, 400);

    const usersSheet = ss.getSheetByName('Users');
    if (!usersSheet) return createResponse({ error: 'Users tab not found' }, 404);
    
    const data = usersSheet.getDataRange().getValues();
    const headers = data.shift();
    
    // Find column indexes dynamically
    const emailIdx = headers.indexOf('email');
    const roleIdx = headers.indexOf('role');
    const nameIdx = headers.indexOf('name');
    const passIdx = headers.indexOf('password');
    const idIdx = headers.indexOf('id');
    
    if (emailIdx === -1) return createResponse({ error: 'Email column not found in Users tab' }, 500);

    const userRow = data.find(row => String(row[emailIdx]).toLowerCase() === email.toLowerCase());
    
    if (userRow) {
      // Check password if password column exists
      if (passIdx !== -1) {
        const storedPass = String(userRow[passIdx]);
        if (storedPass !== String(password)) {
          return createResponse({ error: 'Invalid password' }, 401);
        }
      }

      return createResponse({ 
        id: idIdx !== -1 ? userRow[idIdx] : null,
        email: userRow[emailIdx], 
        role: userRow[roleIdx] || 'user',
        name: nameIdx !== -1 ? userRow[nameIdx] : email.split('@')[0]
      });
    } else {
      return createResponse({ error: 'User not found or authorized' }, 403);
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
`;
