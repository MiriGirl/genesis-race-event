"use client";
import React from "react";
import { nationalities } from "@/data/nationalities";

interface HeaderProps {
  fno: string;
  name: string;
  country?: string;
  raceTime?: string;
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
      <div style={{ textAlign: "center", lineHeight: 1.2 }}>
        <span
          style={{
            fontSize: "14px",
            color: "#ccc",
            letterSpacing: "1px",
          }}
        >
          RACE TIME
        </span>
        <br />
        <span
          style={{
            fontSize: "30px",
            fontWeight: 600,
            color: "#fff",
          }}
        >
          {raceTime}
        </span>
      </div>
    </header>
  );
}