import { z } from "zod";

export const localizedTextSchema = z.object({
  ru: z.string().min(1, "Заполните русский текст"),
  en: z.string().min(1, "Заполните английский текст"),
});

export const localizedTextOptionalSchema = z.object({
  ru: z.string(),
  en: z.string(),
});

export const slugSchema = z
  .string()
  .min(1)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "slug must be lowercase kebab-case (a-z, 0-9, -)");

// A title needs Russian; the English one is optional because the site falls back to Russian
// (see pickLocalized), so requiring it would only block saving a draft.
export const localizedTitleSchema = z.object({
  ru: z.string().trim().min(1, "Заполните русское название"),
  en: z.string(),
});

export const projectStatusSchema = z.enum(["draft", "published"]);

export const profileUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  role: localizedTextSchema.optional(),
  about: localizedTextSchema.optional(),
  avatarId: z.string().nullable().optional(),
  currentJobCompany: z.string().nullable().optional(),
  currentJobPosition: localizedTextOptionalSchema.nullable().optional(),
  currentJobFrom: z.coerce.date().nullable().optional(),
  currentJobDescription: localizedTextOptionalSchema.nullable().optional(),
  skills: z.array(z.string().min(1)).optional(),
});

export const experienceCreateSchema = z.object({
  company: z.string().min(1),
  position: localizedTitleSchema,
  dateFrom: z.coerce.date(),
  dateTo: z.coerce.date().nullable().optional(),
  description: localizedTextOptionalSchema,
  order: z.number().int().optional(),
  logoId: z.string().nullable().optional(),
  url: z
    .string()
    .url()
    .refine((value) => /^https?:\/\//i.test(value), "URL must start with http:// or https://")
    .nullable()
    .optional(),
  logoZoom: z.number().min(0.1).max(8).optional(),
  logoX: z.number().min(-4).max(4).optional(),
  logoY: z.number().min(-4).max(4).optional(),
});

export const experienceUpdateSchema = experienceCreateSchema.partial();

export const projectCreateSchema = z.object({
  slug: slugSchema,
  title: localizedTitleSchema,
  description: localizedTextOptionalSchema,
  tag: localizedTextOptionalSchema.nullable().optional(),
  coverId: z.string().nullable().optional(),
  techStack: z.array(z.string().min(1)).default([]),
  status: projectStatusSchema.default("draft"),
  order: z.number().int().default(0),
});

export const projectUpdateSchema = projectCreateSchema.partial();

export const caseCreateSchema = z.object({
  title: localizedTitleSchema,
  description: localizedTextOptionalSchema,
  order: z.number().int().optional(),
});

export const caseUpdateSchema = caseCreateSchema.partial();

export const caseMediaSetSchema = z.object({
  mediaIds: z.array(z.string().min(1)),
});

export const caseMediaAddSchema = z.object({
  mediaId: z.string().min(1),
});

export const caseMediaFramingSchema = z.object({
  zoom: z.number().min(0.1).max(8),
  offsetX: z.number().min(-4).max(4),
  offsetY: z.number().min(-4).max(4),
});

export const contactRequestSchema = z.object({
  name: z.string().trim().min(1, "Укажите имя").max(100),
  contact: z.string().trim().min(3, "Укажите Telegram или почту").max(200),
  message: z.string().trim().min(5, "Напишите пару слов о задаче").max(4000),
  // The form cannot be sent without ticking the consent box.
  consent: z.literal(true, "Consent to personal data processing is required"),
  // Honeypot: hidden from people, filled in by bots.
  website: z.string().max(500).optional(),
});

export const contactRequestUpdateSchema = z.object({ read: z.boolean() });
