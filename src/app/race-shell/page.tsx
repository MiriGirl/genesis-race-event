"use client";
import React, { useState, useEffect } from "react";
import EnterCode from "../components/entercode"; // ✅ make sure path is correct
import Stopwatch from "../components/stopwatch";
import Header from "../components/header";
import RaceMap from "../components/racemap";
import FooterEnter from "../components/footerenter";
import FooterStopwatch from "../components/footerstopwatch";
import FooterShell from "../components/footershell";


<Header fno="F20293" name="MICHELLE NGIAM" raceTime="0:00:00" />

export default function RaceShell() {
  const [activeTab, setActiveTab] = useState<"map" | "leaderboard">("map");
  const [showEnterCode, setShowEnterCode] = useState(false);
  const [activeMode, setActiveMode] = useState<"enter" | "stopwatch">("enter");
     const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  if (!hydrated) return null; // or return a loading screen

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        background: "#111",
        minHeight: "100vh",
      }}
    >
      {/* Constrained container */}
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
        <Header
        fno="F20293"
        name="MICHELLE NGIAM"
        flag="/flags/sg.png"
        raceTime="0:00:00"
      />

        {/* Main content */}
                {/* Main content */}
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
          {/* Toggle buttons */}
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
            {/* Map Tab */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                opacity: activeTab === "map" ? 1 : 0,
                transition: "opacity 0.4s ease",
                pointerEvents: activeTab === "map" ? "auto" : "none",
              }}
            >
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                {/* ✅ Replace image with RaceMap component */}
                <RaceMap />
              </div>
              <div
                style={{
                  position: "relative",
                  textAlign: "center",
                  marginTop: "16px",
                }}
              >
                
              </div>
            </div>

            {/* Leaderboard Tab */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                opacity: activeTab === "leaderboard" ? 1 : 0,
                transition: "opacity 0.4s ease",
                pointerEvents: activeTab === "leaderboard" ? "auto" : "none",
                color: "#fff",
                textAlign: "center",
              }}
            >
              <p>Leaderboard Placeholder</p>
            </div>
          </div>
        </div>

       {/* Footer */}

<FooterShell />
      </div>

      {/* ✅ EnterCode modal */}
      <EnterCode
        isOpen={showEnterCode}
        onClose={() => setShowEnterCode(false)}
        onSubmit={(code) => {
          console.log("Code entered:", code);

          if (code === "1111") {
            setActiveMode("stopwatch"); // 🔥 switch footer
          }

          setShowEnterCode(false);
        }}
      />
    </div>
  );
}