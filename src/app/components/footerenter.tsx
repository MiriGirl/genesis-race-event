"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";

type FooterEnterProps = {
  currentSector: number | null;
  onStart: () => void;
};

export default function FooterEnter({ currentSector, onStart }: FooterEnterProps) {
  // All sector code logic removed
  const handleStart = () => {
    onStart();
  };

  return (
    <>
      {/* Purple blur + text */}
      <div
        style={{
          position: "relative",
          textAlign: "center",
          marginTop: "16px",
          width: "100%",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            height: "50px",
            backgroundColor: "#A700D1",
            opacity: 0.79,
            filter: "blur(20px)",
            zIndex: 0,
          }}
        />
        <div
          style={{
            position: "relative",
            zIndex: 2,
            color: "#fff",
            padding: "14px 0",
            fontWeight: 600,
            fontSize: "14px",
            letterSpacing: "0.05em",
          }}
        >
          SELECT A SECTOR TO LEARN MORE
        </div>
      </div>

      {/* White card */}
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 50, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        style={{
          background: "#fff",
          borderTopLeftRadius: "44px",
          borderTopRightRadius: "44px",
          textAlign: "center",
          paddingBottom: "20px",
          position: "relative",
          zIndex: 1,
        }}
      >
        <p
          style={{
            fontWeight: 700,
            fontSize: "20px",
            paddingTop: "20px",
            marginBottom: "8px",
            color: "#000",
          }}
        >
          ENTER ANY SECTOR CODE
        </p>

      {/* Circles */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "10px",
          marginBottom: "20px",
        }}
      >
        {[0, 1, 2, 3].map((idx) => (
          <motion.div
            key={idx}
            style={{
              width: "60px",
              height: "60px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "50%",
              border: "2px solid #ccc",
              background: "#EAEAEA",
              fontSize: "28px",
              fontWeight: 700,
              color: "#777",
            }}
          >
            {"0"}
          </motion.div>
        ))}
      </div>

        {/* Start button */}
        <motion.button
          className="font-dragracing"
          onClick={handleStart}
          whileTap={{ scale: 0.95 }}
          whileHover={{ scale: 1.05 }}
          style={{
            width: "100%",
            maxWidth: "300px",
            height: "52px",
            background: "#000",
            color: "#fff",
            fontWeight: 600,
            fontSize: "26px",
            borderRadius: "48px",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
        >
          START
        </motion.button>
      </motion.div>
    </>
  );
}