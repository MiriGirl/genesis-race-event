import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

interface GiftPopupProps {
  isOpen: boolean;
  onClose: () => void;
  driverNo: string; // F20
  raceType: "f1" | "standard" | "exclusive"; // determines which gift
  style?: React.CSSProperties; // optional style prop for root container
}

export default function GiftPopup({ isOpen, onClose, driverNo, raceType, style }: GiftPopupProps) {
  // Select text + image based on race type
  const isF1 = raceType === "f1";
  const giftText = isF1 ? "PERFORMANCE KIT" : "COMPLETION KIT";
  // Use local assets for giftImage based on raceType
  let giftImage = "";
  if (raceType === "f1") {
    giftImage = "/bg/f1quest.png";
  } else if (raceType === "standard" || raceType === "exclusive") {
    giftImage = "/bg/generalquest.png";
  }

  useEffect(() => {
    if (isOpen) {
      fetch("/api/update-points", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ participantId: driverNo }),
      }).then(res => res.json())
        .then(data => console.log("Points updated:", data))
        .catch(err => console.error("Error updating points:", err));
    }
  }, [isOpen, driverNo]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0,0,0,0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 3000,
            ...style,
          }}
        >
          <motion.div
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", stiffness: 160, damping: 20 }}
            style={{
              background: "#fff",
              borderRadius: 40,
              padding: "20px 16px",
              textAlign: "center",
              width: "80%",
              maxWidth: 380,
              boxShadow: "0 6px 20px rgba(0,0,0,0.25)",
              position: "relative",
            }}
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              style={{
                position: "absolute",
                top: 12,
                right: 12,
                border: "none",
                background: "none",
                cursor: "pointer",
              }}
            >
              <div
                style={{
                  background: "#000000ff",
                  color: "#fff",
                  borderRadius: "50%",
                  width: 42,
                  height: 42,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 20,
                  fontWeight: 700,
                }}
              >
                ×
              </div>
            </button>

            {/* Heading */}
            <h2
              style={{
                fontSize: 30,
                fontWeight: 700,
                marginBottom: 0,
                marginTop: 24,
                color: "black",
                lineHeight: 1,
              }}
            >
              YOU FINISHED <br /> YOUR INNER RACE 🏁.
            </h2>
            <p style={{    marginTop: 5, fontSize: 18, color: "#444", marginBottom: 20 }}>
              SHOW THIS POPUP TO THE SHOP
            </p>

            {/* Gift Image */}
            <div
              style={{
                background: "#f0e4f9",
                borderRadius: 30,
                padding: 30,
                marginBottom: 20,
              }}
            >
              <Image
                src={giftImage}
                alt="Gift"
                width={200}
                height={200}
                style={{ objectFit: "contain", margin: "0 auto" }}
              />
              <p
                style={{
                  marginTop: 30,
                  marginBottom: 0,
                  fontWeight: 500,
                  fontSize: 22,
                  color: "#A349EF",
                  textTransform: "uppercase",
                  lineHeight: 1.2,
                }}
              >
                COLLECT YOUR <br />
               <span style={{
                 
                  fontWeight: 800,
                  
                }} > 
                
                {giftText}<br /> </span> FROM THE SHOP
              </p>
            </div>

            {/* Driver Number */}
            <p
              style={{
                marginBottom: -10,
                fontSize: 20,
                fontWeight: 800,
                color: "#333",
              }}
            >
              DRIVER NO
            </p>
            <h3 className="font-dragracing"
              style={{
                margin: "0 0 20px 0",
                fontSize: 46,
                fontWeight: 800,
                color: "#a349ef",
              }}
            >
              {driverNo}
            </h3>

            {/* Download CTA */}
            <a href="https://apps.apple.com/sg/app/meuraki-wellness/id6692630132" target="_blank" rel="noopener noreferrer">
              <button className="font-dragracing"
                style={{
                  width: "100%",
                  background: "#000",
                  color: "#fff",
                  borderRadius: 24,
                  padding: "12px 16px",
                  fontSize: 22,
                  fontWeight: 600,
                  border: "none",
                  cursor: "pointer",
                  textTransform: "uppercase",
                }}
              >
                Download the app
              </button>
            </a>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}