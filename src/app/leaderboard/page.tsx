// app/components/Leaderboard.tsx
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
  }, [currentRaceNo]);

  useEffect(() => {
    async function fetchBestSectors() {
      try {
        const res = await fetch('/api/best-sectors');
        const sectorsData = await res.json();
        setSectors(sectorsData);
      } catch (err) {
        console.error("Error fetching best sectors", err);
      }
    }
    fetchBestSectors();
  }, []);

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
            background: "rgba(0,0,0,0.15)",
          }}
        />
      </div>

      <div style={{ maxWidth: "1200px", margin: "0 auto", position: "relative", zIndex: 2, padding: "20px" }}>
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
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "30px" }}>
          {/* Left Panel: Event Leaderboard */}
          <div>
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
                    const isCurrent = entry.race_no === currentRaceNo;
                    return (
                      <motion.div
                        key={entry.participant_id}
                        layout
                        initial={{ opacity: 0, y: -30, backgroundColor: "rgba(168,85,247,0.8)" }}
                        animate={{ opacity: 1, y: 0, backgroundColor: isCurrent ? "rgba(168,85,247,0.8)" : "rgba(21,21,21,1)" }}
                        exit={{ opacity: 0, y: 30 }}
                        transition={{ duration: 1.2, ease: "easeOut" }}
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
                        <span style={{ fontSize: 30, fontWeight: "500" }}>{flagFor(entry.nationality)}</span>
                        <span className="font-dragracing" style={{ fontSize: 20, fontWeight: "500" }}>{entry.race_no}</span>
                        <span style={{ overflow: "hidden", textOverflow: "ellipsis", textTransform: "uppercase", whiteSpace: "nowrap" }}>
                          {entry.name}
                        </span>
                        <span style={{ textAlign: "right" }}>{formatTime(entry.total_seconds)}</span>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* Right Panel: Best Sector Times */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", height: "100vh", boxSizing: "border-box" }}>
            {/* Logo above Best Sector Times table */}
            <div style={{ marginBottom: "20px", width: "100%", display: "flex", justifyContent: "center" }}>
              <Image
                src="/bg/innerdrive-crest.png"
                alt="Innerdrive Crest"
                width={280}
                height={280}
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
                gridTemplateColumns: "40px 40px 40px 80px 1fr 100px",
                alignItems: "center",
                padding: "10px 40px",
                marginBottom: "10px",
                fontWeight: 400,
                fontSize: "16px",
                textTransform: "uppercase",
                color: "#ffffffff",
                width: "100%",
              }}
            >
              <span>Pos</span>
              <span>Sector</span>
              <span> </span>
              <span>FNO</span>
              <span>Name</span>
              <span style={{ textAlign: "right" }}>Time</span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px", overflowY: "auto", width: "100%" }}>
              {loading ? (
                <p style={{ textAlign: "center", padding: "40px 0" }}>Loading...</p>
              ) : (
                <AnimatePresence>
                  {sectors.map((entry, idx) => {
                    const isCurrent = entry.race_no === currentRaceNo;
                    return (
                      <motion.div
                        key={"sector-" + entry.participant_id}
                        layout
                        initial={{ opacity: 0, y: -30, backgroundColor: "rgba(168,85,247,0.8)" }}
                        animate={{ opacity: 1, y: 0, backgroundColor: isCurrent ? "rgba(168,85,247,0.8)" : "rgba(21,21,21,1)" }}
                        exit={{ opacity: 0, y: 30 }}
                        transition={{ duration: 1.2, ease: "easeOut" }}
                        style={{
                          display: "grid",
                          gridTemplateColumns: "40px 40px 40px 80px 1fr 100px",
                          alignItems: "center",
                          padding: "2px 40px",
                          clipPath: "polygon(5% 0, 100% 0, 95% 100%, 0% 100%)",
                          boxShadow: idx < 3 ? "0 0 15px 5px rgba(168,85,247,1)" : "none"
                        }}
                      >
                        <span className="font-dragracing" style={{ fontSize: 20, fontWeight: "bold" }}>{entry.pos}</span>
                        <span className="font-dragracing" style={{ fontSize: 20, fontWeight: "bold" }}>{entry.sector}</span>
                        <span style={{ fontSize: 30, fontWeight: "500" }}>{flagFor(entry.nationality)}</span>
                        <span className="font-dragracing" style={{ fontSize: 20, fontWeight: "500" }}>{entry.race_no}</span>
                        <span style={{ overflow: "hidden", textOverflow: "ellipsis", textTransform: "uppercase", whiteSpace: "nowrap" }}>
                          {entry.name}
                        </span>
                        <span style={{ textAlign: "right" }}>{formatTime(entry.best_time_seconds)}</span>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              )}
            </div>
          </div>
        </div>
      </div>
      <style jsx global>{`
      `}</style>
    </div>
  );
}