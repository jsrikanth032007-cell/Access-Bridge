import { z } from 'zod';

// =================== REQUEST SCHEMAS =================== //

export const simplifyRequestSchema = z.object({
  text: z.string().optional(),
  url: z.string().url('Please enter a valid web URL').optional().or(z.literal('')),
  language: z
    .enum(['English', 'Tamil', 'Hindi', 'Telugu', 'Malayalam', 'Kannada'])
    .optional(),
  readingLevel: z.enum(['Simple', 'Very Simple', 'Original']).optional(),
});

export const askRequestSchema = z.object({
  question: z.string().trim().min(1, 'Question cannot be empty'),
  context: z.string().optional(),
  language: z.string().optional(),
});

export const lectureNotesRequestSchema = z.object({
  transcript: z.string().trim().min(10, 'Transcript must contain at least 10 characters'),
  language: z
    .enum(['English', 'Tamil', 'Hindi', 'Telugu', 'Malayalam', 'Kannada'])
    .optional(),
});

// =================== GEMINI STRUCTURED RESPONSE SCHEMAS =================== //

export const simplifyResultSchema = z.object({
  plainLanguage: z.string({ required_error: 'plainLanguage is required' }),
  keyPoints: z.array(z.string()).min(1, 'At least one key point required'),
  actionSteps: z.array(z.string()).default([]),
  glossary: z
    .array(
      z.object({
        term: z.string(),
        definition: z.string(),
      })
    )
    .default([]),
  translation: z.string().default(''),
});

export const imageDescribeResultSchema = z.object({
  altText: z.string({ required_error: 'altText is required' }),
  detailedDescription: z.string({ required_error: 'detailedDescription is required' }),
  detectedText: z.string().default('No text detected in image.'),
});

export const askResultSchema = z.object({
  answer: z.string({ required_error: 'answer is required' }),
});

export const lectureNotesResultSchema = z.object({
  title: z.string().default('Lecture Summary'),
  summary: z.string({ required_error: 'summary is required' }),
  keyTerms: z
    .array(
      z.object({
        term: z.string(),
        explanation: z.string(),
      })
    )
    .default([]),
  quiz: z
    .array(
      z.object({
        question: z.string(),
        options: z.array(z.string()).min(2),
        correctAnswer: z.string(),
        explanation: z.string(),
      })
    )
    .default([]),
});
