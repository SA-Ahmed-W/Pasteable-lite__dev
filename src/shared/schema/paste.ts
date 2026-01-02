import { z } from "zod";

export const pasteSchema = z.object({
  content: z.string().min(1, "content is required"),
  ttl_seconds: z.coerce.number().int().min(1).optional(),
  max_views: z.coerce.number().int().min(1).optional(),
});

export type PasteInput = z.infer<typeof pasteSchema>;
