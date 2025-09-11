"use client";
import React, { useState } from "react";
import FooterEnter from "./footerenter";
import FooterStopwatch from "./footerstopwatch";
import EnterCode from "./entercode";

export default function FooterShell() {
  const [activeMode, setActiveMode] = useState<"enter" | "stopwatch">("enter");
  const [showEnterCode, setShowEnterCode] = useState(false);

  return (
    <>
      <footer
        style={{
          position: "fixed",
          bottom: 0,
          left: "50%",
          transform: "translateX(-50%)",
          width: "100%",
          maxWidth: "430px",
        }}
      >
        {activeMode === "enter" && (
          <FooterEnter onStart={() => setShowEnterCode(true)} />
        )}
        {activeMode === "stopwatch" && (
          <FooterStopwatch
            sector={3}
            onFinish={() => setActiveMode("enter")}
          />
        )}
      </footer>

      {/* Bottom sheet for entering codes */}
      <EnterCode
        isOpen={showEnterCode}
        onClose={() => setShowEnterCode(false)}
        onSubmit={(code) => {
          console.log("✅ Code entered:", code);
          if (code === "1111") {
            setActiveMode("stopwatch");
          }
          setShowEnterCode(false);
        }}
      />
    </>
  );
}