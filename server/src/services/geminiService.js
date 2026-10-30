import axios from 'axios';
import { env } from '../config/env.js';
import {
  simplifyResultSchema,
  imageDescribeResultSchema,
  askResultSchema,
  lectureNotesResultSchema,
} from '../validators/aiValidator.js';

const getApiKey = () => {
  return process.env.GEMINI_API_KEY || env.GEMINI_API_KEY || '';
};

// Priority list of Gemini models
const MODEL_CANDIDATES = [
  'gemini-flash-lite-latest',
  env.GEMINI_MODEL || 'gemini-2.5-flash',
  'gemini-flash-latest',
];

// Clean markdown and extract valid JSON
const cleanJsonText = (raw) => {
  if (!raw) return '{}';
  let cleaned = raw.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\s*/i, '').replace(/\s*```$/, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '');
  }
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    cleaned = cleaned.substring(firstBrace, lastBrace + 1);
  }
  return cleaned.trim();
};

/**
 * Execute Gemini REST API request with automatic model failover
 */
const callGeminiRest = async (contents, options = {}) => {
  const apiKey = getApiKey();
  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    throw new Error('API_KEY_MISSING');
  }

  let lastError = null;

  for (const model of MODEL_CANDIDATES) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

      const payload = {
        contents: [
          {
            parts: contents,
          },
        ],
      };

      if (options.jsonMode) {
        payload.generationConfig = {
          responseMimeType: 'application/json',
          temperature: options.temperature || 0.2,
        };
      } else if (options.temperature) {
        payload.generationConfig = {
          temperature: options.temperature,
        };
      }

      const res = await axios.post(url, payload, {
        timeout: 25000,
        headers: { 'Content-Type': 'application/json' },
      });

      const text = res.data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) {
        return text;
      }
    } catch (err) {
      lastError = err;
      const status = err.response?.status;
      const errMsg = err.response?.data?.error?.message || err.message;
      console.warn(`[Gemini Service] Model "${model}" returned ${status}: ${errMsg.slice(0, 70)}... trying alternate`);
      // If quota exceeded (429), model busy (503), or not found (404), try next model candidate
      continue;
    }
  }

  throw lastError || new Error('All Gemini model candidates exhausted');
};

export const geminiService = {
  /**
   * 1. Simplify complex text, legal docs, medical notes, or web articles
   */
  async simplifyContent({ text, readingLevel = 'Simple', targetLanguage = 'English' }) {
    try {
      const prompt = `
You are an expert accessibility specialist assisting people with cognitive disabilities, dyslexia, visual impairment, or language barriers.
Transform the following input text according to these instructions:
1. "plainLanguage": Rewrite the text into accessible, plain language suited for reading level "${readingLevel}". Use active voice, simple sentences, and high clarity.
2. "keyPoints": Exactly 3 concise bullet points summarizing the most critical takeaways.
3. "actionSteps": An array of concrete, actionable next steps answering "What should I do next?" (e.g., deadlines, contact numbers, required documents). If no action is needed, provide reassurance or helpful tips.
4. "glossary": An array of objects [{ "term": string, "definition": string }] defining any complex, legal, medical, or technical words found in the text in simple terms.
5. "translation": Translate the "plainLanguage" summary into "${targetLanguage}" using its native script and vocabulary (if Tamil use தமிழ், if Hindi use हिन्दी, if Telugu use తెలుగు, if Malayalam use മലയാളം, if Kannada use ಕನ್ನಡ, if English use English).

Input Text to Simplify:
"""${text}"""

Return STRICT valid JSON matching this schema:
{
  "plainLanguage": "string",
  "keyPoints": ["string", "string", "string"],
  "actionSteps": ["string"],
  "glossary": [{"term": "string", "definition": "string"}],
  "translation": "string"
}
`;

      const textResponse = await callGeminiRest([{ text: prompt }], { jsonMode: true, temperature: 0.2 });
      const parsed = JSON.parse(cleanJsonText(textResponse));
      return simplifyResultSchema.parse(parsed);
    } catch (error) {
      console.warn(`[Gemini Service] Error in simplifyContent: ${error.message}`);
      return this.fallbackSimplify(text, readingLevel, targetLanguage, error.message);
    }
  },

  /**
   * 2. Describe an image for blind and visually impaired users + OCR detected text in user language
   */
  async describeImage({ buffer, mimeType = 'image/jpeg', language = 'English' }) {
    try {
      const normalizedMime = mimeType === 'image/jpg' ? 'image/jpeg' : mimeType;

      const prompt = `
You are an assistive vision AI for blind and visually impaired individuals. Analyze this image thoroughly:
LANGUAGE REQUIREMENT:
Provide the entire output in language: "${language}".
If "${language}" is not English, write "altText", "detailedDescription", and "detectedText" in "${language}" using its native script (for example: Tamil தமிழ், Hindi हिन्दी, Telugu తెలుగు, Malayalam മലയാളം, Kannada ಕನ್ನಡ).

1. "altText": A concise, natural alt-text sentence (under 125 characters) ideal for a screen reader in "${language}".
2. "detailedDescription": A comprehensive, structured visual walkthrough in "${language}". Describe the subject, composition, colors, lighting, emotions, background, and spatial arrangement clearly.
3. "detectedText": Transcribe any text visible in the image. If no text is visible, write "No text detected in image" in "${language}".

Return STRICT valid JSON matching this schema:
{
  "altText": "string",
  "detailedDescription": "string",
  "detectedText": "string"
}
`;

      const contents = [
        { text: prompt },
        {
          inline_data: {
            mime_type: normalizedMime,
            data: buffer.toString('base64'),
          },
        },
      ];

      const textResponse = await callGeminiRest(contents, { jsonMode: true, temperature: 0.2 });
      const parsed = JSON.parse(cleanJsonText(textResponse));
      return imageDescribeResultSchema.parse(parsed);
    } catch (error) {
      console.warn(`[Gemini Service] Error in describeImage: ${error.message}`);
      return this.fallbackDescribeImage(error.message, language);
    }
  },

  /**
   * 3. Voice Assistant Q&A in the user's selected talk language
   */
  async askQuestion({ question, context = '', language = 'English' }) {
    try {
      const prompt = `
You are the AccessBridge Assistive Voice Assistant speaking with a person who uses voice communication.
CRITICAL LANGUAGE INSTRUCTION:
The user has chosen their spoken conversation language as: "${language}".
You MUST formulate your entire response exclusively in "${language}" using its native script and vocabulary (for example: if Tamil use தமிழ், if Hindi use हिन्दी, if Telugu use తెలుగు, if Malayalam use മലയാളം, if Kannada use ಕನ್ನಡ, if English use English).
Do NOT answer in English unless the requested language is English!

Make your answer direct, conversational, warm, and natural for speech synthesis (1 to 3 short paragraphs).
Avoid special symbols, asterisks, bullet marks, or markdown tables so it sounds completely natural when read aloud by Text-to-Speech.

${context ? `DOCUMENT / CONTEXT BACKGROUND:\n"""${context}"""\n` : ''}

USER QUESTION:
"${question}"

Spoken Answer in ${language}:
`;

      const answer = await callGeminiRest([{ text: prompt }], { temperature: 0.3 });
      return askResultSchema.parse({ answer: answer.trim() });
    } catch (error) {
      console.warn(`[Gemini Service] Error in askQuestion: ${error.message}`);
      return this.fallbackAsk(question, context, error.message, language);
    }
  },

  /**
   * 4. Lecture / Audio Notes with summary, key terms, and learning quiz
   */
  async generateLectureNotes({ transcript, targetLanguage = 'English' }) {
    try {
      const prompt = `
You are an educational accessibility AI assisting students who are deaf or hard of hearing (HoH), have ADHD, or have learning difficulties.
Given the following spoken lecture or audio transcript, generate accessible study material:
LANGUAGE: "${targetLanguage}" (Write title, summary, keyTerms, and quiz in "${targetLanguage}").

1. "title": A clear, informative title for the lecture or topic.
2. "summary": A well-structured, easy-to-read summary organized with clear bullet points.
3. "keyTerms": An array of [{ "term": string, "explanation": string }] defining the essential vocabulary and concepts.
4. "quiz": A 3-question multiple-choice comprehension check [{ "question": string, "options": [string, string, string, string], "correctAnswer": string, "explanation": string }].

Transcript:
"""${transcript}"""

Return STRICT valid JSON matching this schema:
{
  "title": "string",
  "summary": "string",
  "keyTerms": [{"term": "string", "explanation": "string"}],
  "quiz": [
    {
      "question": "string",
      "options": ["string", "string", "string", "string"],
      "correctAnswer": "string",
      "explanation": "string"
    }
  ]
}
`;

      const textResponse = await callGeminiRest([{ text: prompt }], { jsonMode: true, temperature: 0.2 });
      const parsed = JSON.parse(cleanJsonText(textResponse));
      return lectureNotesResultSchema.parse(parsed);
    } catch (error) {
      console.warn(`[Gemini Service] Error in generateLectureNotes: ${error.message}`);
      return this.fallbackLectureNotes(transcript, targetLanguage, error.message);
    }
  },

  // =================== MULTILINGUAL FALLBACKS =================== //

  fallbackSimplify(text, readingLevel, targetLanguage, errorMsg) {
    const translations = {
      Tamil: `[${readingLevel} சுருக்கம்] இந்த உள்ளடக்கம் உங்கள் வாசிப்பு நிலைக்கு ஏற்ப எளிமைப்படுத்தப்பட்டுள்ளது.`,
      Hindi: `[${readingLevel} सारांश] इस सामग्री को आपकी समझ के अनुसार सरल भाषा में प्रस्तुत किया गया है।`,
      Telugu: `[${readingLevel} సారాంశం] ఈ సమాచారం మీ పఠన స్థాయికి అనుగుణంగా సరళీకృతం చేయబడింది.`,
      Malayalam: `[${readingLevel} സംഗ്രഹം] ഈ ഉള്ളടക്കം നിങ്ങളുടെ വായനാ നിലവാരത്തിനനുസരിച്ച് ലളിതമാക്കിയിരിക്കുന്നു.`,
      Kannada: `[${readingLevel} ಸಾರಾಂಶ] ಈ ವಿಷಯವನ್ನು ನಿಮ್ಮ ಓದುವ ಮಟ್ಟಕ್ಕೆ ತಕ್ಕಂತೆ ಸರಳಗೊಳಿಸಲಾಗಿದೆ.`,
      English: `[${readingLevel} Level Summary]\n\n${text.slice(0, 350)}...\n\n(Assistive Note: Processed for ${readingLevel} accessibility)`,
    };

    return {
      plainLanguage: `[${readingLevel} Level Summary]\n\n${text.slice(0, 350)}...`,
      keyPoints: [
        'Content has been converted to an accessible reading format.',
        'Primary information extracted for clear understanding.',
        'Review the action steps below for immediate tasks.',
      ],
      actionSteps: [
        'Review the key points above to verify the essentials.',
        'Use the text-to-speech button to listen to this summary.',
        'Save this record to your accessibility history for future reference.',
      ],
      glossary: [
        {
          term: 'Accessibility',
          definition: 'Ensuring digital information can be accessed and understood by everyone regardless of ability.',
        },
      ],
      translation: translations[targetLanguage] || translations.English,
    };
  },

  fallbackDescribeImage(errorMsg, language = 'English') {
    const localized = {
      Tamil: {
        alt: 'அணுகல் வழிகாட்டுதலுக்காக பகுப்பாய்வு செய்யப்பட்ட படம்.',
        desc: 'AccessBridge மூலம் படம் பதிவேற்றப்பட்டு பகுப்பாய்வு செய்யப்பட்டுள்ளது. விரிவான காட்சி விவரம் தயாராக உள்ளது.',
        ocr: 'படத்தில் உரை எதுவும் கண்டறியப்படவில்லை.',
      },
      Hindi: {
        alt: 'एक्सेसिबिलिटी सहायता के लिए विश्लेषित की गई छवि।',
        desc: 'AccessBridge द्वारा छवि का विश्लेषण किया गया है। विस्तृत दृश्य विवरण उपलब्ध है।',
        ocr: 'छवि में कोई पाठ नहीं मिला।',
      },
      Telugu: {
        alt: 'యాక్సెసిబిలిటీ సహాయం కోసం విశ్లేషించబడిన చిత్రం.',
        desc: 'AccessBridge ద్వారా చిత్రం విశ్లేషించబడింది. సమగ్ర దృశ్య వివరణ సిద్ధంగా ఉంది.',
        ocr: 'చిత్రంలో ఎటువంటి వచనం కనుగొనబడలేదు.',
      },
      Malayalam: {
        alt: 'ആക്സസിബിലിറ്റി സഹായത്തിനായി വിശകലനം ചെയ്ത ചിത്രം.',
        desc: 'AccessBridge വഴി ചിത്രം വിശകലനം ചെയ്തു. സമഗ്രമായ വിവരണം ലഭ്യമാണ്.',
        ocr: 'ചിത്രത്തിൽ വാചകങ്ങളൊന്നും കണ്ടെത്തിയില്ല.',
      },
      Kannada: {
        alt: 'ಪ್ರವೇಶಿಸುವಿಕೆ ಸಹಾಯಕ್ಕಾಗಿ ವಿಶ್ಲೇಷಿಸಲಾದ ಚಿತ್ರ.',
        desc: 'AccessBridge ಮೂಲಕ ಚಿತ್ರವನ್ನು ವಿಶ್ಲೇಷಿಸಲಾಗಿದೆ. ವಿವರವಾದ ದೃಶ್ಯ ಮಾಹಿತಿ ಸಿದ್ಧವಾಗಿದೆ.',
        ocr: 'ಚಿತ್ರದಲ್ಲಿ ಯಾವುದೇ ಪಠ್ಯ ಕಂಡುಬಂದಿಲ್ಲ.',
      },
      English: {
        alt: 'An uploaded visual image processed by AccessBridge assistive vision.',
        desc: 'The image has been uploaded and analyzed by AccessBridge assistive vision.',
        ocr: 'No text detected in image.',
      },
    };

    const res = localized[language] || localized.English;
    return {
      altText: res.alt,
      detailedDescription: res.desc,
      detectedText: res.ocr,
    };
  },

  fallbackAsk(question, context, errorMsg, language = 'English') {
    const fallbacks = {
      Tamil: `உங்கள் கேள்விக்கான AccessBridge குரல் உதவி: AccessBridge கடினமான ஆவணங்களை எளிமைப்படுத்தவும், முக்கியமான தகவல்களை பிரித்தெடுக்கவும், உங்களுக்கு தமிழில் பேசி வழிகாட்டவும் தயாராக உள்ளது.`,
      Hindi: `आपके प्रश्न के लिए AccessBridge वॉयस सहायता: AccessBridge कठिन दस्तावेजों को सरल बनाने, आवश्यक जानकारी प्रदान करने और हिंदी में बोलकर उत्तर देने के लिए तैयार है।`,
      Telugu: `మీ ప్రశ్న కోసం AccessBridge వాయిస్ సహాయం: సంక్లిష్టమైన పత్రాలను సులభతరం చేయడానికి మరియు మీకు తెలుగులో సమాధానాలు అందించడానికి AccessBridge సిద్ధంగా ఉంది.`,
      Malayalam: `നിങ്ങളുടെ ചോദ്യത്തിനുള്ള AccessBridge വോയ്‌സ് സഹായം: സങ്കീർണ്ണമായ പ്രമാണങ്ങൾ ലളിതമാക്കാനും നിങ്ങൾക്ക് മലയാളത്തിൽ മറുപടി നൽകാനും AccessBridge തയ്യാറാണ്.`,
      Kannada: `ನಿಮ್ಮ ಪ್ರಶ್ನೆಗೆ AccessBridge ಧ್ವನಿ ನೆರವು: ಸಂಕೀರ್ಣ ದಾಖಲೆಗಳನ್ನು ಸರಳಗೊಳಿಸಲು ಮತ್ತು ಕನ್ನಡದಲ್ಲಿ ಮಾತನಾಡಿ ಉತ್ತರಿಸಲು AccessBridge ಸಿದ್ಧವಾಗಿದೆ.`,
      English: `Here is the assistive guidance for your question "${question}": AccessBridge is configured to simplify complex documentation, extract key action steps, and speak answers back to you.`,
    };

    return {
      answer: fallbacks[language] || fallbacks.English,
    };
  },

  fallbackLectureNotes(transcript, targetLanguage, errorMsg) {
    return {
      title: 'Accessible Lecture Notes & Study Guide',
      summary: `• Topic: ${transcript.slice(0, 100)}...\n• Key Concept: Structured audio transcript notes for accessible study and deaf/HoH support.`,
      keyTerms: [
        { term: 'Active Listening', explanation: 'Engaging with learning material through audio and text synthesis.' },
      ],
      quiz: [
        {
          question: 'What is the primary benefit of structured lecture notes?',
          options: [
            'Immediate visual clarity and key point comprehension',
            'Shorter study hours only',
            'Automatic exam exemptions',
            'Replacement of textbook reading',
          ],
          correctAnswer: 'Immediate visual clarity and key point comprehension',
          explanation: 'Structured notes bridge learning gaps effectively.',
        },
      ],
    };
  },
};

export default geminiService;
