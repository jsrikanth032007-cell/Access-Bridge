import axios from 'axios';

const LANG_CODE_MAP = {
  English: 'en',
  Tamil: 'ta',
  Hindi: 'hi',
  Telugu: 'te',
  Malayalam: 'ml',
  Kannada: 'kn',
  en: 'en',
  ta: 'ta',
  hi: 'hi',
  te: 'te',
  ml: 'ml',
  kn: 'kn',
};

/**
 * Split text into readable chunks under 180 characters, preserving sentence boundaries
 */
function splitTextIntoChunks(text, maxLength = 170) {
  if (!text) return [];

  // Match sentences or clauses by punctuation / line breaks
  const rawSentences = text
    .replace(/\r\n/g, '\n')
    .split(/(?<=[.?!;:\n])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);

  const chunks = [];

  for (const sentence of rawSentences) {
    if (sentence.length <= maxLength) {
      chunks.push(sentence);
    } else {
      // Split long sentence by comma or words
      const words = sentence.split(' ');
      let currentChunk = '';

      for (const word of words) {
        if ((currentChunk + ' ' + word).trim().length <= maxLength) {
          currentChunk = (currentChunk + ' ' + word).trim();
        } else {
          if (currentChunk) chunks.push(currentChunk);
          currentChunk = word;
        }
      }
      if (currentChunk) {
        chunks.push(currentChunk);
      }
    }
  }

  // Cap at 15 chunks (approx 2000-2500 chars) for snappy TTS delivery
  return chunks.slice(0, 15);
}

/**
 * Generate high-fidelity spoken audio MP3 for any of the 6 languages
 * (English, Tamil, Hindi, Telugu, Malayalam, Kannada)
 */
export const getSpokenAudioStream = async (text, language = 'English') => {
  const langCode = LANG_CODE_MAP[language] || 'en';

  // Clean text from markdown, brackets, and excessive formatting
  const cleaned = text
    .replace(/[*#_~`>]/g, '')
    .replace(/\[.*?\]/g, '')
    .replace(/•/g, ', ')
    .replace(/\s+/g, ' ')
    .trim();

  if (!cleaned) {
    throw new Error('No readable text provided for audio synthesis');
  }

  const chunks = splitTextIntoChunks(cleaned);
  if (chunks.length === 0) {
    throw new Error('No valid text chunks to synthesize');
  }

  // Fetch MP3 audio buffers for each chunk in parallel
  const requests = chunks.map(async (chunk) => {
    const url = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${langCode}&client=tw-ob&q=${encodeURIComponent(chunk)}`;
    const response = await axios.get(url, {
      responseType: 'arraybuffer',
      timeout: 10000,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Referer: 'https://translate.google.com/',
      },
    });
    return Buffer.from(response.data);
  });

  const buffers = await Promise.all(requests);
  const combinedBuffer = Buffer.concat(buffers);

  return {
    audioBuffer: combinedBuffer,
    contentType: 'audio/mpeg',
  };
};

export default { getSpokenAudioStream };
