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
  position: localizedTextSchema,
  dateFrom: z.coerce.date(),
  dateTo: z.coerce.date().nullable().optional(),
  description: localizedTextSchema,
  order: z.number().int().optional(),
  logoId: z.string().nullable().optional(),
});

export const experienceUpdateSchema = experienceCreateSchema.partial();

export const projectCreateSchema = z.object({
  slug: slugSchema,
  title: localizedTextSchema,
  description: localizedTextSchema,
  tag: localizedTextSchema.nullable().optional(),
  coverId: z.string().nullable().optional(),
  techStack: z.array(z.string().min(1)).default([]),
  status: projectStatusSchema.default("draft"),
  order: z.number().int().default(0),
});

export const projectUpdateSchema = projectCreateSchema.partial();

export const caseCreateSchema = z.object({
  title: localizedTextSchema,
  description: localizedTextSchema,
  order: z.number().int().optional(),
});

export const caseUpdateSchema = caseCreateSchema.partial();

export const caseMediaSetSchema = z.object({
  mediaIds: z.array(z.string().min(1)),
});

export const caseMediaAddSchema = z.object({
  mediaId: z.string().min(1),
});

export const contactRequestSchema = z.object({
  name: z.string().trim().min(1, "Укажите имя").max(100),
  contact: z.string().trim().min(3, "Укажите Telegram или почту").max(200),
  message: z.string().trim().min(5, "Напишите пару слов о задаче").max(4000),
  // Honeypot: hidden from people, filled in by bots.
  website: z.string().max(500).optional(),
});

export const contactRequestUpdateSchema = z.object({ read: z.boolean() });
