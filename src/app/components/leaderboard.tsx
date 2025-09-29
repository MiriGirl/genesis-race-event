"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { nationalities } from "../../data/nationalities";
import { createClient } from "@supabase/supabase-js";
import { motion, AnimatePresence } from "framer-motion";

const flagFor = (country?: string) =>
  (country && (nationalities as Record<string, string>)[country]) || "🏳️";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type LeaderboardEntry = {
  participant_id: string;
  name: string;
  race_no: string;
  nationality: string;
  total_seconds: number;
  completed_checkpoints: number;
  last_sector?: number;
  race_time?: number;
  line_type?: string;
  merch_badge?: boolean;
  app_badge?: boolean;
};

type LeaderboardProps = {
  currentRaceNo: string;
  currentSector?: number;
  raceTime?: number;
  bagGiven?: boolean;
  finished?: boolean;
  lineType?: string;
};

export default function Leaderboard({
  currentRaceNo,
  currentSector,
  raceTime,
  bagGiven,
  finished,
  lineType,
}: LeaderboardProps) {
  const [data, setData] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const [currentNameState, setCurrentNameState] = useState<string | null>(null);
  const [currentNationalityState, setCurrentNationalityState] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        const { data: p, error } = await supabase
          .from("participants")
          .select("name,nationality")
          .eq("race_no", currentRaceNo)
          .single();
        if (!ignore && p) {
          setCurrentNameState(p.name || null);
          setCurrentNationalityState(p.nationality || null);
        }
      } catch (e) {
        console.error("Failed to fetch participant by race_no", e);
      }
    })();
    return () => { ignore = true; };
  }, [currentRaceNo]);

  // Fetch from API
  useEffect(() => {
    async function fetchLeaderboard() {
      try {
        const res = await fetch(`/api/leaderboard?raceNo=${currentRaceNo}`);
        const lb = await res.json();
        console.log("Leaderboard API response:", lb);
        // Always unwrap correctly
        const normalized = Array.isArray(lb) ? lb : (lb?.data ?? []);
        setData(normalized);
      } catch (err) {
        console.error("Error fetching leaderboard", err);
      } finally {
        setLoading(false);
      }
    }
    fetchLeaderboard();

    // Subscribe to realtime updates
    const channel = supabase
      .channel("leaderboard-updates")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "checkpoints" },
        () => {
          fetchLeaderboard();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentRaceNo]);

  // Helper to format seconds → HH:MM:SS
  const formatTime = (seconds: number) => {
    const s = Math.floor(Number(seconds) || 0);
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return `${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}:${String(sec).padStart(2,"0")}`;
  };

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        color: "white",
        fontFamily: "monospace",
        overflow: "visible",
   
      }}
    >
      {/* Background */}
      <div style={{ position: "absolute", inset: 0, zIndex: 1, height: "auto", width: "100%" }}>
        <Image
          src="/bg/leaderboard-image.png"
          alt="Leaderboard background"
          fill
          style={{ objectFit: "cover", pointerEvents: "none", backgroundRepeat: "repeat-y" }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            height: "100%",
            width: "100%",
            pointerEvents: "none",
            background: "transparent",
          }}
        />
      </div>

      <div style={{ maxWidth: "600px", margin: "0 auto", position: "relative", zIndex: 1 }}>
        {/* Header Tabs */}
        
        {/* Title */}
        <div style={{ display: "flex", justifyContent: "center", fontFamily: "Poppins, sans-serif", marginBottom: "16px" }}>
          <div
            style={{
              backgroundColor: "#fff",
              color: "#000",
              padding: "0px 30px",
              clipPath: "polygon(5% 0, 100% 0, 95% 100%, 0% 100%)",
            }}
          >
            <h1 className="font-dragracing" style={{ margin: 0, fontSize: "18px" }}>
              EVENT LEADERBOARD
            </h1>
          </div>
        </div>


        {loading ? (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "60vh",
            }}
          >
            <div className="loader" />
          </div>
        ) : (
          <>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "32px 28px 100px auto 80px",
                alignItems: "center",
                padding: "8px 12px",
                borderRadius: "6px",
                backgroundColor: "rgba(0,0,0,0.8)",
                fontFamily: "Poppins, sans-serif",
                fontWeight: 600,
                fontSize: "13px",
                marginBottom: "8px",
              }}
            >
              <span style={{ textAlign: "center" }}>POS</span>
              <span style={{ opacity: 0 }}>•</span> {/* placeholder for flag column */}
              <span>DRIVER NO</span>
              <span>NAME</span>
              <span style={{ textAlign: "right" }}>HH:MM:SS</span>
            </div>
            <div style={{ marginBottom: "16px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <AnimatePresence>
                  {(() => {
                    // Sort full leaderboard by total_seconds ascending
                    const sortedData = [...data].sort((a, b) => a.total_seconds - b.total_seconds);

                    // Find current racer in data
                    const current = data.find((d) => d.race_no === currentRaceNo);

                    let visible: LeaderboardEntry[] = [];
                    let hasNotStarted = false;
                    if (current) {
                      hasNotStarted = current.completed_checkpoints === 0 && current.total_seconds === 0;
                      const hasFinished = current.completed_checkpoints === 6;

                      if (hasNotStarted) {
                        // Show banner + top 8 fastest (without current included yet)
                        const fastestEight = sortedData.filter((d) => d.race_no !== currentRaceNo).slice(0, 8);
                        visible = [
                          ...fastestEight,
                          {
                            participant_id: current.participant_id,
                            race_no: current.race_no,
                            name: current.name || currentNameState || "JOIN LEADERBOARD",
                            nationality: current.nationality || currentNationalityState || "Singapore",
                            total_seconds: current.total_seconds,
                            completed_checkpoints: current.completed_checkpoints,
                          }
                        ];
                      } else {
                        // In progress or finished: place current racer into sorted leaderboard properly
                        const others = sortedData.filter((d) => d.race_no !== currentRaceNo);
                        let insertIndex = others.findIndex((d) => current.total_seconds < d.total_seconds);
                        if (insertIndex === -1) insertIndex = others.length;
                        const combined = [...others];
                        combined.splice(insertIndex, 0, current);
                        visible = combined.slice(0, 8);
                      }
                    } else {
                      // Current racer not found in data
                      const placeholder: LeaderboardEntry = {
                        participant_id: "placeholder-" + currentRaceNo,
                        race_no: currentRaceNo,
                        name: currentNameState || "CURRENT RACER",
                        nationality: currentNationalityState || "Singapore",
                        total_seconds: typeof raceTime === "number" ? raceTime : 0,
                        race_time: typeof raceTime === "number" ? raceTime : 0,
                        completed_checkpoints: typeof currentSector === "number" ? currentSector : 0,
                      };
                      const fastestSeven = sortedData.slice(0, 7);
                      visible = [...fastestSeven, placeholder];
                    }

                    // Insert "FINISH RACE TO RANK" banner before first unfinished racer
                    let bannerInserted = false;
                    return visible.map((entry, idx) => {
                      const isCurrent = entry.race_no === currentRaceNo;
                      // Use outer hasNotStarted for banner condition
                      const showBanner = isCurrent && hasNotStarted;

                      // Determine position based on sorting
                      let pos: number | string = "-";
                      if (!entry.participant_id.startsWith("placeholder-") && !(isCurrent && hasNotStarted)) {
                        // Position is index in sortedData + 1
                        pos = sortedData.findIndex(d => d.participant_id === entry.participant_id) + 1;
                      }

                      // For time display: use raceTime prop if current, else entry.total_seconds
                      let timeToShow: number | undefined;
                      if (isCurrent) {
                        if (typeof raceTime === "number") {
                          timeToShow = Math.floor(raceTime / 1000);
                        } else {
                          timeToShow = entry.race_time ?? entry.total_seconds;
                        }
                      } else {
                        timeToShow = entry.total_seconds;
                      }

                      // Insert banner before first unfinished racer (completed_checkpoints < 6)
                      let insertFinishBanner = false;
                      if (
                        !bannerInserted &&
                        (!entry.completed_checkpoints || entry.completed_checkpoints < 6) &&
                        !showBanner &&
                        isCurrent
                      ) {
                        insertFinishBanner = true;
                        bannerInserted = true;
                      }
                      if (
                        !bannerInserted &&
                        (!entry.completed_checkpoints || entry.completed_checkpoints < 6) &&
                        !showBanner &&
                        !isCurrent
                      ) {
                        insertFinishBanner = true;
                        bannerInserted = true;
                      }

                      return (
                        <div key={`wrapper-${entry.participant_id}-${entry.race_no}`}>
                          {showBanner && (
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "12px", margin: "8px 0" }}>
                              <div style={{ flex: 1, height: "2px", backgroundColor: "#fff" }} />
                              <h2 style={{ fontFamily: "Poppins, sans-serif", fontWeight: "bold", fontSize: "16px", margin: 0 }}>
                                START RACE TO JOIN LEADERBOARD
                              </h2>
                              <div style={{ flex: 1, height: "2px", backgroundColor: "#fff" }} />
                            </div>
                          )}
                          {insertFinishBanner && (
                            <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:"12px", margin:"8px 0" }}>
                              <div style={{ flex:1, height:"2px", backgroundColor:"#fff" }} />
                              <h2 style={{ fontFamily:"Poppins, sans-serif", fontWeight:"bold", fontSize:"16px", margin:0 }}>
                                FINISH RACE TO RANK
                              </h2>
                              <div style={{ flex:1, height:"2px", backgroundColor:"#fff" }} />
                            </div>
                          )}
                          <motion.div
                            key={`${entry.participant_id}-${entry.race_no}`}
                            layout
                            initial={{ opacity: 0, y: -50, scale: 0.8 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 50, scale: 0.8 }}
                            transition={{
                              type: "spring",
                              stiffness: 500,
                              damping: 30,
                              duration: 0.6,
                            }}
                            style={{
                              display: "grid",
                              gridTemplateColumns: "32px 28px 100px auto 80px",
                              alignItems: "center",
                              padding: "7px 12px",
                              borderRadius: "12px",
                              backgroundColor: isCurrent ? "rgba(168,85,247,0.8)" : "#1A1A1A",
                              ...(idx < 3
                                ? {
                                    boxShadow: "0 0 15px 5px rgba(168,85,247,0.8)",
                                    animation: "pulseGlow 2s infinite",
                                    position: "relative",
                                    zIndex: 5,
                                  }
                                : {}),
                            }}
                          >
                            <span style={{ textAlign: "center", fontWeight: "bold" }}>
                              {pos}
                            </span>
                            <span style={{ fontSize: "18px" }}>{flagFor(entry.nationality)}</span>
                            <span className="font-dragracing" style={{ fontWeight: 500, fontSize: "15px" }}>
                              {entry.race_no}
                            </span>
                            <span
                              style={{
                                textTransform: "uppercase",
                                fontFamily: "Poppins, sans-serif",
                                fontWeight: 600,
                                fontSize: "14px",
                              }}
                            >
                              {entry.name}
                            </span>
                            <span
                              style={{
                                textAlign: "right",
                                fontFamily: "Poppins, sans-serif",
                                fontWeight: 400,
                                fontSize: "13px",
                              }}
                            >
                              {formatTime(timeToShow ?? 0)}
                            </span>
                          </motion.div>
                        </div>
                      );
                    });
                  })()}
                </AnimatePresence>
              </div>
            </div>
          </>
        )}

        {/* Footer section for badges */}
        <div style={{ textAlign: "center", height: "20vh", display: "flex", flexDirection: "column", justifyContent: "flex-start", paddingTop: 5 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "12px" }}>
            <div style={{ flex: 1, height: "2px", backgroundColor: "#fff" }} />
            <h2 style={{ fontFamily: "Poppins, sans-serif", fontWeight: "bold", fontSize: "16px", margin: 0 }}>
              INNERDRIVE™ RACE BADGES EARNED
            </h2>
            <div style={{ flex: 1, height: "2px", backgroundColor: "#fff" }} />
          </div>
          {(() => {
            // Use currentSector prop if provided, otherwise fallback to completed_checkpoints from leaderboard data
            let lastSector: number = 0;
            let current: LeaderboardEntry | undefined = undefined;
            if (typeof currentSector === "number") {
              lastSector = currentSector;
            } else {
              current = data.find((d) => d.race_no === currentRaceNo);
              lastSector = typeof currentSector === "number"
                ? currentSector
                : (current?.completed_checkpoints ?? 0);
            }
            if (!current) {
              current = data.find((d) => d.race_no === currentRaceNo);
            }
            // If finished, show all badges as earned
            const allEarned = !!finished;
            // Debug logs for props and computed values
            console.log("[LEADERBOARD BADGES] currentSector (prop):", currentSector);
            console.log("[LEADERBOARD BADGES] raceTime (prop):", raceTime);
            console.log("[LEADERBOARD BADGES] currentRaceNo (prop):", currentRaceNo);
            console.log("[LEADERBOARD BADGES] current (from data):", current);
            console.log("[LEADERBOARD BADGES] lastSector (computed):", lastSector);
            console.log("[LEADERBOARD BADGES] allEarned (computed):", allEarned);
            // For each sector badge (1-6)
            const badges = Array.from({ length: 6 }, (_, i) => {
              const sector = i + 1;
              // Corrected badge logic:
              let isEarned = false;
              if (allEarned) {
                isEarned = true; // if finished, all badges earned
              } else if (sector === 6) {
                isEarned = false; // sector 6 only when finished
              } else {
                // For sectors 1–5, badge is earned only if currentSector (lastSector) is beyond it.
                // Example: if currentSector=2, only sector 1 badge is true.
                isEarned = lastSector > sector - 1;
              }
              // Hide sector 1 badge if lastSector is 1 (still on sector 1, not completed yet)
              if (sector === 1 && lastSector === 1 && !allEarned) {
                isEarned = false;
              }
              console.log(
                `[LEADERBOARD BADGES] sector: ${sector}, isEarned: ${isEarned}`
              );
              if (!isEarned) {
                return null;
              }
              return (
                <Image
                  key={sector}
                  src={`/bg/sector${sector}.png`}
                  alt={`Sector ${sector} badge`}
                  width={70}
                  height={70}
                  style={{
                    opacity: 1,
                    filter: "none",
                    transition: "opacity 0.3s, filter 0.3s",
                    boxShadow: "0 0 15px 5px rgba(168,85,247,0.8)",
                    borderRadius: "50%",
                    animation: "pulseGlow 2s infinite",
                  }}
                />
              );
            });
            // After mapping, check if any badge is rendered
            // --- Quest badge logic ---
            // If sector 6 badge was rendered, also add quest completion badge based on participant line type
            const renderedBadges = badges.filter(Boolean);
            const sector6Earned = !!badges[5];
            if (sector6Earned) {
              // Determine quest badge image based on lineType prop, fallback to current?.line_type
              let questImg = "/bg/generalquest.png";
              const effectiveLineType = lineType ?? current?.line_type;
              if (effectiveLineType === "f1") {
                questImg = "/bg/f1quest.png";
              }
              renderedBadges.push(
                <Image
                  key="quest"
                  src={questImg}
                  alt="Quest Completion Badge"
                  width={70}
                  height={70}
                  style={{
                    opacity: 1,
                    filter: "none",
                    transition: "opacity 0.3s, filter 0.3s",
                    boxShadow: "0 0 15px 5px rgba(168,85,247,0.8)",
                    borderRadius: "50%",
                    animation: "pulseGlow 2s infinite",
                  }}
                />
              );
            }
            // --- Merch and App Installed badge logic ---
            // Only check for these if current is defined
            if (current?.merch_badge) {
              renderedBadges.push(
                <Image
                  key="merch"
                  src="/bg/merch.png"
                  alt="Merch Badge"
                  width={70}
                  height={70}
                  style={{
                    opacity: 1,
                    filter: "none",
                    transition: "opacity 0.3s, filter 0.3s",
                    boxShadow: "0 0 15px 5px rgba(168,85,247,0.8)",
                    borderRadius: "50%",
                    animation: "pulseGlow 2s infinite",
                  }}
                />
              );
            }
            if (current?.app_badge) {
              renderedBadges.push(
                <Image
                  key="appinstalled"
                  src="/bg/appinstalled.png"
                  alt="App Installed Badge"
                  width={70}
                  height={70}
                  style={{
                    opacity: 1,
                    filter: "none",
                    transition: "opacity 0.3s, filter 0.3s",
                    boxShadow: "0 0 15px 5px rgba(168,85,247,0.8)",
                    borderRadius: "50%",
                    animation: "pulseGlow 2s infinite",
                  }}
                />
              );
            }
            if (renderedBadges.length > 0) {
              return (
                <div
                  style={{
                    marginTop: "18px",
                    display: "grid",
                    gridTemplateColumns: "repeat(3, 1fr)",
                    gap: "18px",
                    justifyItems: "center",
                  }}
                >
                  {renderedBadges}
                </div>
              );
            } else {
              // No badges: remove grid styling, center message
              return (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    minHeight: "70px",
                  }}
                >
                  <p style={{ fontSize: "14px", color: "lightgray", marginTop: "8px", fontFamily: "Poppins, sans-serif", textAlign: "center", whiteSpace: "nowrap" }}>
                    You Haven’t Earned Any Badges Yet.
                  </p>
                </div>
              );
            }
          })()}
        </div>

      </div>
      <style jsx global>{`
        @keyframes pulseGlow {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.05); opacity: 0.9; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}