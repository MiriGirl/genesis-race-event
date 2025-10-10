"use client";

import { useEffect, useState, useRef } from "react";

export default function WishingWall() {
  const scrollRef = useRef<HTMLDivElement>(null);

  // 🧩 Dummy wishes (replace with DB later)
  const [wishes, setWishes] = useState<any[]>([
    {
      id: 1,
      name: "Miriam Kumar",
      message:
        "Wishing for a weekend filled with sunshine, laughter and great vibes at Genesis 🌞",
      created_at: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
    },
    {
      id: 2,
      name: "Peaceful Camper",
      message:
        "May everyone at the festival find a moment of calm and connection 💜",
      created_at: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
    },
    {
      id: 3,
      name: "Miriam Kumar",
      message:
        "Here’s to supporting wellness, music and mindful play at Meuraki!",
      created_at: new Date(Date.now() - 1000 * 60 * 6).toISOString(),
    },
    {
      id: 4,
      name: "Peaceful Camper",
      message:
        "Wishing every soul peace, light and joy during Genesis Festival 🌺",
      created_at: new Date(Date.now() - 1000 * 60 * 4).toISOString(),
    },
  ]);

  // 🌀 Simulate new wishes coming in
  useEffect(() => {
    const interval = setInterval(() => {
      setWishes((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          name: "Anonymous Dreamer",
          message: `A new wish appeared ✨ ${prev.length + 1}`,
          created_at: new Date().toISOString(),
        },
      ]);
    }, 8000);
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
        height: "100vh",
        backgroundColor: "black",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden",
      }}
    >
      {/* Outer frame */}
      <div
        style={{
          width: "100%",
          maxWidth: "550px",
          height: "100%",
          backgroundImage: "url('/bg/background-genesis.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          position: "relative",
          fontFamily: "'Playfair Display', serif",
          color: "white",
          overflow: "hidden",
        }}
      >
        {/* Top banner */}
        <img
          src="/bg/genesis-top.png"
          alt="Genesis Top"
          style={{
            position: "absolute",
            top: 0,
            left: "50%",
            transform: "translateX(-50%)",
            width: "90%",
            maxWidth: "550px",
            zIndex: 1,
          }}
        />

        {/* Top Text Overlay */}
        <div
          style={{
            position: "absolute",
            top: "120px",
            left: "50%",
            transform: "translateX(-50%)",
            textAlign: "center",
            color: "white",
            zIndex: 2,
            width: "100%",
            fontFamily: "'Playfair Display', serif",
          }}
        >
          <h1
            style={{
              fontSize: "36px",
              fontWeight: 700,
              letterSpacing: "1px",
              margin: 0,
              lineHeight: "1.2em",
              textShadow: "0 2px 4px rgba(0,0,0,0.4)",
            }}
          >
            WRITE YOUR WISH<br />& DONATE
          </h1>
        </div>

        {/* Donate button */}
        <div
          style={{
            position: "absolute",
            top: "80px",
            right: "40px",
            width: "110px",
            height: "110px",
            borderRadius: "50%",
            backgroundColor: "black",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            fontWeight: "bold",
            zIndex: 3,
            cursor: "pointer",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: "50%",
             
            }}
          ></div>
          <p
            style={{
              textAlign: "center",
              fontSize: "13px",
              fontWeight: 700,
            }}
          >
            DONATE<br />NOW
          </p>
        </div>

        {/* Rotating text circle */}
        <div
          style={{
            position: "absolute",
            top: "80px",
            right: "40px",
            width: "110px",
            height: "110px",
            borderRadius: "50%",
            animation: "spin 12s linear infinite",
            pointerEvents: "none",
          }}
        >
          <svg viewBox="0 0 100 100" style={{ width: "100%", height: "100%" }}>
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

        {/* Live Wish Feed Label */}
        <div
          style={{
            position: "absolute",
            top: "260px",
            left: "50%",
            transform: "translateX(-50%)",
            display: "inline-block",
            background: "black",
            padding: "8px 22px",
            borderRadius: "25px",
            fontSize: "15px",
            fontWeight: 600,
            fontFamily: "'Poppins', sans-serif",
            letterSpacing: "0.5px",
            zIndex: 3,
          }}
        >
          LIVE WISH FEED
        </div>

        {/* Live feed */}
        <div
          style={{
            position: "absolute",
            top: "300px",
            left: "50%",
            transform: "translateX(-50%)",
            width: "90%",
            height: "45%",
            background: "rgba(255,255,255,0.1)",
            borderRadius: "20px",
            overflowY: "auto",
            padding: "1rem",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "12px",
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
              <img
                src="/bg/purple-heart.png"
                alt="heart"
                width={22}
                height={22}
              />
              <div>
                <p
                  style={{
                    fontWeight: 700,
                    margin: 0,
                    fontSize: "14px",
                     color: "#000000",
                     lineHeight: 1.1,
                  }}
                >
                  {wish.name}
                </p>
                <p
                  style={{
                    margin: 0,
                    fontSize: "12px",
                    fontWeight: 500,
                    color: "#696969",
                  }}
                >
                  {timeAgo(wish.created_at)}
                </p>
                <p
                  style={{
                    marginTop: "5px",
                    fontSize: "13px",
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
            position: "absolute",
            bottom: "70px",
            left: "50%",
            transform: "translateX(-50%)",
            width: "90%",
            display: "flex",
            alignItems: "center",
            background: "rgba(255,255,255,0.15)",
            borderRadius: "50px",
            padding: "10px 20px",
            cursor: "pointer",
          }}
          onClick={() => alert("Popup to send your wish coming soon!")}
        >
          <img
            src="/bg/purple-heart.png"
            alt="heart"
            width={22}
            height={22}
            style={{ marginRight: "10px" }}
          />
          <span style={{ flex: 1, fontSize: "14px", opacity: 0.8 }}>
            Add your wish to the wishing well
          </span>
          <img src="/bg/plus-icon.png" alt="plus" width={22} height={22} />
        </div>

        {/* Footer */}
        <div
          style={{
            position: "absolute",
            bottom: "10px",
            left: "50%",
            transform: "translateX(-50%)",
            width: "90%",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: "13px",
            fontWeight: 600,
          }}
        >
          <p style={{ color: "white", margin: 0 }}>
            LEARN MORE ABOUT WISHES, GIVING.SG, MEURAKI AND DOWNLOAD THE APP
          </p>
          <div style={{ display: "flex", gap: "10px" }}>
            <img src="/bg/white-arrow.png" width={20} height={20} alt="arrow" />
            <img
              src="/bg/hamburger-menu.png"
              width={22}
              height={22}
              alt="menu"
            />
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}