"use client";
import React, { useEffect, useState } from "react";
import FooterStopwatch from "./footerstopwatch";
import EnterCode from "./entercode";
import { motion } from "framer-motion";

type FooterStatus = {
  type: "enter" | "stopwatch" | "finished";
  currentSector: number;
  raceNo?: string;
  participantId?: string;
  stationId?: string;
  accessCode?: string;
  startTime?: string;
  bib?: string;
};

export default function FooterShell({ raceNo, bib }: { raceNo: string; bib: number }) {
  console.log("FooterShell props:", { raceNo, bib });
  const [status, setStatus] = useState<FooterStatus | null>(null);
  const [isEnterCodeOpen, setIsEnterCodeOpen] = useState(false);
  const [selectedSector, setSelectedSector] = useState<number | null>(null);
  const [participantInfo, setParticipantInfo] = useState<{ participantId: string; raceNo: string; bib: number }>({
    participantId: "",
    raceNo: "",
    bib: 0,
  });
  const [skipNextFetch, setSkipNextFetch] = useState(false);

  // Fetch participant info on mount
  useEffect(() => {
    const fetchParticipantInfo = async () => {
      try {
        const res = await fetch(`/api/player-info`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ raceNo }),
        });
        const data = await res.json();
        console.log("Fetched participant info:", data);
        if (data && typeof data.participantId === "string") {
          setParticipantInfo({ participantId: data.participantId, raceNo, bib });
        }
      } catch (err) {
        console.error("Error fetching participant info:", err);
      }
    };
    fetchParticipantInfo();
  }, [raceNo, bib]);

  // Refactor fetchStatus so it can be reused and exposed for refresh
  const fetchStatus = async () => {
    try {
      const payload = { raceNo, bib };
      console.log("About to fetch with payload:", payload);
      const res = await fetch(`/api/race-status`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      console.log("Raw response received:", { status: res.status, ok: res.ok });
      const data = await res.json();
      console.log("Parsed JSON data:", data);
      // Validate the shape of the response
      if (
        typeof data === "object" &&
        data !== null &&
        typeof data.type === "string" &&
        typeof data.currentSector === "number"
      ) {
        if (
          data.type === "enter" ||
          data.type === "stopwatch" ||
          data.type === "finished" ||
          data.type === "started"
        ) {
          // Map "started" to "stopwatch"
          const mappedType = data.type === "started" ? "stopwatch" : data.type;
          const stationIdValue = data.stationId ?? data.checkpoint?.station_id;
          const accessCodeValue = data.accessCode ?? data.station?.accessCode ?? data.checkpoint?.access_code ?? "";
          const newStatus: FooterStatus = {
            type: mappedType,
            currentSector: data.currentSector,
            raceNo: data.raceNo,
            participantId: data.participantId,
            stationId: stationIdValue,
            accessCode: accessCodeValue,
            startTime: data.startTime,
            bib: String(bib),
          };
          if (skipNextFetch) {
            console.log("⏭️ Skipping fetchStatus update because skipNextFetch is true");
            setSkipNextFetch(false);
            return;
          }
          setStatus(newStatus);
          console.log("Updated status set:", newStatus);
          console.log("stationId received and set:", stationIdValue);
          console.log("✅ stationId from API:", data.stationId);
          console.log("✅ stationIdValue used in setStatus:", stationIdValue);
        } else {
          console.warn("Unexpected type in API response:", data.type);
        }
      } else {
        console.warn("Invalid API response shape:", data);
      }
    } catch (err) {
      console.error("Error fetching race status:", err);
    }
  };

  // Expose a refreshStatus function
  const refreshStatus = () => {
    console.log("Refreshing status...");
    fetchStatus();
  };

  useEffect(() => {
    console.log("useEffect triggered with raceNo and bib:", { raceNo, bib });
    fetchStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [raceNo, bib]);

  useEffect(() => {
    if (status) {
      console.log("🔄 [FooterShell] Status after refresh/mount:", status);
      console.log("🔄 [FooterShell] stationId inside status:", status.stationId);
    }
  }, [status]);

  if (!status) return null;

  if (status.type === "enter") {
    console.log(`Rendering FooterEnter branch with currentSector: ${status.currentSector}`);
    console.log("Returning <FooterEnter /> component");

    const handleStart = () => {
      setIsEnterCodeOpen(true); // just open EnterCode popup
    };

    const handleEnterCodeSubmit = async (data: { accessCode: string }) => {
      console.log("EnterCode submitted with accessCode:", data.accessCode);

      try {
        const res = await fetch("/api/submit-code", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            raceNo,
            participantId: participantInfo.participantId,
            stationId: status.stationId,
            accessCode: data.accessCode,
          }),
        });

        if (!res.ok) throw new Error("Failed to submit code");

        // ✅ Optimistic update
        setStatus((prev) =>
          prev
            ? {
                ...prev,
                type: "stopwatch",
                accessCode: data.accessCode,
                startTime: new Date().toISOString(),
                bib: String(bib),
              }
            : {
                type: "stopwatch",
                currentSector: status.currentSector,
                raceNo,
                participantId: participantInfo.participantId,
                stationId: status.stationId ?? "",
                accessCode: data.accessCode,
                startTime: new Date().toISOString(),
                bib: String(bib),
              }
        );

        setIsEnterCodeOpen(false);

      } catch (err) {
        console.error("Error submitting code:", err);
      }
    };

    const handleCloseEnterCode = () => {
      setIsEnterCodeOpen(false);
    };

    const enterCodeProps = {
      isOpen: isEnterCodeOpen,
      currentSector: status.currentSector,
      raceNo: raceNo,
      participantId: participantInfo.participantId,
      stationId: status.stationId || "",
      accessCode: status.accessCode ?? "",
      onSubmit: handleEnterCodeSubmit,
      onClose: handleCloseEnterCode,
      bib: raceNo.replace("F", ""),
    };
    console.log("Passing props to EnterCode:", enterCodeProps);
    console.log("stationId passed to EnterCode:", status.stationId);

    if (!isEnterCodeOpen) {
      return (
        <div className="relative z-50 flex flex-col items-center justify-center w-full h-full">
          {/* Purple blur background */}
          <div
            className="absolute inset-0 bg-gradient-to-r from-purple-500 to-indigo-600 blur-3xl opacity-70"
            style={{
              filter: "blur(100px)",
              zIndex: -1,
              position: "absolute",
              top: "-20%",
              left: "-20%",
              width: "140%",
              height: "140%",
              borderRadius: "50%",
            }}
          />
          {/* White card container */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="relative bg-white rounded-3xl shadow-lg p-8 max-w-md w-full flex flex-col items-center"
          >
            {/* Decorative circles */}
            <div className="absolute top-4 left-4 w-12 h-12 bg-purple-300 rounded-full opacity-50 animate-pulse"></div>
            <div className="absolute bottom-4 right-4 w-16 h-16 bg-indigo-300 rounded-full opacity-40 animate-pulse"></div>

            {/* Current sector display */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="text-4xl font-extrabold text-purple-700 mb-4"
            >
              SECTOR {status.currentSector}
            </motion.div>

            {/* START button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleStart}
              className="mt-6 px-12 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold rounded-full shadow-lg hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-purple-300 transition"
              aria-label="Start Race"
            >
              START
            </motion.button>
          </motion.div>
        </div>
      );
    }

    return <EnterCode {...enterCodeProps} />;
  }

  if (status.type === "stopwatch") {
    console.log(`Rendering FooterStopwatch branch with currentSector: ${status.currentSector}`);

    const footerStopwatchProps = {
      currentSector: status.currentSector,
      raceNo: status.raceNo ?? "",
      participantId: status.participantId ?? "",
      stationId: status.stationId ?? "",
      accessCode: status.accessCode ?? "",
      startTime: status.startTime ?? "",
      bib: status.bib ?? String(bib),
      onFinish: () => {
        console.log("Sector finished");
        refreshStatus();
      },
    };
    console.log("Passing props to FooterStopwatch:", footerStopwatchProps);
    console.log("stationId passed to FooterStopwatch:", footerStopwatchProps.stationId);

    console.log("🎯 Rendering Stopwatch now with props:", footerStopwatchProps);
    console.log("Returning <FooterStopwatch /> component");
    return (
      <FooterStopwatch
        {...footerStopwatchProps}
      />
    );
  }

  if (status.type === "finished") {
    console.log("Rendering finished branch (null)");
    return null;
  }

  return null;
}