"use client";
import React from "react";


type FooterEnterProps = {
  onStart: () => void;
};

export default function FooterEnter({ onStart }: FooterEnterProps) {
  return (
    
    <div
      style={{
        background: "#fff",
        borderTopLeftRadius: "44px",
        borderTopRightRadius: "44px",
        textAlign: "center",
        paddingBottom: "20px",
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
        {[0, 0, 0, 0].map((digit, idx) => (
          <div
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
            {digit}
          </div>
        ))}
      </div>

      {/* Start button */}
      <button
        className="font-dragracing"
        onClick={onStart}
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
      </button>
    </div>
  );
}