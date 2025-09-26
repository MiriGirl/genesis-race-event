"use client";
import React, { useState, useEffect } from "react";
import Header from "../../components/header";
import RaceMap from "../../components/racemap";
import FooterEnter from "../../components/footerenter";
import FooterStopwatch from "../../components/footerstopwatch";
import FooterExit from "../../components/footerexit";
import Leaderboard from "../../components/leaderboard";
import { useParams } from "next/navigation";
import { nationalities } from "../../../data/nationalities";
import { createClient } from "@supabase/supabase-js";
import SectorInfo from "../../components/sectorinfo";
import { AnimatePresence } from "framer-motion";
import CompletionGift from "../../components/completiongift";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

function FooterShell({ raceNo, bib, status, setPageSyncing, onStatusUpdate, onFinishCallback }: { raceNo: string; bib: number; status: { type: string; currentSector?: number; participantId?: string; stationId?: string; accessCode?: string; startTime?: string } | null; setPageSyncing: (v: boolean) => void; onStatusUpdate: (s: { type: string; currentSector?: number; participantId?: string; stationId?: string; accessCode?: string; startTime?: string } | null) => void; onFinishCallback: () => void; }) {
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
          setPageSyncing(true);
          setIsSyncing(true);
          setTimeout(async () => {
            const res = await fetch(`/api/race-status?raceNo=${raceNo}&bib=${bib}`);
            if (res.ok) {
              const data = await res.json();
              setLocalStatus(data);
              setRaceStatus(data);
              onStatusUpdate(data);
              await onFinishCallback();
            }
            setPageSyncing(false);
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
            setPageSyncing(true);
            setIsSyncing(true);
            setTimeout(async () => {
              const res = await fetch(`/api/race-status?raceNo=${raceNo}&bib=${bib}`);
              if (res.ok) {
                const data = await res.json();
                setLocalStatus(data);
                setRaceStatus(data);
                onStatusUpdate(data);
                await onFinishCallback();
              }
              setPageSyncing(false);
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
  const [loading, setLoading] = useState(true);
  // Add raceType and bag_given to playerInfo state
  const [playerInfo, setPlayerInfo] = useState<{ fno: string; name: string; flag: string; country?: string; raceTime: string; raceType?: string; bag_given?: boolean } | null>(null);
  const [raceStatus, setRaceStatus] = useState<{ type: string; currentSector?: number; participantId?: string; stationId?: string; accessCode?: string; startTime?: string } | null>(null);
  const [isPageSyncing, setIsPageSyncing] = useState(false);

  // New state for total race time in milliseconds
  const [totalTime, setTotalTime] = useState<number | null>(null);


  // New state for glow animation
  const [glow, setGlow] = useState(false);

  // New state for selected sector
  const [selectedSector, setSelectedSector] = useState<number | null>(null);

  // State for CompletionGift popup
  const [showGift, setShowGift] = useState(false);
  const [giftShownOnce, setGiftShownOnce] = useState(false);
  // Effect to auto-open CompletionGift when race is finished and not shown yet
  useEffect(() => {
    if (activeTab === "map" && raceStatus?.type === "finished" && !giftShownOnce) {
      setShowGift(true);
      setGiftShownOnce(true);
    }
  }, [activeTab, raceStatus?.type, giftShownOnce]);

  // Close CompletionGift if bag_given becomes true while popup is open
  useEffect(() => {
    if (playerInfo?.bag_given && showGift) {
      setShowGift(false);
    }
  }, [playerInfo?.bag_given, showGift]);


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
      // Add raceType and bag_given to playerInfo object, use data.line_type for raceType
      setPlayerInfo({ ...data, flag, raceType: data.line_type, bag_given: data.bag_given });
    }
    fetchPlayerInfo();
  }, [fno]);

  // ✅ Realtime subscription for bag_given updates
  useEffect(() => {
    if (!fno) return;

    const subscription = supabase
      .channel("bag_given_changes")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "participants",
          filter: `fno=eq.${fno.toUpperCase()}`
        },
        (payload) => {
          const newBagGiven = payload.new?.bag_given;
          setPlayerInfo((prev) =>
            prev ? { ...prev, bag_given: newBagGiven } : prev
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [fno]);

  // Subscribe to bag_given updates
  useEffect(() => {
    if (!fno) return;

    const channel = supabase
      .channel("bag-given-updates")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "participants",
          filter: `race_no=eq.${fno.toUpperCase()}`,
        },
        async (payload) => {
          console.log("Bag given changed:", payload);

          // Re-fetch player info to update bag_given in state
          const res = await fetch(`/api/player-info?fno=${fno.toUpperCase()}`);
          if (res.ok) {
            const data = await res.json();
            const countryName = (data.country ?? "") as string;
            const flag = nationalities[countryName] || "🏳️";
            setPlayerInfo({
              ...data,
              flag,
              raceType: data.line_type,
              bag_given: data.bag_given,
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fno]);

  useEffect(() => {
    async function fetchRaceStatus() {
      try {
        setLoading(true);
        const raceNo = fno?.toUpperCase() ?? "";
        const bib = parseInt(raceNo.replace("F", ""), 10);
        const res = await fetch(`/api/race-status?raceNo=${raceNo}&bib=${bib}`);
        if (!res.ok) throw new Error("API error");
        const data = await res.json();
        setRaceStatus(data);
      } catch (e) {
        setRaceStatus({ type: "enter", currentSector: 1 });
      } finally {
        setLoading(false);
      }
    }
    if (fno) {
      fetchRaceStatus();
    }
  }, [fno]);


  // Fetch total race time from participant_times view filtered by participantId and raceNo
  useEffect(() => {
    async function fetchTotalTime() {
      if (!raceStatus?.participantId || !fno) {
        setTotalTime(null);
        return;
      }
      const raceNo = fno.toUpperCase();
      const { data, error } = await supabase
        .from("participant_times")
        .select("total_time_ms")
        .eq("participant_id", raceStatus.participantId)
        .eq("race_no", raceNo)
        .single();

      if (error) {
        setTotalTime(null);
      } else if (data && typeof data.total_time_ms === "number") {
        setTotalTime(data.total_time_ms);
      } else {
        setTotalTime(null);
      }
    }
    fetchTotalTime();
  }, [raceStatus?.participantId, fno]);

  // Effect to trigger glow animation on totalTime update
  useEffect(() => {
    if (totalTime !== null) {
      setGlow(true);
      const timer = setTimeout(() => setGlow(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [totalTime]);

  if (!hydrated || loading) {
    return (
      <div
        style={{
          width: "100%",
          background: "#111",
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div className="loader"></div>
      </div>
    );
  }

  const raceNo = fno?.toUpperCase() ?? "";


  const displayedSector = (raceStatus?.type === "enter" && (raceStatus?.currentSector ?? 1) === 1)
    ? 0
    : (raceStatus?.currentSector ?? 1);

  // Helper to format milliseconds to hh:mm:ss
  function formatTime(ms: number) {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  }

  // Function to fetch updated total time after finishing a sector
  async function fetchUpdatedTotalTime() {
    if (!raceStatus?.participantId || !fno) {
      setTotalTime(null);
      return;
    }
    const raceNo = fno.toUpperCase();
    const { data, error } = await supabase
      .from("participant_times")
      .select("total_time_ms")
      .eq("participant_id", raceStatus.participantId)
      .eq("race_no", raceNo)
      .single();

    if (error) {
      setTotalTime(null);
    } else if (data && typeof data.total_time_ms === "number") {
      setTotalTime(data.total_time_ms);
    } else {
      setTotalTime(null);
    }
  }

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        background: "#111",
        minHeight: "100vh",
        height: "100vh",
        maxHeight: "100vh",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "430px",
          minWidth: "320px",
          background: "#000",
          flex: 1,
          display: "flex",
          flexDirection: "column",
          height: "100vh",
          maxHeight: "100vh",
          overflow: "hidden",
        }}
      >
        {/* Sticky Header and Tab Toggle */}
        <div style={{ position: "sticky", top: 0, zIndex: 10, background: "#000" }}>
          {/* ✅ Header */}
          <Header
            fno={playerInfo?.fno ?? fno ?? ""}
            name={playerInfo?.name || "Loading..."}
            country={playerInfo?.country || ""}
            flag={playerInfo?.flag}
            raceTime={
              <span style={{ animation: glow ? "glow 2s ease-in-out" : "none", display: "inline-block" }}>
                {totalTime !== null
                  ? formatTime(totalTime)
                  : (playerInfo?.raceTime || "00:00:00")}
              </span>
            }
          />
          {/* Toggle Buttons */}
          <div
            style={{
              display: "flex",
              border: "1px solid #fff",
              borderRadius: "50px",
              overflow: "hidden",
              margin: "16px 16px 0 16px",
              background: "#000",
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
              {activeTab === "map" && raceStatus?.type === "finished" ? "Lucky Draw" : "Race Map"}
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
        </div>

        {/* ✅ Main Content */}
        <div
          style={{
            flex: 1,
            background: "#000",
            padding: "16px",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "column",
            overflowY: "auto",
          }}
        >
          {/* Tab Content */}
          <div style={{ flex: 1, position: "relative" }}>
            {/* ✅ Race Map or Lucky Draw */}
            {activeTab === "map" && (
              <div
                style={{
                  width: "100%",
                  display: "flex",
                  justifyContent: "center",
                  marginTop: "5%",
                }}
              >
                {raceStatus?.type === "finished" ? (
                  <div style={{ color: "#fff", textAlign: "center" }}>
                    <p>Lucky Draw</p>
                  </div>
                ) : (
                  <div
                    style={{
                      width: "100%",
                      maxWidth: "500px",
                      minWidth: "320px",
                    }}
                  >
                    <RaceMap
                      currentSector={displayedSector}
                      statusType={raceStatus?.type}
                      onSectorClick={(sectorId) => setSelectedSector(sectorId)}
                    />
                  </div>
                )}
              </div>
            )}

            {/* ✅ Leaderboard */}
            {activeTab === "leaderboard" && (
              <div style={{ position: "absolute", inset: 0 }}>
               <Leaderboard
  currentRaceNo={fno?.toUpperCase() ?? ""}
  currentSector={raceStatus?.currentSector ?? 0}
  raceTime={totalTime ?? 0}
  bagGiven={playerInfo?.bag_given ?? false}
  finished={raceStatus?.type === "finished"}   // ✅ add this
    lineType={playerInfo?.raceType ?? "standard"}   // ✅ new prop

/>
              </div>
            )}
          </div>
        </div>

        {/* ✅ Footer */}
        {activeTab !== "leaderboard" && (
          <FooterShell
            raceNo={raceNo}
            bib={parseInt(raceNo.replace("F", ""), 10)}
            status={raceStatus}
            setPageSyncing={setIsPageSyncing}
            onStatusUpdate={setRaceStatus}
            onFinishCallback={fetchUpdatedTotalTime}
          />
        )}

        {/* Render FooterExit for Lucky Draw/Leaderboard view after FooterShell, before CompletionGift */}
        {activeTab === "map" && raceStatus?.type === "finished" && (
          <>
            {console.log("Rendering FooterExit with bag_given:", playerInfo?.bag_given)}
            {playerInfo?.bag_given
              ? <FooterExit state="charm" onAction={() => console.log("Download app clicked")} />
              : <FooterExit state="completion" onAction={() => setShowGift(true)} />}
          </>
        )}

        <AnimatePresence mode="wait">
          {selectedSector !== null && (
            <SectorInfo
              key={`sector-${selectedSector}`}
              sectorId={selectedSector}
              onClose={() => setSelectedSector(null)}
            />
          )}
        </AnimatePresence>

        {isPageSyncing && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 9999,
            }}
          >
            <div className="loader" />
          </div>
        )}

        {/* Show CompletionGift popup when leaderboard tab is active and race is complete */}
        <CompletionGift
          isOpen={showGift}
          onClose={() => setShowGift(false)}
          driverNo={fno ?? ""}
          raceType={normalizeRaceType(playerInfo?.raceType)}
        />

        <style>{`
          @keyframes glow {
            from {
              text-shadow: 0 0 8px rgba(230, 0, 255, 1), 0 0 16px rgba(255, 0, 251, 1);
            }
            to {
              text-shadow: 0 0 20px rgba(162, 0, 255, 1), 0 0 30px rgba(119, 0, 255, 1);
            }
          }
        `}</style>
      </div>
    </div>
  );
}
// Helper to ensure raceType is a valid union
function normalizeRaceType(type?: string): "f1" | "standard" | "exclusive" {
  if (type === "f1" || type === "standard" || type === "exclusive") return type;
  return "standard";
}