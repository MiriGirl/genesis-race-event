"use client";
import { useEffect, useState } from "react";

export default function RacePageDummy({ fno, now }: { fno: string; now?: Date }) {
  const [current, setCurrent] = useState(now || new Date());

  useEffect(() => {
    if (!now) {
      const timer = setInterval(() => setCurrent(new Date()), 1000);
      return () => clearInterval(timer);
    }
  }, [now]);

  // Use `current` everywhere instead of `new Date()`
  // ... rest of your RacePageClient logic
}