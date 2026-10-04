import type { Locale } from "../config";
import { en } from "./en";
import { ru, type Dictionary } from "./ru";

export type { Dictionary };

export const dictionaries: Record<Locale, Dictionary> = { ru, en };
