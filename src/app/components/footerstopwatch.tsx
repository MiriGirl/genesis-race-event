"use client";
import React, { useState, useEffect } from "react";

interface FooterStopwatchProps {
  currentSector: number; // ✅ which sector we’re at
  onFinish: (splitMs: number) => void;  // ✅ callback to trigger finish with split time in ms
}

export default function FooterStopwatch({ currentSector, onFinish }: FooterStopwatchProps) {
  const [time, setTime] = useState(0);
  const [running, setRunning] = useState(true);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (running) {
      interval = setInterval(() => setTime((t) => t + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [running]);

  const formatTime = (secs: number) => {
    const m = String(Math.floor(secs / 60)).padStart(2, "0");
    const s = String(secs % 60).padStart(2, "0");
    return `${m}:${s}`;
  };

  // Circle math
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const seconds = time % 60;
  const progress = (seconds / 60) * circumference;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        height: "80%",
        color: "#fff",
        textAlign: "center",
        position: "relative",
      }}
    >
      {/* Sector Info */}
      <div>
        <div
          style={{
            fontSize: "14px",
            fontWeight: 400,
            letterSpacing: "2px",
            textTransform: "uppercase",
          }}
        >
          YOU ARE AT
        </div>
        <div
          style={{
            fontSize: "30px",
            fontWeight: 600,
            letterSpacing: "1px",
            textTransform: "uppercase",
            fontFamily: "Poppins, sans-serif",
            marginTop: "-10px",
          }}
        >
          SECTOR {currentSector}
        </div>
      </div>

      {/* Stopwatch */}
      <div style={{ position: "relative", marginTop: "-15px", marginBottom: "-15px" }}>
        {/* Blur Background */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            width: "200px",
            height: "110px",
            background: "radial-gradient(circle, rgba(167, 0, 209, 0.59))",
            borderRadius: "50%",
            transform: "translate(-50%, -35%)",
            filter: "blur(50px)",
            zIndex: 0,
          }}
        />

        <svg width="180" height="180" style={{ transform: "rotate(-90deg)" }}>
          <circle
            cx="90"
            cy="90"
            r={radius}
            stroke="#282828"
            strokeWidth="12"
            fill="none"
          />
          <circle
            cx="90"
            cy="90"
            r={radius}
            stroke="url(#gradientStroke)"
            strokeWidth="12"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={circumference - progress}
            strokeLinecap="round"
            style={{ transition: "stroke-dashoffset 1s linear" }}
          />
          <defs>
            <linearGradient id="gradientStroke" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#6833f8ff" />
              <stop offset="100%" stopColor="#D73AFF" />
            </linearGradient>
          </defs>
        </svg>

        {/* Time Text */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            fontSize: "28px",
            fontWeight: 700,
          }}
        >
          {formatTime(time)}
        </div>
      </div>

      {/* Finish Button */}
      <button
        onClick={() => {
          setRunning(false);
          onFinish(time * 1000);
        }}
        className="font-dragracing"
        style={{
          background: "#a020f0",
          padding: "14px 40px",
          borderRadius: "50px",
          color: "#fff",
          fontWeight: "bold",
          border: "none",
          cursor: "pointer",
          fontSize: "18px",
          letterSpacing: "1px",
          marginBottom: 20,
        }}
      >
        FINISH
      </button>
    </div>
  );
}