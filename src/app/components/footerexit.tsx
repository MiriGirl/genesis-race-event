"use client";
import React from "react";
import { motion } from "framer-motion";
import { transform } from "next/dist/build/swc/generated-native";

type FooterExitProps = {
  state: "completion" | "charm"; // Two states
  onAction: () => void;
};

export default function FooterExit({ state, onAction }: FooterExitProps) {
  // Define content for the two states
  const content =
    state === "completion"
      ? {
          title: "COLLECT YOUR COMPLETION KIT 🏁",
          button: "Collect",
        }
      : {
          title: "DOWNLOAD & UNLOCK THE INNERDRIVE™ CHARM",
          button: "Download the app",
        };

  return (
    <>
      {/* Purple blur bar */}
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
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 50, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        style={{
          background: "#fff",
          borderTopLeftRadius: "44px",
          borderTopRightRadius: "44px",
          textAlign: "center",
          padding: "20px",
          position: "relative",
          zIndex: 1,
          marginTop: "5%",
          color: "black",
        }}
      >
        {/* Title */}
        <div
          style={{
            fontWeight: 700,
            fontSize: "26px",
            textTransform: "uppercase",
            marginBottom: "20px",
            paddingLeft: 10,
             paddingRight: 10,
            lineHeight: 1,
          
          }}
        >
          {content.title}
        </div>

        {/* Action button */}
        <motion.button
          className="font-dragracing"
          whileTap={{ scale: 0.95 }}
          whileHover={{ scale: 1.05 }}
          onClick={onAction}
          style={{
            width: "100%",
            maxWidth: "350px",
            height: "52px",
            background: "#000",
            color: "#fff",
            fontWeight: 600,
            fontSize: "22px",
            borderRadius: "48px",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            
          }}
        >
          {content.button}
        </motion.button>
      </motion.div>
    </>
  );
}