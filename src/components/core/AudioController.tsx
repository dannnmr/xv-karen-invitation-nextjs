"use client";

import { useAudio } from "@/hooks/useAudio";
import type { InvitationConfig } from "@/config/invitation";

export function AudioController({
  src,
  colors,
}: {
  src: string;
  colors: InvitationConfig["theme"]["colors"];
}) {
  const { isPlaying, toggle } = useAudio({ src, volume: 0.25 });
  if (!src) return null;

  return (
    <button
      onClick={toggle}
      aria-label={isPlaying ? "Silenciar música" : "Reproducir música"}
      className="fixed bottom-8 right-8 z-[60] w-14 h-14 rounded-full flex items-center justify-center shadow-lg border transition-all"
      style={{
        borderColor: colors.accent,
        backgroundColor: "rgba(255,255,255,0.95)",
        color: colors.accent,
      }}
    >
      {isPlaying ? (
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
        >
          <rect x="6" y="4" width="4" height="16" rx="1" />
          <rect x="14" y="4" width="4" height="16" rx="1" />
        </svg>
      ) : (
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M8 5.14v13.72a1 1 0 0 0 1.5.86l10-6.86a1 1 0 0 0 0-1.72l-10-6.86A1 1 0 0 0 8 5.14Z" />
        </svg>
      )}
    </button>
  );
}
