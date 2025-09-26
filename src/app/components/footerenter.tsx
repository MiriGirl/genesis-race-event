"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import EnterCode from "./entercode";

type FooterEnterProps = {
  currentSector: number | null;
  onStart: () => void;
  raceNo: string;
  participantId: string;
  stationId: string;
  bib: string;
  accessCode: string;
  onCodeSubmit: () => void;
};

export default function FooterEnter({
  currentSector,
  onStart,
  raceNo,
  participantId,
  stationId,
  bib,
  accessCode,
  onCodeSubmit,
}: FooterEnterProps) {
  const [showEnterCode, setShowEnterCode] = useState(false);

  const handleStart = () => {
    setShowEnterCode(true);
  };

  if (showEnterCode) {
    return (
      <EnterCode
        isOpen={showEnterCode}
        onClose={() => setShowEnterCode(false)}
        onSubmit={(code) => {
          console.log("submitted code", code);
          setShowEnterCode(false);
          onCodeSubmit();
        }}
        currentSector={currentSector ?? 1}
        raceNo={raceNo}
        participantId={participantId}
        stationId={stationId}
        bib={bib}
        accessCode={accessCode}
      />
    );
  }

  return (
    <>
      {/* Purple blur + text */}
      <div
        style={{
          position: "relative",
          textAlign: "center",
          marginTop: "0px",
          width: "100%",
        }}
      >
        
      </div>

      {/* White card */}
      <motion.div
        onClick={handleStart}
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
          paddingTop: 10,
          position: "relative",
          zIndex: 1,
         
        }}
      >
        <p
          style={{
            fontWeight: 700,
            fontSize: "20px",
            paddingTop: "0px",
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