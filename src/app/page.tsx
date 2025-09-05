"use client";
import { useState } from "react";

export default function RacePageClient() {
  const [fnoInput, setFnoInput] = useState("");

  return (
    <div className="flex justify-center bg-black min-h-screen w-full">
      {/* Constrained container with background */}
      <div
        className="relative w-full max-w-md min-h-screen bg-cover bg-center flex flex-col items-center text-white max-w-[400px]"
        style={{ backgroundImage: "url(/bg/race-bg2.jpg)" }}
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/20" />

        {/* Content */}
        <div
          className="relative z-10 flex flex-col items-center w-full px-4 pt-6"
          style={{ marginTop: "15px" }}
        >
          {/* Logo */}
          <img
            src="/bg/Innerdrive-logo.png"
            alt="Innerdrive Logo"
            className="w-[90%] max-w-[320px] h-auto object-contain mb-6"
          />

          {/* Dates */}
          <div className="flex justify-center items-center gap-2 mt-2">
            <div className="flex flex-col items-center justify-center rounded-[16px] bg-[#610B89] w-[70px] h-[70px]">
              <span className="font-sans text-[30px] leading-[110%] text-white font-bold">
                26
              </span>
              <span className="font-sans text-[18px] tracking-[0.04em] text-white">
                SEP
              </span>
            </div>

            <span className="font-sans text-white text-[40px] font-normal">–</span>

            <div className="flex flex-col items-center justify-center rounded-[16px] bg-[#610B89] w-[70px] h-[70px]">
              <span className="font-sans text-[30px] text-white font-bold">
                05
              </span>
              <span className="font-sans text-[18px] tracking-[0.04em] text-white">
                OCT
              </span>
            </div>
          </div>

          {/* Race Number Section */}
          <div className="relative flex flex-col items-center text-center" style={{ marginTop: "140px", marginBottom:"60px" }}>
  {/* Blurred Rectangle */}
  <div
    className="absolute w-[400px] h-[140px] rounded-lg"
    style={{
      backgroundColor: "#A700D1",
      opacity: 0.39,
      filter: "blur(25px)",
      top: "40px",        // 👈 push the blur down
      left: "50%",
      transform: "translateX(-50%)",
      zIndex: 0,
     
    }}
  />

              <div className="relative z-10 flex flex-col items-center justify-center h-[120px] w-[260px]">
              <div
                className="absolute inset-0 rounded-lg px-6 py-4"
                style={{
                  backgroundColor: "#A700D1",
                  opacity: 0.59,
                  filter: "blur(40px)",
                }}
              />

              <div
                className="relative z-10 flex flex-col items-center gap-1"
                style={{ marginTop: "90px" }}
              >
                <p
                  className="uppercase"
                  style={{
                    fontSize: "13px",
                    fontWeight: 600,
                    letterSpacing: "0.1em",
                    marginBottom: 0,
                  }}
                >
                  YOUR RACE NUMBER
                </p>

                {/* Race Number Input Box */}
                <div
  className="flex items-center justify-between px-6 w-[90%] max-w-[320px] relative "
  style={{
    backgroundColor: "rgba(57, 57, 57, 0.5)",
    backdropFilter: "blur(1px)",
    boxShadow: "0 0 4px rgba(0,0,0,0.45)",
    padding: 12,
    marginTop: 15,
    borderRadius: 20,
    position: "relative",
    overflow: "hidden",
  
  }}

>
  {/* 
                  {/* Fixed "F" */}
                  <span
                    className="font-dragracing text-[#FF00FF]"
                    style={{
                      fontSize: "48px",
                      fontWeight: 600,
                      marginLeft: 10,
                      marginRight: "2px",
                    }}
                  >
                    F
                  </span>

                  {/* Input */}
                  <input
                    type="text"
                    maxLength={5}
                    placeholder="-----"
                    value={fnoInput}
                    onChange={(e) =>
                      setFnoInput(e.target.value.replace(/[^0-9]/g, ""))
                    }
                    className="flex-1 bg-transparent text-[#FF00FF] font-dragracing max-w-[180px]"
                    style={{
                      fontSize: "48px",
                      fontWeight: 400,
                      letterSpacing: "0.15em",
                      border: 0,
                      outline: "none",
                      textAlign: "left",
                    }}
                  />

                  {/* Arrow button – visible only when 5 digits */}
{fnoInput.length === 5 && (
  <button
    onClick={async () => {
      try {
        const res = await fetch(`/api/check-race?fno=F${fnoInput}`);
        const data = await res.json();

        if (data?.exists) {
          window.location.href = `/F${fnoInput}`;
        } else {
          window.location.href = "/error";
        }
      } catch {
        window.location.href = "/error";
      }
    }}
    style={{
      border: "none",
      background: "transparent",
      padding: 0,
      marginLeft: "10px",
      cursor: "pointer",
    }}
  >
    <img
      src="/icons/rightwhitearrow.png"
      alt="Arrow"
      style={{
        width: "46px",
        height: "46px",
        objectFit: "contain",
      }}
    />
  </button>
)}
                </div>
              </div>
            </div>
          </div>

          {/* Subtitle Section */}
          <div className="mt-2">
            <p
              className="uppercase"
              style={{
                fontSize: "16px",
                fontWeight: 600,
                letterSpacing: "0.1em",
              }}
            >
              THE REAL RACE <span style={{
                fontSize: "16px",
                fontWeight: 400,
                letterSpacing: "0.1em",
              }}>within</span> 
            </p>

            
            
          
          </div>

          {/* Caption Text */}
          <p
            className="text-center uppercase mt-2 max-w-[320px]"
            style={{
              fontFamily: "'Poppins', sans-serif",
              fontWeight: 400,
              fontSize: 13,
              lineHeight: "134%",
              letterSpacing: 0.4,
            }}
          >
            Check your email for your driver code and enter it to enter the driver portal
          </p>
        </div>
      </div>
    </div>
  );
}