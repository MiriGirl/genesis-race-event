"use client";
import React, { useState, useEffect } from "react";

interface EnterCodeProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (code: string) => void;
}

export default function EnterCode({ isOpen, onClose, onSubmit }: EnterCodeProps) {
  const [digits, setDigits] = useState(["", "", "", ""]);

  const handleChange = (value: string, index: number) => {
    if (/^[0-9a-zA-Z]?$/.test(value)) {
      const newDigits = [...digits];
      newDigits[index] = value.toUpperCase();
      setDigits(newDigits);

      // auto focus next input
      if (value && index < digits.length - 1) {
        const nextInput = document.getElementById(`digit-${index + 1}`);
        nextInput?.focus();
      }
    }
  };

  useEffect(() => {
    if (isOpen) {
      const firstInput = document.getElementById("digit-0") as HTMLInputElement;
      firstInput?.focus(); // ensures focus also when reopening
    }
  }, [isOpen]);

  const handleSubmit = () => {
    const code = digits.join("");
    if (code.trim()) {
      onSubmit(code);
      setDigits(["", "", "", ""]);
      onClose();
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: isOpen ? "rgba(0,0,0,0.5)" : "transparent",
        display: isOpen ? "flex" : "none",
        justifyContent: "center",
        alignItems: "flex-end",
        zIndex: 1000,
        transition: "background-color 0.3s ease",
      }}
      onClick={onClose}
    >
      {/* ✅ Close button (white circle with black X) */}
      <button
        onClick={onClose}
        style={{
          position: "absolute",
          top: "50%", // middle vertically relative to the overlay
          transform: "translateY(-120%)", // floats above the sheet
          background: "#fff",
          border: "none",
          borderRadius: "50%",
          width: "44px",
          height: "44px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "20px",
          fontWeight: "bold",
          color: "#000",
          cursor: "pointer",
          zIndex: 1001,
          boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
        }}
      >
        ✕
      </button>

      {/* Bottom sheet card */}
      <div
        style={{
          minWidth: "320px",
          maxWidth: "430px",
          margin: "0 auto",
          background: "#fff",
          borderTopLeftRadius: "40px",
          borderTopRightRadius: "40px",
          padding: "20px",
          boxShadow: "0 -4px 20px rgba(0,0,0,0.3)",
          transform: isOpen ? "translateY(0)" : "translateY(100%)",
          transition: "transform 0.35s ease",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Title */}
        <h2
          style={{
            fontSize: "24px",
            fontWeight: 700,
            marginBottom: "20px",
            textAlign: "center",
            color: "#000",
          }}
        >
          HOW YOUR RACE WORKS
        </h2>

        {/* Steps */}
        <ol style={{ margin: "0 0 24px 0", padding: 0, listStyle: "none" }}>
          <li
            style={{
              display: "flex",
              fontSize: "15px",
              fontWeight: 300,
              alignItems: "flex-start",
              marginBottom: "12px",
              color: "#000",
            }}
          >
            <span
              style={{
                width: "28px",
                height: "28px",
                borderRadius: "50%",
                background: "#000",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "14px",
                marginRight: "12px",
                flexShrink: 0,
              }}
            >
              1
            </span>
            No need to race in order.
          </li>
          <li
            style={{
              display: "flex",
              fontWeight: 300,
              fontSize: "15px",
              alignItems: "flex-start",
              marginBottom: "12px",
              color: "#000",
            }}
          >
            <span
              style={{
                width: "28px",
                height: "28px",
                borderRadius: "50%",
                background: "#000",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "14px",
                marginRight: "12px",
                flexShrink: 0,
              }}
            >
              2
            </span>
            Pick any open sector, grab the code from a pit crew member, and race
            to complete it at top speed to earn your badge.
          </li>
          <li
            style={{
              display: "flex",
              fontSize: "15px",
              alignItems: "flex-start",
              color: "#000",
              fontWeight: 300,
            }}
          >
            <span
              style={{
                width: "28px",
                height: "28px",
                borderRadius: "50%",
                background: "#000",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "14px",
                marginRight: "12px",
                flexShrink: 0,
              }}
            >
              3
            </span>
            Your total sector times will be added up — the fastest overall earns
            the top spot on the leaderboard. 🏁
          </li>
        </ol>

        {/* Code input */}
        <h3
          style={{
            textAlign: "center",
            fontSize: "18px",
            fontWeight: 700,
            marginBottom: "16px",
            color: "#000",
          }}
        >
          ENTER ANY SECTOR CODE
        </h3>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "16px",
            marginBottom: "24px",
          }}
        >
          {digits.map((digit, index) => (
            <input
              key={index}
              id={`digit-${index}`}
              type="text"
              value={digit}
              maxLength={1}
              onChange={(e) => handleChange(e.target.value, index)}
              inputMode="text"
              autoFocus={index === 0}
              style={{
                width: "64px",
                height: "64px",
                borderRadius: "50%",
                background: "#fff",
                border: "2px solid #C7C7C7",
                fontSize: "24px",
                fontWeight: 700,
                textAlign: "center",
                color: "#000",
                outline: "none",
                boxShadow: digit
                  ? "0 0 0 3px rgba(141, 12, 233, 1)" // purple glow when filled
                  : "none",
                transition: "all 0.2s ease",
              }}
            />
          ))}
        </div>

        {/* Start button */}
        <button
          className="font-dragracing"
          onClick={handleSubmit}
          style={{
            width: "100%",
            height: "56px",
            background: "#6B00B6",
            color: "#fff",
            border: "none",
            borderRadius: "32px",
            fontSize: "20px",
            fontWeight: 700,
            letterSpacing: "1px",
            cursor: "pointer",
            fontFamily: "sans-serif",
          }}
        >
          START
        </button>
      </div>
    </div>
  );
}