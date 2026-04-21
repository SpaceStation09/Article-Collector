import { z } from "zod";

const articleUrl = z
  .string()
  .trim()
  .url()
  .transform((value) => new URL(value).toString());

export const fetchTitleSchema = z.object({
  url: articleUrl,
});

export const articleInputSchema = z.object({
  url: articleUrl,
  title: z.string().trim().min(1, "Title is required").max(300),
  language: z.enum(["ZH", "EN"]),
  titleSource: z.enum(["AUTO", "MANUAL"]),
  tags: z.array(z.string().trim().min(1).max(40)).max(20),
});
