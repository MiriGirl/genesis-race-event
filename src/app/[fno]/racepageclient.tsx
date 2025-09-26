"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RacePageClient({ fno }: { fno: string }) {
  const router = useRouter();

  const [countdown, setCountdown] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [raceActive, setRaceActive] = useState(false);

  useEffect(() => {
    async function checkRace() {
      try {
        const res = await fetch(`/api/check-race?fno=${fno}`);
        const data = await res.json();

        if (!data.exists) {
          // ❌ redirect to /error if race number not found
          router.replace("/error");
        }
      } catch (err) {
        console.error("Race check failed", err);
        router.replace("/error");
      }
    }

    checkRace();
  }, [fno, router]);

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

      // Helpful diagnostics while we stabilise
      if (process.env.NODE_ENV !== 'production') {
        console.log(
          `Device: ${new Date(nowMs).toString()} | ` +
            `SGT parts -> ${y}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')} ${String(hh).padStart(2,'0')}:${String(mm).padStart(2,'0')}:${String(ss).padStart(2,'0')} | ` +
            `open(10:00 SGT): ${new Date(openMs).toISOString()} | close(22:00 SGT): ${new Date(closeMs).toISOString()}`
        );
      }

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
                    {fno}
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

          {raceActive ? (
            <div className="mt-8">
              <button
                className="bg-[#A700D1] hover:bg-[#8a009f] text-white font-bold py-3 px-10 rounded-lg text-xl transition-colors"
                onClick={() => router.push(`/race-shell/${fno}`)}
              >
                START RACE
              </button>
            </div>
          ) : (
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
            </>
          )}
        </div>
      </div>
    </div>
  );
}