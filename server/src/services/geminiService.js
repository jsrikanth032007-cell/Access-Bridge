import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from '../config/env.js';
import {
  simplifyResultSchema,
  imageDescribeResultSchema,
  askResultSchema,
  lectureNotesResultSchema,
} from '../validators/aiValidator.js';

let genAI = null;
if (env.GEMINI_API_KEY && env.GEMINI_API_KEY !== 'your_gemini_api_key_here') {
  genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
}

// Clean markdown code blocks from model JSON output (e.g. ```json ... ```)
const cleanJsonText = (raw) => {
  if (!raw) return '{}';
  let cleaned = raw.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\s*/i, '').replace(/\s*```$/, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '');
  }
  return cleaned.trim();
};

export const geminiService = {
  /**
   * 1. Simplify complex text, legal docs, medical notes, or web articles
   */
  async simplifyContent({ text, readingLevel = 'Simple', targetLanguage = 'English' }) {
    if (!genAI) {
      return this.fallbackSimplify(text, readingLevel, targetLanguage);
    }

    try {
      const model = genAI.getGenerativeModel({
        model: env.GEMINI_MODEL || 'gemini-1.5-flash',
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.3,
        },
      });

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

      const result = await model.generateContent(prompt);
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
    if (!genAI) {
      return this.fallbackDescribeImage();
    }

    try {
      const model = genAI.getGenerativeModel({
        model: env.GEMINI_MODEL || 'gemini-1.5-flash',
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.2,
        },
      });

      const imagePart = {
        inlineData: {
          data: buffer.toString('base64'),
          mimeType,
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

      const result = await model.generateContent([prompt, imagePart]);
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
    if (!genAI) {
      return this.fallbackAsk(question, context);
    }

    try {
      const model = genAI.getGenerativeModel({
        model: env.GEMINI_MODEL || 'gemini-1.5-flash',
        generationConfig: {
          temperature: 0.4,
        },
      });

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

      const result = await model.generateContent(prompt);
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
    if (!genAI) {
      return this.fallbackLectureNotes(transcript, targetLanguage);
    }

    try {
      const model = genAI.getGenerativeModel({
        model: env.GEMINI_MODEL || 'gemini-1.5-flash',
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.3,
        },
      });

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

      const result = await model.generateContent(prompt);
      const textResponse = result.response.text();
      const parsed = JSON.parse(cleanJsonText(textResponse));
      return lectureNotesResultSchema.parse(parsed);
    } catch (error) {
      console.warn(`[Gemini Service] Error in generateLectureNotes: ${error.message}`);
      return this.fallbackLectureNotes(transcript, targetLanguage, error.message);
    }
  },

  // =================== GRACEFUL FALLBACKS =================== //

  fallbackSimplify(text, readingLevel, targetLanguage, errorMsg) {
    const isMock = !env.GEMINI_API_KEY || env.GEMINI_API_KEY === 'your_gemini_api_key_here';
    const note = isMock
      ? 'Note: Add your GEMINI_API_KEY in server/.env to enable live Google Gemini AI models.'
      : `AI Notice: ${errorMsg || 'Temporary network fallback mode.'}`;

    return {
      plainLanguage: `[${readingLevel} Level Summary]\n\n${text.slice(0, 350)}...\n\n${note}`,
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
          definition: 'Clear, concise communication designed so the reader can find what they need and understand it the first time.',
        },
      ],
      translation: `[${targetLanguage} Translation]\n${text.slice(0, 250)}...`,
    };
  },

  fallbackDescribeImage(errorMsg) {
    return {
      altText: 'An uploaded visual image processed by AccessBridge assistive vision.',
      detailedDescription:
        'The image has been uploaded to AccessBridge. To enable live detailed computer vision descriptions and visual scene interpretation, configure a valid GEMINI_API_KEY in server/.env.',
      detectedText: errorMsg || 'Please provide a valid GEMINI_API_KEY for live visual optical text recognition.',
    };
  },

  fallbackAsk(question, context, errorMsg) {
    return {
      answer: `Here is the assistive guidance for your question "${question}": AccessBridge is configured to simplify complex documentation, extract key action steps, and speak answers back to you. Please configure your GEMINI_API_KEY in server/.env for live contextual Q&A answers.`,
    };
  },

  fallbackLectureNotes(transcript, targetLanguage, errorMsg) {
    return {
      title: 'Accessible Lecture Notes & Study Guide',
      summary: `• Primary Topic: ${transcript.slice(0, 100)}...\n• Key Concept: Structured audio transcript notes for accessible study and deaf/HoH support.\n• Note: Configure your GEMINI_API_KEY in server/.env for AI-generated notes.`,
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
          explanation: 'Structured notes and text transcriptions bridge auditory communication gaps effectively.',
        },
      ],
    };
  },
};

export default geminiService;
