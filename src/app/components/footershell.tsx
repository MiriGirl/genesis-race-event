"use client";
import React, { useState } from "react";
import FooterEnter from "./footerenter";
import EnterCode from "./entercode";
import FooterStopwatch from "./footerstopwatch";

export default function FooterShell() {
  const [currentSector, setCurrentSector] = useState<number | null>(null);
  const [isCodeOpen, setIsCodeOpen] = useState(false);
  const [accessCode, setAccessCode] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [activeAccessCode, setActiveAccessCode] = useState<string | null>(null);
  const raceNo = 1; // TODO: Replace with actual race number if needed

  // Step 1: Open bottom sheet (EnterCode)
  const handleOpenEnterCode = () => {
    setIsCodeOpen(true);
    setErrorMessage("");
    setAccessCode("");
  };

  // Step 2: After valid code entered → set sector + close sheet
  // Now expects accessCode from EnterCode
  const handleCodeSubmit = async (enteredCode: string) => {
    setErrorMessage("");
    try {
      const res = await fetch("/api/check-race", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          raceNo,
          accessCode: enteredCode,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setCurrentSector(data.sector);
        setIsCodeOpen(false);
        setAccessCode(enteredCode);
        setActiveAccessCode(enteredCode);
        setErrorMessage("");
      } else {
        setErrorMessage(data.message || "Invalid code.");
      }
    } catch (err: any) {
      setErrorMessage("Failed to check code. Please try again.");
    }
  };

  // Step 3: After stopwatch done → reset to Enter
  const handleFinish = async (splitMs: number) => {
    setErrorMessage("");
    try {
      const res = await fetch("/api/finish-sector", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          raceNo,
          accessCode,
          splitMs,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setActiveAccessCode(null);
        if (data.message === "Race finished") {
          setCurrentSector(null);
          setIsCodeOpen(false);
          setAccessCode("");
        } else {
          setCurrentSector(null);
          setIsCodeOpen(true);
        }
        setErrorMessage("");
      } else {
        setErrorMessage(data.message || "Failed to finish sector.");
      }
    } catch (err: any) {
      setErrorMessage("Failed to finish sector. Please try again.");
    }
  };

  return (
    <>
      {currentSector !== null && activeAccessCode ? (
        <FooterStopwatch
          currentSector={currentSector}
          onFinish={(splitMs) => handleFinish(splitMs)}
        />
      ) : isCodeOpen ? (
        <EnterCode
          isOpen={isCodeOpen}
          onClose={() => setIsCodeOpen(false)}
          currentSector={currentSector ?? 1}
          onSubmit={handleCodeSubmit}
          errorMessage={errorMessage}
        />
      ) : currentSector === null ? (
        <FooterEnter
          currentSector={currentSector}
          onStart={handleOpenEnterCode}
        />
      ) : null}
    </>
  );
}