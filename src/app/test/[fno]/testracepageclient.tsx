"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RacePageClient({ fno }: { fno: string }) {
  const router = useRouter();

  const EVENT_START = new Date("2025-09-26T10:00:00+08:00");
  const EVENT_END = new Date("2025-10-05T22:00:00+08:00");

  // 🔑 Force state for testing (null for real flow)
  const FORCE_STATE: "before" | "open" | "closed" | "after" | null = null ;

  const [hydrated, setHydrated] = useState(false);
  const [countdown, setCountdown] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [eventState, setEventState] = useState<
    "before" | "open" | "closed" | "after"
  >("before");

  useEffect(() => setHydrated(true), []);

  // ✅ Check if race number exists
  useEffect(() => {
    async function checkRace() {
      try {
        const res = await fetch(`/api/check-race?fno=${fno}`);
        const data = await res.json();

        if (!data.exists) {
          router.replace("/error");
        }
      } catch (err) {
        console.error("Race check failed", err);
        router.replace("/error");
      }
    }

    if (hydrated) checkRace();
  }, [hydrated, fno, router]);

  // ✅ Convert device time → SGT
  function getNowSGT(): Date {
    const now = new Date();
    const utc = now.getTime() + now.getTimezoneOffset() * 60000;
    return new Date(utc + 8 * 60 * 60000);
  }

  function calcCountdown(diff: number) {
    return {
      days: Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24))),
      hours: Math.max(0, Math.floor((diff / (1000 * 60 * 60)) % 24)),
      minutes: Math.max(0, Math.floor((diff / (1000 * 60)) % 60)),
      seconds: Math.max(0, Math.floor((diff / 1000) % 60)),
    };
  }

  // ✅ Timer + state logic
  useEffect(() => {
    if (!hydrated) return;

    const interval = setInterval(() => {
      const nowSGT = getNowSGT();

      // --- Force testing ---
      if (FORCE_STATE) {
        setEventState(FORCE_STATE);

        if (FORCE_STATE === "before") {
          const diff = EVENT_START.getTime() - nowSGT.getTime();
          setCountdown(calcCountdown(diff));
        }
        if (FORCE_STATE === "closed") {
          const nextOpen = new Date(nowSGT);
          if (nextOpen.getHours() >= 22) nextOpen.setDate(nextOpen.getDate() + 1);
          nextOpen.setHours(10, 0, 0, 0);
          setCountdown(calcCountdown(nextOpen.getTime() - nowSGT.getTime()));
        }
        return;
      }

      // --- Real flow ---
      let state: "before" | "open" | "closed" | "after" = "before";

      if (nowSGT < EVENT_START) {
        state = "before";
        setCountdown(calcCountdown(EVENT_START.getTime() - nowSGT.getTime()));
      } else if (nowSGT >= EVENT_START && nowSGT <= EVENT_END) {
        const h = nowSGT.getHours();
        if (h >= 10 && h < 22) {
          state = "open";
        } else {
          state = "closed";
          const nextOpen = new Date(nowSGT);
          if (h >= 22) nextOpen.setDate(nextOpen.getDate() + 1);
          nextOpen.setHours(10, 0, 0, 0);
          if (nextOpen > EVENT_END) {
            state = "after";
          } else {
            setCountdown(calcCountdown(nextOpen.getTime() - nowSGT.getTime()));
          }
        }
      } else {
        state = "after";
      }

      setEventState(state);
    }, 1000);

    return () => clearInterval(interval);
  }, [hydrated]);

  if (!hydrated) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-black text-white">
        Loading race page...
      </div>
    );
  }

  return (
    <div className="flex justify-center bg-black min-h-screen w-full">
      {/* Constrained container with background */}
      <div
        className="relative w-full max-w-md min-h-screen bg-cover bg-center flex flex-col items-center text-white max-w-[400px]"
        style={{ backgroundImage: "url(/bg/race-bg2.jpg)" }}
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/20" />

        {/* Content */}
        <div
          className="relative z-10 flex flex-col items-center w-full px-4 pt-6"
          style={{ marginTop: "15px" }}
        >
          {/* Logo */}
          <img
            src="/bg/Innerdrive-logo.png"
            alt="Innerdrive Logo"
            className="w-[90%] max-w-[320px] h-auto object-contain mb-6"
          />

          {/* Dates */}
          <div className="flex justify-center items-center gap-2 mt-2">
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
            <span
              className="font-sans text-white"
              style={{ fontSize: "40px", fontWeight: 400, padding: "0 1 0px" }}
            >
              –
            </span>
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
          <div
            className="relative flex flex-col items-center mt-10 text-center mt-10"
            style={{
              marginTop: "30px",
              marginBottom: "0",
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
                  marginTop: 20,
                }}
              />

              {/* Inner Blur */}
              <div
                className="absolute inset-0 rounded-lg px-6 py-4"
                style={{
                  backgroundColor: "#A700D1",
                  opacity: 0.59,
                  filter: "blur(40px)",
                }}
              />

              {/* Text Content */}
              <div
                className="relative z-10 flex flex-col items-center gap-1 "
                style={{ marginTop: "90px" }}
              >
                <p
                  className="uppercase"
                  style={{
                    fontSize: "16px",
                    fontWeight: 600,
                    letterSpacing: "0.1em",
                    margin: 0,
                  }}
                >
                  YOUR RACE NUMBER
                </p>

                <h1
                  className="font-dragracing text-[#FF00FF]"
                  style={{
                    fontSize: "60px",
                    fontWeight: 400,
                    letterSpacing: "0",
                    margin: -10,
                  }}
                >
                  {fno}
                </h1>
              </div>
            </div>
          </div>

          {/* === Event States === */}
          {eventState === "before" && (
            <>
              <div className="mt-02">
    <p
      className="uppercase items-center text-center"
      style={{
        fontSize: "16px",
        fontWeight: 600,
        letterSpacing: "0.1em", // 7% spacing
        
      }}
    >
      THE REAL RACE 
      
    </p>
    <p
      className="uppercase items-center text-center"
      style={{
        fontSize: "16px",
        fontWeight: 400,
        letterSpacing: "0.1em",
        marginTop: -22,
      }}
    >
 WITHIN STARTS IN
    </p>
  </div>
              <CountdownBox countdown={countdown} showDays />
              <p
                className="text-center uppercase mt-2 max-w-[320px]"
                style={{
                  fontFamily: "'Poppins', sans-serif",
                  fontWeight: 400,
                  fontSize: 12,
                  lineHeight: "134%",
                  letterSpacing: 0.4,
                  marginTop: 14,
                }}
              >
                Your race link will be active on event days between 10 am to 10pm.
                See you soon!
              </p>
            </>
          )}

          {eventState === "open" && (
            <div className="flex flex-col items-center mt-8">
              <p
      className="uppercase items-center text-center"
      style={{
        fontSize: "16px",
        fontWeight: 600,
        letterSpacing: "0.1em", // 7% spacing
        
      }}
    >
      THE REAL RACE 
      
    </p>
    <p
      className="uppercase items-center text-center"
      style={{
        fontSize: "16px",
        fontWeight: 400,
        letterSpacing: "0.1em",
        marginTop: -22,
      }}
    >
 WITHIN IS LIVE
    </p>
              <button
                className="relative font-dragracing text-[40px] leading-[130%] font-normal text-white px-12 py-6 rounded-3xl border shadow-lg hover:scale-105 transition-transform text-center"
                style={{
                  height: "100px",
                  borderRadius: 15,
                  width: "320px",
                  color: "rgba(255,255,255,0.87)",
                  WebkitTextStroke: "1px rgba(167,0,209,0.59)",
                  backgroundColor: "rgba(128,0,255,0.4)",
                  backgroundImage:
                    "linear-gradient(to right, rgba(0,0,255,0.04), rgba(0,0,255,0.04))",
                  // borderColor: "rgba(167,0,209,0.59)",
                }}
              >
                START RACE
              </button>
            </div>
          )}

          {eventState === "closed" && (
            <div className="flex flex-col items-center mt-8">
              <div className="mt-2">
                <p
      className="uppercase items-center text-center"
      style={{
        fontSize: "16px",
        fontWeight: 600,
        letterSpacing: "0.1em", // 7% spacing
        
      }}
    >
      THE REAL RACE WITHIN
      
    </p>
    <p
      className="uppercase items-center text-center"
      style={{
        fontSize: "16px",
        fontWeight: 400,
        letterSpacing: "0.1em",
        marginTop: -22,
      }}
    >
IS CLOSED RIGHT NOW
    </p>
              </div>
              <CountdownBox countdown={countdown} showDays={false} />
              <p
                className="text-center uppercase mt-2 max-w-[320px]"
                style={{
                  fontFamily: "'Poppins', sans-serif",
                  fontWeight: 400,
                  fontSize: 13,
                  lineHeight: "134%",
                  letterSpacing: 0.4,
                  marginTop: 20,
                }}
              >
               Your race link will be active on event days between 10 am to 10pm. See you soon!

              </p>
            </div>
          )}

          {eventState === "after" && (
            <div className="flex flex-col items-center mt-8">
              <div className="mt-02">
                <p
                  className="uppercase"
                  style={{
                    fontSize: "18px",
                    fontWeight: 600,
                    letterSpacing: "0.1em",
                    marginTop: 40,
                  }}
                >
                  THE RACE HAS ENDED
                </p>
              </div>
              <p
                className="text-center uppercase mt-2 max-w-[320px]"
                style={{
                  fontFamily: "'Poppins', sans-serif",
                  fontWeight: 400,
                  fontSize: 13,
                  lineHeight: "134%",
                  letterSpacing: 0.4,
                  marginTop: -2,
                }}
              >
                Thank you for participating!
                <br />
                See you at the next year.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function CountdownBox({
  countdown,
  showDays = true,
}: {
  countdown: { days: number; hours: number; minutes: number; seconds: number };
  showDays?: boolean;
}) {
  return (
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
      {showDays && (
        <div className="flex flex-col items-center">
          <span
            style={{ fontSize: 40, fontWeight: "500" }}
            className="leading-none"
          >
            {countdown.days}
          </span>
          <span
            className="uppercase"
            style={{
              fontSize: 11,
              fontWeight: "400",
              letterSpacing: "0.1em",
            }}
          >
            DAYS
          </span>
        </div>
      )}
      <div className="flex flex-col items-center">
        <span
          style={{ fontSize: 40, fontWeight: "500" }}
          className="leading-none"
        >
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
        <span
          style={{ fontSize: 40, fontWeight: "500" }}
          className="leading-none"
        >
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
        <span
          style={{ fontSize: 40, fontWeight: "500" }}
          className="leading-none"
        >
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
  );
}