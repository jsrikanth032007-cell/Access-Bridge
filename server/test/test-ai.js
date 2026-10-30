import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api';

async function testAi() {
  try {
    console.log('--- Logging in with Demo User ---');
    const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'demo@accessbridge.org',
      password: 'Password123!',
    });
    const token = loginRes.data.token;
    const authHeaders = { Authorization: `Bearer ${token}` };
    console.log('✓ Logged in as:', loginRes.data.user.email);

    console.log('\n--- Testing POST /api/ai/simplify ---');
    const simplifyRes = await axios.post(
      `${BASE_URL}/ai/simplify`,
      {
        text: 'The aforementioned indemnification clause shall hold harmless the lessor against any and all liabilities, torts, or damages incurred pursuant to lease execution.',
        readingLevel: 'Very Simple',
        language: 'English',
      },
      { headers: authHeaders }
    );
    console.log('✓ Simplify response status:', simplifyRes.status);
    console.log('Plain language preview:', simplifyRes.data.result.plainLanguage.slice(0, 100));
    console.log('Key points count:', simplifyRes.data.result.keyPoints.length);
    console.log('History ID created:', simplifyRes.data.historyId);

    console.log('\n--- Testing POST /api/ai/ask ---');
    const askRes = await axios.post(
      `${BASE_URL}/ai/ask`,
      {
        question: 'What is the indemnification clause in simple terms?',
        context: simplifyRes.data.result.plainLanguage,
      },
      { headers: authHeaders }
    );
    console.log('✓ Voice assistant answer received:', askRes.data.result.answer.slice(0, 100));

    console.log('\n--- Testing POST /api/ai/lecture-notes ---');
    const lectureRes = await axios.post(
      `${BASE_URL}/ai/lecture-notes`,
      {
        transcript:
          'Today we discuss sound waves. Sound is a longitudinal mechanical wave that travels through matter by compressing and decompressing particles.',
      },
      { headers: authHeaders }
    );
    console.log('✓ Lecture notes title:', lectureRes.data.result.title);
    console.log('Key terms count:', lectureRes.data.result.keyTerms.length);

    console.log('\n--- Testing GET /api/history ---');
    const historyRes = await axios.get(`${BASE_URL}/history`, { headers: authHeaders });
    console.log('✓ Total history records count:', historyRes.data.count);
    const firstItemId = historyRes.data.history[0]._id;

    console.log('\n--- Testing GET /api/history/:id ---');
    const historyItemRes = await axios.get(`${BASE_URL}/history/${firstItemId}`, {
      headers: authHeaders,
    });
    console.log('✓ History item retrieved:', historyItemRes.data.item.title);

    console.log('\n ALL AI AND HISTORY ROUTES WORKING 100%! ');
    process.exit(0);
  } catch (error) {
    console.error('AI Route test failed:', error.response?.data || error.message);
    process.exit(1);
  }
}

testAi();
