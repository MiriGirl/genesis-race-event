import MapSVG from "./map";

import { useEffect } from "react";

interface RaceMapProps {
  currentSector: number | null; // null = all idle
  sectors?: { id: number; status: "completed" | "active" | "idle" }[];
  statusType?: string;
  onSectorClick?: (id: number) => void;
}

export default function RaceMap({ currentSector, sectors, statusType, onSectorClick }: RaceMapProps) {
  useEffect(() => {
    console.log("RaceMap props - currentSector:", currentSector, "statusType:", statusType);
  }, [currentSector, statusType]);

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

  console.log("Rendering RaceMap with props:", { currentSector, sectors, statusType });

  return (
    <>
      <div className="race-map-container" style={{ display: "flex", justifyContent: "center" }}>
        <MapSVG style={{ width: "100%", height: "auto" }} />
      </div>
      <div style={{ textAlign: "center", marginTop: "20px", position: "relative" }}>
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
            marginTop: "-40px", // keep text over blur
          }}
        >
          SELECT A SECTOR TO LEARN MORE
        </div>
      </div>
      <style jsx global>{`
        /* Make sector groups clickable if onSectorClick is provided */
        ${onSectorClick
          ? `
          .race-map-container #sector-1, .race-map-container #sector-2, .race-map-container #sector-3, .race-map-container #sector-4, .race-map-container #sector-5, .race-map-container #sector-6 {
            cursor: pointer;
          }
        `
          : ""}
        /* ✅ If no currentSector, everything stays idle */
        ${allIdle
          ? `
          .race-map-container #track-1, .race-map-container #track-2, .race-map-container #track-3, .race-map-container #track-4, .race-map-container #track-5, .race-map-container #track-6 {
            stroke: rgba(218, 218, 218, 0.15) !important; /* #dadada at 15% */
            stroke-width: 12;
          }
            

          /* Sector circles & labels idle */
      .race-map-container #number2, .race-map-container #number3, .race-map-container #number4, .race-map-container #number5, .race-map-container #number6 {
            fill: #FFFFFF !important; /* white circles */
          }
          .race-map-container #number1 {
            fill: #7000E0 !important;
            animation: pulseGlow 2s infinite ease-in-out;
            filter: drop-shadow(0 0 4px #A349EF);
          }
          .race-map-container #number-1 text, .race-map-container #number-2 text, .race-map-container #number-3 text, .race-map-container #number-4 text, .race-map-container #number-5 text, .race-map-container #number-6 text {
            fill: #7000E0 !important; /* purple labels */
          }
        `
          : ""}

        /* ✅ Completed sectors (before currentSector) */
        ${currentSector && currentSector > 1
          ? Array.from({ length: currentSector - 1 }, (_, i) => {
              const sector = i + 1;
              return `
                .race-map-container #track-${sector} {
                  stroke: #7000E0 !important;
                  stroke-width: 12;
                  stroke-linecap: round;
                  filter: drop-shadow(0px 0px 4px #7000E0);
                }
                .race-map-container #number${sector} {
                  fill: #7000E0 !important;
                }
                .race-map-container #number-${sector} text {
                  fill: #ffffff !important;
                }
              `;
            }).join("\n")
          : ""}

        /* ✅ Active sector track highlight (only if statusType === "stopwatch" and !raceNotStarted) */
        ${
          currentSector && statusType === "stopwatch" && !raceNotStarted
            ? `
          .race-map-container #track-${currentSector} {
            stroke: #A349EF !important;
            stroke-width: 12;
            stroke-linecap: round;
            stroke-dasharray: 1200;
            stroke-dashoffset: 1200 !important;

            animation-name: pulseGradientGlow, dashForward;
            animation-duration: 2s, 12s;
            animation-iteration-count: infinite, infinite;
            animation-timing-function: ease-in-out, linear;

            opacity: 1 !important;
          }
        `
            : ""
        }

        /* ✅ Active sector circle styling (always if currentSector is set) */
        ${
          currentSector
            ? `
          .race-map-container #sector-${currentSector} {
            animation-name: pulseGlow;
            animation-duration: 1.4s;
            animation-iteration-count: infinite;
            animation-timing-function: ease-in-out;

            transform-box: fill-box;
            -webkit-transform-box: fill-box; /* Safari/WebKit */
            transform-origin: 50% 50%;
            -webkit-transform-origin: 50% 50%;
            will-change: transform, opacity, filter;
          }
          .race-map-container #sector-${currentSector} rect {
            fill: #A349EF !important;
          }
          .race-map-container #sector-${currentSector} text {
            fill: #ffffff !important;
          }
        `
            : ""
        }

        /* ✅ Idle sectors (after currentSector or all if null) */
        ${
                    currentSector !== null && currentSector > 0
            ? Array.from({ length: 6 - currentSector }, (_, i) => {
                const sector = currentSector + i + 1;
                return `
                  .race-map-container #track-${sector} {
                    stroke: #dadada !important;
                    stroke-opacity: 0.15;
                    stroke-width: 12;
                  }
                  .race-map-container #number${sector} {
                   fill: #FFFFFF !important;
                  }
                  .race-map-container #number-${sector} text {
                    fill: #7000E0 !important;
                  }
                `;
              }).join("\n")
            : ""
        }

        /* ✅ Sector states from sectors prop */
        ${sectors && sectors.length > 0
          ? sectors
              .map(({ id, status }) => {
                if (status === "completed") {
                  return `
                    .race-map-container #track-${id} {
                      stroke: #7000E0 !important;
                      stroke-width: 12;
                      stroke-linecap: round;
                      filter: drop-shadow(0px 0px 4px #7000E0);
                    }
                    .race-map-container #number${id} {
                      fill: #7000E0 !important;
                    }
                    .race-map-container #number-${id} text {
                      fill: #ffffff !important;
                    }
                  `;
                } else if (status === "active") {
                  return `
                    .race-map-container #track-${id} {
                      stroke: #A349EF !important;
                      stroke-width: 12;
                      stroke-linecap: round;
                      stroke-dasharray: 1200;
                      stroke-dashoffset: 1200;
                      animation-name: pulseGradientGlow, dashForward;
                      animation-duration: 2s, 12s;
                      animation-iteration-count: infinite, infinite;
                      animation-timing-function: ease-in-out, linear;
                      opacity: 1 !important;
                    }
                    .race-map-container #sector-${id} {
                      animation-name: pulseGlow;
                      animation-duration: 1.4s;
                      animation-iteration-count: infinite;
                      animation-timing-function: ease-in-out;

                      transform-box: fill-box;
                      -webkit-transform-box: fill-box;
                      transform-origin: 50% 50%;
                      -webkit-transform-origin: 50% 50%;
                      will-change: transform, opacity, filter;
                    }
                    .race-map-container #sector-${id} rect {
                      fill: #A349EF !important;
                    }
                    .race-map-container #sector-${id} text {
                      fill: #ffffff !important;
                    }
                  `;
                } else if (status === "idle") {
                  return `
                    .race-map-container #track-${id} {
                      stroke: #dadada !important;
                      stroke-opacity: 0.15;
                      stroke-width: 12;
                    }
                    .race-map-container #number${id} {
                      fill: #FFFFFF !important;
                    }
                    .race-map-container #number-${id} text {
                      fill: #7000E0 !important;
                    }
                  `;
                }
                return "";
              })
              .join("\n")
          : ""}

        /* 🔮 Pulse glow for active circle */
        @keyframes pulseGlow {
          0%   { transform: scale(1);   opacity: 1;    filter: drop-shadow(0 0 3px #A349EF); }
          50%  { transform: scale(1.5); opacity: 0.85; filter: drop-shadow(0 0 14px #A349EF); }
          100% { transform: scale(1);   opacity: 1;    filter: drop-shadow(0 0 3px #A349EF); }
        }

        @keyframes dashForward {
          from { stroke-dashoffset: 1200; }
          to { stroke-dashoffset: 0; }
        }

        @keyframes pulseGradientGlow {
          0%   { filter: drop-shadow(0 0 6px #420BD9); }
          50%  { filter: drop-shadow(0 0 16px #D73AFF); }
          100% { filter: drop-shadow(0 0 6px #420BD9); }
        }
      `}</style>
      
    </>
  );
}