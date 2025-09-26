"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { nationalities } from "../../data/nationalities";
import { createClient } from "@supabase/supabase-js";
import { motion, AnimatePresence } from "framer-motion";
import { easeOut } from "framer-motion";

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
};

type SectorEntry = {
  pos: number;
  sector: number;
  participant_id: string;
  name: string;
  race_no: string;
  nationality: string;
  best_time_seconds: number;
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
  const [sectors, setSectors] = useState<SectorEntry[]>([]);

  const [currentNameState, setCurrentNameState] = useState<string | null>(null);
  const [currentNationalityState, setCurrentNationalityState] = useState<string | null>(null);

  const [updatedRow, setUpdatedRow] = useState<string | null>(null);
  const [updatedSectorRow, setUpdatedSectorRow] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        const { data: p } = await supabase
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
    return () => {
      ignore = true;
    };
  }, [currentRaceNo]);

  useEffect(() => {
    async function fetchLeaderboard() {
      try {
        const res = await fetch(`/api/leaderboard?raceNo=${currentRaceNo}`);
        const lb = await res.json();
        const normalized = Array.isArray(lb) ? lb : lb?.data ?? [];
        // Determine updated row
        if (data.length > 0 && normalized.length > 0) {
          for (let i = 0; i < normalized.length; i++) {
            const newEntry = normalized[i];
            const oldEntry = data.find((d) => d.participant_id === newEntry.participant_id);
            if (!oldEntry || oldEntry.total_seconds !== newEntry.total_seconds) {
              setUpdatedRow(newEntry.participant_id);
              setTimeout(() => setUpdatedRow(null), 2000);
              break;
            }
          }
        } else if (data.length === 0 && normalized.length > 0) {
          setUpdatedRow(normalized[0].participant_id);
          setTimeout(() => setUpdatedRow(null), 2000);
        }
        setData(normalized);
      } catch (err) {
        console.error("Error fetching leaderboard", err);
      } finally {
        setLoading(false);
      }
    }
    fetchLeaderboard();

    const channel = supabase
      .channel("leaderboard-updates")
      .on("postgres_changes", { event: "*", schema: "public", table: "checkpoints" }, () => {
        fetchLeaderboard();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // Only depend on currentRaceNo to prevent infinite API calls
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentRaceNo]);

  useEffect(() => {
    async function fetchBestSectors() {
      try {
        const res = await fetch('/api/best-sectors');
        const sectorsData = await res.json();
        // Determine updated sector row
        if (sectors.length > 0 && sectorsData.length > 0) {
          for (let i = 0; i < sectorsData.length; i++) {
            const newEntry = sectorsData[i];
            const oldEntry = sectors.find((d) => d.participant_id === newEntry.participant_id);
            if (!oldEntry || oldEntry.best_time_seconds !== newEntry.best_time_seconds) {
              setUpdatedSectorRow(newEntry.participant_id);
              setTimeout(() => setUpdatedSectorRow(null), 2000);
              break;
            }
          }
        } else if (sectors.length === 0 && sectorsData.length > 0) {
          setUpdatedSectorRow(sectorsData[0].participant_id);
          setTimeout(() => setUpdatedSectorRow(null), 2000);
        }
        setSectors(sectorsData);
      } catch (err) {
        console.error("Error fetching best sectors", err);
      }
    }
    fetchBestSectors();

    const channel = supabase
      .channel("sectors-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "checkpoints" }, () => {
        fetchBestSectors();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // Only depend on currentRaceNo (if needed), or use [] if sectors aren't race specific
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentRaceNo]);

  const formatTime = (seconds: number) => {
    const s = Math.floor(Number(seconds) || 0);
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  };

  return (
    <div style={{ position: "relative", width: "100%", color: "white", fontFamily: "Poppins, sans-serif" }}>
      {/* Background */}
      <div style={{ position: "absolute", inset: 0, zIndex: 1 }}>
        <Image
          src="/bg/leaderboard.png"
          alt="Leaderboard background"
          fill
          style={{ objectFit: "cover", pointerEvents: "none" }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
           
          }}
        />
      </div>

      <div style={{ maxWidth: "1400px", margin: "0 auto", position: "relative", zIndex: 2, padding: "20px" }}>
        {/* Innerdrive logo */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "12px" }}>
          <Image
            src="/bg/Innerdrive-logo.png"
            alt="Innerdrive logo"
            width={320}
            height={0}
            style={{ maxWidth: "580px", height: "auto" }}
          />
        </div>

        {/* Panels container */}
        <div style={{ display: "flex", width: "100%", gap: "20px" }}>
          <div style={{ flex: 1 }}>
            {/* Left Panel: Event Leaderboard */}
            {/* Title Polygon */}
            <div style={{ display: "flex", justifyContent: "center", margin: "4px 0 12px 0" }}>
              <div
                className="font-dragracing"
                style={{
                  background: "#ffffff",
                  padding: "6px 50px",
                  color: "black",
                  clipPath: "polygon(5% 0, 100% 0, 95% 100%, 0% 100%)",
                  boxShadow: "0 0 18px rgba(255,255,255,0.3)",
                }}
              >
                <h1 style={{ margin: 0, fontSize: "20px", fontWeight: "bold" }}>EVENT LEADERBOARD</h1>
              </div>
            </div>

            {/* Table header */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "60px 40px 120px 1fr 120px",
                alignItems: "center",
                padding: "5px 66px",
                marginBottom: "10px",
                fontWeight: 400,
                fontSize: "16px",
                textTransform: "uppercase",
                color: "#ffffffff",
              }}
            >
              <span>Pos</span>
              <span> </span>
              <span>Driver No</span>
              <span>Name</span>
              <span style={{ textAlign: "right" }}>HH:MM:SS</span>
            </div>

            {loading ? (
              <p style={{ textAlign: "center", padding: "40px 0" }}>Loading...</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <AnimatePresence>
                  {data.slice(0, 15).map((entry, idx) => {
                    const isUpdated = entry.participant_id === updatedRow;
                    // Animation logic: row 0 always purple, updated row flashes purple then fades to black, others black
                    let initial = { opacity: 0, y: -30, backgroundColor: "rgba(168,85,247,0.8)" };
                    let animate, transition, onAnimationComplete;
                    if (idx === 0) {
                      animate = { opacity: 1, y: 0, backgroundColor: "rgba(168,85,247,0.8)" };
                      transition = { duration: 1.2, ease: easeOut };
                      onAnimationComplete = undefined;
                    } else if (isUpdated) {
                      animate = { opacity: 1, y: 0, backgroundColor: "rgba(21,21,21,1)" };
                      transition = { duration: 1.5, ease: easeOut };
                      initial = { opacity: 0, y: -30, backgroundColor: "rgba(168,85,247,0.8)" };
                      onAnimationComplete = undefined;
                    } else {
                      animate = { opacity: 1, y: 0, backgroundColor: "rgba(21,21,21,1)" };
                      transition = { duration: 1.2, ease: easeOut };
                      onAnimationComplete = undefined;
                    }
                    return (
                      <motion.div
                        key={entry.participant_id}
                        layout
                        initial={initial}
                        animate={animate}
                        exit={{ opacity: 0, y: 30 }}
                        transition={transition}
                        onAnimationComplete={onAnimationComplete}
                        style={{
                          display: "grid",
                          gridTemplateColumns: "60px 40px 120px 1fr 120px",
                          alignItems: "center",
                          padding: "2px 66px",
                          clipPath: "polygon(5% 0, 100% 0, 95% 100%, 0% 100%)",
                          boxShadow: idx < 3 ? "0 0 15px 5px rgba(168,85,247,1)" : "none"
                        }}
                      >
                        <span className="font-dragracing" style={{ fontSize: 20, fontWeight: "bold" }}>{idx + 1}</span>
                        <span style={{ fontSize: 28, fontWeight: "500" }}>{flagFor(entry.nationality)}</span>
                        <span className="font-dragracing" style={{ fontSize: 20, fontWeight: "400" }}>{entry.race_no}</span>
                        <span style={{ overflow: "hidden", textOverflow: "ellipsis", textTransform: "uppercase", whiteSpace: "nowrap", fontSize: 16, fontWeight: "500" }}>
                          {entry.name}
                        </span>
                        <span style={{ textAlign: "right", fontSize: 16, fontWeight: "400" }}>{formatTime(entry.total_seconds)}</span>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}
          </div>
          <div style={{ flex: 1 }}>
            {/* Right Panel: Best Sector Times */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", height: "100vh", boxSizing: "border-box" }}>
              {/* Logo above Best Sector Times table */}
              <div style={{ marginBottom: "20px", marginTop: -40, width: "100%", display: "flex", justifyContent: "center" }}>
                <Image
                  src="/bg/innerdrive-crest.png"
                  alt="Innerdrive Crest"
                  width={200}
                  height={200}
                  style={{ height: "auto", width: "auto" }}
                />
              </div>

              {/* Title Polygon */}
              <div style={{ display: "flex", justifyContent: "center", margin: "4px 0 12px 0", width: "100%" }}>
                <div
                  className="font-dragracing"
                  style={{
                    background: "#ffffff",
                    padding: "6px 40px",
                    color: "black",
                    clipPath: "polygon(5% 0, 100% 0, 95% 100%, 0% 100%)",
                    boxShadow: "0 0 18px rgba(255,255,255,0.3)",
                  }}
                >
                  <h1 style={{ margin: 0, fontSize: "20px", fontWeight: "bold" }}>BEST SECTOR TIMES</h1>
                </div>
              </div>

              {/* Table header */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "68px 130px 40px 180px 60px 0fr 100px 50px",
                  alignItems: "center",
                  padding: "10px 40px",
                  marginBottom: "10px",
                  fontWeight: 400,
                  fontSize: "16px",
                  textTransform: "uppercase",
                  color: "#ffffffff",
                  width: "84%",
                }}
              >
                <span>Pos</span>
                
                <span>FNO</span>
                <span> </span>
                <span>Name</span>
                   <span> </span>
                   <span>Sector</span>
               
                <span style={{ textAlign: "right" }}>Time</span>
                <span> </span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "10px", overflowY: "inherit", width: "85%" }}>
                {loading ? (
                  <p style={{ textAlign: "center", padding: "40px 0" }}>Loading...</p>
                ) : (
                  <AnimatePresence>
                    {sectors.map((entry, idx) => {
                      const isUpdated = entry.participant_id === updatedSectorRow;
                      let initial = { opacity: 0, y: -30, backgroundColor: "rgba(168,85,247,0.8)" };
                      let animate, transition, onAnimationComplete;
                      if (idx === 0) {
                        animate = { opacity: 1, y: 0, backgroundColor: "rgba(168,85,247,0.8)" };
                        transition = { duration: 1.2, ease: easeOut };
                        onAnimationComplete = undefined;
                      } else if (isUpdated) {
                        animate = { opacity: 1, y: 0, backgroundColor: "rgba(21,21,21,1)" };
                        transition = { duration: 1.5, ease: easeOut };
                        initial = { opacity: 0, y: -30, backgroundColor: "rgba(168,85,247,0.8)" };
                        onAnimationComplete = undefined;
                      } else {
                        animate = { opacity: 1, y: 0, backgroundColor: "rgba(21,21,21,1)" };
                        transition = { duration: 1.2, ease: easeOut };
                        onAnimationComplete = undefined;
                      }
                      return (
                        <div key={"sector-" + entry.participant_id} style={{ position: "relative" }}>
                          <motion.div
                            layout
                            initial={initial}
                            animate={animate}
                            exit={{ opacity: 0, y: 30 }}
                            transition={transition}
                            onAnimationComplete={onAnimationComplete}
                            style={{
                              display: "grid",
                              gridTemplateColumns: "40px 24px 20px 100px 280px 0fr 100px 60px",
                              alignItems: "center",
                              padding: "2px 40px",
                              clipPath: "polygon(5% 0, 100% 0, 95% 100%, 0% 100%)",
                              boxShadow: idx < 3 ? "0 0 15px 5px rgba(168,85,247,1)" : "none"
                            }}
                          >
                            <span className="font-dragracing" style={{ fontSize: 20, fontWeight: "bold" }}>{entry.pos}</span>
                          
                            <span style={{ fontSize: 24, fontWeight: "500" }}>{flagFor(entry.nationality)}</span>
                            <span />
                            <span className="font-dragracing" style={{ fontSize: 20, fontWeight: "400" }}>{entry.race_no}</span>
                            <span style={{ overflow: "hidden", textOverflow: "ellipsis", textTransform: "uppercase", whiteSpace: "nowrap", fontSize: 16, fontWeight: "500" }}>
                              {entry.name}
                            </span>
                             <span className="font-dragracing" style={{ fontSize: 20, fontWeight: "bold" }}>{entry.sector}</span>
                            <span style={{ textAlign: "right", fontSize: 16, fontWeight: "400" }}>{formatTime(entry.best_time_seconds)}</span>
                            <span />
                          </motion.div>
                          {idx < 6 && (
                            <Image
                              src={`/bg/mvp-${idx + 1}.webp`}
                              alt="badge"
                              width={40}
                              height={40}
                              style={{ position: "absolute", right: -50, top: "50%", transform: "translateY(-50%)" }}
                            />
                          )}
                        </div>
                      );
                    })}
                  </AnimatePresence>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <style jsx global>{`
      `}</style>
    </div>
  );
}