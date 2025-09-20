import MapSVG from "./map";

interface RaceMapProps {
  currentSector: number | null; // null = all idle
  sectors?: { id: number; status: "completed" | "active" | "idle" }[];
}

export default function RaceMap({ currentSector, sectors }: RaceMapProps) {
  return (
    <div style={{ display: "flex", justifyContent: "center" }}>
      <MapSVG style={{ width: "100%", height: "auto" }} />
      <style jsx global>{`
        /* ✅ If no currentSector, everything stays idle */
        ${currentSector === null
          ? `
          #track-1, #track-2, #track-3, #track-4, #track-5, #track-6 {
            stroke: #dadada;
            stroke-opacity: 0.2;
            stroke-width: 12;
          }

          /* 🔮 Sector 1 pulses as a group (circle + text) */
          #number-1 {
            animation: pulseGroup 2s infinite ease-in-out;
            transform-origin: center;
            filter: drop-shadow(0 0 4px #a349ef);
          }

          /* Other circles idle grey */
          #number-2, #number-3, #number-4, #number-5, #number-6 {
            fill: #dadada;
          }
          text[id="2"], text[id="3"], text[id="4"], text[id="5"], text[id="6"] {
            fill: #a349ef;
          }
        `
          : ""}

        /* ✅ Completed sectors (before currentSector) */
        ${currentSector && currentSector > 1
          ? Array.from({ length: currentSector - 1 }, (_, i) => {
              const sector = i + 1;
              return `
                #track-${sector} {
                  stroke: #610b89;
                  stroke-width: 12;
                  stroke-linecap: round;
                  filter: drop-shadow(0px 0px 4px #610b89);
                }
                #number-${sector} {
                  fill: #610b89;
                }
                text[id="${sector}"] {
                  fill: #ffffff;
                }
              `;
            }).join("\n")
          : ""}

        /* ✅ Active sector (only if provided) */
        ${currentSector
          ? `
          #track-${currentSector} {
            stroke: #a349ef;
            stroke-width: 12;
            stroke-linecap: round;
            filter: drop-shadow(0px 0px 6px #a349ef);
            stroke-dasharray: 1200;
            stroke-dashoffset: 1200;
            animation: dashForward 12s linear infinite;
          }
          #number-${currentSector} {
            fill: #a349ef;
            animation: pulseGlow 2s infinite ease-in-out;
          }
          text[id="${currentSector}"] {
            fill: #ffffff;
          }
        `
          : ""}

        /* ✅ Idle sectors (after currentSector or all if null) */
        ${
          currentSector
            ? Array.from({ length: 6 - currentSector }, (_, i) => {
                const sector = currentSector + i + 1;
                return `
                  #track-${sector} {
                    stroke: #dadada;
                    stroke-opacity: 0.2;
                    stroke-width: 12;
                  }
                  #number-${sector} {
                    fill: #dadada;
                  }
                  text[id="${sector}"] {
                    fill: #a349ef;
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
                      stroke: #610b89;
                      stroke-width: 12;
                      stroke-linecap: round;
                      filter: drop-shadow(0px 0px 4px #610b89);
                    }
                    #number-${id} {
                      fill: #610b89;
                    }
                    text[id="${id}"] {
                      fill: #ffffff;
                    }
                  `;
                } else if (status === "active") {
                  return `
                    #track-${id} {
                      stroke: #a349ef;
                      stroke-width: 12;
                      stroke-linecap: round;
                      filter: drop-shadow(0px 0px 6px #a349ef);
                      stroke-dasharray: 1200;
                      stroke-dashoffset: 1200;
                      animation: dashForward 12s linear infinite;
                    }
                    #number-${id} {
                      fill: #a349ef;
                      animation: pulseGlow 2s infinite ease-in-out;
                    }
                    text[id="${id}"] {
                      fill: #ffffff;
                    }
                  `;
                } else if (status === "idle") {
                  return `
                    #track-${id} {
                      stroke: #dadada;
                      stroke-opacity: 0.2;
                      stroke-width: 12;
                    }
                    #number-${id} {
                      fill: #dadada;
                    }
                    text[id="${id}"] {
                      fill: #a349ef;
                    }
                  `;
                }
                return "";
              })
              .join("\n")
          : ""}

        /* 🔮 Pulse glow for active circle */
        @keyframes pulseGlow {
          0% { filter: drop-shadow(0 0 2px #a349ef); }
          50% { filter: drop-shadow(0 0 8px #a349ef); }
          100% { filter: drop-shadow(0 0 2px #a349ef); }
        }

        /* 🔮 Pulse whole group in idle */
        @keyframes pulseGroup {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.1); opacity: 0.9; }
          100% { transform: scale(1); opacity: 1; }
        }

        /* Smooth forward animation */
        @keyframes dashForward {
          from { stroke-dashoffset: 1200; }
          to { stroke-dashoffset: 0; }
        }
      `}</style>
    </div>
  );
}