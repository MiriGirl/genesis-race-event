import React, { useEffect, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";


interface SectorInfoProps {
  sectorId: number;
  onClose: () => void;
}

interface SectorData {
  title: string;
  subtitle: string;
  challenge: string;
  activity: string;
  athleteHighlight: string;
  athleteName: string;
  athleteImage: string;
  athleteDescription: string;
  athleteMessage: string;
  stationTheme: string;
  poweredBy: string;
  officialPartner: string;
  brandLogo: string;
  brandDescription: string;
  concernsTitle: string;
  concernsText: string;
}


export default function SectorInfo({ sectorId, onClose }: SectorInfoProps) {
  const [sectorData, setSectorData] = useState<SectorData | null>(null);

  useEffect(() => {
    async function fetchSectorData() {
      try {
        const response = await fetch(`/api/station-details?sector=${sectorId}`);
        if (response.ok) {
          const data = await response.json();
          console.log("Sector API result:", data);
          const api = data.data;

          // Map API → Component fields
          const mapped: SectorData = {
            title: api.sector_name,
            subtitle: api.type,
            challenge: api.challenge,
            activity: api.activity,
            athleteHighlight: api.athlete_highlight,
            athleteName: api.athlete_highlight, // fallback for name
            athleteImage: api.athlete_image,
            athleteDescription: api.athlete_description,
            athleteMessage: api.athlete_message,
            stationTheme: "INNERDRIVE™ STATION THEME", // static
            poweredBy: api.powered_by,
            officialPartner: api.official_partner,
            brandLogo: api.logo_url,
            brandDescription: api.brand_description,
            concernsTitle: "Potential Concerns", // static
            concernsText: api.potential_concerns,
          };

          setSectorData(mapped);
        } else {
          setSectorData(null);
        }
      } catch (error) {
        setSectorData(null);
      }
    }
    fetchSectorData();
  }, [sectorId]);

  return (
    <div
      // Overlay
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        zIndex: 1000,
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        alignItems: "center",
        background: "rgba(0,0,0,0.55)",
      }}
    >
      <AnimatePresence>
        <motion.div
          // Bottom sheet
          style={{
            width: "100 %",
            paddingTop: 10,
            overflowX: "hidden",
            maxWidth: "520px",
            left: 0, right: 0, bottom: 0,
            margin: "0 auto",
            background: "#fff",
            borderTopLeftRadius: "40px",
            borderTopRightRadius: "40px",
            boxShadow: "0 -4px 20px rgba(0,0,0,0.3)",
            position: "fixed",
            height: "80vh",
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-start",    
            paddingRight: "10px",
            paddingLeft: "10px",
          }}
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "100%", opacity: 0 }}
          transition={{
            type: "spring",
            stiffness: 180,
            damping: 22,
            mass: 0.55,
            opacity: { duration: 0.18 },
          }}
        >
          <AnimatePresence mode="wait" initial={false}>
            {!sectorData && (
              <motion.div
                key="loader"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.22 }}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  height: "100%",
                  minHeight: "100%",
                }}
              >
                {/* Header always at the top */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    position: "relative",
                    paddingBottom: 8,
                    borderBottom: "1px solid #ddd",
                    flexShrink: 0,
                  }}
                >
                  <button
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      position: "absolute",
                      left: 0,
                      top: "50%",
                      transform: "translateY(-50%)",
                      fontSize: "1.5rem",
                      fontWeight: "bold",
                      lineHeight: 1,
                      padding: "4px 8px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                    onClick={onClose}
                    aria-label="Close"
                  >
                    <Image
                      src="/bg/arrow-prev.svg"
                      alt="Back"
                      width={30}
                      height={30}
                      priority
                      style={{ display: "block", justifyContent: "center"}}
                    />
                  </button>
                  <h2
                    style={{
                      margin: 0,
                      fontSize: 22,
                      fontWeight: 800,
                      letterSpacing: -0.5,
                      textAlign: "center",
                      flex: 1,
                      color: "black",
                      lineHeight: "22px",
                    }}
                  >
                    SECTOR {sectorId} <br />
                    INFORMATION
                  </h2>
                </div>
                {/* Loader centered in remaining space */}
                <div
                  style={{
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <div className="loader" />
                  <style>{`
                    .loader {
                      width: 60px;
                      aspect-ratio: 1;
                      --g: conic-gradient(from -90deg at 10px 10px,#a349ef 90deg,#0000 0);
                      background: var(--g), var(--g), var(--g);
                      background-size: 50% 50%;
                      animation: l16 1s infinite;
                    }
                    @keyframes l16 {
                      0%   {background-position:0    0   ,10px 10px,20px 20px} 
                      50%  {background-position:0    20px,10px 10px,20px 0   } 
                      100% {background-position:20px 20px,10px 10px,0    0   } 
                    }
                  `}</style>
                </div>
              </motion.div>
            )}
            {sectorData && (
              <motion.div
                key="content"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                style={{
                  maxWidth: 600,
                  margin: "0 auto",
                  textAlign: "center",
                  paddingTop: 8, // top spacing for consistency
                }}
              >
          <div
            // .header
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
              paddingBottom: 8,
              borderBottom: "1px solid #ddd",
            }}
          >
            <button
              // .close-button
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                position: "absolute",
                left: 0,
                top: "50%",
                transform: "translateY(-50%)",
                fontSize: "1.5rem",
                fontWeight: "bold",
                lineHeight: 1,
                padding: "4px 8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              onClick={onClose}
              aria-label="Close"
            >
              <Image
                src="/bg/arrow-prev.svg"
                alt="Back"
                width={30}
                height={30}
                priority
                style={{ display: "block", justifyContent: "center"}}
              />
            </button>
            <h2
              style={{
                margin: 0,
                fontSize: 22,
                fontWeight: 800,
                letterSpacing: -0.5,
                textAlign: "center",
                flex: 1,
                color: "black",
                lineHeight: "22px",
              }}
            >
              SECTOR {sectorId} <br />
              INFORMATION
            </h2>
          </div>
       
            <div
              // .circle-container
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                margin: "16px 0",
                position: "relative",
              }}
            >
              <img
                src="/bg/check-flag.png"
                alt=""
                aria-hidden="true"
                // .checkerboard-left
                style={{
                  position: "absolute",
                  top: "50%",
                  left: -34,
                  width: 160,
                  height: "auto",
                  transform: "translateY(-30%)",
                  opacity: 1,
                  zIndex: 0,
                  pointerEvents: "none",
                  userSelect: "none",
                }}
              />
              <div
                // .circle-number
                style={{
                  width: 72,
                  height: 72,
                  background: "#a349ef",
                  color: "white",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: "bold",
                  fontSize: 40,
                }}
              >
                {sectorId}
              </div>
              <img
                src="/bg/check-flag-right.png"
                alt=""
                aria-hidden="true"
                // .checkerboard-right
                style={{
                  position: "absolute",
                  top: "50%",
                  right: -44,
                  width: 150,
                  height: "auto",
                  transform: "translateY(-30%)",
                  opacity: 1,
                  zIndex: 0,
                  pointerEvents: "none",
                  userSelect: "none",
                }}
              />
            </div>
            <div>
              <h1
                // .title
                style={{
                  margin: 0,
                  fontSize: "2rem",
                  fontWeight: 700,
                  color: "black",
                  textAlign: "center",
                }}
              >
                {sectorData.title}
              </h1>
            </div>
            <div>
              <p
                // .subtitle
                style={{
                  display: "inline-block",
                  margin: "12px auto 24px auto",
                  padding: "6px 16px",
                  border: "2px solid #a349ef",
                  borderRadius: 20,
                  backgroundColor: "transparent",
                  color: "#000",
                  fontSize: 14,
                  fontWeight: 500,
                  textAlign: "center",
                }}
              >
                {sectorData.challenge}
              </p>
            </div>
            <div>
              <div
                // .pit-lane-banner
                style={{
                  backgroundColor: "#A349EF",
                  color: "white",
                  fontWeight: "bold",
                  fontSize: "18px",
                  textTransform: "uppercase",
                  padding: "5px 15px",
                  display: "inline-block",
                  clipPath: "polygon(5% 0, 95% 0, 100% 100%, 0% 100%)",
                  margin: "0 auto",
                  position: "relative",
                  zIndex: 1,
                }}
              >
                PIT LANE CHALLENGE
              </div>
            </div>
            <div
              // .section.highlight
              style={{
                backgroundColor: "#f4f4f4ff",
                padding: "25px 22px 25px 22px",
                borderRadius: 18,
                marginTop: -12,
                position: "relative",
                zIndex: 0,
              }}
            >
              <p
                style={{
                  margin: 0,
                  color: "#444",
                  fontSize: 15,
                  lineHeight: 1.4,
                }}
              >
                {sectorData.activity}
              </p>
            </div>
            <div
              // .section.concerns
              style={{}}
            >
              <div
                // .concerns-title
                style={{
                  backgroundColor: "#FF4D4D",
                  color: "white",
                  fontWeight: "bold",
                  fontSize: 16,
                  textTransform: "uppercase",
                  padding: "5px 20px",
                  display: "inline-block",
                  clipPath: "polygon(5% 0, 95% 0, 100% 100%, 0% 100%)",
                  margin: "20px auto 10px auto",
                  position: "relative",
                  zIndex: 1,
                }}
              >
                {sectorData.concernsTitle}
              </div>
              <div
                // .concerns-box
                style={{
                  backgroundColor: "#ffe6e6",
                  color: "#cc0000",
                  borderRadius: 12,
                  padding: "15px 20px",
                  maxWidth: 600,
                  margin: "0 auto 24px auto",
                  fontSize: 15,
                  lineHeight: 1.4,
                  textAlign: "center",
                  marginTop: -15,
                }}
              >
                <p
                  // .concerns-box-text
                  style={{
                    color: "#cc0000",
                    fontSize: 14,
                    margin: 0,
                  }}
                >
                  {sectorData.concernsText}
                </p>
              </div>
            </div>
            <div
              // .section
              style={{}}
            >
              <h3
                style={{
                  margin: "24px 0",
                  fontSize: 16,
                  fontWeight: 700,
                  color: "#a349ef",
                  textTransform: "uppercase",
                  display: "flex",
                  alignItems: "center",
                  textAlign: "center",
                  justifyContent: "center",
                  position: "relative",
                }}
              >
                {/* divider lines left/right */}
                <span
    style={{
      flex: 1,
      height: 1,
      backgroundColor: "#e0e0e0",
      marginRight: 12,
    }}
  />
                <span
                  style={{
                    padding: "0 12px",
                    position: "relative",
                    zIndex: 1,
                  }}
                >
                  SECTOR ACTIVITY
                </span>
                <span
    style={{
      flex: 1,
      height: 1,
      backgroundColor: "#e0e0e0",
      marginRight: 12,
    }}
  />
              </h3>
              <p
                style={{
                  margin: 0,
                  color: "#444",
                  fontSize: 14,
                  lineHeight: 1.4,
                }}
              >
                {sectorData.activity}
              </p>
            </div>
            <div
              // .section
              style={{}}
            >
              <h3
                style={{
                  margin: "24px 0",
                  fontSize: 16,
                  fontWeight: 700,
                  color: "#a349ef",
                  textTransform: "uppercase",
                  display: "flex",
                  alignItems: "center",
                  textAlign: "center",
                  justifyContent: "center",
                  position: "relative",
                }}
              >
                {/* divider lines left/right */}
                <span
    style={{
      flex: 1,
      height: 1,
      backgroundColor: "#e0e0e0",
      marginRight: 12,
    }}
  />
                <span
                  style={{
                    padding: "0 12px",
                    position: "relative",
                    zIndex: 1,
                  }}
                >
                 ATHLETE HIGHLIGHT
                </span>
                <span
    style={{
      flex: 1,
      height: 1,
      backgroundColor: "#e0e0e0",
      marginRight: 12,
    }}
  />
              </h3>
              <div
                // .athlete-row
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  textAlign: "center",
                  paddingLeft: 10,
                  paddingRight: 10,
                }}
              >
                <div
                  // .athlete-image
                  style={{
                    flex: 1,
                    maxWidth: "80%",
                    marginBottom: 20,
                  }}
                >
                  {sectorData.athleteImage && (
                    <img
                      src={sectorData.athleteImage}
                      alt={sectorData.athleteName || "Athlete"}
                      style={{
                        width: "100%",
                        height: "auto",
                        borderRadius: 12,
                      }}
                    />
                  )}
                </div>
                <div
                  // .athlete-text
                  style={{
                    flex: 1,
                  }}
                >
                  <h4
                    style={{
                      margin: "0 0 8px 0",
                      fontSize: 24,
                      fontWeight: 700,
                      color: "black",
                      textTransform: "uppercase",
                      alignItems: "center",
                      textAlign: "center",
                    }}
                  >
                    {sectorData.athleteName}
                  </h4>
                  <p
                    // .athlete-desc
                    style={{
                      fontSize: "15px",
                      color: "#555",
                      lineHeight: 1.5,
                      margin: 0,
                      marginBottom: 8,
                       textTransform: "capitalize",
                    }}
                  >
                    {sectorData.athleteDescription}
                  </p>
                </div>
              </div>
            </div>
            <div
              // .section
              style={{}}
            >
              <h3
                style={{
                  margin: "24px 0",
                  fontSize: 16,
                  fontWeight: 700,
                  color: "#a349ef",
                  textTransform: "uppercase",
                  display: "flex",
                  alignItems: "center",
                  textAlign: "center",
                  justifyContent: "center",
                  position: "relative",
                }}
              >
                {/* divider lines left/right */}
                <span
    style={{
      flex: 1,
      height: 1,
      backgroundColor: "#e0e0e0",
      marginRight: 12,
    }}
  />
                <span
                  style={{
                    padding: "0 12px",
                    position: "relative",
                    zIndex: 1,
                  }}
                >
                 MOTIVATIONAL QUOTE
                </span>
                <span
    style={{
      flex: 1,
      height: 1,
      backgroundColor: "#e0e0e0",
      marginRight: 12,
    }}
  />
              </h3>
            <div
              // .athlete-message-box
              style={{
                backgroundColor: "#f2f2f2",
                padding: "40px 44px",
                marginTop: 24,
                marginBottom: 24,
                textAlign: "center",
              }}
            >
              <p
                // .athlete-quote
                style={{
                  textTransform: "uppercase",
                  fontWeight: 600,
                  color: "#616161",
                  fontSize: 22,
                  margin: "0 0 8px 0",
                  lineHeight: "22px",
                }}
              >
                {sectorData.athleteMessage}
              </p>
              <p
                // .athlete-subtitle
                style={{
                  fontSize: "0.9rem",
                  fontWeight: 400,
                  color: "#858585",
                  margin: 0,
                }}
              >
                {sectorData.stationTheme}
              </p>
            </div>
            <div
              // .section
              style={{}}
            >
              <h3
                style={{
                  margin: "24px 0",
                  fontSize: 16,
                  fontWeight: 700,
                  color: "#a349ef",
                  textTransform: "uppercase",
                  display: "flex",
                  alignItems: "center",
                  textAlign: "center",
                  justifyContent: "center",
                  position: "relative",
                }}
              >
                {/* divider lines left/right */}
                <span
    style={{
      flex: 1,
      height: 1,
      backgroundColor: "#e0e0e0",
      marginRight: 12,
    }}
  />
                <span
                  style={{
                    padding: "0 12px",
                    position: "relative",
                    zIndex: 1,
                  }}
                >
                  POWERED BY
                </span>
                <span
    style={{
      flex: 1,
      height: 1,
      backgroundColor: "#e0e0e0",
      marginRight: 12,
    }}
  />
              </h3>
              <div
                // .brand
                style={{
                  display: "flex",
                  alignItems: "center",
                  flexDirection: "column",
                }}
              >
                {sectorData.brandLogo && (
                  <img
                    src={sectorData.brandLogo}
                    alt={sectorData.poweredBy || "Brand Logo"}
                    style={{
                      marginTop: 10,
                      marginBottom: 10,
                      width: "50%",
                      height: "auto",
                      objectFit: "contain",
                    }}
                  />
                )}
                <h4
                  style={{
                    margin: "20px 2px 0px 0",
                    fontWeight: 600,
                    fontSize: 22,
                    color: "#222",
                    textTransform: "uppercase",
                  }}
                >
                  {sectorData.poweredBy}
                </h4>
                {sectorData.officialPartner && (
                  <p
                    style={{
                      backgroundColor: "#e0e0e0",
                      borderRadius: 12,
                      textTransform: "uppercase",
                      color: "#555555",
                      padding: "4px 12px",
                      margin: "6px auto 12px auto",
                      maxWidth: "fit-content",
                      textAlign: "center",
                      fontSize: "0.85rem",
                      fontWeight: 600,
                    }}
                  >
                    {sectorData.officialPartner}
                  </p>
                )}
                <p
                  style={{
                    margin: 0,
                    fontSize: 14,
                    color: "#848484",
                    maxWidth: 360,
                  }}
                >
                  {sectorData.brandDescription}
                </p>
              </div>
            </div>
          </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}