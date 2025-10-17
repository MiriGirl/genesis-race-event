"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import RegisterForm from "../components/registerform";

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function WishingWall() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showWishSheet, setShowWishSheet] = useState(false);
  // Hamburger menu open state
  const [menuOpen, setMenuOpen] = useState(false);

  // Wishes state, initially empty
  const [wishes, setWishes] = useState<any[]>([]);


  // Fetch live wishes from API
  useEffect(() => {
  async function fetchWishes() {
    try {
      const res = await fetch("/api/wishing-well", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to fetch wishes");
      const data = await res.json();
      const wishesArray = Array.isArray(data?.data)
        ? data.data
        : Array.isArray(data)
        ? data
        : [];
      setWishes([...wishesArray].reverse());
    } catch (err) {
      console.error("❌ Error fetching wishes:", err);
    }
  }

  // Initial fetch
  fetchWishes();

  // Supabase realtime listener
  const channel = supabase
    .channel("realtime:wishes")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "wishes" },
      (payload) => {
        console.log("📡 Realtime update:", payload);
        if (payload.eventType === "INSERT" && payload.new) {
          setWishes((prev) => [payload.new, ...prev]);
        } else if (payload.eventType === "DELETE" && payload.old) {
          setWishes((prev) => prev.filter((w) => w.id !== payload.old.id));
        } else if (payload.eventType === "UPDATE" && payload.new) {
          setWishes((prev) =>
            prev.map((w) => (w.id === payload.new.id ? payload.new : w))
          );
        }
      }
    )
    .subscribe();

  // Cleanup
  return () => {
    console.log("🧹 Cleaning up realtime listener");
    supabase.removeChannel(channel);
  };
}, []);

  // Auto-scroll to bottom as new wishes appear
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [wishes]);

  function timeAgo(dateString: string) {
    const now = new Date();
    const then = new Date(dateString);
    const diff = Math.floor((now.getTime() - then.getTime()) / 1000); // seconds
    if (diff < 60) return "just now";
    const mins = Math.floor(diff / 60);
    if (mins < 60) return `${mins} min${mins > 1 ? "s" : ""} ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    const days = Math.floor(hours / 24);
    return `${days} day${days > 1 ? "s" : ""} ago`;
  }

  return (
    <div
      style={{
        width: "100%",
        minHeight: "100vh",
        height: "100vh",
        backgroundColor: "black",
        overflow: "auto",
      }}
    >
      {/* Outer frame */}
      <div
        style={{
          width: "100%",
          minHeight: "100vh",
          backgroundImage: "url('/bg/wishing-well-bg.jpg')",
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center top",
          fontFamily: "'Playfair Display', serif",
          color: "white",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "flex-start",
        }}
      >
        {/* 1. Top Banner Container */}
        <div
          style={{
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            paddingTop: "2vh",
            zIndex: 1,
          }}
        >
          <img
            src="/bg/genesis-top.png"
            alt="Genesis Top"
            style={{
              width: "80%",
              maxWidth: "450px",
              zIndex: 1,
            }}
          />
        </div>

        {/* 2. Slider Container */}
        <div
          style={{
            width: "100%",
            overflow: "hidden",
            height: "20vh",
            maxHeight: "200px",
            zIndex: 1,
            marginTop: "2vh",
            maskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
            WebkitMaskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
          }}
        >
          <motion.div
            animate={{ x: ["0%", "-100%"] }}
            transition={{ duration: 30, ease: "linear", repeat: Infinity }}
            style={{
              display: "flex",
              width: "200%",
            }}
          >
            {["/bg/slider1.jpg", "/bg/slider2.jpg", "/bg/slider3.jpg", "/bg/slider4.jpg", "/bg/slider1.jpg"].map(
              (src, index) => (
                <img
                  key={index}
                  src={src}
                  alt={`slide-${index}`}
                  style={{
                    width: "25%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              )
            )}
          </motion.div>
        </div>

        {/* 3. Text & Button Container */}
        <div
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 10vw",
            marginTop: "4vh",
            zIndex: 2,
            maxWidth: "100%",
          }}
        >
          <div
            style={{
              textAlign: "left",
              color: "white",
              fontFamily: "'Playfair Display', serif",
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              justifyContent: "center",
              paddingRight: "2vw",
            }}
          >
            <h1
              style={{
                fontFamily: "'Playfair Display', serif",
                fontWeight: 700,
                fontSize: "clamp(36px, 3.8vw, 84px)",
                textAlign: "left",
                color: "white",
                margin: 0,
                lineHeight: "1.1em",
                letterSpacing: "1.5px",
                textShadow: "0 2px 8px rgba(0,0,0,0.38)",
                filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.25))",
                textTransform: "uppercase",
                marginTop: "2vh",
              }}
            >
              One Wish Can Spark a Thousand Lights
            </h1>
          </div>
          <div
            style={{
              position: "relative",
              width: "9vw",
              height: "10vw",
              minWidth: "100px",
              maxWidth: "160px",
              minHeight: "100px",
              maxHeight: "160px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              zIndex: 3,
              overflow: "visible",
              transform: "scale(1.05)",
            }}
          >
            {/* Rotating text circle, now wrapped around the donate button */}
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: "130%",
                height: "130%",
                pointerEvents: "none",
                overflow: "visible",
                zIndex: 3,
              }}
            >
              <svg
                viewBox="0 0 100 100"
                style={{
                  width: "100%",
                  height: "100%",
                  animation: "spin 52s linear infinite",
                  display: "block",
                }}
              >
                <path
                  id="circle"
                  d="M 50, 50 m -40, 0 a 40,40 0 1,1 80,0 a 40,40 0 1,1 -80,0"
                  fill="none"
                />
                <text fill="white" fontSize="8" fontWeight="bold">
                  <textPath href="#circle" startOffset="0%">
                    SUPPORT A CAUSE • SUPPORT A CAUSE • SUPPORT A CAUSE •
                  </textPath>
                </text>
              </svg>
            </div>
            {/* Donate button */}
            <div
              style={{
                width: "100%",
                height: "100%",
                borderRadius: "50%",
                backgroundColor: "black",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                transform: "rotate(-10deg)",
                boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
                cursor: "pointer",
                zIndex: 4,
              }}
            >
              <p
                style={{
                  textAlign: "center",
                  fontSize: "clamp(12px, 1.2vw, 16px)",
                  fontWeight: 700,
                  lineHeight: "1.1em",
                  color: "white",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  margin: 0,
                  fontFamily: "'Poppins', sans-serif",
                  fontVariant: "normal",
                  fontStyle: "normal",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                DONATE<br />NOW
              </p>
            </div>
          </div>
        </div>

        {/* 4. Live Feed Container */}
        <div
          style={{
            width: "90%",
            margin: "5vh auto",
            background: "rgba(255,255,255,0.45)",
            borderRadius: "20px",
            padding: "20px",
            boxShadow: "0 4px 24px rgba(0, 0, 0, 0.2)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "flex-start",
            zIndex: 2,
          }}
        >
          {/* Live Wish Feed Label */}
          <div
            style={{
              display: "inline-block",
              background: "black",
              padding: "8px 22px",
              borderRadius: "25px",
              fontSize: "clamp(12px, 1.2vw, 16px)",
              fontWeight: 600,
              fontFamily: "'Poppins', sans-serif",
              letterSpacing: "0.5px",
              zIndex: 3,
              marginBottom: "2vh",
              marginTop: "0",
            }}
          >
            LIVE WISH FEED
          </div>
          <div
            style={{
              fontFamily: "'Poppins', sans-serif",
              fontWeight: 500,
              fontSize: "clamp(14px, 1.2vw, 16px)",
              color: "rgba(255,255,255,0.9)",
              width: "100%",
              textAlign: "center",
              marginLeft: "0",
              marginRight: "auto",
              marginBottom: 15,
            }}
          >
            🌟 Take a moment to send a wish of hope.
          </div>
          {/* Scrollable wishes */}
          <div
            className="live-feed"
            style={{
              overflowY: "auto",
              flex: 1,
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: "1vw",
              paddingBottom: "10px",
              width: "100%",
              maxHeight: "40vh",
            }}
            ref={scrollRef}
          >
            {wishes.map((wish) => (
              <div
                key={wish.id}
                style={{
                  background: "#ffffff",
                  borderRadius: "12px",
                  padding: "10px",
                  fontFamily: "'Poppins', sans-serif",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "10px",
                }}
              >
                <img src="/bg/purple-heart.png" alt="heart" width={22} height={22} />
                <div>
                  <p
                    style={{
                      fontWeight: 700,
                      margin: 0,
                      fontSize: "clamp(12px, 1.2vw, 16px)",
                      color: "#000000",
                      lineHeight: 1.1,
                    }}
                  >
                    {wish.name}
                  </p>
                  <p
                    style={{
                      margin: 0,
                      fontSize: "clamp(12px, 1vw, 14px)",
                      fontWeight: 500,
                      color: "#696969",
                    }}
                  >
                    {timeAgo(wish.created_at)}
                  </p>
                  <p
                    style={{
                      marginTop: "5px",
                      fontSize: "clamp(12px, 1vw, 14px)",
                      lineHeight: "1.3em",
                      fontWeight: 400,
                      color: "#696969",
                    }}
                  >
                    {wish.message}
                  </p>
                </div>
              </div>
            ))}
          </div>
          {/* Add wish bar */}
          <div
            style={{
              flexShrink: 0,
              width: "95%",
              margin: "0 auto",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(255, 255, 255, 0.9)",
              borderRadius: "50px",
              padding: "12px 20px",
              cursor: "pointer",
              boxShadow: "0 -2px 8px rgba(0,0,0,0.2)",
              zIndex: 10,
              marginLeft: -10,
              marginTop: "18px",
            }}
            onClick={() => setShowWishSheet(true)}
          >
            <img
              src="/bg/purple-heart.png"
              alt="heart"
              width={22}
              height={22}
              style={{ marginRight: "10px" }}
            />
            <span
              style={{
                flex: 1,
                fontSize: "clamp(12px, 1.2vw, 16px)",
                fontWeight: 600,
                color: "#000",
                opacity: 0.9,
                fontFamily: "'Poppins', sans-serif",
              }}
            >
              Add your wish to the wishing well
            </span>
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                backgroundColor: "black",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <img src="/bg/send-icon.png" alt="send" width={16} height={16} />
            </div>
          </div>
        </div>

        {/* Footer - info bar */}
        <div
          style={{
            width: "90%",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontFamily: "'Poppins', sans-serif",
            fontSize: "18px",
            fontWeight: 400,
            color: "white",
            borderRadius: "50px",
            padding: "14px 24px",
            overflow: "hidden",
            zIndex: 3,
            margin: "0 auto 80px auto",
            position: "relative",
            background: "rgba(0,0,0,0.6)",
          }}
        >
          <img
            src="/bg/white-arrow.png"
            alt="arrow background"
            style={{
              position: "absolute",
              right: "0",
              bottom: "0",
              width: "230px",
              height: "auto",
              opacity: 0.5,
              zIndex: 0,
              pointerEvents: "none",
            }}
          />
          <div style={{ zIndex: 1, flex: 1, lineHeight: "1.1em" }}>
            <span style={{ fontWeight: 700 }}>LEARN MORE</span> ABOUT<br />
            WISHES, GIVING.SG, MEURAKI<br />AND DOWNLOAD THE APP
          </div>
        </div>
      </div>

      {/* 5. Hamburger Menu (fixed) */}
      <div
        style={{
          position: "fixed",
          bottom: "20px",
          right: "20px",
          zIndex: 999,
        }}
      >
        <div style={{ position: "relative", marginLeft: "16px", flexShrink: 0, zIndex: 5 }}>
          <AnimatePresence>
            {menuOpen && (
              <>
                <motion.a
                  key="wishes"
                  href="/wishing-well"
                  target="_blank"
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: -60 }}
                  exit={{ opacity: 0, y: 40 }}
                  transition={{ duration: 0.25 }}
                  style={{
                    position: "absolute",
                    bottom: "60px",
                    right: "0",
                    width: "48px",
                    height: "48px",
                    borderRadius: "50%",
                    backgroundColor: "#A700D1",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
                    zIndex: 999,
                  }}
                >
                  <img src="/bg/purple-heart.png" width={22} height={22} alt="Wishes" />
                </motion.a>

                <motion.a
                  key="meuraki"
                  href="https://meuraki.com"
                  target="_blank"
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: -120 }}
                  exit={{ opacity: 0, y: 40 }}
                  transition={{ duration: 0.3 }}
                  style={{
                    position: "absolute",
                    bottom: "60px",
                    right: "0",
                    width: "48px",
                    height: "48px",
                    borderRadius: "50%",
                    backgroundColor: "#FF00FF",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
                    zIndex: 999,
                  }}
                >
                  <img src="/bg/meuraki-logo.png" width={22} height={22} alt="Meuraki" />
                </motion.a>

                <motion.a
                  key="giving"
                  href="https://www.giving.sg"
                  target="_blank"
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: -180 }}
                  exit={{ opacity: 0, y: 40 }}
                  transition={{ duration: 0.35 }}
                  style={{
                    position: "absolute",
                    bottom: "60px",
                    right: "0",
                    width: "48px",
                    height: "48px",
                    borderRadius: "50%",
                    backgroundColor: "#610B89",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
                    zIndex: 999,
                  }}
                >
                  <img src="/bg/donate.png" width={22} height={22} alt="Donate" />
                </motion.a>
              </>
            )}
          </AnimatePresence>

          <motion.button
            onClick={() => setMenuOpen(!menuOpen)}
            style={{
              width: "55px",
              height: "55px",
              borderRadius: "50%",
              backgroundColor: "white",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              cursor: "pointer",
              boxShadow: "0 4px 8px rgba(0,0,0,0.25)",
              border: "none",
              zIndex: 999,
            }}
            animate={{ rotate: menuOpen ? 180 : 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
          >
            <img
              src={menuOpen ? "/bg/close-icon.png" : "/bg/hamburger-menu.png"}
              width={25}
              height={25}
              alt="Menu"
            />
          </motion.button>
        </div>
      </div>

      {showWishSheet && (
        <RegisterForm onClose={() => setShowWishSheet(false)} />
      )}

      <style jsx>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        @media (min-width: 1024px) {
          h1 {
            font-size: clamp(32px, 4vw, 60px) !important;
          }
          .live-feed {
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)) !important;
            gap: 1.5vw !important;
          }
        }
      `}</style>
    </div>
  );
}