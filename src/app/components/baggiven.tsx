"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface AdminAppProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AdminApp({ isOpen, onClose }: AdminAppProps) {
  const [fno, setFno] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [status, setStatus] = useState<null | { bag_given: boolean; type: string }>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [giveLoading, setGiveLoading] = useState(false);

  // When 5 digits entered, fetch bag status
  useEffect(() => {
    setStatus(null);
    setError(null);
    if (fno.length === 5) {
      setLoading(true);
      console.log("Fetching GET /api/bag-status with:", { raceNo: `F${fno}`, bib: fno });
      fetch(`/api/bag-status?raceNo=F${fno}&bib=${fno}`)
        .then(async (res) => {
          if (!res.ok) {
            throw new Error(await res.text());
          }
          return res.json();
        })
        .then((data) => {
          setStatus(data);
        })
        .catch((err) => {
          setError(typeof err === "string" ? err : err?.message || "Error");
        })
        .finally(() => setLoading(false));
    }
  }, [fno]);

  const handleGiveGift = async () => {
    setGiveLoading(true);
    setError(null);
    try {
      console.log("Sending POST /api/bag-status with:", { raceNo: "F" + fno, bib: fno, bag_given: true });
      const response = await fetch("/api/bag-status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ raceNo: "F" + fno, bib: fno, bag_given: true }),
      });
      if (!response.ok) {
        const errorMsg = await response.text();
        setError("Failed to update: " + errorMsg);
        return;
      }
      // Refetch status
      console.log("Refetching GET /api/bag-status with:", { raceNo: `F${fno}`, bib: fno });
      const refreshed = await fetch(`/api/bag-status?raceNo=F${fno}&bib=${fno}`);
      if (!refreshed.ok) {
        throw new Error(await refreshed.text());
      }
      setStatus(await refreshed.json());
    } catch (err: any) {
      setError(err?.message || "Error");
    } finally {
      setGiveLoading(false);
    }
  };

  const isActive = isFocused || fno !== "";

  // Determine colors for F and input based on status
  let fColor = isActive ? "#5932EA" : "#777777";
  let inputBorder = isActive ? "#5932EA" : "#D6D6D6";
  let inputBg = isActive ? "rgba(79,42,234,0.11)" : "#f4f4f4ff";

  if (status) {
    if (status.type !== "finished") {
      fColor = "#d32f2f";
      inputBorder = "#d32f2f";
      inputBg = "rgba(211,47,47,0.11)";
    } else if (status.bag_given) {
      fColor = "#1bbf4a";
      inputBorder = "#1bbf4a";
      inputBg = "rgba(27,191,74,0.11)";
    } else {
      fColor = "#5932EA";
      inputBorder = "#5932EA";
      inputBg = "rgba(79,42,234,0.11)";
    }
  }

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
              top: "42%",
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
              Enter the FNO. Gift status will show automatically.
            </p>

            {/* Separate F prefix and input */}
            <div
              className="font-dragracing"
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
                  color: fColor,
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
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder={isFocused || fno !== "" ? "" : "10000"}
                maxLength={5}
                value={fno}
                onChange={(e) => {
                  // Only allow numbers
                  const val = e.target.value.replace(/[^0-9]/g, "");
                  setFno(val);
                }}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                style={{
                  flexGrow: 1,
                  border: `1.5px solid ${inputBorder}`,
                  borderRadius: "16px",
                  padding: "10px 16px",
                  fontSize: "28px",
                  fontWeight: "600",
                  fontFamily: "inherit",
                  backgroundColor: inputBg,
                  outline: "none",
                  textAlign: "center",
                  color: inputBorder,
                  justifyContent: "center",
                  width: 50,
                }}
              />
            </div>

            {/* Status feedback */}
            <div style={{ minHeight: "100px", width: "100%", maxWidth: 340, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
              {loading && fno.length === 5 && (
                <span style={{ color: "#888", fontWeight: 500, fontSize: 18, marginTop: 12 }}>Checking...</span>
              )}
              {error && (
                <span style={{ color: "#d32f2f", fontWeight: 600, fontSize: 17, marginTop: 10 }}>{error}</span>
              )}
              {!loading && !error && status && (
                <>
                  {status.type !== "finished" ? (
                    <div className="font-dragracing"
                    style= {{ borderTop: "4px solid #EEEEEE", borderBottom: "4px solid #EEEEEE", padding: "20px 0", marginTop: "0px", textAlign: "center" }}>
                      <span  className="font-dragracing" style={{ color: "#DF0404", fontWeight: 700, fontSize: 28, border: "0px",lineHeight: "30px", textTransform: "uppercase" }}>NOT <br></br>COMPLETED</span>
                      <div style={{ fontFamily: "Poppins", color: "#989898ff", fontSize: 14, marginTop: 8 }}>This participant has not finished the race.</div>
                    </div>
                  ) : status.bag_given ? (
                    <div style={{ borderTop: "4px solid #EEEEEE", borderBottom: "4px solid #EEEEEE", padding: "20px 0", marginTop: "0px", textAlign: "center" }}>
                      <span className="font-dragracing" style={{ color: "#1bbf4a", fontWeight: 700, fontSize: 38, textTransform: "uppercase", lineHeight: "30px" }}>GIFT <br></br>COLLECTED</span>
                      <div style={{ fontFamily: "Poppins", color: "#989898ff", fontSize: 14, marginTop: 8  }}>Participant has already collected the gift bag.</div>
                    </div>
                  ) : (
                    <div style={{ borderTop: "4px solid #EEEEEE", borderBottom: "4px solid #EEEEEE", padding: "20px 0", marginTop: "0px", textAlign: "center", width: "100%" }}>
                      <div style={{ color: "#6d6d6d", fontSize: 14, lineHeight:"18px", marginBottom: 15, }}>
                        This racer has not yet collected their gift. Please hand it to them and click the button.
                      </div>
                      <button
                        className="font-dragracing"
                        onClick={handleGiveGift}
                        disabled={giveLoading}
                        style={{
                          backgroundColor: "#5823e9ff",
                          color: "#fff",
                          border: "none",
                          borderRadius: "9999px",
                          padding: "14px 0",
                          fontWeight: "700",
                          fontSize: "28px",
                          cursor: giveLoading ? "not-allowed" : "pointer",
                          width: "100%",
                          maxWidth: "300px",
                          textTransform: "uppercase",
                          letterSpacing: "1.2px",
                          marginBottom: 8,
                          opacity: giveLoading ? 0.7 : 1,
                        }}
                      >
                        {giveLoading ? "Processing..." : "GIVE GIFT"}
                      </button>
                      
                    </div>
                  )}
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}