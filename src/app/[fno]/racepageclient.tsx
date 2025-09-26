"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";

export default function RacePageClient() {
  const router = useRouter();
  const params = useParams();
  // Ensure fno is always a string
  const rawFno = params?.fno;
  const fno = Array.isArray(rawFno) ? rawFno[0] : (rawFno || "");

  // Derive raceNo and bib
  const raceNo = fno.toUpperCase();
  const bib = raceNo.startsWith("F") ? raceNo.slice(1) : raceNo;

  const [countdown, setCountdown] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [raceActive, setRaceActive] = useState(false);
  const [raceStatus, setRaceStatus] = useState<"not_started" | "in_progress" | "finished" | null>(null);
  const [showStartButton, setShowStartButton] = useState(false);

  const FORCE_EVENT_MODE = false;

  useEffect(() => {
    async function checkRace() {
      try {
        const res = await fetch(`/api/race-status?raceNo=${raceNo}&bib=${bib}`);
        const data = await res.json();

        console.log("API response:", data);
        if (raceActive) {
          console.log("✅ Inside event hours (10am–10pm SGT)");
          // Inside event hours
          if (data?.type === "enter") {
            setShowStartButton(true);
            // UI log for START RACE button
            console.log("🟢 UI: Showing START RACE button");
          } else if (data?.type === "finished" || data?.status === "finished") {
            // UI log for finished race holding state
            console.log("🏁 UI: Finished race (holding state)");
          } else if (data?.status === "in_progress") {
            // UI log for redirect
            console.log("🚦 UI: Redirecting to race-shell");
            router.replace(`/race-shell/${raceNo}`);
          } else {
            // UI log for fallback holding state
            console.log("ℹ️ UI: Holding state (no button/redirect)");
          }
        } else {
          console.log("⏰ Outside event hours (before 10am or after 10pm SGT)");
          // UI log for outside event hours
          console.log("🟣 UI: Countdown + holding message");
          setShowStartButton(false);
        }

        console.log("API race status:", data?.status || data?.type);

        if (data?.status) {
          // Preferred if provided
          console.log("Race started?", data.status !== "not_started");
          setRaceStatus(data.status);
          if (data.status === "in_progress") {
            if (raceActive) {
              console.log("Race in progress and raceActive is true → redirecting");
              router.replace(`/race-shell/${raceNo}`);
            } else {
              console.log("Race in progress but raceActive is false → showing holding page");
            }
          }
        } else if (data?.type) {
          // Fallback mapping if API only provides `type`
          const mapped =
            data.type === "enter"
              ? "not_started"
              : data.type === "finished"
              ? "finished"
              : data.type;
          console.log("Race started?", mapped !== "not_started");
          setRaceStatus(mapped as "not_started" | "in_progress" | "finished");
          if (mapped === "in_progress" && raceActive) {
            console.log("Race in progress (from type) and raceActive is true → redirecting");
            router.replace(`/race-shell/${raceNo}`);
          }
        } else {
          setRaceStatus(null);
        }
      } catch (err) {
        console.error("Race check failed", err);
        setRaceStatus(null);
      }
    }

    if (fno) {
      checkRace();
    }
  }, [fno, raceNo, bib, router, raceActive]);

  useEffect(() => {
    const interval = setInterval(() => {
      // --- timezone-robust countdown using UTC math ---
      const nowMs = Date.now();

      // Get SGT calendar parts for "now"
      const parts = new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Asia/Singapore',
        hour12: false,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }).formatToParts(new Date());

      const get = (type: string) => Number(parts.find(p => p.type === type)?.value || 0);
      const y = get('year');
      const m = get('month');
      const d = get('day');
      const hh = get('hour');
      const mm = get('minute');
      const ss = get('second');

      // Convert SGT wall-clock times to UTC epoch ms by subtracting 8 hours
      const openMs  = Date.UTC(y, m - 1, d, 10 - 8, 0, 0);  // 10:00 SGT => 02:00 UTC
      const closeMs = Date.UTC(y, m - 1, d, 22 - 8, 0, 0);  // 22:00 SGT => 14:00 UTC

      if (nowMs >= openMs && nowMs <= closeMs) {
        setRaceActive(true);
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      } else {
        setRaceActive(false);

        // If before open -> next is today 10am; if after close -> tomorrow 10am
        let nextOpenMs = nowMs < openMs ? openMs : openMs + 24 * 60 * 60 * 1000;

        const diff = Math.max(0, nextOpenMs - nowMs);
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((diff / (1000 * 60)) % 60);
        const seconds = Math.floor((diff / 1000) % 60);

        setCountdown({ days, hours, minutes, seconds });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex justify-center bg-black min-h-screen w-full">
      {/* Constrained container with background */}
      <div
        className="relative w-full max-w-md min-h-screen bg-cover bg-center flex flex-col items-center text-white max-w-[430px]"
        style={{ backgroundImage: "url(/bg/race-bg2.jpg)" }}
      >
        {/* Overlay (optional for readability) */}
        <div className="absolute inset-0 bg-black/20" />

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center w-full px-4 pt-6" style={{ marginTop: "15px" }}>
          {/* Logo */}
          <img
            src="/bg/Innerdrive-logo.png"
            alt="Innerdrive Logo"
            className="w-[90%] max-w-[320px] h-auto object-contain mb-6"
          />

          {/* Dates */}
          <div className="flex justify-center items-center gap-2 mt-2">
            {/* Start */}
            <div className="flex flex-col items-center justify-center rounded-[16px] bg-[#610B89] w-[70px] h-[70px]">
              <span
                className="font-sans text-[30px] leading-[110%] text-white"
                style={{ fontWeight: 700 }}
              >
                26
              </span>
              <span
                className="font-sans text-[18px] tracking-[0.04em] leading-[110%] text-white"
                style={{ fontWeight: 400 }}
              >
                SEP
              </span>
            </div>

            {/* Dash */}
            <span
              className="font-sans text-white"
              style={{ fontSize: "40px", fontWeight: 400, padding: "0 1 0px" }}
            >
              –
            </span>

            {/* End */}
            <div className="flex flex-col items-center justify-center rounded-[16px] bg-[#610B89] w-[70px] h-[70px]">
              <span
                className="font-sans text-[30px] leading-[100%] text-white"
                style={{ fontWeight: 700 }}
              >
                05
              </span>
              <span
                className="font-sans text-[18px] tracking-[0.04em] leading-[100%] text-white"
                style={{ fontWeight: 400 }}
              >
                OCT
              </span>
            </div>
          </div>
          {/* Race Number */}
          {/* Race Number Section */}
          <div
            className="relative flex flex-col items-center mt-10 text-center mt-10"
            style={{
              marginTop: "80px",
              marginBottom: "30px",
            }}
          >
            {/* === Race Number Block === */}
            <div className="relative flex flex-col items-center mt-10 ">
              {/* Blurred Rectangle */}
              <div
                className="absolute w-[200px] h-[140px] rounded-lg"
                style={{
                  backgroundColor: "#A700D1",
                  opacity: 0.39,
                  filter: "blur(25px)",
                  marginTop: -50,
                }}
              />

              {/* Text Content inside blur */}
              <div className="relative flex flex-col items-center mt-8 text-center">
                {/* Blurred Rectangle */}
                <div
                  className="absolute inset-0 rounded-lg px-6 py-4"
                  style={{
                    backgroundColor: "#A700D1",
                    opacity: 0.59,
                    filter: "blur(40px)",
                  }}
                />

                {/* Text Content */}
                <div className="relative z-10 flex flex-col items-center gap-1 " style={{ marginTop: "90px" }}>
                  {/* Upper Label */}
                  <p
                    className="uppercase"
                    style={{
                      fontSize: "11px",
                      fontWeight: 600,
                      letterSpacing: "0.1em",
                      margin: 0, // 🔑 remove spacing
                    }}
                  >
                    YOUR RACE NUMBER
                  </p>

                  {/* Main Number (DragRacing Font) */}
                  <h1
                    className="font-dragracing text-[#FF00FF]"
                    style={{
                      fontSize: "60px",
                      fontWeight: 400,
                      letterSpacing: "0",
                      margin: -18, // 🔑 remove spacing
                    }}
                  >
                    {raceNo}
                  </h1>
                </div>
              </div>
            </div>

            {/* === Separate Section Below === */}
            <div className="mt-02">
              <p
                className="uppercase"
                style={{
                  fontSize: "16px",
                  fontWeight: 600,
                  letterSpacing: "0.1em", // 7% spacing
                }}
              >
                THE REAL RACE
              </p>
              <p
                className="uppercase"
                style={{
                  fontSize: "16px",
                  fontWeight: 400,
                  letterSpacing: "0.1em",
                  margin: -22,
                }}
              >
                WITHIN STARTS IN
              </p>
            </div>
          </div>

          {!raceActive && (
            <>
              {/* Countdown Timer UI */}
              <div
                className="flex justify-center gap-8 mt-4 rounded-lg px-8 py-6 w-[90%] max-w-[280px]"
                style={{
                  backgroundColor: "rgba(57, 57, 57, 0.5)",
                  gap: "22px",
                  backdropFilter: "blur(1px)",
                  boxShadow: "0 0 4px rgba(0,0,0,0.45)",
                  padding: 10,
                  marginTop: 6,
                  borderRadius: 20,
                }}
              >
                <div className="flex flex-col items-center">
                  <span style={{ fontSize: 40, fontWeight: "500" }} className="leading-none">
                    {countdown.days}
                  </span>
                  <span
                    className="uppercase"
                    style={{ fontSize: 11, fontWeight: "400", letterSpacing: "0.1em" }}
                  >
                    DAYS
                  </span>
                </div>
                <div className="flex flex-col items-center">
                  <span style={{ fontSize: 40, fontWeight: "500" }} className="leading-none">
                    {countdown.hours.toString().padStart(2, "0")}
                  </span>
                  <span
                    className="uppercase"
                    style={{ fontSize: 11, fontWeight: "400", letterSpacing: "0.1em" }}
                  >
                    HOURS
                  </span>
                </div>
                <div className="flex flex-col items-center">
                  <span style={{ fontSize: 40, fontWeight: "500" }} className="leading-none">
                    {countdown.minutes.toString().padStart(2, "0")}
                  </span>
                  <span
                    className="uppercase"
                    style={{ fontSize: 11, fontWeight: "400", letterSpacing: "0.1em" }}
                  >
                    MINUTES
                  </span>
                </div>
                <div className="flex flex-col items-center">
                  <span style={{ fontSize: 40, fontWeight: "500" }} className="leading-none">
                    {countdown.seconds.toString().padStart(2, "0")}
                  </span>
                  <span
                    className="uppercase"
                    style={{ fontSize: 11, fontWeight: "400", letterSpacing: "0.05em" }}
                  >
                    SECONDS
                  </span>
                </div>
              </div>

              {/* Caption Text */}
              {raceStatus === "not_started" && (
                <p
                  className="text-center uppercase mt-2 max-w-[280px]"
                  style={{
                    fontFamily: "'Poppins', sans-serif",
                    fontWeight: 400,
                    fontSize: 11,
                    lineHeight: "134%",
                    letterSpacing: 0.4,
                  }}
                >
                  Your race link will be active on event days between 10 am to 10pm.
                  See you soon!
                </p>
              )}
            </>
          )}

          {/* START RACE button only shown when showStartButton is true */}
          {showStartButton ? (
            <div className="mt-4">
              <button
                onClick={() => router.push(`/race-shell/${raceNo}`)}
                className="font-dragracing"
                style={{
                  background: "rgba(128,0,255,0.4)",
                  color: "#FFFFFF",
                  fontSize: "32px",
                  fontWeight: 400,
                  letterSpacing: "0.02em",
                  padding: "20px 40px",
                  borderRadius: "20px",
                  border: "none",
                  cursor: "pointer",
                  width: "100%",
                  maxWidth: "336px",
                  height: "87px",
                 
                }}
              >
                START RACE
              </button>
            </div>
          ) : raceActive ? null : null}

          {raceStatus === "finished" ? (
            // Placeholder for finished race state
            null
          ) : null}
        </div>
      </div>
    </div>
  );
}