"use client";
import React from "react";

interface HeaderProps {
  fno: string;
  name: string;
  flag?: string;
  raceTime?: string;
}

export default function Header({
  fno = "F20293",
  name = "MICHELLE NGIAM",
  flag = "/flags/sg.png",
  raceTime = "0:00:00",
}: HeaderProps) {
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
        <img
          src={flag}
          alt="flag"
          style={{ width: "28px", height: "20px", objectFit: "cover" }}
        />
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
            style={{
              fontSize: "14px",
              fontWeight: 500,
              color: "#ccc",
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