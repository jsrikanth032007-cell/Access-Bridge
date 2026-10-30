import { UserService, ProfileService, HistoryService } from '../services/storeService.js';
import { connectDB } from '../config/db.js';

async function seed() {
  console.log('Seeding AccessBridge demo data...');

  try {
    await connectDB();

    const demoEmail = 'demo@accessbridge.org';
    const demoPassword = 'Password123!';

    let user = await UserService.findByEmail(demoEmail);
    if (!user) {
      user = await UserService.create({
        name: 'Samira Patel',
        email: demoEmail,
        password: demoPassword,
      });
      console.log(`✓ Demo user created: ${demoEmail} (Password: ${demoPassword})`);
    } else {
      console.log(`ℹ Demo user already exists: ${demoEmail}`);
    }

    const userId = user._id || user.id;

    // Seed Profile
    const profile = await ProfileService.updateByUserId(userId, {
      disabilityTypes: ['visual', 'dyslexia'],
      preferredLanguage: 'English',
      readingLevel: 'Simple',
      fontSize: 'large',
      dyslexiaFont: true,
      highContrast: false,
      reducedMotion: false,
      autoReadAloud: true,
    });
    console.log('✓ Accessibility Profile initialized with dyslexia support and large text.');

    // Seed Sample History Item 1: Complex Medical Document Simplified
    await HistoryService.create({
      userId,
      featureType: 'simplify',
      title: 'Medical Discharge & Prescription Advisory',
      inputData: {
        source: 'text',
        textSnippet:
          'Patient presents post-laparoscopic intervention. Continued ambulatory monitoring advised. Administer analgesics PRN, strictly refrain from lifting weight > 5kg, and ensure thromboprophylaxis stockings remain donned for 14 diurnal cycles.',
      },
      outputData: {
        plainLanguage:
          'You had a minor keyhole surgery and are now recovering at home. Take your pain medicine only when you feel pain. Do not lift heavy objects over 10 pounds (like heavy grocery bags). Wear your tight compression socks for 2 weeks to stop blood clots from forming in your legs.',
        keyPoints: [
          'Take pain pills only when needed, not on an automatic timer.',
          'Do not lift anything heavier than 5 kg (11 lbs) for the next 2 weeks.',
          'Keep your medical socks on day and night for 14 days to keep blood flowing safely.',
        ],
        actionSteps: [
          'Set a daily reminder to check your wound for redness or swelling.',
          'Schedule your follow-up clinic appointment within 14 days.',
          'Call your doctor immediately if you develop sudden shortness of breath or calf pain.',
        ],
        glossary: [
          {
            term: 'Laparoscopic',
            definition: 'Keyhole surgery performed through very small cuts using a tiny camera.',
          },
          {
            term: 'PRN',
            definition: 'A medical term meaning "take only when needed", not every hour.',
          },
          {
            term: 'Thromboprophylaxis',
            definition: 'Medical prevention steps taken to stop dangerous blood clots from forming.',
          },
        ],
        translation:
          'நீங்க அறுவைசிகிச்சை முடிஞ்சு வீடு திரும்பியிருக்கீங்க. வலி இருக்கும்போது மட்டும் வலி மாத்திரை போடுங்க. அடுத்த 2 வாரங்களுக்கு 5 கிலோவுக்கு மேலான எடையை தூக்காதீங்க.',
      },
      language: 'English',
      readingLevel: 'Simple',
    });

    // Seed Sample History Item 2: Image Description
    await HistoryService.create({
      userId,
      featureType: 'describe-image',
      title: 'City Metro Station Accessibility Map',
      inputData: {
        fileName: 'metro_accessibility_guide.png',
        mimeType: 'image/png',
      },
      outputData: {
        altText: 'Color-coded metro line diagram highlighting wheelchair ramps and elevators.',
        detailedDescription:
          'A modern transport diagram showing North and South transit lines. Elevators are marked with bright blue circular icons with white wheelchair symbols at all major interchange terminals. Braille tactile path indicators run continuously from Platform 1 to Platform 3.',
        detectedText:
          'METRO TRANSIT ACCESSIBLE ROUTE • ELEVATOR ACCESS AT GATES 2 & 4 • TACTILE PAVING ACTIVE',
      },
    });

    // Seed Sample History Item 3: Lecture Notes
    await HistoryService.create({
      userId,
      featureType: 'lecture-notes',
      title: 'Clean Energy & Solar Photovoltaic Systems',
      inputData: {
        transcriptSnippet:
          'Welcome students. Today we examine semiconductor physics inside solar photovoltaic panels. When photons strike silicon, valence electrons absorb kinetic energy and flow across the p-n junction, generating direct electrical current.',
      },
      outputData: {
        title: 'Clean Energy & Solar Photovoltaic Systems',
        summary:
          '• Solar panels work using semiconductors like silicon.\n• Light particles (photons) hit the silicon cell.\n• This knocks electrons loose, creating an electric current.\n• The resulting direct current (DC) is then converted for home use.',
        keyTerms: [
          {
            term: 'Photovoltaic (PV)',
            explanation: 'The process of turning light particles directly into electricity.',
          },
          {
            term: 'Photon',
            explanation: 'A tiny particle of light carrying radiant energy.',
          },
          {
            term: 'p-n Junction',
            explanation: 'The boundary inside a semiconductor that guides electrical current in one direction.',
          },
        ],
        quiz: [
          {
            question: 'What happens when light photons hit a solar cell?',
            options: [
              'Electrons absorb energy and flow to create electricity',
              'The solar panel turns into a battery',
              'The silicon dissolves in water',
              'The temperature drops to freezing',
            ],
            correctAnswer: 'Electrons absorb energy and flow to create electricity',
            explanation: 'Photons transfer their energy to electrons, driving them across the junction as electric current.',
          },
        ],
      },
      language: 'English',
    });

    console.log('✓ Sample history records seeded successfully.');
    console.log('\n Seed process completed!');
  } catch (err) {
    console.error('Seed error:', err);
  }
}

seed();

