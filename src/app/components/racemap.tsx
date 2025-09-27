import MapSVG from "./map";

import { useEffect } from "react";

interface RaceMapProps {
  currentSector: number | null; // null = all idle
  sectors?: { id: number; status: "completed" | "active" | "idle" }[];
  statusType?: string;
  onSectorClick?: (id: number) => void;
}

export default function RaceMap({ currentSector, sectors, statusType, onSectorClick }: RaceMapProps) {
  const raceNotStarted = statusType === "enter" && currentSector === 1;
  const allIdle = currentSector === null || currentSector === 0;

  // Attach click handlers to sector groups
  useEffect(() => {
    if (!onSectorClick) return;
    const handlers: Array<{ el: Element, fn: (e: Event) => void }> = [];
    for (let i = 1; i <= 6; ++i) {
      const el = document.getElementById(`sector-${i}`);
      if (el) {
        const fn = (e: Event) => {
          e.stopPropagation();
          onSectorClick(i);
        };
        el.addEventListener("click", fn);
        handlers.push({ el, fn });
      }
    }
    return () => {
      handlers.forEach(({ el, fn }) => el.removeEventListener("click", fn));
    };
  }, [onSectorClick]);

  useEffect(() => {
    // reset all
    document.querySelectorAll('[data-id^="track-"]').forEach(el => {
      el.classList.remove("completed", "active");
    });
    document.querySelectorAll('[id^="sector-"]').forEach(el => {
      el.classList.remove("completed", "active");
    });

    if (currentSector && currentSector > 1) {
      for (let i = 1; i < currentSector; i++) {
        document.querySelector(`[data-id="track-${i}"]`)?.classList.add("completed");
        document.querySelector(`#sector-${i}`)?.classList.add("completed");
      }
    }

    if (currentSector) {
      document.querySelector(`[data-id="track-${currentSector}"]`)?.classList.add("active");
      document.querySelector(`#sector-${currentSector}`)?.classList.add("active");
    }
  }, [currentSector, statusType]);

  return (
    <>
      <div style={{ display: "flex", justifyContent: "center" }}>
        <MapSVG style={{ width: "100%", height: "auto" }} />
      </div>
      {statusType !== "stopwatch" && (
        <div style={{ textAlign: "center", marginTop: "12px", position: "relative" }}>
          <div
            style={{
              height: "40px",
              backgroundColor: "#A700D1",
              opacity: 0.79,
              filter: "blur(20px)",
              zIndex: 0,
            }}
          />
          <div
            style={{
              position: "relative",
              zIndex: 2,
              color: "#fff",
              padding: "14px 0",
              fontWeight: 600,
              fontSize: "14px",
              letterSpacing: "0.05em",
              marginTop: "-50px",
             
            }}
          >
            SELECT A SECTOR TO LEARN MORE
          </div>
        </div>
      )}
      
    </>
  );
}