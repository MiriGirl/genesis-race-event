"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface AdminAppProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AdminApp({ isOpen, onClose }: AdminAppProps) {
  const [fno, setFno] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [status, setStatus] = useState<null | { bag_given: boolean; type: string }>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [giveLoading, setGiveLoading] = useState(false);
  // New state for t-shirt and bundle total
  const [tshirtTotal, setTshirtTotal] = useState(0);
  const [bundleTotal, setBundleTotal] = useState(0);

  // When 5 digits entered, fetch bag status
  useEffect(() => {
    setStatus(null);
    setError(null);
    if (fno.length === 5) {
      setLoading(true);
      console.log("Fetching GET /api/bag-status with:", { raceNo: `F${fno}`, bib: fno });
      fetch(`/api/bag-status?raceNo=F${fno}&bib=${fno}`)
        .then(async (res) => {
          if (!res.ok) {
            throw new Error(await res.text());
          }
          return res.json();
        })
        .then((data) => {
          setStatus(data);
        })
        .catch((err) => {
          setError(typeof err === "string" ? err : err?.message || "Error");
        })
        .finally(() => setLoading(false));
    }
  }, [fno]);

  const handleGiveGift = async () => {
    setGiveLoading(true);
    setError(null);
    try {
      console.log("Sending POST /api/bag-status with:", { raceNo: "F" + fno, bib: fno, bag_given: true });
      const response = await fetch("/api/bag-status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ raceNo: "F" + fno, bib: fno, bag_given: true }),
      });
      if (!response.ok) {
        const errorMsg = await response.text();
        setError("Failed to update: " + errorMsg);
        return;
      }
      // Refetch status
      console.log("Refetching GET /api/bag-status with:", { raceNo: `F${fno}`, bib: fno });
      const refreshed = await fetch(`/api/bag-status?raceNo=F${fno}&bib=${fno}`);
      if (!refreshed.ok) {
        throw new Error(await refreshed.text());
      }
      setStatus(await refreshed.json());
    } catch (err: any) {
      setError(err?.message || "Error");
    } finally {
      setGiveLoading(false);
    }
  };

  const isActive = isFocused || fno !== "";

  // Determine colors for F and input based on status
  let fColor = isActive ? "#5932EA" : "#777777";
  let inputBorder = isActive ? "#5932EA" : "#D6D6D6";
  let inputBg = isActive ? "rgba(79,42,234,0.11)" : "#f4f4f4ff";

  if (status) {
    if (status.type !== "finished") {
      fColor = "#d32f2f";
      inputBorder = "#d32f2f";
      inputBg = "rgba(211,47,47,0.11)";
    } else if (status.bag_given) {
      fColor = "#1bbf4a";
      inputBorder = "#1bbf4a";
      inputBg = "rgba(27,191,74,0.11)";
    } else {
      fColor = "#5932EA";
      inputBorder = "#5932EA";
      inputBg = "rgba(79,42,234,0.11)";
    }
  }

  // State for merch purchase
  const [capQty, setCapQty] = useState(0);
  const [tumblerQty, setTumblerQty] = useState(0);

  // Updated cap and tumbler prices
  const capPrice = 25.0;
  const tumblerPrice = 28.0;

  const capTotal = capQty * capPrice;
  const tumblerTotal = tumblerQty * tumblerPrice;

  // Use new tshirtTotal and bundleTotal from state
  const totalToPay = tshirtTotal + bundleTotal + capTotal + tumblerTotal;

  // Handler for PAY button: submit CAP, TUMBLER, TSHIRT, and BUNDLE purchases to API
  const handlePay = async () => {
    // Collect purchases for CAP and TUMBLER (always pass fno if exists)
    const purchases: {
      type: string;
      qty: number;
      price?: number;
      item?: string;
      fno?: string;
    }[] = [];
    // Always pass fno if exists (for all items)
    const fnoField = fno ? { fno: "F" + fno } : {};
    if (capQty > 0) {
      purchases.push({
        type: "CAP",
        qty: capQty,
        price: capPrice,
        item: "Cap",
        ...fnoField,
      });
    }
    if (tumblerQty > 0) {
      purchases.push({
        type: "TUMBLER",
        qty: tumblerQty,
        price: tumblerPrice,
        item: "Tumbler",
        ...fnoField,
      });
    }
    // --- TSHIRT: collect from TShirtRow state
    let tshirtRows: any[] = [];
    if (typeof window !== "undefined" && (window as any).__tshirtRows) {
      tshirtRows = (window as any).__tshirtRows;
    }
    let bundleRows: any[] = [];
    if (typeof window !== "undefined" && (window as any).__bundleRows) {
      bundleRows = (window as any).__bundleRows;
    }
    // Add TSHIRT purchases (ensure item_type/item not null, always pass fno if exists)
    if (Array.isArray(tshirtRows)) {
      tshirtRows.forEach((row) => {
        if (row && row.qty > 0 && row.model && row.variant) {
          purchases.push({
            type: "TSHIRT",
            item: row.model && row.variant ? row.model + " " + row.variant : "TShirt",
            qty: row.qty,
            price: row.price ?? 0,
            ...fnoField,
          });
        }
      });
    }
    // Add BUNDLE purchases (ensure item_type/item not null, always pass fno if exists)
    if (Array.isArray(bundleRows)) {
      bundleRows.forEach((row) => {
        if (row && row.qty > 0 && row.model && row.variant) {
          purchases.push({
            type: "BUNDLE",
            item: row.model && row.variant ? row.model + " " + row.variant : "Bundle",
            qty: row.qty,
            price: row.price ?? 0,
            ...fnoField,
          });
        }
      });
    }
    // Log fno and purchases payload
    console.log("FNO for merch purchase:", fno);
    console.log("Submitting merch purchases (full payload):", purchases);
    try {
      // If fno exists, also update participant with fno (log it)
      if (fno) {
        console.log("Updating participant with fno:", "F" + fno);
        // Example: you might want to POST to /api/participant-update or similar.
        // Uncomment and adjust as needed:
        // await fetch("/api/participant-update", {
        //   method: "POST",
        //   headers: { "Content-Type": "application/json" },
        //   body: JSON.stringify({ fno: "F" + fno })
        // });
      }
      const requestBody = JSON.stringify({ purchases });
      console.log("Raw request body for /api/merch-purchase:", requestBody);
      const res = await fetch("/api/merch-purchase", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: requestBody,
      });
      if (!res.ok) {
        const txt = await res.text();
        console.error("Merch purchase error:", txt);
        return;
      }
      console.log("Merch purchase successful");
      onClose();
    } catch (err) {
      console.error("Merch purchase error:", err);
    }
  };

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.div
          key="footer-enter"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "flex-end",
            zIndex: 1000,
          }}
          onClick={onClose}
        >
          {/* Close button - moved to top left inside sheet */}
          <div style={{ position: "absolute", left: 0, top: 0, width: "100%", maxWidth: "530px", margin: "0 auto", pointerEvents: "none" }}>
            <button
              onClick={onClose}
              style={{
                position: "absolute",
                top: 16,
                left: 16,
                background: "#fff",
                border: "none",
                borderRadius: "50%",
                width: "44px",
                height: "44px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "20px",
                fontWeight: "bold",
                color: "#000",
                cursor: "pointer",
                zIndex: 1001,
                boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
                pointerEvents: "auto",
              }}
            >
              ✕
            </button>
          </div>

          {/* Bottom sheet */}
          <motion.div
            key="enter-fno-sheet"
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{
              type: "spring",
              stiffness: 140,
              damping: 18,
              opacity: { duration: 0.2 },
            }}
            style={{
              width: "90%",
              maxWidth: "530px",
              margin: "0 auto",
              background: "#fafafa",
              border: 40,
              padding: "24px",
              boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              borderTopLeftRadius: "40px",
              borderTopRightRadius: "40px",
              maxHeight: "90vh",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Scrollable content */}
            <div style={{ flex: 1, overflowY: "auto", paddingBottom: 100, width: "100%" }}>
              {/* Heading */}
              <h3
                style={{
                  textAlign: "center",
                  fontSize: "28px",
                  fontWeight: 700,
                  marginBottom: -10,
                  marginTop: -5,
                  color: "#000",
                }}
              >
                ENTER FNO
              </h3>
              {/* Instruction text */}
              <p
                style={{
                  textAlign: "center",
                  fontSize: "14px",
                  marginBottom: "24px",
                  color: "#6d6d6dff",
                }}
              >
                Enter the FNO. Gift status will show automatically.
              </p>

              {/* Separate F prefix and input */}
              <div
                className="font-dragracing"
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  marginBottom: "24px",
                  width: "100%",
                  maxWidth: "300px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: "12px",
                    width: "100%",
                  }}
                >
                  <span
                    style={{
                      color: fColor,
                      fontWeight: "700",
                      fontSize: "24px",
                      fontFamily: "'Drag Racing', cursive",
                      userSelect: "none",
                    }}
                  >
                    F
                  </span>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    placeholder={isFocused || fno !== "" ? "" : "10000"}
                    maxLength={5}
                    value={fno}
                    onChange={(e) => {
                      // Only allow numbers
                      const val = e.target.value.replace(/[^0-9]/g, "");
                      setFno(val);
                    }}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    style={{
                      flexGrow: 1,
                      border: `1.5px solid ${inputBorder}`,
                      borderRadius: "16px",
                      padding: "10px 16px",
                      fontSize: "28px",
                      fontWeight: "600",
                      fontFamily: "inherit",
                      backgroundColor: inputBg,
                      outline: "none",
                      textAlign: "center",
                      color: inputBorder,
                      justifyContent: "center",
                      width: 50,
                    }}
                  />
                </div>
              </div>

              {/* Horizontal divider line */}
              <div style={{ borderTop: "4px solid #EEEEEE", width: "95%" }} />

              {/* --- T‑SHIRT SECTION (single row design) --- */}
              <TShirtRow onTotalChange={setTshirtTotal} />

              {/* Divider line */}
              <div style={{ borderTop: "4px solid #EEEEEE", width: "95%", margin: "16px 0" }} />

              {/* CAP Section */}
              <div style={{ width: "100%", marginTop: 8 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                  <div style={{ paddingLeft: "8px", color: "#111", fontWeight: 800, fontSize: 18, letterSpacing: 0.2 }}>CAP</div>
                  <div style={{
                    background: "#F4EDFF",
                    color: "#6B6B6B",
                    fontWeight: 600,
                    borderRadius: 28,
                    padding: "10px 8px",
                    fontSize: 14,
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    minWidth: 110
                  }}>
                    ${ (capQty * capPrice).toFixed(2) }
                  </div>
                </div>
                <input
                  type="number"
                  min={0}
                  value={capQty === 0 ? "" : capQty}
                  onChange={e => {
                    const val = e.target.value;
                    setCapQty(val === "" ? 0 : Math.max(0, Number(val)));
                  }}
                  placeholder="QTY"
                  style={{
                    width: "90%",
                    height: 50,
                    borderRadius: 14,
                    border: "1.5px solid #E6E6EA",
                    padding: "0 18px",
                    fontSize: 14,
                    textAlign: "center",
                    background: "#fff",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
                    fontWeight: 500,
                    color: "#222"
                  }}
                />
              </div>

              {/* Divider after CAP */}
              <div style={{ borderTop: "4px solid #EEEEEE", width: "95%", margin: "16px 0" }} />

              {/* TUMBLER Section */}
              <div style={{ width: "100%", marginTop: 8 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                  <div style={{ paddingLeft: "8px", color: "#111", fontWeight: 800, fontSize: 18, letterSpacing: 0.2 }}>TUMBLER</div>
                  <div style={{
                    background: "#F4EDFF",
                    color: "#6B6B6B",
                    fontWeight: 600,
                    borderRadius: 28,
                    padding: "10px 8px",
                    fontSize: 14,
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    minWidth: 110
                  }}>
                    ${ (tumblerQty * tumblerPrice).toFixed(2) }
                  </div>
                </div>
                <input
                  type="number"
                  min={0}
                  value={tumblerQty === 0 ? "" : tumblerQty}
                  onChange={e => {
                    const val = e.target.value;
                    setTumblerQty(val === "" ? 0 : Math.max(0, Number(val)));
                  }}
                  placeholder="QTY"
                  style={{
                    width: "90%",
                    height: 50,
                    borderRadius: 14,
                    border: "1.5px solid #E6E6EA",
                    padding: "0 18px",
                    fontSize: 14,
                    textAlign: "center",
                    background: "#fff",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
                    fontWeight: 500,
                    color: "#222"
                  }}
                />
              </div>

              {/* Divider after TUMBLER */}
              <div style={{ borderTop: "4px solid #EEEEEE", width: "95%", margin: "16px 0" }} />

              {/* BUNDLES Section */}
              <BundleRow onTotalChange={setBundleTotal} />
            </div>
            {/* Sticky footer */}
            <div style={{ position: "sticky", bottom: 0, background: "#fafafa", paddingTop: 16, borderTop: "2px solid #EAEAEA", width: "100%", zIndex: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <span style={{ fontFamily: "'Drag Racing', cursive", fontWeight: 700, fontSize: 22, color: "#555" }}>TOTAL TO PAY</span>
                <span style={{ fontFamily: "'Drag Racing', cursive", fontWeight: 700, fontSize: 22, color: "#555" }}>${totalToPay.toFixed(2)}</span>
              </div>
              <button
                type="button"
                style={{
                  width: "100%",
                  backgroundColor: "#000",
                  color: "#fff",
                  fontFamily: "'Drag Racing', cursive",
                  fontWeight: "700",
                  fontSize: 24,
                  padding: "16px 0",
                  borderRadius: 100,
                  cursor: "pointer",
                  border: "none",
                  marginBottom: 0,
                }}
                onClick={handlePay}
              >
                PAY
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
// MerchPurchase component implementing expandable dropdowns and toggle +/−
function MerchPurchase() {
  // T-SHIRT state
  const tshirtOptions = ["Classic", "Slim", "Sport", "Vintage"];
  const [tshirtDropdowns, setTshirtDropdowns] = useState([{ value: "Classic" }]);
  const [tshirtExpanded, setTshirtExpanded] = useState(false);
  // BUNDLE DEAL state
  const bundleOptions = [
    "Bundle 1",
    "Bundle 2",
    "Bundle 3",
    "Bundle 4",
    "Bundle 5",
    "Bundle 6",
    "Bundle 7",
  ];
  const [bundleDropdowns, setBundleDropdowns] = useState([{ value: "Bundle 1" }]);
  const [bundleExpanded, setBundleExpanded] = useState(false);
  // CAP and TUMBLER state
  const [capQty, setCapQty] = useState(0);
  const [tumblerQty, setTumblerQty] = useState(0);
  // Prices
  const tshirtPrices: Record<string, number> = {
    Classic: 20.0,
    Slim: 22.0,
    Sport: 25.0,
    Vintage: 23.0,
  };
  const capPrice = 15.0;
  const tumblerPrice = 18.0;
  const bundlePrices: Record<string, number> = {
    "Bundle 1": 50.0,
    "Bundle 2": 55.0,
    "Bundle 3": 60.0,
    "Bundle 4": 65.0,
    "Bundle 5": 70.0,
    "Bundle 6": 75.0,
    "Bundle 7": 80.0,
  };

  // T-SHIRT expand/collapse
  function handleTshirtToggle() {
    if (tshirtExpanded) {
      setTshirtDropdowns([tshirtDropdowns[0]]);
      setTshirtExpanded(false);
    } else {
      // expand to 4 dropdowns
      setTshirtDropdowns((prev) => {
        const arr = [...prev];
        for (let i = arr.length; i < tshirtOptions.length; i++) {
          // Find first option not already selected
          const used = arr.map((x) => x.value);
          const next = tshirtOptions.find((o) => !used.includes(o)) || tshirtOptions[0];
          arr.push({ value: next });
        }
        return arr;
      });
      setTshirtExpanded(true);
    }
  }
  // T-SHIRT dropdown change
  function handleTshirtDropdownChange(idx: number, val: string) {
    setTshirtDropdowns((prev) => {
      const arr = [...prev];
      arr[idx] = { value: val };
      return arr;
    });
  }
  // T-SHIRT selected options for disables
  const tshirtSelected = tshirtDropdowns.map((d) => d.value);

  // BUNDLE expand/collapse
  function handleBundleToggle() {
    if (bundleExpanded) {
      setBundleDropdowns([bundleDropdowns[0]]);
      setBundleExpanded(false);
    } else {
      setBundleDropdowns((prev) => {
        const arr = [...prev];
        for (let i = arr.length; i < bundleOptions.length; i++) {
          const used = arr.map((x) => x.value);
          const next = bundleOptions.find((o) => !used.includes(o)) || bundleOptions[0];
          arr.push({ value: next });
        }
        return arr;
      });
      setBundleExpanded(true);
    }
  }
  function handleBundleDropdownChange(idx: number, val: string) {
    setBundleDropdowns((prev) => {
      const arr = [...prev];
      arr[idx] = { value: val };
      return arr;
    });
  }
  const bundleSelected = bundleDropdowns.map((d) => d.value);

  // T-SHIRT QTY: per dropdown, so store an array
  const [tshirtQtys, setTshirtQtys] = useState([0, 0, 0, 0]);
  // When dropdowns collapse, reset extra qtys to 0
  useEffect(() => {
    if (!tshirtExpanded) {
      setTshirtQtys((prev) => [prev[0], 0, 0, 0]);
    }
  }, [tshirtExpanded]);
  // If dropdowns expand, ensure qtys array is correct length
  useEffect(() => {
    setTshirtQtys((prev) => {
      const arr = [...prev];
      while (arr.length < tshirtOptions.length) arr.push(0);
      return arr.slice(0, tshirtDropdowns.length);
    });
  }, [tshirtDropdowns.length]);
  // CAP/TUMBLER: single qty
  // BUNDLE: per dropdown
  const [bundleQtys, setBundleQtys] = useState(Array(7).fill(0));
  useEffect(() => {
    if (!bundleExpanded) {
      setBundleQtys((prev) => [prev[0], 0, 0, 0, 0, 0, 0]);
    }
  }, [bundleExpanded]);
  useEffect(() => {
    setBundleQtys((prev) => {
      const arr = [...prev];
      while (arr.length < bundleOptions.length) arr.push(0);
      return arr.slice(0, bundleDropdowns.length);
    });
  }, [bundleDropdowns.length]);

  // T-SHIRT total
  const tshirtTotal = tshirtDropdowns.reduce(
    (sum, dropdown, i) => sum + (tshirtPrices[dropdown.value] || 0) * (tshirtQtys[i] || 0),
    0
  );
  const capTotal = capQty * capPrice;
  const tumblerTotal = tumblerQty * tumblerPrice;
  const bundleTotal = bundleDropdowns.reduce(
    (sum, dropdown, i) => sum + (bundlePrices[dropdown.value] || 0) * (bundleQtys[i] || 0),
    0
  );
  const totalToPay = tshirtTotal + capTotal + tumblerTotal + bundleTotal;

  return (
    <div
      style={{
        paddingLeft: 20,
        width: "100%",
        maxWidth: 460,
        display: "flex",
        flexDirection: "column",
        gap: 0,
        
      }}
    >
      {/* Scrollable content container */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 20,
          maxHeight: "70vh",
          overflowY: "scroll",
          paddingRight: 8,
        }}
      >
        {/* T-SHIRT row */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
          <label style={{ color: "#000", fontWeight: 600, fontSize: 16, minWidth: 80 }}>T-SHIRT</label>
          <div style={{ flexGrow: 1 }}>
            {tshirtDropdowns.map((dropdown, idx) => (
              <div key={idx} style={{ display: "flex", alignItems: "center", marginBottom: idx < tshirtDropdowns.length - 1 ? 6 : 0 }}>
                <select
                  value={dropdown.value}
                  onChange={(e) => {
                    handleTshirtDropdownChange(idx, e.target.value);
                  }}
                  style={{
                    borderRadius: 8,
                    padding: "6px 8px",
                    fontSize: 14,
                    fontFamily: "inherit",
                    border: "1px solid #ccc",
                    cursor: "pointer",
                    marginRight: 8,
                    minWidth: 100,
                  }}
                >
                  {tshirtOptions.map((opt) => (
                    <option
                      key={opt}
                      value={opt}
                      disabled={tshirtSelected.includes(opt) && dropdown.value !== opt}
                    >
                      {opt}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  min={0}
                  value={tshirtQtys[idx] || 0}
                  onChange={(e) => {
                    const val = Math.max(0, Number(e.target.value));
                    setTshirtQtys((prev) => {
                      const arr = [...prev];
                      arr[idx] = val;
                      return arr;
                    });
                  }}
                  style={{
                    width: 50,
                    marginRight: 2,
                    borderRadius: 8,
                    padding: "6px 8px",
                    fontSize: 14,
                    fontFamily: "inherit",
                    border: "1px solid #ccc",
                    textAlign: "center",
                  }}
                />
                <span style={{ fontWeight: 600, fontSize: 14, minWidth: 60, textAlign: "right" }}>
                  ${(tshirtPrices[dropdown.value] * (tshirtQtys[idx] || 0)).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
          <button
            onClick={handleTshirtToggle}
            style={{
              backgroundColor: "#5823e9ff",
              color: "#fff",
              border: "none",
              borderRadius: "9999px",
              width: 30,
              height: 30,
              fontWeight: "700",
              fontSize: 20,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginLeft: 4,
            }}
            type="button"
          >
            {tshirtExpanded ? "−" : "+"}
          </button>
          <div style={{ minWidth: 70, textAlign: "right", fontWeight: 600, fontSize: 16 }}>
            ${tshirtTotal.toFixed(2)}
          </div>
        </div>
        {/* CAP row */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <label style={{ fontWeight: 600, fontSize: 16, minWidth: 80 }}>CAP</label>
          <div style={{ flexGrow: 1, marginRight: 12 }} />
            <input
              type="number"
              min={0}
              value={capQty === 0 ? "" : capQty}
              onChange={(e) => {
                const val = e.target.value;
                setCapQty(val === "" ? 0 : Math.max(0, Number(val)));
              }}
              style={{
                width: 50,
                marginRight: 8,
                borderRadius: 8,
                padding: "6px 8px",
                fontSize: 14,
                fontFamily: "inherit",
                border: "1px solid #ccc",
                textAlign: "center",
              }}
            />
          <div style={{ minWidth: 70, textAlign: "right", fontWeight: 600, fontSize: 16 }}>${capTotal.toFixed(2)}</div>
        </div>
        {/* TUMBLER row */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <label style={{ fontWeight: 600, fontSize: 16, minWidth: 80 }}>TUMBLER</label>
          <div style={{ flexGrow: 1, marginRight: 12 }} />
            <input
              type="number"
              min={0}
              value={tumblerQty === 0 ? "" : tumblerQty}
              onChange={(e) => {
                const val = e.target.value;
                setTumblerQty(val === "" ? 0 : Math.max(0, Number(val)));
              }}
              style={{
                width: 50,
                marginRight: 8,
                borderRadius: 8,
                padding: "6px 8px",
                fontSize: 14,
                fontFamily: "inherit",
                border: "1px solid #ccc",
                textAlign: "center",
              }}
            />
          <div style={{ minWidth: 70, textAlign: "right", fontWeight: 600, fontSize: 16 }}>${tumblerTotal.toFixed(2)}</div>
        </div>
        {/* BUNDLE DEAL row */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
          <label style={{ fontWeight: 600, fontSize: 16, minWidth: 80 }}>BUNDLE DEAL</label>
          <div style={{ flexGrow: 1 }}>
            {bundleDropdowns.map((dropdown, idx) => (
              <div key={idx} style={{ display: "flex", alignItems: "center", marginBottom: idx < bundleDropdowns.length - 1 ? 6 : 0 }}>
                <select
                  value={dropdown.value}
                  onChange={(e) => {
                    handleBundleDropdownChange(idx, e.target.value);
                  }}
                  style={{
                    borderRadius: 8,
                    padding: "6px 8px",
                    fontSize: 14,
                    fontFamily: "inherit",
                    border: "1px solid #ccc",
                    cursor: "pointer",
                    marginRight: 8,
                    minWidth: 100,
                  }}
                >
                  {bundleOptions.map((opt) => (
                    <option
                      key={opt}
                      value={opt}
                      disabled={bundleSelected.includes(opt) && dropdown.value !== opt}
                    >
                      {opt}
                    </option>
                  ))}
                </select>
            <input
              type="number"
              min={0}
              value={bundleQtys[idx] === 0 ? "" : bundleQtys[idx]}
              onChange={(e) => {
                const val = e.target.value;
                setBundleQtys((prev) => {
                  const arr = [...prev];
                  arr[idx] = val === "" ? 0 : Math.max(0, Number(val));
                  return arr;
                });
              }}
              style={{
                width: 50,
                marginRight: 2,
                borderRadius: 8,
                padding: "6px 8px",
                fontSize: 14,
                fontFamily: "inherit",
                border: "1px solid #ccc",
                textAlign: "center",
              }}
            />
                <span style={{ fontWeight: 600, fontSize: 14, minWidth: 60, textAlign: "right" }}>
                  ${(bundlePrices[dropdown.value] * (bundleQtys[idx] || 0)).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
          <button
            onClick={handleBundleToggle}
            style={{
              backgroundColor: "#5823e9ff",
              color: "#fff",
              border: "none",
              borderRadius: "9999px",
              width: 30,
              height: 30,
              fontWeight: "700",
              fontSize: 20,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginLeft: 4,
            }}
            type="button"
          >
            {bundleExpanded ? "−" : "+"}
          </button>
          <div style={{ minWidth: 70, textAlign: "right", fontWeight: 600, fontSize: 16 }}>
            ${bundleTotal.toFixed(2)}
          </div>
        </div>
      </div>
      {/* Sticky footer with divider, total, divider, and pay button */}
      <div style={{ position: "sticky", bottom: 0, background: "#fff", paddingTop: 16, zIndex: 10 }}>
        <div style={{ borderTop: "2px solid #EAEAEA", width: "100%", marginBottom: 16 }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <span style={{ fontFamily: "'Drag Racing', cursive", fontWeight: 700, fontSize: 22, color: "#555" }}>TOTAL TO PAY</span>
          <span style={{ fontFamily: "'Drag Racing', cursive", fontWeight: 700, fontSize: 22, color: "#555" }}>${totalToPay.toFixed(2)}</span>
        </div>
        <div style={{ borderTop: "2px solid #EAEAEA", width: "100%", marginBottom: 16 }} />
        <button
          type="button"
          style={{
            width: "100%",
            backgroundColor: "#000",
            color: "#fff",
            fontFamily: "'Drag Racing', cursive",
            fontWeight: "700",
            fontSize: 24,
            padding: "16px 0",
            borderRadius: 100,
            cursor: "pointer",
            border: "none",
          }}
        >
          PAY
        </button>
      </div>
    </div>
  );
}

/** Multi-row T‑SHIRT selection: model/variant/qty, plus/minus row controls */
function TShirtRow({ onTotalChange }: { onTotalChange: (val: number) => void }) {
  // Options: object with model keys, each with array of variant objects
  // Updated price values:
  const options: Record<
    string,
    { label: string; price: number }[]
  > = {
    "Grunge Tee": [
      { label: "Acid", price: 35 },
      { label: "Cream", price: 35 },
    ],
    "Muscle Tee": [
      { label: "Black", price: 30 },
      { label: "White", price: 30 },
    ],
  };
  // State: array of { model, variant, qty }
  const [rows, setRows] = React.useState<{ model: string; variant: string; qty: number }[]>([
    { model: "", variant: "", qty: 0 }
  ]);

  // Helper: get price for row
  function getPrice(model: string, variant: string) {
    if (model && variant) {
      return options[model]?.find((v) => v.label === variant)?.price ?? 0;
    }
    return 0;
  }
  // Helper: count total number of rows (max is number of all variants, i.e. 4)
  function totalVariantsCount() {
    // 2 models, each 2 variants: 4 total
    return Object.values(options).reduce((sum, arr) => sum + arr.length, 0);
  }
  // Add a new row (if less than 4 rows)
  function handleAddRow() {
    if (rows.length < totalVariantsCount()) {
      setRows((prev) => [...prev, { model: "", variant: "", qty: 0 }]);
    }
  }
  // Remove a row
  function handleRemoveRow(idx: number) {
    setRows((prev) => prev.filter((_, i) => i !== idx));
  }
  // Update row field with auto-selection logic for single remaining variant/model
  function updateRow(idx: number, field: "model" | "variant" | "qty", value: string | number) {
    setRows((prev) => {
      const arr = [...prev];
      if (field === "model") {
        const selectedModel = value as string;
        // When setting model, clear variant
        arr[idx] = { model: selectedModel, variant: "", qty: arr[idx].qty };
        // If only one variant is available for this model, auto-select it
        const variants = options[selectedModel] || [];
        if (variants.length === 1) {
          arr[idx].variant = variants[0].label;
        }
      } else if (field === "variant") {
        arr[idx] = { ...arr[idx], variant: value as string };
      } else if (field === "qty") {
        arr[idx] = { ...arr[idx], qty: Math.max(0, Number(value)) };
      }
      return arr;
    });
  }

  // Total for each row and overall
  const lineTotals = rows.map(r => getPrice(r.model, r.variant) * r.qty);
  const overallTotal = lineTotals.reduce((a, b) => a + b, 0);

  // Expose rows to window for AdminApp to collect purchases
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      (window as any).__tshirtRows = rows.map(r => ({
        ...r,
        price: getPrice(r.model, r.variant),
      }));
    }
    onTotalChange(overallTotal);
    // eslint-disable-next-line
  }, [rows, overallTotal, onTotalChange]);

  const pill = {
    background: "#F4EDFF",
    color: "#6B6B6B",
    fontWeight: 600,
    borderRadius: 28,
    padding: "10px 8px",
    fontSize: 14,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minWidth: 110,
  } as React.CSSProperties;

  const cardShadow = "0 8px 24px rgba(0,0,0,0.08)";

  return (
    <div style={{ width: "100%", marginTop: 8 }}>
      {/* Header row */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
        <div style={{ paddingLeft: "8px", color: "#111", fontWeight: 800, fontSize: 18, letterSpacing: 0.2 }}>T-SHIRT</div>
        <div style={pill}>${overallTotal.toFixed(2)}</div>
      </div>
      {/* Each row */}
      {rows.map((row, idx) => (
        <div key={idx} style={{ marginBottom: idx < rows.length - 1 ? 10 : 0 }}>
          {/* Selected label above dropdowns */}
          {row.model && row.variant && (
            <div
              style={{
                paddingLeft: "8px",
                marginTop: idx === 0 ? "-18px" : "0px",
                marginBottom: "8px",
                fontSize: 13,
                fontWeight: 400,
                color: "#555",
                letterSpacing: 0.01,
              }}
            >
              {row.model} &nbsp;|&nbsp; {row.variant}
            </div>
          )}
          {/* Controls row */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: row.model
                ? "1.2fr 1.2fr 60px 38px"
                : "2.4fr 60px 38px",
              gap: 12,
              alignItems: "center",
            }}
          >
            {/* Model dropdown */}
            <div style={{ position: "relative" }}>
              <select
                value={row.model}
                onChange={(e) => updateRow(idx, "model", e.target.value)}
                style={{
                  width: "100%",
                  minWidth: 120,
                  height: 50,
                  borderRadius: 14,
                  border: "1.5px solid #E6E6EA",
                  padding: "0 44px 0 18px",
                  fontSize: 14,
                  color: row.model ? "#222" : "#888",
                  background: "#fff",
                  boxShadow: cardShadow,
                  appearance: "none",
                  fontWeight: 500,
                }}
              >
                <option value="" disabled hidden>
                  Select Model
                </option>
                {Object.keys(options).map((m) => {
                  const variants = options[m];
                  // Find all variants for this model that are selected in other rows
                  const selectedVariants = rows.filter(r => r.model === m && r.variant).map(r => r.variant);
                  // If all variants for this model are already selected in other rows, disable this model (unless this row is using it)
                  const allUsed = variants.every(v => selectedVariants.includes(v.label));
                  return (
                    <option
                      key={m}
                      value={m}
                      disabled={allUsed && row.model !== m}
                    >
                      {m}
                    </option>
                  );
                })}
              </select>
              {/* Chevron */}
              <span
                style={{
                  position: "absolute",
                  right: 10,
                  top: "50%",
                  transform: "translateY(-50%)",
                  width: 26,
                  height: 26,
                  borderRadius: "50%",
                  background: "#EFEDFF",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  pointerEvents: "none",
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#555"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </span>
            </div>
            {/* Variant dropdown */}
            {row.model && (
              <div style={{ position: "relative" }}>
                <select
                  value={row.variant}
                  onChange={(e) => updateRow(idx, "variant", e.target.value)}
                  style={{
                    width: "100%",
                    minWidth: 100,
                    height: 50,
                    borderRadius: 14,
                    border: "1.5px solid #E6E6EA",
                    padding: "0 44px 0 18px",
                    fontSize: 14,
                    color: row.variant ? "#222" : "#888",
                    background: "#fff",
                    boxShadow: cardShadow,
                    appearance: "none",
                    fontWeight: 500,
                  }}
                  onBlur={() => {
                    // Auto-select if only one option remains unselected
                    // Only if not already selected
                    if (!row.variant) {
                      const allVariants = options[row.model];
                      if (allVariants) {
                        // Find variants not selected in other rows for this model
                        const otherSelected = rows
                          .filter((r, i) => i !== idx && r.model === row.model && r.variant)
                          .map((r) => r.variant);
                        const available = allVariants
                          .map((v) => v.label)
                          .filter((v) => !otherSelected.includes(v));
                        if (available.length === 1) {
                          // Auto-select the last remaining variant
                          updateRow(idx, "variant", available[0]);
                        }
                      }
                    }
                  }}
                >
                  <option value="" disabled hidden>
                    Select Variant
                  </option>
                  {options[row.model].map((v) => {
                    const otherSelected = rows
                      .filter((r, i) => i !== idx && r.model === row.model && r.variant)
                      .map((r) => r.variant);
                    return (
                      <option key={v.label} value={v.label} disabled={otherSelected.includes(v.label)}>
                        {v.label}
                      </option>
                    );
                  })}
                </select>
                {/* Chevron */}
                <span
                  style={{
                    position: "absolute",
                    right: 10,
                    top: "50%",
                    transform: "translateY(-50%)",
                    width: 26,
                    height: 26,
                    borderRadius: "50%",
                    background: "#EFEDFF",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    pointerEvents: "none",
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#555"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </span>
              </div>
            )}
            {/* QTY input */}
            <input
              type="number"
              min={0}
              value={row.qty === 0 ? "" : row.qty}
              onChange={(e) => {
                // If field is cleared, set qty to 0; else parse as number
                const val = e.target.value;
                updateRow(idx, "qty", val === "" ? 0 : val);
              }}
              placeholder="QTY"
              style={{
                height: 50,
                width: 38,
                borderRadius: 14,
                border: "1.5px solid #E6E6EA",
                padding: "0 8px",
                fontSize: 14,
                textAlign: "center",
                background: "#fff",
                boxShadow: cardShadow,
                fontWeight: 600,
                color: "#222",
              }}
            />
            {/* Plus or minus button */}
            <button
              type="button"
              aria-label={
                idx === rows.length - 1 && rows.length < totalVariantsCount()
                  ? "add tee row"
                  : rows.length > 1
                  ? "remove tee row"
                  : "remove tee row"
              }
              style={{
                height: 28,
                width: 28,
                borderRadius: "50%",
                background: "#000",
                color: "#fff",
                border: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 8px 24px rgba(0,0,0,0.22)",
                fontSize: 18,
                lineHeight: 1,
                fontWeight: 700,
              }}
              onClick={() => {
                if (idx === rows.length - 1 && rows.length < totalVariantsCount()) {
                  handleAddRow();
                } else if (rows.length > 1) {
                  handleRemoveRow(idx);
                }
              }}
            >
              {idx === rows.length - 1 && rows.length < totalVariantsCount()
                ? "+"
                : rows.length > 1
                ? "−"
                : ""}
            </button>
          </div>
          {/* Row total pill removed */}
        </div>
      ))}
    </div>
  );
}
// Multi-row BUNDLE selection: 4 bundle types, each with options inside
function BundleRow({ onTotalChange }: { onTotalChange: (val: number) => void }) {
  // Four bundle categories, each with variants and prices
  // Updated bundle prices per instructions:
  const options: Record<
    string,
    { label: string; price: number; value: string }[]
  > = {
    "RACE": [
      { label: "Option 1 - $55", price: 55, value: "Option 1 - $55" },
      { label: "Option 2 - $50", price: 50, value: "Option 2 - $50" },
    ],
    "HYDRATION": [
      { label: "Option 1 - $58", price: 58, value: "Option 1 - $58" },
      { label: "Option 2 - $53", price: 53, value: "Option 2 - $53" },
    ],
    "FUEL": [
      { label: "Option 1 - $50", price: 50, value: "Option 1 - $50" },
    ],
    "INNERDRIVE™": [
      { label: "Option 1 - $80", price: 80, value: "Option 1 - $80" },
      { label: "Option 2 - $75", price: 75, value: "Option 2 - $75" },
    ],
  };
  // State: array of { model, variant, qty }
  const [rows, setRows] = React.useState<{ model: string; variant: string; qty: number }[]>([
    { model: "", variant: "", qty: 0 }
  ]);

  function getPrice(model: string, variant: string) {
    if (model && variant) {
      return options[model]?.find((v) => v.value === variant)?.price ?? 0;
    }
    return 0;
  }
  // Compute the total number of variants across all bundle models
  function totalVariantsCount() {
    return Object.values(options).reduce((sum, arr) => sum + arr.length, 0);
  }
  // Add a new row (if total rows is less than total variants)
  function handleAddRow() {
    if (rows.length < totalVariantsCount()) {
      setRows((prev) => [...prev, { model: "", variant: "", qty: 0 }]);
    }
  }
  function handleRemoveRow(idx: number) {
    setRows((prev) => prev.filter((_, i) => i !== idx));
  }
  function updateRow(idx: number, field: "model" | "variant" | "qty", value: string | number) {
    setRows((prev) => {
      const arr = [...prev];
      if (field === "model") {
        const selectedModel = value as string;
        arr[idx] = { model: selectedModel, variant: "", qty: arr[idx].qty };
        const variants = options[selectedModel] || [];
        if (variants.length === 1) {
          arr[idx].variant = variants[0].value;
        }
      } else if (field === "variant") {
        arr[idx] = { ...arr[idx], variant: value as string };
      } else if (field === "qty") {
        arr[idx] = { ...arr[idx], qty: Math.max(0, Number(value)) };
      }
      return arr;
    });
  }
  const lineTotals = rows.map(r => getPrice(r.model, r.variant) * r.qty);
  const overallTotal = lineTotals.reduce((a, b) => a + b, 0);

  // Expose rows to window for AdminApp to collect purchases
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      (window as any).__bundleRows = rows.map(r => ({
        ...r,
        price: getPrice(r.model, r.variant),
      }));
    }
    onTotalChange(overallTotal);
    // eslint-disable-next-line
  }, [rows, overallTotal, onTotalChange]);
  const pill = {
    background: "#F4EDFF",
    color: "#6B6B6B",
    fontWeight: 600,
    borderRadius: 28,
    padding: "10px 8px",
    fontSize: 14,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minWidth: 110,
  } as React.CSSProperties;
  const cardShadow = "0 8px 24px rgba(0,0,0,0.08)";
  return (
    <div style={{ width: "100%", marginTop: 8 }}>
      {/* Header row */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
        <div style={{ paddingLeft: "8px", color: "#111", fontWeight: 800, fontSize: 18, letterSpacing: 0.2 }}>BUNDLES</div>
        <div style={pill}>${overallTotal.toFixed(2)}</div>
      </div>
      {/* Each row */}
      {rows.map((row, idx) => (
        <div key={idx} style={{ marginBottom: idx < rows.length - 1 ? 10 : 0 }}>
          {/* Selected label above dropdowns */}
          {row.model && row.variant && (
            <div
              style={{
                paddingLeft: "8px",
                marginTop: idx === 0 ? "-18px" : "0px",
                marginBottom: "8px",
                fontSize: 13,
                fontWeight: 400,
                color: "#555",
                letterSpacing: 0.01,
              }}
            >
              {row.model} &nbsp;|&nbsp; {
                // Find the label for this variant, but strip price part after " - "
                (() => {
                  const label = options[row.model]?.find((v) => v.value === row.variant)?.label || row.variant;
                  // Remove the price part (e.g., "Option 1 - $55" -> "Option 1")
                  return label.split(" - ")[0];
                })()
              }
            </div>
          )}
          {/* Controls row */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: row.model
                ? "1.2fr 1.2fr 60px 38px"
                : "2.4fr 60px 38px",
              gap: 12,
              alignItems: "center",
            }}
          >
            {/* Model dropdown */}
            <div style={{ position: "relative" }}>
              <select
                value={row.model}
                onChange={(e) => updateRow(idx, "model", e.target.value)}
                style={{
                  width: "100%",
                  minWidth: 120,
                  height: 50,
                  borderRadius: 14,
                  border: "1.5px solid #E6E6EA",
                  padding: "0 44px 0 18px",
                  fontSize: 14,
                  color: row.model ? "#222" : "#888",
                  background: "#fff",
                  boxShadow: cardShadow,
                  appearance: "none",
                  fontWeight: 500,
                }}
              >
                <option value="" disabled hidden>
                  Select Bundle
                </option>
                {Object.keys(options).map((m) => {
                  const variants = options[m];
                  // Find all variants for this model that are selected in other rows
                  const selectedVariants = rows
                    .filter((r, i) => i !== idx && r.model === m && r.variant)
                    .map((r) => r.variant);
                  // If all variants for this model are already selected in other rows, disable this model (unless this row is using it)
                  const allUsed = variants.every(v => selectedVariants.includes(v.value));
                  return (
                    <option
                      key={m}
                      value={m}
                      disabled={allUsed && row.model !== m}
                    >
                      {m}
                    </option>
                  );
                })}
              </select>
              {/* Chevron */}
              <span
                style={{
                  position: "absolute",
                  right: 10,
                  top: "50%",
                  transform: "translateY(-50%)",
                  width: 26,
                  height: 26,
                  borderRadius: "50%",
                  background: "#EFEDFF",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  pointerEvents: "none",
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#555"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </span>
            </div>
            {/* Variant dropdown */}
            {row.model && (
              <div style={{ position: "relative" }}>
                <select
                  value={row.variant}
                  onChange={(e) => updateRow(idx, "variant", e.target.value)}
                  style={{
                    width: "100%",
                    minWidth: 100,
                    height: 50,
                    borderRadius: 14,
                    border: "1.5px solid #E6E6EA",
                    padding: "0 44px 0 18px",
                    fontSize: 14,
                    color: row.variant ? "#222" : "#888",
                    background: "#fff",
                    boxShadow: cardShadow,
                    appearance: "none",
                    fontWeight: 500,
                  }}
                  onBlur={() => {
                    if (!row.variant) {
                      const allVariants = options[row.model];
                      if (allVariants) {
                        const otherSelected = rows
                          .filter((r, i) => i !== idx && r.model === row.model && r.variant)
                          .map((r) => r.variant);
                        const available = allVariants
                          .map((v) => v.value)
                          .filter((v) => !otherSelected.includes(v));
                        if (available.length === 1) {
                          updateRow(idx, "variant", available[0]);
                        }
                      }
                    }
                  }}
                >
                  <option value="" disabled hidden>
                    Select Option
                  </option>
                  {options[row.model].map((v) => {
                    const otherSelected = rows
                      .filter((r, i) => i !== idx && r.model === row.model && r.variant)
                      .map((r) => r.variant);
                    return (
                      <option
                        key={v.value}
                        value={v.value}
                        disabled={otherSelected.includes(v.value) && row.variant !== v.value}
                      >
                        {v.label}
                      </option>
                    );
                  })}
                </select>
                {/* Chevron */}
                <span
                  style={{
                    position: "absolute",
                    right: 10,
                    top: "50%",
                    transform: "translateY(-50%)",
                    width: 26,
                    height: 26,
                    borderRadius: "50%",
                    background: "#EFEDFF",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    pointerEvents: "none",
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#555"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </span>
              </div>
            )}
            {/* QTY input */}
            <input
              type="number"
              min={0}
              value={row.qty === 0 ? "" : row.qty}
              onChange={(e) => {
                const val = e.target.value;
                updateRow(idx, "qty", val === "" ? 0 : Math.max(0, Number(val)));
              }}
              placeholder="QTY"
              style={{
                height: 50,
                width: 38,
                borderRadius: 14,
                border: "1.5px solid #E6E6EA",
                padding: "0 8px",
                fontSize: 14,
                textAlign: "center",
                background: "#fff",
                boxShadow: cardShadow,
                fontWeight: 600,
                color: "#222",
              }}
            />
            {/* Plus or minus button */}
            <button
              type="button"
              aria-label={
                idx === rows.length - 1 && rows.length < totalVariantsCount()
                  ? "add bundle row"
                  : rows.length > 1
                  ? "remove bundle row"
                  : "remove bundle row"
              }
              style={{
                height: 28,
                width: 28,
                borderRadius: "50%",
                background: "#000",
                color: "#fff",
                border: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 8px 24px rgba(0,0,0,0.22)",
                fontSize: 18,
                lineHeight: 1,
                fontWeight: 700,
              }}
              onClick={() => {
                if (idx === rows.length - 1 && rows.length < totalVariantsCount()) {
                  handleAddRow();
                } else if (rows.length > 1) {
                  handleRemoveRow(idx);
                }
              }}
            >
              {idx === rows.length - 1 && rows.length < totalVariantsCount()
                ? "+"
                : rows.length > 1
                ? "−"
                : ""}
            </button>
          </div>
          {/* Row total pill removed */}
        </div>
      ))}
    </div>
  );
}