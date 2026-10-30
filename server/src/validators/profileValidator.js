import { z } from 'zod';

export const updateProfileSchema = z.object({
  disabilityTypes: z.array(z.string()).optional(),
  preferredLanguage: z
    .enum(['English', 'Tamil', 'Hindi', 'Telugu', 'Malayalam', 'Kannada'])
    .optional(),
  readingLevel: z.enum(['Simple', 'Very Simple', 'Original']).optional(),
  fontSize: z.enum(['small', 'medium', 'large', 'xlarge']).optional(),
  dyslexiaFont: z.boolean().optional(),
  highContrast: z.boolean().optional(),
  reducedMotion: z.boolean().optional(),
  autoReadAloud: z.boolean().optional(),
});

