"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import RegisterForm from "../components/registerform";

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
        const wishesArray = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
        setWishes([...wishesArray].reverse());
      } catch (err) {
        console.error("❌ Error fetching wishes:", err);
      }
    }

    fetchWishes();
    const interval = setInterval(fetchWishes, 8000);
    return () => clearInterval(interval);
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
        maxWidth: "900px",
        margin: "0 auto",
        minHeight: "100%",
        background: "transparent",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 20px",
        boxSizing: "border-box",
      }}
    >
      {/* Wrapper for pill and container */}
      <div style={{
        position: "relative",
        width: "90%",
        maxWidth: "800px",
        margin: "0 auto",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}>
        {/* Live Wish Feed Label */}
        <div
          style={{
            position: "absolute",
            top: "-35px",
            left: "50%",
            transform: "translateX(-50%)",
            background: "black",
            color: "white",
            padding: "15px 47px",
            borderRadius: "25px",
            fontSize: "clamp(12px, 1.2vw, 16px)",
            fontWeight: 600,
            fontFamily: "'Poppins', sans-serif",
            letterSpacing: "0.5px",
            zIndex: 5,
            boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
          }}
        >
          LIVE WISH FEED
        </div>
        {/* Live Feed Container ONLY */}
        <div
          className="feed-container"
          style={{
            width: "100%",
            maxWidth: "800px",
            margin: "0 auto",
            background: "rgba(255,255,255,0.45)",
            borderRadius: "20px",
            paddingTop: "40px",
            padding: "20px",
            paddingBottom: "60px",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.25)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "flex-start",
            zIndex: 2,
            position: "relative",
          }}
        >
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
          {/* Add wish bar wrapper */}
          <div style={{ position: "relative", width: "100%", display: "flex", justifyContent: "center" }}>
            <div
              style={{
                flexShrink: 0,
                width: "95%",
                position: "absolute",
                bottom: "-77px",
                left: "50%",
                transform: "translateX(-50%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "rgba(255, 255, 255, 0.95)",
                borderRadius: "50px",
                padding: "12px 20px",
                cursor: "pointer",
                animation: "glowPulse 2s ease-in-out infinite",
                boxShadow: "0 0 25px rgba(255, 20, 147, 0.7), 0 0 50px rgba(255, 105, 180, 0.5)",
                transition: "box-shadow 0.3s ease-in-out",
                zIndex: 5,
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
                  fontSize: "clamp(15px, 1.2vw, 16px)",
                  fontWeight: 600,
                  color: "#000",
                  opacity: 0.9,
                  fontFamily: "'Poppins', sans-serif",
                  textTransform: "uppercase",
                }}
              > write your wish here
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
        </div>
      </div>
      {showWishSheet && (
        <div
          style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            backgroundColor: "rgba(0, 0, 0, 0.6)",
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            borderRadius: "30px",
            overflow: "hidden",
          }}
          onClick={() => setShowWishSheet(false)}
        >
          <div
            style={{
              position: "relative",
              background: "white",
              borderRadius: "30px",
              padding: "35px",
              maxWidth: "500px",
              width: "90%",
              boxShadow: "0 8px 25px rgba(0,0,0,0.4)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <RegisterForm onClose={() => setShowWishSheet(false)} />
          </div>
        </div>
      )}
      <style jsx>{`
        html, body {
          overflow: hidden;
          margin: 0;
          padding: 0;
          background: transparent;
        }
        .live-feed {
          grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
          gap: 1vw;
        }
        @media (min-width: 768px) {
          .live-feed {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        @media (min-width: 1024px) {
          .live-feed {
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)) !important;
            gap: 1.5vw !important;
          }
        }
        @keyframes glowPulse {
          0% {
            box-shadow: 0 0 20px rgba(255, 20, 147, 0.4), 0 0 40px rgba(255, 105, 180, 0.3);
          }
          50% {
            box-shadow: 0 0 35px rgba(255, 20, 147, 0.8), 0 0 70px rgba(255, 105, 180, 0.6);
          }
          100% {
            box-shadow: 0 0 20px rgba(255, 20, 147, 0.4), 0 0 40px rgba(255, 105, 180, 0.3);
          }
        }
        @media (max-width: 768px) {
          .feed-container {
            width: 95% !important;
            margin: 0 auto !important;
          }
        }
      `}</style>
    </div>
  );
}