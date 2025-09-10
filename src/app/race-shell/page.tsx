"use client";
import React, { useState } from "react";
import EnterCode from "../components/entercode"; // ✅ make sure path is correct
import Stopwatch from "../components/stopwatch";
import Header from "../components/header";
import RaceMap from "../components/racemap";


<Header fno="F20293" name="MICHELLE NGIAM" raceTime="0:00:00" />

export default function RaceShell() {
  const [activeTab, setActiveTab] = useState<"map" | "leaderboard">("map");
  const [showEnterCode, setShowEnterCode] = useState(false);
  const [activeMode, setActiveMode] = useState<"enter" | "stopwatch">("enter");

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
<footer
  style={{
    position: "fixed",
    bottom: 0,
    left: "50%",
    transform: "translateX(-50%)",
    width: "100%",
    maxWidth: "430px",
  }}
>
  {activeMode === "enter" && !showEnterCode && (
    // 🔹 Enter Mode Footer
    <div
      style={{
        background: "#fff",
        borderTopLeftRadius: "44px",
        borderTopRightRadius: "44px",
        textAlign: "center",
        paddingBottom: "20px",
      }}
    >
      <p
        style={{
          fontWeight: 700,
          fontSize: "20px",
          paddingTop: "20px",
          marginBottom: "8px",
          color: "#000",
        }}
      >
        ENTER ANY SECTOR CODE
      </p>
      {/* circles */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "10px",
          marginBottom: "20px",
        }}
      >
        {[0, 0, 0, 0].map((digit, idx) => (
          <div
            key={idx}
            style={{
              width: "60px",
              height: "60px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "50%",
              border: "2px solid #ccc",
              background: "#EAEAEA",
              fontSize: "28px",
              fontWeight: 700,
              color: "#777",
            }}
          >
            {digit}
          </div>
        ))}
      </div>
      <button
        className="font-dragracing"
        onClick={() => setShowEnterCode(true)}
        style={{
          width: "100%",
          maxWidth: "300px",
          height: "52px",
          background: "#000",
          color: "#fff",
          fontWeight: 600,
          fontSize: "26px",
          borderRadius: "48px",
          textTransform: "uppercase",
          letterSpacing: "0.05em",
        }}
      >
        START
      </button>
    </div>
  )}

  {activeMode === "stopwatch" && (
    // 🔹 Stopwatch Mode Footer (NO white background!)
    <div
      style={{
        background: "#000",
        textAlign: "center",
        padding: "32px 16px",
      }}
    >
      <p style={{ color: "#fff", fontSize: "14px", marginBottom: "8px" }}>
        YOU ARE AT
      </p>
      <h2
        style={{
          color: "#fff",
          fontSize: "28px",
          fontWeight: 700,
          marginBottom: "20px",
        }}
      >
        SECTOR 3
      </h2>

      <Stopwatch
        onFinish={(time) => {
          console.log("Stopwatch finished:", time);
          setActiveMode("enter");
        }}
      />

      <button
        className="font-dragracing"
        onClick={() => setActiveMode("enter")}
        style={{
          marginTop: "24px",
          background: "#A700D1",
          border: "none",
          borderRadius: "50px",
          padding: "14px 32px",
          color: "#fff",
          fontSize: "20px",
          fontWeight: 700,
          textTransform: "uppercase",
          boxShadow: "0 0 20px rgba(167,0,209,0.7)",
        }}
      >
        FINISH
      </button>
    </div>
  )}
</footer>
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