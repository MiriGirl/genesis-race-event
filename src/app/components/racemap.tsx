"use client";
import React from "react";

export default function RaceMap() {
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
      <img
        src="/bg/racemap.svg"
        alt="Race Map"
        style={{ width: "100%", maxWidth: "350px", height: "auto" }}
      />

      <div style={{ position: "relative", textAlign: "center", marginTop: "16px", width: "100%" }}>
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundColor: "#A700D1",
            opacity: 0.79,
            filter: "blur(15px)",
            zIndex: 0,
          }}
        />
        <div
          style={{
            position: "relative",
            zIndex: 2,
            color: "#fff",
            padding: "14px 0",
            fontWeight: 600,
            fontSize: "14px",
            letterSpacing: "0.05em",
          }}
        >
          SELECT A SECTOR TO LEARN MORE
        </div>
      </div>
    </div>
  );
}