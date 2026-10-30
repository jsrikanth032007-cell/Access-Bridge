import { geminiService } from '../services/geminiService.js';
import { getSpokenAudioStream } from '../services/ttsService.js';
import {
  extractTextFromPdf,
  extractTextFromTxt,
  extractTextFromUrl,
} from '../services/textExtractor.js';
import {
  simplifyRequestSchema,
  askRequestSchema,
  lectureNotesRequestSchema,
} from '../validators/aiValidator.js';
import { ProfileService, HistoryService } from '../services/storeService.js';

export const simplify = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const profile = await ProfileService.findByUserId(userId);

    let rawText = '';
    let sourceTitle = 'Document Simplification';

    // 1. Check if user uploaded a file (.pdf or .txt)
    if (req.file) {
      sourceTitle = req.file.originalname;
      if (req.file.mimetype === 'application/pdf') {
        rawText = await extractTextFromPdf(req.file.buffer);
      } else {
        rawText = extractTextFromTxt(req.file.buffer);
      }
    }
    // 2. Check if user entered a URL
    else if (req.body.url && req.body.url.trim() !== '') {
      sourceTitle = req.body.url.trim();
      rawText = await extractTextFromUrl(req.body.url.trim());
    }
    // 3. Check if user pasted text
    else if (req.body.text && req.body.text.trim() !== '') {
      rawText = req.body.text.trim();
      sourceTitle = rawText.slice(0, 40) + '...';
    } else {
      return res.status(400).json({
        success: false,
        message: 'Please provide text to simplify, enter a web URL, or upload a .txt/.pdf file.',
      });
    }

    // Determine target reading level & language (fallback to user's accessibility profile)
    const readingLevel = req.body.readingLevel || profile.readingLevel || 'Simple';
    const targetLanguage = req.body.language || profile.preferredLanguage || 'English';

    // Call Gemini Service
    const aiResult = await geminiService.simplifyContent({
      text: rawText,
      readingLevel,
      targetLanguage,
    });

    // Save to user history
    const historyRecord = await HistoryService.create({
      userId,
      featureType: 'simplify',
      title: sourceTitle,
      inputData: {
        textSnippet: rawText.slice(0, 300),
        source: req.file ? 'file' : req.body.url ? 'url' : 'text',
      },
      outputData: aiResult,
      language: targetLanguage,
      readingLevel,
    });

    res.json({
      success: true,
      result: aiResult,
      historyId: historyRecord._id || historyRecord.id,
      readingLevel,
      language: targetLanguage,
    });
  } catch (error) {
    next(error);
  }
};

export const describeImage = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const profile = await ProfileService.findByUserId(userId);

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload an image file (PNG, JPG, WebP, GIF) to describe.',
      });
    }

    const language = req.body.language || profile.preferredLanguage || 'English';

    const aiResult = await geminiService.describeImage({
      buffer: req.file.buffer,
      mimeType: req.file.mimetype,
      language,
    });

    // Save to user history
    const historyRecord = await HistoryService.create({
      userId,
      featureType: 'describe-image',
      title: req.file.originalname || 'Image Description',
      inputData: {
        fileName: req.file.originalname,
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
      },
      outputData: aiResult,
      language,
    });

    res.json({
      success: true,
      result: aiResult,
      historyId: historyRecord._id || historyRecord.id,
      language,
    });
  } catch (error) {
    next(error);
  }
};

export const askVoiceAssistant = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const profile = await ProfileService.findByUserId(userId);
    const validatedData = askRequestSchema.parse(req.body);

    const language = validatedData.language || profile.preferredLanguage || 'English';

    const aiResult = await geminiService.askQuestion({
      question: validatedData.question,
      context: validatedData.context || '',
      language,
    });

    res.json({
      success: true,
      result: aiResult,
      language,
    });
  } catch (error) {
    next(error);
  }
};

export const generateLectureNotes = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const profile = await ProfileService.findByUserId(userId);

    let transcript = '';
    if (req.file) {
      transcript = extractTextFromTxt(req.file.buffer);
    } else if (req.body.transcript) {
      transcript = req.body.transcript.trim();
    }

    if (!transcript || transcript.length < 10) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a lecture or audio transcript of at least 10 characters.',
      });
    }

    const targetLanguage = req.body.language || profile.preferredLanguage || 'English';

    const aiResult = await geminiService.generateLectureNotes({
      transcript,
      targetLanguage,
    });

    // Save to history
    const historyRecord = await HistoryService.create({
      userId,
      featureType: 'lecture-notes',
      title: aiResult.title || 'Lecture Summary',
      inputData: {
        transcriptSnippet: transcript.slice(0, 300),
      },
      outputData: aiResult,
      language: targetLanguage,
    });

    res.json({
      success: true,
      result: aiResult,
      historyId: historyRecord._id || historyRecord.id,
    });
  } catch (error) {
    next(error);
  }
};

export const getTtsAudio = async (req, res) => {
  try {
    const text = (req.query.text || '').toString();
    const lang = (req.query.lang || 'English').toString();

    if (!text.trim()) {
      return res.status(400).send('Missing text parameter');
    }

    const { audioBuffer, contentType } = await getSpokenAudioStream(text, lang);
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.send(audioBuffer);
  } catch (error) {
    console.warn('[TTS Controller] Audio generation notice:', error.message);
    res.status(500).send('Audio generation failed');
  }
};

