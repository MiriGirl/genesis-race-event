"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface AdminAppProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AdminApp({ isOpen, onClose }: AdminAppProps) {
  const [fno, setFno] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = async () => {
    try {
      const response = await fetch("/api/update-app-points", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ fno: "F" + fno }),
      });
      if (!response.ok) {
        const error = await response.text();
        alert("Failed to update points: " + error);
        return;
      }
      alert("Points updated successfully!");
    } catch (err: any) {
      alert("Error: " + (err?.message || err));
    }
  };

  const isActive = isFocused || fno !== "";

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
              bottom: "35%",
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

          {/* Bottom sheet */}
          <motion.div
            key="enter-fno-sheet"
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
            width: "100%",
              maxWidth: "530px",
              margin: "0 auto",
              background: "#fafafa",
              border: 40,
              padding: "24px",
              boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
               borderTopLeftRadius: "40px",
              borderTopRightRadius: "40px",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Heading */}
            <h3
              style={{
                textAlign: "center",
               
                fontSize: "28px",
                fontWeight: 700,
                marginBottom: -10,
                color: "#000",
               
              }}
            >
              ENTER FNO
            </h3>

            {/* Instruction text */}
            <p
              style={{
                textAlign: "center",
                fontSize: "14px",
                marginBottom: "24px",
                color: "#6d6d6dff",
              }}
            >
              Enter the FNO and click submit. That's it :)
            </p>

            {/* Separate F prefix and input */}
            <div    className="font-dragracing"
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: "24px",
                   width: "180px",
                maxWidth: "300px",
                
              }}
            >
              <span
            
                style={{
                  color: isActive ? "#5932EA" : "#777777",
                  fontWeight: "700",
                  fontSize: "24px",
                  fontFamily: "'Drag Racing', cursive",
                  userSelect: "none",
                  marginRight: "22px",
                  
                }}
              >
                F
              </span>
              <input
            
                type="text"
                placeholder={isFocused || fno !== "" ? "" : "10000"}
                maxLength={5}
                value={fno}
                onChange={(e) => setFno(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                style={{
                  flexGrow: 1,
                  border: `1.5px solid ${isActive ? "#5932EA" : "#D6D6D6"}`,
                  borderRadius: "16px",
                  padding: "10px 16px",
                  fontSize: "28px",
                  fontWeight: "600",
                  fontFamily: "inherit",
                  backgroundColor: isActive ? "rgba(79,42,234,0.11)" : "#f4f4f4ff",
                  outline: "none",
                  textAlign:"center",
                  color: isActive ? "#5932EA" : "#777777",
                   justifyContent: "center",
                   width: 50,
                
                }}
              />
            </div>

            {/* Submit button */}
            <button
            className="font-dragracing"
              onClick={handleSubmit}
              style={{
                backgroundColor: "#000",
                color: "#fff",
                border: "none",
                borderRadius: "9999px",
                padding: "14px 0",
                fontWeight: "bold",
                fontSize: "20px",
                cursor: "pointer",
                width: "100%",
                maxWidth: "300px",
                textTransform: "uppercase",
                letterSpacing: "1.2px",
              }}
            >
              Submit
            </button>

            {/* Close link/button */}
            
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}