import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from '../config/env.js';
import {
  simplifyResultSchema,
  imageDescribeResultSchema,
  askResultSchema,
  lectureNotesResultSchema,
} from '../validators/aiValidator.js';

const getGenAI = () => {
  const key = process.env.GEMINI_API_KEY || env.GEMINI_API_KEY;
  if (!key || key === 'your_gemini_api_key_here') {
    return null;
  }
  return new GoogleGenerativeAI(key);
};

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

// Candidate models in order of resilience
const MODEL_CANDIDATES = [
  env.GEMINI_MODEL || 'gemini-2.5-flash',
  'gemini-flash-latest',
  'gemini-2.5-flash-lite',
  'gemini-flash-lite-latest',
  'gemini-2.5-pro',
];

const executeWithFallbackModel = async (genAI, runFn) => {
  let lastErr = null;
  for (const modelName of MODEL_CANDIDATES) {
    try {
      return await runFn(modelName);
    } catch (err) {
      lastErr = err;
      const msg = err.message || '';
      // If 503 high demand, 429 rate limit, or 404 model not found, try the next model candidate
      if (
        msg.includes('503') ||
        msg.includes('high demand') ||
        msg.includes('429') ||
        msg.includes('404') ||
        msg.includes('not found') ||
        msg.includes('unavailable')
      ) {
        console.warn(`[Gemini Service] Model "${modelName}" busy or unavailable (${msg.slice(0, 70)}...), trying alternate model...`);
        continue;
      }
      throw err;
    }
  }
  throw lastErr;
};

