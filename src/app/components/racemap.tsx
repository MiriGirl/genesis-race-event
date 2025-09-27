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
      <style jsx global>{`
        /* Make sector groups clickable if onSectorClick is provided */
        ${onSectorClick
          ? `
          #sector-1, #sector-2, #sector-3, #sector-4, #sector-5, #sector-6 {
            cursor: pointer;
          }
        `
          : ""}
        /* ✅ If no currentSector, everything stays idle */
        ${allIdle
          ? `
          #track-1, #track-2, #track-3, #track-4, #track-5, #track-6 {
            stroke: rgba(218, 218, 218, 0.15) !important; /* #dadada at 15% */
            stroke-width: 12;
          }
            

          /* Sector circles & labels idle */
      #number2, #number3, #number4, #number5, #number6 {
            fill: #FFFFFF !important; /* white circles */
          }
          #number1 {
            fill: #7000E0 !important;
            animation: pulseGlow 2s infinite ease-in-out;
            filter: drop-shadow(0 0 4px #A349EF);
          }
          #number-1 text, #number-2 text, #number-3 text, #number-4 text, #number-5 text, #number-6 text {
            fill: #7000E0 !important; /* purple labels */
          }
        `
          : ""}

        /* ✅ Completed sectors (before currentSector) */
        ${currentSector && currentSector > 1
          ? Array.from({ length: currentSector - 1 }, (_, i) => {
              const sector = i + 1;
              return `
                #track-${sector} {
                  stroke: #7000E0 !important;
                  stroke-width: 12;
                  stroke-linecap: round;
                  filter: drop-shadow(0px 0px 4px #7000E0);
                }
                #number${sector} {
                  fill: #7000E0 !important;
                }
                #number-${sector} text {
                  fill: #ffffff !important;
                }
              `;
            }).join("\n")
          : ""}

        /* ✅ Active sector track highlight (only if statusType === "stopwatch" and !raceNotStarted) */
        ${
          currentSector && statusType === "stopwatch" && !raceNotStarted
            ? `
          #track-${currentSector} {
            stroke: #A349EF !important;
            stroke-width: 12;
            stroke-linecap: round;
            stroke-dasharray: 1200;
            stroke-dashoffset: 1200;
            animation: pulseGradientGlow 2s infinite ease-in-out, dashForward 12s linear infinite;
            opacity: 1 !important;
          }
        `
            : ""
        }

        /* ✅ Active sector circle styling (always if currentSector is set) */
        ${
          currentSector
            ? `
          #sector-${currentSector} {
            animation: pulseGlow 1.4s infinite ease-in-out;
            transform-box: fill-box;
            -webkit-transform-box: fill-box; /* Safari/WebKit */
            transform-origin: 50% 50%;
            -webkit-transform-origin: 50% 50%;
            will-change: transform, opacity, filter;
          }
          #sector-${currentSector} rect {
            fill: #A349EF !important;
          }
          #sector-${currentSector} text {
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
                  #track-${sector} {
                    stroke: #dadada !important;
                    stroke-opacity: 0.15;
                    stroke-width: 12;
                  }
                  #number${sector} {
                   fill: #FFFFFF !important;
                  }
                  #number-${sector} text {
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
                    #track-${id} {
                      stroke: #7000E0 !important;
                      stroke-width: 12;
                      stroke-linecap: round;
                      filter: drop-shadow(0px 0px 4px #7000E0);
                    }
                    #number${id} {
                      fill: #7000E0 !important;
                    }
                    #number-${id} text {
                      fill: #ffffff !important;
                    }
                  `;
                } else if (status === "active") {
                  return `
                    #track-${id} {
                      stroke: #A349EF !important;
                      stroke-width: 12;
                      stroke-linecap: round;
                      stroke-dasharray: 1200;
                      stroke-dashoffset: 1200;
                      animation: pulseGradientGlow 2s infinite ease-in-out, dashForward 12s linear infinite;
                      opacity: 1 !important;
                    }
                    #sector-${id} {
                      animation: pulseGlow 1.4s infinite ease-in-out;
                      transform-box: fill-box;
                      -webkit-transform-box: fill-box;
                      transform-origin: 50% 50%;
                      -webkit-transform-origin: 50% 50%;
                      will-change: transform, opacity, filter;
                    }
                    #sector-${id} rect {
                      fill: #A349EF !important;
                    }
                    #sector-${id} text {
                      fill: #ffffff !important;
                    }
                  `;
                } else if (status === "idle") {
                  return `
                    #track-${id} {
                      stroke: #dadada !important;
                      stroke-opacity: 0.15;
                      stroke-width: 12;
                    }
                    #number${id} {
                      fill: #FFFFFF !important;
                    }
                    #number-${id} text {
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