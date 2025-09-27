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
  const [tshirtType, setTshirtType] = useState("Classic");
  const [tshirtQty, setTshirtQty] = useState(0);
  const [capQty, setCapQty] = useState(0);
  const [tumblerQty, setTumblerQty] = useState(0);
  const [bundleType, setBundleType] = useState("Bundle 1");
  const [bundleQty, setBundleQty] = useState(0);

  // Prices (example values)
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

  const tshirtTotal = tshirtQty * (tshirtPrices[tshirtType] || 0);
  const capTotal = capQty * capPrice;
  const tumblerTotal = tumblerQty * tumblerPrice;
  const bundleTotal = bundleQty * (bundlePrices[bundleType] || 0);

  const totalToPay = tshirtTotal + capTotal + tumblerTotal + bundleTotal;

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
            }}
            onClick={(e) => e.stopPropagation()}
          >
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
                alignItems: "center",
                marginBottom: "24px",
                width: "180px",
                maxWidth: "300px",
              }}
            >
              <span
                style={{
                  color: fColor,
                  fontWeight: "700",
                  fontSize: "24px",
                  fontFamily: "'Drag Racing', cursive",
                  userSelect: "none",
                  marginRight: "22px",
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

            {/* Horizontal divider line */}
            <div style={{ borderTop: "4px solid #EEEEEE", width: "95%" }} />

            {/* --- T‑SHIRT SECTION (single row design) --- */}
            <TShirtRow />

            {/* MerchPurchase moved above */}
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
    <div style={{ paddingLeft: 20, width: "100%", maxWidth: 460, display: "flex", flexDirection: "column", gap: 20 }}>
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
          value={capQty}
          onChange={(e) => setCapQty(Math.max(0, Number(e.target.value)))}
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
          value={tumblerQty}
          onChange={(e) => setTumblerQty(Math.max(0, Number(e.target.value)))}
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
                value={bundleQtys[idx] || 0}
                onChange={(e) => {
                  const val = Math.max(0, Number(e.target.value));
                  setBundleQtys((prev) => {
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
      {/* Divider line */}
      <div style={{ borderTop: "4px solid #EEEEEE", margin: "20px 0", width: "100%" }} />
      {/* Total and Pay button */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <span style={{ fontWeight: 700, fontSize: 18 }}>TOTAL TO PAY</span>
        <span style={{ fontWeight: 700, fontSize: 18 }}>${totalToPay.toFixed(2)}</span>
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
          padding: "14px 0",
          borderRadius: 16,
          cursor: "pointer",
          border: "none",
        }}
      >
        PAY
      </button>
    </div>
  );
}

/** CAP-style single row for T‑SHIRT: Title, full-width QTY input, pill total */
function TShirtRow() {
  // Only one row, fixed model/variant for demo (could be props or state in real app)
  // For CAP-style, let's assume a single row: "Grunge Tee | Acid"
  const row = { model: "Grunge Tee", variant: "Acid" };
  const price = 35;
  const [qty, setQty] = React.useState(0);
  const pill = {
    background: "#F4EDFF",
    color: "#6B6B6B",
    fontWeight: 600,
    borderRadius: 28,
    padding: "10px 18px",
    fontSize: 16,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minWidth: 90,
    boxShadow: "0 1px 6px rgba(90,30,200,0.03)",
  } as React.CSSProperties;
  return (
    <div style={{ width: "100%", marginTop: 18, marginBottom: 10 }}>
      {/* Title row */}
      <div style={{
        fontWeight: 800,
        fontSize: 17,
        color: "#1A1A1A",
        letterSpacing: 0.1,
        marginBottom: 4,
        paddingLeft: 2,
      }}>
        {row.model} &nbsp;|&nbsp; {row.variant}
      </div>
      {/* QTY input and pill total row */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        marginTop: 0,
        marginBottom: 0,
        width: "100%",
      }}>
        <input
          type="number"
          min={0}
          value={qty}
          onChange={e => setQty(Math.max(0, Number(e.target.value)))}
          placeholder="QTY"
          style={{
            flexGrow: 1,
            width: "100%",
            borderRadius: 14,
            border: "1.5px solid #E6E6EA",
            padding: "15px 20px",
            fontSize: 18,
            fontWeight: 700,
            color: "#222",
            background: "#fff",
            boxShadow: "0 2px 12px rgba(90,30,200,0.03)",
            outline: "none",
            marginRight: 0,
            textAlign: "left",
            letterSpacing: 0.2,
          }}
        />
        <span style={pill}>
          ${(price * qty).toFixed(2)}
        </span>
      </div>
    </div>
  );
}