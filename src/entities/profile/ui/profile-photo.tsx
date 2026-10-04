"use client";

import { useDictionary } from "@/shared/i18n/locale-provider";
import type { ProfileAvatar } from "../model/types";

export function ProfilePhoto({ avatar, name }: { avatar: ProfileAvatar; name: string }) {
  const dict = useDictionary();

  if (!avatar) {
    return (
      <div className="flex aspect-[3/4] w-full items-center justify-center rounded-2xl border border-dashed border-[#3a372f] text-sm text-[#5c584f]">
        {dict.profile.photoSoon}
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={avatar.path} alt={name} className="w-full object-contain" />
  );
}
