"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface FooterTimerProps {
  isOpen: boolean;
  onFinish: () => void;
}

export default function FooterTimer({ isOpen, onFinish }: FooterTimerProps) {
  const [time, setTime] = useState(0);

  // Timer increments every second
  useEffect(() => {
    if (!isOpen) return;
    setTime(0); // reset when opened
    const interval = setInterval(() => {
      setTime((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen]);

  // Format as MM:SS
  const formatTime = (t: number) => {
    const minutes = Math.floor(t / 60).toString().padStart(2, "0");
    const seconds = (t % 60).toString().padStart(2, "0");
    return `${minutes}:${seconds}`;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="footer-timer"
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "100%", opacity: 0 }}
          transition={{ type: "spring", stiffness: 120, damping: 18 }}
          style={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            minWidth: "320px",
            maxWidth: "430px",
            margin: "0 auto",
            background: "#000",
            borderTopLeftRadius: "40px",
            borderTopRightRadius: "40px",
            padding: "28px 20px",
            boxShadow: "0 -4px 20px rgba(0,0,0,0.4)",
            color: "#fff",
            textAlign: "center",
            zIndex: 1000,
          }}
        >
          {/* Sector Text */}
          <motion.h3
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            style={{ fontSize: "14px", fontWeight: 500, margin: "0 0 4px 0" }}
          >
            YOU ARE AT
          </motion.h3>
          <motion.h2
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            style={{ fontSize: "28px", fontWeight: 800, margin: "0 0 20px 0" }}
          >
            SECTOR 3
          </motion.h2>

          {/* Circular Timer */}
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
            style={{
              width: "140px",
              height: "140px",
              borderRadius: "50%",
              border: "10px solid #6B00B6",
              margin: "0 auto 24px auto",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "28px",
              fontWeight: 700,
              color: "#fff",
              background: "radial-gradient(circle, rgba(107,0,182,0.3) 0%, transparent 70%)",
              boxShadow: "0 0 20px rgba(107,0,182,0.6)",
            }}
          >
            {formatTime(time)}
          </motion.div>

          {/* Finish Button */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onFinish}
            style={{
              width: "100%",
              padding: "16px",
              borderRadius: "50px",
              border: "none",
              fontSize: "18px",
              fontWeight: 700,
              background: "#8A2BE2",
              color: "#fff",
              cursor: "pointer",
              textTransform: "uppercase",
              fontFamily: "inherit",
              boxShadow: "0 0 25px rgba(138,43,226,0.6)",
            }}
          >
            Finish
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}