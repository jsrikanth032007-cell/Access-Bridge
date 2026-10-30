import pdfParse from 'pdf-parse';
import axios from 'axios';
import * as cheerio from 'cheerio';

export const extractTextFromPdf = async (buffer) => {
  try {
    const data = await pdfParse(buffer);
    const cleaned = data.text.replace(/\r\n/g, '\n').trim();
    if (!cleaned) {
      throw new Error('PDF appears to be empty or contains only scanned images without OCR text.');
    }
    return cleaned;
  } catch (error) {
    throw new Error(`Failed to extract text from PDF: ${error.message}`);
  }
};

export const extractTextFromTxt = (buffer) => {
  try {
    return buffer.toString('utf-8').trim();
  } catch (error) {
    throw new Error(`Failed to read text file: ${error.message}`);
  }
};

export const extractTextFromUrl = async (url) => {
  try {
    // Validate URL format
    const parsed = new URL(url);
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      throw new Error('Invalid URL protocol. Only http:// and https:// URLs are supported.');
    }

    const response = await axios.get(url, {
      timeout: 10000,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36 AccessBridge/1.0',
      },
    });

    const html = response.data;
    const $ = cheerio.load(html);

    // Remove noise
    $('script, style, noscript, nav, header, footer, aside, iframe, svg, [role="banner"], [role="navigation"]').remove();

    // Prioritize main content containers if present
    const mainContent = $('article, main, #content, .content, .post, [role="main"]').first();

    let extractedText = '';
    if (mainContent.length > 0) {
      extractedText = mainContent.text();
    } else {
      extractedText = $('body').text();
    }

    // Clean whitespace and excessive blank lines
    const cleaned = extractedText
      .replace(/\t/g, ' ')
      .replace(/\r\n/g, '\n')
      .replace(/[ \t]+/g, ' ')
      .replace(/\n\s*\n+/g, '\n\n')
      .trim();

    if (!cleaned) {
      throw new Error('Could not extract readable article text from the provided webpage.');
    }

    return cleaned;
  } catch (error) {
    throw new Error(`Failed to fetch web content from URL: ${error.message}`);
  }
};
