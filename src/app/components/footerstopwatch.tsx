"use client";
import React, { useState, useEffect, useRef } from "react";

interface FooterStopwatchProps {
  currentSector: number | null; // ✅ which sector we’re at
  onFinish: (splitMs: number) => void;  // ✅ callback to trigger finish with split time in ms
  onStop?: () => void;
  raceNo: string;
  participantId: string;
  stationId: string;
  accessCode: string;
  startTime: string;
  bib: string;
}

export default function FooterStopwatch({ currentSector, onFinish, onStop, raceNo, participantId, stationId, accessCode, startTime, bib }: FooterStopwatchProps) {
  const [time, setTime] = useState(0);
  const [running, setRunning] = useState(true);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  // Log when component renders
  console.log("FooterStopwatch rendered with currentSector:", currentSector, "time:", time);

  useEffect(() => {
    if (!startTime) {
      console.warn("⏱ No startTime provided to FooterStopwatch");
      return;
    }
    const startTimestamp = new Date(startTime).getTime();
    if (isNaN(startTimestamp)) {
      console.warn("⏱ Invalid startTime:", startTime);
      return;
    }
    if (running) {
      timerRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTimestamp) / 1000);
        setTime(elapsed >= 0 ? elapsed : 0);
      }, 1000);
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [running, startTime]);

  useEffect(() => {
    console.log("🔍 FooterStopwatch props:", {
      currentSector,
      raceNo,
      participantId,
      stationId,
      accessCode,
      startTime,
      bib,
    });
  }, [currentSector, raceNo, participantId, stationId, accessCode, startTime, bib]);

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

  const refreshRaceStatus = async () => {
    try {
      const res = await fetch(`/api/race-status?raceNo=${raceNo}&bib=${bib}`);
      if (res.ok) {
        const data = await res.json();
        console.log("🔄 Refreshed race status after finish:", data);
      }
    } catch (err) {
      console.error("Error refreshing race status after finish:", err);
    }
  };

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
        onClick={async () => {
          const confirmFinish = window.confirm(
            "Are you sure you want to finish and send your split time? This will stop the timer."
          );
          if (!confirmFinish) return;
          if (timerRef.current) {
            clearInterval(timerRef.current);
          }
          const splitMs = time * 1000;
          console.log("➡️ Sending save-split payload:", {
            raceNo,
            participantId,
          
            stationId,
            accessCode,
            split_ms: splitMs,
            completedAt: new Date().toISOString(),
          });
          try {
            const response = await fetch("/api/save-split", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                raceNo: raceNo,
                participantId: participantId,
                stationId: stationId,
                accessCode: accessCode,
                split_ms: splitMs,
                completedAt: new Date().toISOString(),
              }),
            });
            if (!response.ok) {
              throw new Error(`Failed to save split: ${response.status}`);
            }
            const result = await response.json();
            console.log("Split saved:", result);
            setTimeout(async () => {
              await refreshRaceStatus(); // check API for updated state
              setRunning(false);
              onFinish(splitMs); // let FooterShell decide next view
            }, 2000);
          } catch (error) {
            console.error("Error saving split:", error);
          }
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