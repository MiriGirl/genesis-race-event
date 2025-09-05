"use client";

import Link from "next/link";

export default function ErrorPage() {
  return (
    <div
      style={{
        position: "fixed",
        inset: "0",
        zIndex: 50,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(0, 0, 0, 0.05)", // dark overlay
        padding: "20px",
        
      }}
    >
      {/* Modal card */}
      <div
        style={{
          backgroundColor: "white",
          borderRadius: "12px",
          boxShadow: "0 10px 25px rgba(0,0,0,0.3)",
          width: "90%",
          maxWidth: "420px",
          padding: "24px",
          position: "relative",
          textAlign: "center",
        }}
      >
        {/* Close button */}
        <button
          style={{
            position: "absolute",
            top: "12px",
            right: "12px",
            fontSize: "20px",
            color: "#9ca3af", // gray-400
            background: "transparent",
            border: "none",
            cursor: "pointer",
            alignItems: "center",
          }}
          aria-label="Close"
          onClick={() => (window.location.href = "https://innerdrive.sg")}
        >
          ×
        </button>
          <img
  src="/bg/innerdrive.jpg"
  alt="Innerdrive Logo"
  style={{
    width: "70%",       // 50% sizing
    margin: "0 auto",   // center horizontally
    display: "block",   // ensures centering works
    marginTop: "10px",
     marginBottom: "10px",
  }}
/>
        {/* Title */}
        <h1
          style={{
            fontSize: "20px",
            fontWeight: 600,
            color: "#111827", // gray-900
            marginBottom: "8px",
             marginTop: "25px",
             lineHeight: 1.1,
          }}
        >
          The race number you entered does not exist!
        </h1>

        {/* Message */}
        <p
          style={{
            fontSize: "13px",
            color: "#4b5563", // gray-600
            marginBottom: "25px",
            lineHeight: 1.3,
             marginTop: "25px",
            paddingLeft: "20px",
         paddingRight: "20px",
           
          }}
        >
          Please check your email and type the race number provided to you.
        </p>

        {/* Okay button */}
        <div style={{ display: "flex", justifyContent: "center" }}>
          <Link href="https://innerdrive.sg">
            <button
      style={{
        backgroundColor: "#111827", // gray-900
        color: "white",
        fontSize: "14px",
        fontWeight: 500,
        padding: "18px 46px",
        borderRadius: "36px",
        cursor: "pointer",
        border: "none",
      }}
    >
      Retry
    </button>
          </Link>
        </div>
        {/* Logo at bottom */}

      </div>
    </div>
  );
}