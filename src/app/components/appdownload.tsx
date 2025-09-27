"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface AdminAppProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AdminApp({ isOpen, onClose }: AdminAppProps) {
  const [fno, setFno] = useState("");

  const handleSubmit = () => {
    // You can add submit logic here if needed
    alert(`Submitted FNO: ${fno}`);
  };

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
              minWidth: "320px",
              maxWidth: "430px",
              margin: "0 auto",
              background: "#fff",
              borderTopLeftRadius: "40px",
              borderTopRightRadius: "40px",
              padding: "20px",
              boxShadow: "0 -4px 20px rgba(0,0,0,0.3)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Heading */}
            <h3
              style={{
                textAlign: "center",
                fontSize: "18px",
                fontWeight: 700,
                marginBottom: "16px",
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
                marginBottom: "20px",
                color: "#000",
              }}
            >
              Enter the FNO and click submit. That's it :)
            </p>

            {/* Input with F prefix */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: "20px",
                width: "100%",
                maxWidth: "300px",
                border: "1px solid #ccc",
                borderRadius: "8px",
                overflow: "hidden",
                backgroundColor: "#f9f9f9",
              }}
            >
              <span
                style={{
                  padding: "10px 12px",
                  backgroundColor: "#e0e0e0",
                  color: "#000",
                  fontWeight: "700",
                  fontSize: "16px",
                  userSelect: "none",
                }}
              >
                F
              </span>
              <input
                type="text"
                placeholder="Enter number"
                value={fno}
                onChange={(e) => setFno(e.target.value)}
                style={{
                  flexGrow: 1,
                  border: "none",
                  outline: "none",
                  padding: "10px 12px",
                  fontSize: "16px",
                  fontWeight: "500",
                }}
              />
            </div>

            {/* Submit button */}
            <button
              onClick={handleSubmit}
              style={{
                backgroundColor: "#000",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                padding: "12px 24px",
                fontWeight: "700",
                fontSize: "16px",
                cursor: "pointer",
                width: "100%",
                maxWidth: "300px",
                marginBottom: "16px",
              }}
            >
              Submit
            </button>

            {/* Close link/button */}
            <button
              onClick={onClose}
              style={{
                background: "none",
                border: "none",
                color: "#000",
                textDecoration: "underline",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "500",
              }}
            >
              Close
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}