"use client";
import React, { useState, useEffect } from "react";
import Header from "../components/header";
import RaceMap from "../components/racemap";
import FooterShell from "../components/footershell";

export default function RaceShell() {
  const [activeTab, setActiveTab] = useState<"map" | "leaderboard">("map");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  if (!hydrated) return null; // ✅ Prevent hydration mismatch

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        background: "#111",
        minHeight: "100vh",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "430px",
          minWidth: "320px",
          background: "#000",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* ✅ Header */}
        <Header
          fno="F20293"
          name="MICHELLE NGIAM"
          flag="/flags/sg.png"
          raceTime="0:00:00"
        />

        {/* ✅ Main Content */}
        <div
          style={{
            flex: 1,
            background: "#000",
            padding: "16px",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "column",
            overflowX: "hidden",
            overflowY: "auto",
          }}
        >
          {/* Toggle Buttons */}
          <div
            style={{
              display: "flex",
              border: "1px solid #fff",
              borderRadius: "50px",
              overflow: "hidden",
              marginBottom: "16px",
            }}
          >
            <button
              className="font-sans"
              onClick={() => setActiveTab("map")}
              style={{
                flex: 1,
                padding: "12px 0",
                background: activeTab === "map" ? "#fff" : "transparent",
                color: activeTab === "map" ? "#000" : "#fff",
                fontWeight: activeTab === "map" ? 600 : 400,
                fontSize: 16,
                border: "none",
                borderRadius: activeTab === "map" ? "50px" : "0",
                transition: "all 0.3s ease",
              }}
            >
              Race Map
            </button>
            <button
              className="font-sans"
              onClick={() => setActiveTab("leaderboard")}
              style={{
                flex: 1,
                padding: "12px 0",
                background: activeTab === "leaderboard" ? "#fff" : "transparent",
                color: activeTab === "leaderboard" ? "#000" : "#fff",
                fontWeight: activeTab === "leaderboard" ? 600 : 400,
                fontSize: 16,
                border: "none",
                borderRadius: activeTab === "leaderboard" ? "50px" : "0",
                transition: "all 0.3s ease",
              }}
            >
              Leaderboard
            </button>
          </div>

          {/* Tab Content */}
          <div style={{ flex: 1, position: "relative" }}>
            {/* ✅ Race Map */}
            {activeTab === "map" && (
              <div
                style={{
                  flex: 1,
                  minHeight: "25vh",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  overflow: "visible",
                  marginTop: -20,
                }}
              >
                <RaceMap currentSector={null} />
              </div>
            )}

            {/* ✅ Leaderboard Placeholder */}
            {activeTab === "leaderboard" && (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  color: "#fff",
                  textAlign: "center",
                }}
              >
                <p>Leaderboard Placeholder</p>
              </div>
            )}
          </div>
        </div>

        {/* ✅ Footer */}
        <FooterShell />
      </div>
    </div>
  );
}