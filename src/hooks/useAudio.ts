"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface UseAudioOptions {
  src: string;
  volume?: number;
  loop?: boolean;
  fadeDuration?: number;
}

/**
 * Portado de la referencia (P2/P4, hook literal compartido — el patrón más
 * probado de los 4 proyectos). Web Audio nativa, sin Howler. Autoplay
 * inteligente con fallback a la primera interacción del usuario.
 */
export function useAudio({
  src,
  volume = 0.3,
  loop = true,
  fadeDuration = 500,
}: UseAudioOptions) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fadeRef = useRef<number | null>(null);
  const hasAttemptedAutoplay = useRef(false);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const audio = new Audio(src);
    audio.loop = loop;
    audio.volume = 0;
    audioRef.current = audio;
    return () => {
      audio.pause();
      audio.src = "";
      audioRef.current = null;
    };
  }, [src, loop]);

  const fadeIn = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.play().catch(() => {});
    const start = Date.now();
    const startVol = audio.volume;
    if (fadeRef.current) cancelAnimationFrame(fadeRef.current);
    function step() {
      const progress = Math.min((Date.now() - start) / fadeDuration, 1);
      audio!.volume = startVol + (volume - startVol) * progress;
      if (progress < 1) fadeRef.current = requestAnimationFrame(step);
    }
    fadeRef.current = requestAnimationFrame(step);
    setIsPlaying(true);
  }, [volume, fadeDuration]);

  const fadeOut = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const start = Date.now();
    const startVol = audio.volume;
    if (fadeRef.current) cancelAnimationFrame(fadeRef.current);
    function step() {
      const progress = Math.min((Date.now() - start) / fadeDuration, 1);
      audio!.volume = startVol * (1 - progress);
      if (progress < 1) fadeRef.current = requestAnimationFrame(step);
      else audio!.pause();
    }
    fadeRef.current = requestAnimationFrame(step);
    setIsPlaying(false);
  }, [fadeDuration]);

  const toggle = useCallback(
    () => (isPlaying ? fadeOut() : fadeIn()),
    [isPlaying, fadeIn, fadeOut],
  );

  useEffect(() => {
    if (hasAttemptedAutoplay.current) return;
    let handled = false;
    const onInteract = () => {
      if (handled) return;
      handled = true;
      if (audioRef.current?.paused) fadeIn();
      cleanup();
    };
    const cleanup = () => {
      window.removeEventListener("click", onInteract);
      window.removeEventListener("touchstart", onInteract);
      window.removeEventListener("scroll", onInteract);
    };
    const timeoutId = setTimeout(() => {
      hasAttemptedAutoplay.current = true;
      const audio = audioRef.current;
      if (!audio) return;
      audio
        .play()
        .then(fadeIn)
        .catch(() => {
          window.addEventListener("click", onInteract);
          window.addEventListener("touchstart", onInteract, { passive: true });
          window.addEventListener("scroll", onInteract, { passive: true });
        });
    }, 50);
    return () => {
      clearTimeout(timeoutId);
      cleanup();
    };
  }, [fadeIn]);

  useEffect(() => {
    const onVisibility = () => {
      if (!audioRef.current) return;
      if (document.hidden && isPlaying) audioRef.current.pause();
      else if (!document.hidden && isPlaying)
        audioRef.current.play().catch(() => {});
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [isPlaying]);

  return { isPlaying, toggle };
}
