"use client";
import React, { useState } from "react";
import AdminApp from "../components/adminapp";
import BagGiven from "../components/baggiven";
import MerchPurchase from "../components/merchpurchase";




export default function AdminDashboard() {
  const [isAppSheetOpen, setIsAppSheetOpen] = useState(false);
  const [isBagSheetOpen, setIsBagSheetOpen] = useState(false);
  const [isMerchSheetOpen, setIsMerchSheetOpen] = useState(false);

  return (
    <div
      style={{
        flexDirection: "column",
        overflowX: "hidden",
        minHeight: "100vh",
        width: "100vw",
        maxWidth: "100vw",
        boxSizing: "border-box",
      }}
    >
      {/* Hero */}
      <img
        src="/bg/admin-bg.webp"
        alt="Hero"
        style={{ width: "100vw", maxWidth: "100vw", display: "block" }}
      />
        <h2
        className="font-dragracing"
          style={{
            fontSize: "45px",
            color: "#fff",
            fontWeight: 600,
            lineHeight: "32px",
            letterSpacing: "1px",
            textAlign: "center",
            marginBottom: "68px",
            marginTop: "-90px",
            textTransform: "uppercase",
            textShadow: "0 0 10px #FF00FF, 0 0 20px #FF00FF, 0 0 40px #FF00FF",
          }}
        >
          Admin Dashboard
        </h2>
      {/* White Card */}
      <div
        style={{
          background: "#fff",
          color: "#000",
          width: "100vw",
          maxWidth: "100vw",
          marginTop: "-24px",
          borderTopLeftRadius: "54px",
          borderTopRightRadius: "54px",
          padding: "24px 16px",
          boxShadow: "0 20px 60px rgba(0,0,0,0.35)",
          boxSizing: "border-box",
        }}
      >
        <h2
          style={{
            fontSize: "26px",
            fontWeight: 700,
            lineHeight: "32px",
            letterSpacing: "-1px",
            textAlign: "center",
            marginBottom: "-5px",
            marginTop: "0px",
            textTransform:"uppercase"
          }}
        >
          Select a function
        </h2>
        <p
          style={{
            fontSize: "14px",
            color: "#777",
            lineHeight: "18px",
            textAlign: "center",
            marginBottom: "20px",
            paddingLeft: "40px",
            paddingRight: "40px",
          }}
        >
          Select a function to manage race entries, merch, and more.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Download App Points */}
          <button
          className="font-dragracing"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-start",
              gap: "12px",
              width: "100%",
              height: "85px",
              background: "#000",
              color: "#fff",
              border: "none",
              borderRadius: "999px",
              fontWeight: 700,
              fontSize: "22px",
              textTransform: "uppercase",
              cursor: "pointer",
              padding: "0 20px",
              lineHeight: 1,
              textAlign: "left",
            }}
            onClick={() => setIsAppSheetOpen(true)}
          >
             App Points
            <span
              style={{
                backgroundColor: "#f2f0ff",
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#000",
                fontWeight: "bold",
                fontSize: "20px",
                lineHeight: "1",
                marginLeft: "auto",
              }}
            >
              &rarr;
            </span>
          </button>

          {/* Merch Purchase */}
          <button
            className="font-dragracing"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-start",
              gap: "12px",
              width: "100%",
              height: "85px",
              background: "#7559FF",
              color: "#fff",
              border: "none",
              borderRadius: "999px",
              fontWeight: 700,
              fontSize: "20px",
              textTransform: "uppercase",
              cursor: "pointer",
              padding: "0 20px",
              boxSizing: "border-box",
              textAlign: "left"
            }}
            onClick={() => setIsMerchSheetOpen(true)}
          >
            Merch Purchase
            <span
              style={{
                backgroundColor: "#f2f0ff",
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#000",
                fontWeight: "bold",
                fontSize: "20px",
                lineHeight: "1",
                marginLeft: "auto",
              }}
            >
              &rarr;
            </span>
          </button>

          {/* Bag Collection Entry */}
          <button
            className="font-dragracing"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-start",
              gap: "12px",
              width: "100%",
              height: "85px",
              background: "#A259FF",
              color: "#fff",
              border: "none",
              borderRadius: "999px",
              fontWeight: 700,
              fontSize: "20px",
              textTransform: "uppercase",
              cursor: "pointer",
              padding: "0 20px",
              boxSizing: "border-box",
               textAlign: "left"
            }}
            onClick={() => setIsBagSheetOpen(true)}
          >
            Bag Collection Entry
            <span
              style={{
                backgroundColor: "#f2f0ff",
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#000",
                fontWeight: "bold",
                fontSize: "20px",
                lineHeight: "1",
                marginLeft: "auto",
              }}
            >
              &rarr;
            </span>
          </button>

          {/* Monitor Merch (disabled for now) */}
          <button
            className="font-dragracing"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-start",
              gap: "12px",
              width: "100%",
              height: "70px",
              background: "#eee",
              color: "#888",
              border: "none",
              borderRadius: "999px",
              fontWeight: 700,
              fontSize: "20px",
              textTransform: "uppercase",
              cursor: "not-allowed",
              padding: "0 20px",
              boxSizing: "border-box",
            }}
            disabled
          >
            Monitor Merch (Coming Soon)
            <span
              style={{
                backgroundColor: "#f2f0ff",
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#000",
                fontWeight: "bold",
                fontSize: "20px",
                lineHeight: "1",
                marginLeft: "auto",
              }}
            >
              &rarr;
            </span>
          </button>
        </div>
      </div>
      {isAppSheetOpen && (
        <AdminApp
          isOpen={isAppSheetOpen}
          onClose={() => setIsAppSheetOpen(false)}
        />
      )}
      {isMerchSheetOpen && (
  <MerchPurchase
    isOpen={isMerchSheetOpen}
    onClose={() => setIsMerchSheetOpen(false)}
  />
)}
      {isBagSheetOpen && (
        <BagGiven
          isOpen={isBagSheetOpen}
          onClose={() => setIsBagSheetOpen(false)}
        />
      )}
    </div>
  );
}