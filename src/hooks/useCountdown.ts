"use client";

import { useEffect, useState } from "react";

export function useCountdown(targetDate: Date) {
  const [countdown, setCountdown] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    // Primer cálculo inmediato: solo con `setInterval` la sección mostraba
    // "00 00 00 00" durante el primer segundo.
    const tick = () => {
      const distance = targetDate.getTime() - Date.now();
      if (distance < 0) {
        clearInterval(interval);
        return;
      }
      setCountdown({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor(
          (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
        ),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000),
      });
    };
    const interval = setInterval(tick, 1000);
    tick();

    return () => clearInterval(interval);
  }, [targetDate]);

  return countdown;
}
