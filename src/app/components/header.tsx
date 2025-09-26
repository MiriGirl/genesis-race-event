"use client";
import React from "react";
import { nationalities } from "@/data/nationalities";

interface HeaderProps {
  fno: string;
  name: string;
  country?: string;
  raceTime?: string | React.ReactNode;
  flag?: string;
}

export default function Header({
  fno,
  name,
  country,
  raceTime,
  flag,
}: HeaderProps) {
  const flagEmoji = flag
    ? flag
    : country
    ? nationalities[
        Object.keys(nationalities).find(
          (key) => key.toLowerCase() === country.toLowerCase()
        ) || ""
      ] || "🏳️"
    : "🏳️";

  return (
    <header
      style={{
        width: "100%",
        background: "#000",
        padding: "10px 16px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        boxSizing: "border-box",
      }}
    >
      {/* Left: Flag + FNO + Name */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <span style={{ fontSize: "40px", lineHeight: 1 }}>{flagEmoji}</span>
        <div style={{ display: "flex", flexDirection: "column", lineHeight: 1 }}>
          <span
            className="font-dragracing"
            style={{
              fontSize: "28px",
              fontWeight: 600,
              color: "#fff",
              letterSpacing: "0.05em",
              marginBottom: 4,
            }}
          >
            {fno}
          </span>
          <span
          className="font-dragracing"
            style={{
              
              fontSize: "15px",
              fontWeight: 500,
              color: "#fff",
               textTransform: "uppercase",
               letterSpacing: "0.1em",
            }}
          >
            {name}
          </span>
        </div>
      </div>

      <div style={{ flex: 1 }} />

      {/* Right: Race Time */}
      <GlowRaceTime raceTime={raceTime} />
    </header>
  );
}
// Glowing Race Time component with pulse animation on update
import { useEffect, useRef, useState } from "react";

function GlowRaceTime({ raceTime }: { raceTime?: string | React.ReactNode }) {
  const [glow, setGlow] = useState(false);
  const prevRaceTime = useRef<string | React.ReactNode | undefined>(raceTime);

  useEffect(() => {
    if (
      prevRaceTime.current !== undefined &&
      raceTime !== prevRaceTime.current
    ) {
      setGlow(true);
      const timeout = setTimeout(() => setGlow(false), 600);
      prevRaceTime.current = raceTime;
      return () => clearTimeout(timeout);
    }
    prevRaceTime.current = raceTime;
  }, [raceTime]);

  return (
    <div style={{ textAlign: "center", lineHeight: 1.2 }}>
      <div
        style={{
          fontSize: "14px",
          color: "#ccc",
          letterSpacing: "1px",
        }}
      >
        RACE TIME
      </div>
      <span
        style={{
          display: "block",
          fontSize: "30px",
          fontWeight: 600,
          color: "#fff",
          transition: "text-shadow 0.3s cubic-bezier(0.4,0,0.2,1)",
          textShadow: glow
            ? "0 0 16px #fff, 0 0 32px #f0f, 0 0 48px #0ff"
            : "0 0 2px #fff",
          willChange: "text-shadow",
          marginTop: 2,
        }}
      >
        {raceTime}
      </span>
    </div>
  );
}