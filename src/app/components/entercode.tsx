"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface EnterCodeProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (code: string) => void;
}

export default function EnterCode({ isOpen, onClose, onSubmit }: EnterCodeProps) {
  const [digits, setDigits] = useState(["", "", "", ""]);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const [error, setError] = useState(false);

  const handleChange = (value: string, index: number) => {
    if (/^[0-9a-zA-Z]?$/.test(value)) {
      const newDigits = [...digits];
      newDigits[index] = value.toUpperCase();
      setDigits(newDigits);

      // auto focus next box
      if (value && index < digits.length - 1) {
        const nextInput = document.getElementById(`digit-${index + 1}`);
        nextInput?.focus();
      }

      // auto-verify when last digit is filled
      if (index === digits.length - 1 && value) {
        const code = newDigits.join("");
        if (code === "1111") {
          onSubmit(code);
          setDigits(["", "", "", ""]);
          onClose();
        } else {
          setError(true);
          if (navigator.vibrate) navigator.vibrate(200); // haptic feedback
          setTimeout(() => {
            setError(false);
            setDigits(["", "", "", ""]);
            const firstInput = document.getElementById("digit-0") as HTMLInputElement | null;
            firstInput?.focus();
          }, 1000);
        }
      }
    }
  };

  useEffect(() => {
    if (isOpen) {
      const firstInput = document.getElementById("digit-0") as HTMLInputElement;
      firstInput?.focus();
    }
  }, [isOpen]);

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.div
          key="footer-enter"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "flex-end",
            zIndex: 1000,
          }}
          onClick={onClose}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            style={{
              position: "absolute",
              top: "30%",
              transform: "translateY(-120%)",
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
          <motion.div
            key="enter-code-sheet"
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{
              type: "spring",
              stiffness: 140,
              damping: 18,
              opacity: { duration: 0.2 },
            }}
            style={{
              minWidth: "320px",
              maxWidth: "430px",
              margin: "0 auto",
              background: "#fff",
              borderTopLeftRadius: "40px",
              borderTopRightRadius: "40px",
              padding: "20px",
              boxShadow: "0 -4px 20px rgba(0,0,0,0.3)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Code Entry First */}
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

            <motion.div
              animate={error ? { x: [-10, 10, -10, 10, 0] } : { x: 0 }}
              transition={{ duration: 0.4 }}
              style={{
                display: "flex",
                justifyContent: "center",
                gap: "20px",
                marginBottom: "12px",
              }}
            >
              {digits.map((digit, index) => {
                const isFocused = focusedIndex === index;
                const hasValue = !!digit;

                let borderColor = "#E0E0E0";
                if (error) borderColor = "red";
                else if (isFocused || hasValue) borderColor = "#6B00B6";

                return (
                  <div
                    key={index}
                    style={{
                      position: "relative",
                      width: "72px",
                      height: "72px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {/* Outer ring */}
                    <motion.div
                      animate={isFocused ? { scale: [1, 1.05, 1] } : {}}
                      transition={{ repeat: isFocused ? Infinity : 0, duration: 1.5 }}
                      style={{
                        position: "absolute",
                        width: "84px",
                        height: "84px",
                        borderRadius: "50%",
                        border: `2px solid ${borderColor}`,
                        background: "#fff",
                        zIndex: 1,
                      }}
                    />

                    {/* Inner circle */}
                    <input
                      id={`digit-${index}`}
                      type="text"
                      value={digit}
                      maxLength={1}
                      placeholder="0"
                      onChange={(e) => handleChange(e.target.value, index)}
                      onFocus={() => setFocusedIndex(index)}
                      onBlur={() => setFocusedIndex(null)}
                      style={{
                        width: "72px",
                        height: "72px",
                        borderRadius: "50%",
                        border: "none",
                        background: "#EAEAEA",
                        fontSize: "28px",
                        fontWeight: 700,
                        textAlign: "center",
                        color: digit ? "#000" : "#aaa",
                        outline: "none",
                        zIndex: 2,
                      }}
                    />
                  </div>
                );
              })}
            </motion.div>

            {/* Error message with reserved space */}
            <div style={{ minHeight: "28px", marginTop: "8px" }}>
              <AnimatePresence>
                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.3 }}
                    style={{ textAlign: "center", color: "red", fontSize: "14px" }}
                  >
                    Wrong Code. Please try again
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            {/* Instructions Below */}
            <h2
              style={{
                fontSize: "24px",
                fontWeight: 700,
                margin: "20px 0",
                textAlign: "center",
                color: "#000",
              }}
            >
              HOW YOUR RACE WORKS
            </h2>

            <ol style={{ margin: "0 0 24px 0", padding: 0, listStyle: "none" }}>
              <li style={{ display: "flex", fontSize: "15px", fontWeight: 300, marginBottom: "12px", color: "#000" }}>
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
              <li style={{ display: "flex", fontSize: "15px", fontWeight: 300, marginBottom: "12px", color: "#000" }}>
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
                Pick any open sector, grab the code from a pit crew member, and race to complete it at top speed to earn your badge.
              </li>
              <li style={{ display: "flex", fontSize: "15px", fontWeight: 300, color: "#000" }}>
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
                Your total sector times will be added up — the fastest overall earns the top spot on the leaderboard. 🏁
              </li>
            </ol>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}