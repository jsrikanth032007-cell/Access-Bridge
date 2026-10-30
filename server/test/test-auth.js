import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api';

async function testAuth() {
  try {
    console.log('--- Testing Registration ---');
    const testEmail = `test_${Date.now()}@accessbridge.org`;
    const regRes = await axios.post(`${BASE_URL}/auth/register`, {
      name: 'Alex Johnson',
      email: testEmail,
      password: 'StrongPassword123!',
    });
    console.log('Register response status:', regRes.status);
    console.log('User created:', regRes.data.user.email);
    console.log('Token received:', !!regRes.data.token);
    console.log('Profile created:', regRes.data.profile.preferredLanguage);

    const token = regRes.data.token;

    console.log('\n--- Testing Login ---');
    const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
      email: testEmail,
      password: 'StrongPassword123!',
    });
    console.log('Login response status:', loginRes.status);
    console.log('Logged in user:', loginRes.data.user.name);

    console.log('\n--- Testing /api/auth/me ---');
    const meRes = await axios.get(`${BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log('Me status:', meRes.status);
    console.log('User verified:', meRes.data.user.email);

    console.log('\n--- Testing GET /api/profile ---');
    const getProfileRes = await axios.get(`${BASE_URL}/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log('Get profile status:', getProfileRes.status);
    console.log('Default reading level:', getProfileRes.data.profile.readingLevel);

    console.log('\n--- Testing PUT /api/profile ---');
    const putProfileRes = await axios.put(
      `${BASE_URL}/profile`,
      {
        disabilityTypes: ['visual', 'dyslexia'],
        preferredLanguage: 'Tamil',
        readingLevel: 'Very Simple',
        fontSize: 'large',
        dyslexiaFont: true,
        highContrast: true,
        autoReadAloud: true,
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    console.log('Put profile status:', putProfileRes.status);
    console.log('Updated profile:', {
      language: putProfileRes.data.profile.preferredLanguage,
      readingLevel: putProfileRes.data.profile.readingLevel,
      dyslexiaFont: putProfileRes.data.profile.dyslexiaFont,
      highContrast: putProfileRes.data.profile.highContrast,
    });

    console.log('\n ALL AUTH AND PROFILE TESTS PASSED SUCCESSFULLY! ');
    process.exit(0);
  } catch (error) {
    console.error('Test failed:', error.response?.data || error.message);
    process.exit(1);
  }
}

testAuth();
