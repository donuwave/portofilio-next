"use client";

import { useEffect, useState, type FormEvent } from "react";
import { fetchProfileAdmin, updateProfileAdmin } from "@/entities/profile/api/profile-api";
import type { ProfileAdmin } from "@/entities/profile/model/admin-types";
import { ApiClientError } from "@/shared/api/http";
import type { LocalizedText } from "@/shared/lib/localized-text";
import { Button } from "@/shared/ui/button";
import { Field } from "@/shared/ui/field";
import { Input } from "@/shared/ui/input";
import { LocalizedTextField } from "@/shared/ui/localized-text-field";
import { MediaPickerField } from "@/widgets/media-picker-field/ui/media-picker-field";

const EMPTY_LOCALIZED: LocalizedText = { ru: "", en: "" };

function isEmptyLocalized(value: LocalizedText) {
  return !value.ru.trim() && !value.en.trim();
}

function toDateInputValue(iso: string | null) {
  return iso ? iso.slice(0, 10) : "";
}

function SkillsEditor({ skills, onChange }: { skills: string[]; onChange: (skills: string[]) => void }) {
  const [draft, setDraft] = useState("");

  function addSkill() {
    const value = draft.trim();
    if (value && !skills.includes(value)) onChange([...skills, value]);
    setDraft("");
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {skills.map((skill) => (
          <span
            key={skill}
            className="inline-flex items-center gap-1 rounded-full border border-zinc-300 px-3 py-1 text-xs dark:border-zinc-700"
          >
            {skill}
            <button
              type="button"
              onClick={() => onChange(skills.filter((s) => s !== skill))}
              aria-label={`Удалить ${skill}`}
              className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
            >
              ✕
            </button>
          </span>
        ))}
      </div>
      <div className="mt-2 flex gap-2">
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addSkill();
            }
          }}
          placeholder="Новый навык"
          className="max-w-xs"
        />
        <Button type="button" variant="secondary" onClick={addSkill}>
          Добавить
        </Button>
      </div>
    </div>
  );
}

export function AdminProfileForm() {
  const [profile, setProfile] = useState<ProfileAdmin | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  useEffect(() => {
    fetchProfileAdmin()
      .then(setProfile)
      .catch((err) => setError(err instanceof Error ? err.message : "Не удалось загрузить профиль"))
      .finally(() => setIsLoading(false));
  }, []);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!profile) return;

    setIsSaving(true);
    setError(null);
    setSavedAt(null);
    try {
      const updated = await updateProfileAdmin({
        name: profile.name,
        role: profile.role,
        about: profile.about,
        avatarId: profile.avatarId,
        skills: profile.skills,
        currentJobCompany: profile.currentJobCompany,
        currentJobPosition: profile.currentJobPosition,
        currentJobFrom: profile.currentJobFrom,
        currentJobDescription: profile.currentJobDescription,
      });
      setProfile(updated);
      setSavedAt(Date.now());
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Не удалось сохранить профиль");
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) return <p className="text-sm text-zinc-500">Загрузка...</p>;
  if (!profile) return <p className="text-sm text-red-600">{error ?? "Профиль не найден"}</p>;

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-8">
      <Field label="Имя">
        <Input value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} required />
      </Field>

      <Field label="Аватар">
        <MediaPickerField
          type="image"
          value={profile.avatar}
          onChange={(media) => setProfile({ ...profile, avatar: media, avatarId: media?.id ?? null })}
        />
      </Field>

      <LocalizedTextField
        label="Роль"
        value={profile.role}
        onChange={(role) => setProfile({ ...profile, role })}
      />

      <LocalizedTextField
        label="Обо мне"
        value={profile.about}
        onChange={(about) => setProfile({ ...profile, about })}
        multiline
      />

      <Field label="Навыки">
        <SkillsEditor skills={profile.skills} onChange={(skills) => setProfile({ ...profile, skills })} />
      </Field>

      <div className="space-y-4 border-t border-zinc-200 pt-6 dark:border-zinc-800">
        <p className="text-xs font-medium tracking-wide text-zinc-500">ТЕКУЩЕЕ МЕСТО РАБОТЫ</p>

        <Field label="Компания">
          <Input
            value={profile.currentJobCompany ?? ""}
            onChange={(e) => setProfile({ ...profile, currentJobCompany: e.target.value || null })}
          />
        </Field>

        <LocalizedTextField
          label="Должность"
          value={profile.currentJobPosition ?? EMPTY_LOCALIZED}
          onChange={(value) => setProfile({ ...profile, currentJobPosition: isEmptyLocalized(value) ? null : value })}
        />

        <Field label="Дата начала">
          <Input
            type="date"
            value={toDateInputValue(profile.currentJobFrom)}
            onChange={(e) => setProfile({ ...profile, currentJobFrom: e.target.value || null })}
          />
        </Field>

        <LocalizedTextField
          label="Описание работы"
          value={profile.currentJobDescription ?? EMPTY_LOCALIZED}
          onChange={(value) =>
            setProfile({ ...profile, currentJobDescription: isEmptyLocalized(value) ? null : value })
          }
          multiline
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {savedAt && <p className="text-sm text-green-600">Сохранено.</p>}

      <Button type="submit" disabled={isSaving}>
        {isSaving ? "Сохранение..." : "Сохранить"}
      </Button>
    </form>
  );
}
