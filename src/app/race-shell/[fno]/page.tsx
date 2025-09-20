"use client";
import React, { useState, useEffect } from "react";
import Header from "../../components/header";
import RaceMap from "../../components/racemap";
import FooterEnter from "../../components/footerenter";
import FooterStopwatch from "../../components/footerstopwatch";
import { useParams } from "next/navigation";
import { nationalities } from "../../../data/nationalities";

function FooterShell({ raceNo, bib, status }: { raceNo: string; bib: number; status: { type: string; currentSector?: number; participantId?: string; stationId?: string; accessCode?: string; startTime?: string } | null }) {
  const [localStatus, setLocalStatus] = useState(status);
  const [raceStatus, setRaceStatus] = useState(status);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    setLocalStatus(status);
  }, [status]);

  if (isSyncing) {
    return (
      <div
        style={{
          width: "100%",
          background: "#111",
          borderTop: "1px solid #333",
          padding: "20px 0",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div className="loader"></div>
      </div>
    );
  }

  if (localStatus?.type === "enter") {
    return (
      <FooterEnter
        currentSector={localStatus.currentSector ?? 1}
        raceNo={raceNo}
        participantId={localStatus?.participantId ?? ""}
        stationId={localStatus?.stationId ?? ""}
        bib={bib.toString()}
        accessCode={localStatus?.accessCode ?? ""}
        onStart={() => console.log("Race started")}
        onCodeSubmit={() => {
          setIsSyncing(true);
          setTimeout(async () => {
            const res = await fetch(`/api/race-status?raceNo=${raceNo}&bib=${bib}`);
            if (res.ok) {
              const data = await res.json();
              setLocalStatus(data);
              setRaceStatus(data);
            }
            setIsSyncing(false);
          }, 500);
        }}
      />
    );
  } else if (localStatus?.type === "stopwatch") {
    return (
      <div
        style={{
          width: "100%",
          background: "#111",
          borderTop: "1px solid #333",
          paddingTop: 15,
          // flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <FooterStopwatch
          currentSector={localStatus.currentSector ?? 0}
          raceNo={raceNo}
          participantId={localStatus?.participantId ?? ""}
          stationId={localStatus?.stationId ?? ""}
          bib={bib.toString()}
          accessCode={localStatus?.accessCode ?? ""}
          startTime={localStatus?.startTime ?? ""}
          onFinish={(splitMs) => {
            console.log("Sector finished with split:", splitMs);
            setIsSyncing(true);
            setTimeout(async () => {
              const res = await fetch(`/api/race-status?raceNo=${raceNo}&bib=${bib}`);
              if (res.ok) {
                const data = await res.json();
                setLocalStatus(data);
                setRaceStatus(data);
              }
              setIsSyncing(false);
            }, 500);
          }}
        />
      </div>
    );
  } else {
    return null;
  }
}

export default function RaceShell() {
  const params = useParams();
  const fno = params?.fno as string | undefined;
  const [activeTab, setActiveTab] = useState<"map" | "leaderboard">("map");
  const [hydrated, setHydrated] = useState(false);
  const [playerInfo, setPlayerInfo] = useState<{ fno: string; name: string; flag: string; country?: string; raceTime: string } | null>(null);
  const [raceStatus, setRaceStatus] = useState<{ type: string; currentSector?: number; participantId?: string; stationId?: string; accessCode?: string; startTime?: string } | null>(null);

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    async function fetchPlayerInfo() {
      const targetFno = fno?.toUpperCase();
      const res = await fetch(`/api/player-info?fno=${targetFno}`);
      const data = await res.json();
      const countryName = (data.country ?? "") as string;
      const flag = nationalities[countryName] || "🏳️";
      setPlayerInfo({ ...data, flag });
    }
    fetchPlayerInfo();
  }, [fno]);

  useEffect(() => {
    async function fetchRaceStatus() {
      try {
        const raceNo = fno?.toUpperCase() ?? "";
        const bib = parseInt(raceNo.replace("F", ""), 10);
        const res = await fetch(`/api/race-status?raceNo=${raceNo}&bib=${bib}`);
        if (!res.ok) throw new Error("API error");
        const data = await res.json();
        setRaceStatus(data);
      } catch (e) {
        setRaceStatus({ type: "enter", currentSector: 1 });
      }
    }
    if (fno) {
      fetchRaceStatus();
    }
  }, [fno]);

  if (!hydrated) return null; // ✅ Prevent hydration mismatch

  const raceNo = fno?.toUpperCase() ?? "";

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
          fno={playerInfo?.fno ?? fno ?? ""}
          name={playerInfo?.name || "Loading..."}
          country={playerInfo?.country || ""}
          flag={playerInfo?.flag}
          raceTime={playerInfo?.raceTime || "0:00:00"}
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
                  width: "100%",
                  display: "flex",
                  justifyContent: "center",
                  marginTop: "5%",
                  
                }}
              >
                <div
                  style={{
                    width: "100%",
                    maxWidth: "500px",
                    minWidth: "320px",
                  }}
                >
                  <RaceMap currentSector={5} />
                </div>
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
        <FooterShell raceNo={raceNo} bib={parseInt(raceNo.replace("F", ""), 10)} status={raceStatus} />
      </div>
    </div>
  );
}