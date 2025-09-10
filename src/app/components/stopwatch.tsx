"use client";
import React, { useEffect, useState } from "react";

export default function Stopwatch({ onFinish }: { onFinish: (time: number) => void }) {
  const [time, setTime] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setTime((t) => t + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      style={{
        background: "#fff",
        borderTopLeftRadius: "44px",
        borderTopRightRadius: "44px",
        textAlign: "center",
        padding: "20px",
      }}
    >
      <h3 style={{ fontSize: "22px", fontWeight: 700 }}>Stopwatch</h3>
      <p style={{ fontSize: "28px", fontWeight: 600 }}>{time}s</p>
      <button
        onClick={() => onFinish(time)}
        style={{
          marginTop: "12px",
          padding: "12px 24px",
          borderRadius: "30px",
          background: "purple",
          color: "#fff",
          fontWeight: 600,
          fontSize: "18px",
        }}
      >
        Finish
      </button>
    </div>
  );
}