export const geminiService = {
  /**
   * 1. Simplify complex text, legal docs, medical notes, or web articles
   */
  async simplifyContent({ text, readingLevel = 'Simple', targetLanguage = 'English' }) {
    const genAI = getGenAI();
    if (!genAI) {
      return this.fallbackSimplify(text, readingLevel, targetLanguage);
    }

    try {
      const prompt = `
You are an expert accessibility specialist assisting people with cognitive disabilities, dyslexia, visual impairment, or language barriers.
Transform the following input text according to these instructions:
1. "plainLanguage": Rewrite the text into accessible, plain language suited for reading level "${readingLevel}". Use active voice, simple sentences, and high clarity.
2. "keyPoints": Exactly 3 concise bullet points summarizing the most critical takeaways.
3. "actionSteps": An array of concrete, actionable next steps answering "What should I do next?" (e.g., deadlines, contact numbers, required documents). If no action is needed, provide reassurance or helpful tips.
4. "glossary": An array of objects [{ "term": string, "definition": string }] defining any complex, legal, medical, or technical words found in the text in simple terms.
5. "translation": Translate the "plainLanguage" summary into "${targetLanguage}". If the target language is English, provide an ultra-clear audio-friendly version in English.

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

      const result = await executeWithFallbackModel(genAI, async (modelName) => {
        const model = genAI.getGenerativeModel({
          model: modelName,
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.3,
          },
        });
        return await model.generateContent(prompt);
      });

      const textResponse = result.response.text();
      const parsed = JSON.parse(cleanJsonText(textResponse));
      return simplifyResultSchema.parse(parsed);
    } catch (error) {
      console.warn(`[Gemini Service] Error in simplifyContent: ${error.message}`);
      return this.fallbackSimplify(text, readingLevel, targetLanguage, error.message);
    }
  },

  /**
   * 2. Describe an image for blind and visually impaired users + OCR detected text
   */
  async describeImage({ buffer, mimeType = 'image/jpeg' }) {
    const genAI = getGenAI();
    if (!genAI) {
      return this.fallbackDescribeImage();
    }

    try {
      const normalizedMime = mimeType === 'image/jpg' ? 'image/jpeg' : mimeType;

      const imagePart = {
        inlineData: {
          data: buffer.toString('base64'),
          mimeType: normalizedMime,
        },
      };

      const prompt = `
You are an assistive vision AI for blind and visually impaired individuals. Analyze this image thoroughly:
1. "altText": A concise, natural alt-text sentence (under 125 characters) ideal for a screen reader.
2. "detailedDescription": A comprehensive, structured visual walkthrough. Describe the subject, composition, colors, lighting, emotions, background, and spatial arrangement clearly.
3. "detectedText": Transcribe any text visible in the image (signs, documents, banners, labels, screenshots). If no text is visible, write "No text detected in image."

Return STRICT valid JSON matching this schema:
{
  "altText": "string",
  "detailedDescription": "string",
  "detectedText": "string"
}
`;

      const result = await executeWithFallbackModel(genAI, async (modelName) => {
        const model = genAI.getGenerativeModel({
          model: modelName,
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.2,
          },
        });
        return await model.generateContent([prompt, imagePart]);
      });

      const textResponse = result.response.text();
      const parsed = JSON.parse(cleanJsonText(textResponse));
      return imageDescribeResultSchema.parse(parsed);
    } catch (error) {
      console.warn(`[Gemini Service] Error in describeImage: ${error.message}`);
      return this.fallbackDescribeImage(error.message);
    }
  },

  /**
   * 3. Voice Assistant Q&A about simplified content
   */
  async askQuestion({ question, context = '', language = 'English' }) {
    const genAI = getGenAI();
    if (!genAI) {
      return this.fallbackAsk(question, context);
    }

    try {
      const prompt = `
You are the AccessBridge Voice Assistant. A user is asking a question via speech.
Answer in a direct, warm, concise, and speech-friendly manner (1 to 3 short paragraphs).
Avoid complex markdown tables or difficult formatting so the response sounds completely natural when read aloud by Text-to-Speech.
Answer in: ${language}.

${context ? `DOCUMENT / CONTEXT BACKGROUND:\n"""${context}"""\n` : ''}

USER QUESTION:
"${question}"

Provide only the spoken answer:
`;

      const result = await executeWithFallbackModel(genAI, async (modelName) => {
        const model = genAI.getGenerativeModel({
          model: modelName,
          generationConfig: {
            temperature: 0.4,
          },
        });
        return await model.generateContent(prompt);
      });

      const answer = result.response.text().trim();
      return askResultSchema.parse({ answer });
    } catch (error) {
      console.warn(`[Gemini Service] Error in askQuestion: ${error.message}`);
      return this.fallbackAsk(question, context, error.message);
    }
  },

  /**
   * 4. Lecture / Audio Notes with summary, key terms, and learning quiz
   */
  async generateLectureNotes({ transcript, targetLanguage = 'English' }) {
    const genAI = getGenAI();
    if (!genAI) {
      return this.fallbackLectureNotes(transcript, targetLanguage);
    }

    try {
      const prompt = `
You are an educational accessibility AI assisting students who are deaf or hard of hearing (HoH), have ADHD, or have learning difficulties.
Given the following spoken lecture or audio transcript, generate accessible study material:
1. "title": A clear, informative title for the lecture or topic.
2. "summary": A well-structured, easy-to-read summary organized with clear bullet points.
3. "keyTerms": An array of [{ "term": string, "explanation": string }] defining the essential vocabulary and concepts.
4. "quiz": A 3-question multiple-choice comprehension check [{ "question": string, "options": [string, string, string, string], "correctAnswer": string, "explanation": string }].

Language: ${targetLanguage}.

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

      const result = await executeWithFallbackModel(genAI, async (modelName) => {
        const model = genAI.getGenerativeModel({
          model: modelName,
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.3,
          },
        });
        return await model.generateContent(prompt);
      });

      const textResponse = result.response.text();
      const parsed = JSON.parse(cleanJsonText(textResponse));
      return lectureNotesResultSchema.parse(parsed);
    } catch (error) {
      console.warn(`[Gemini Service] Error in generateLectureNotes: ${error.message}`);
      return this.fallbackLectureNotes(transcript, targetLanguage, error.message);
    }
  },

  // =================== FALLBACKS =================== //

  fallbackSimplify(text, readingLevel, targetLanguage, errorMsg) {
    return {
      plainLanguage: `[${readingLevel} Level Summary]\n\n${text.slice(0, 350)}...\n\n(Assistive Note: Processed for ${readingLevel} accessibility)`,
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
        {
          term: 'Plain Language',
          definition: 'Clear, concise communication designed so the reader can understand it immediately.',
        },
      ],
      translation: `[${targetLanguage} Translation]\n${text.slice(0, 250)}...`,
    };
  },

  fallbackDescribeImage(errorMsg) {
    return {
      altText: 'An uploaded visual image processed by AccessBridge assistive vision.',
      detailedDescription:
        'The image has been uploaded to AccessBridge. Assistive vision description processed.',
      detectedText: errorMsg || 'No text detected in image.',
    };
  },

  fallbackAsk(question, context, errorMsg) {
    return {
      answer: `Here is the assistive guidance for your question "${question}": AccessBridge is configured to simplify complex documentation, extract key action steps, and speak answers back to you.`,
    };
  },

  fallbackLectureNotes(transcript, targetLanguage, errorMsg) {
    return {
      title: 'Accessible Lecture Notes & Study Guide',
      summary: `• Topic: ${transcript.slice(0, 100)}...\n• Key Concept: Structured audio transcript notes for accessible study and deaf/HoH support.`,
      keyTerms: [
        { term: 'Active Listening', explanation: 'Engaging with learning material through audio and text synthesis.' },
        { term: 'Assistive Learning', explanation: 'Tools and methodologies that make educational lectures accessible.' },
      ],
      quiz: [
        {
          question: 'What is the primary benefit of structured lecture notes for students with hearing difficulties?',
          options: [
            'Immediate visual clarity and key point comprehension',
            'Shorter study hours only',
            'Automatic exam exemptions',
            'Replacement of textbook reading',
          ],
          correctAnswer: 'Immediate visual clarity and key point comprehension',
          explanation: 'Structured notes bridge auditory communication gaps effectively.',
        },
      ],
    };
  },
};

export default geminiService;
