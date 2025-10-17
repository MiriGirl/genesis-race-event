"use client";
import { useState } from "react";
import { motion } from "framer-motion";

// List of random wellness names for anonymous wishes
const WELLNESS_NAMES = [
  "Peaceful Camper",
  "Radiant Soul",
  "Mindful Seeker",
  "Joyful Dreamer",
  "Calm Voyager",
  "Hopeful Heart",
  "Gentle Whisper",
  "Serene Explorer"
];

type WishFormProps = {
  onClose?: () => void;
   initialLineType?: string; // 👈 add this line
     onWishSubmitted?: (newWishId: string) => void; // ✅ add this line
};

export default function RegisterForm({ onClose }: WishFormProps) {
  // Form state
  const [name, setName] = useState("");
  const [wish, setWish] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; wish?: string }>({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // Handle anonymous toggle and autofill
  function handleAnonymousChange(e: React.ChangeEvent<HTMLInputElement>) {
    const checked = e.target.checked;
    setAnonymous(checked);
    if (checked) {
      // Pick a random wellness name
      const randomName = WELLNESS_NAMES[Math.floor(Math.random() * WELLNESS_NAMES.length)];
      setName(randomName);
    } else {
      setName("");
    }
  }

  // Validation
  function validate() {
    const errs: { name?: string; wish?: string } = {};
    if (!anonymous && !name.trim()) {
      errs.name = "Please enter your name or post anonymously.";
    }
    if (!wish.trim()) {
      errs.wish = "Please enter your wish.";
    }
    return errs;
  }

  // Submit handler
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    setSubmitting(true);
    try {
      const payload = { name, message: wish };
      const res = await fetch("/api/wishing-well", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        console.error("❌ API Error:", data.error);
        setErrors({ wish: data.error || "Failed to submit wish." });
        setSubmitting(false);
        return;
      }

      console.log("✅ Wish submitted successfully:", data);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setWish("");
        setName("");
        setAnonymous(false);
        setErrors({});
        if (onClose) onClose();
      }, 2000);
      // localStorage.setItem("latestWish", JSON.stringify({ name, message: wish })); // (Old localStorage line, now commented out)
    } catch (err) {
      setErrors({ wish: "Something went wrong. Please try again." });
    } finally {
      setSubmitting(false);
    }
  }

  // Styles
  const fontFamily = "'Poppins', sans-serif";
  // Button gradient matches START button in original
  const gradientBtn = "linear-gradient(90deg, #000000ff 0%, #000000ff 100%)";

  // Drag handle style
  const dragHandle = (
    <div
      style={{
        width: "40px",
        height: "6px",
        background: "#ddd",
        borderRadius: "3px",
        margin: "0 auto 18px auto",
      }}
    />
  );

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        background: "rgba(0,0,0,0.35)",
        backdropFilter: "blur(3px)",
        zIndex: 99,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
      onClick={onClose}
    >
      <motion.div
        key="bottomSheet"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{
          duration: 0.3,
          ease: "easeOut",
        }}
        onClick={(e) => e.stopPropagation()}
        style={{
          position: "relative",
          width: "100%",
          maxWidth: "550px",
          background: "#fff",
          borderRadius: "30px",
          boxShadow: "0 8px 25px rgba(0,0,0,0.3)",
          padding: "40px 28px 28px 28px",
          fontFamily: "'Poppins', sans-serif",
          color: "#000",
          transformOrigin: "center center",
          willChange: "transform, opacity",
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            right: "20px",
            top: "18px",
            background: "transparent",
            border: "none",
            fontSize: "22px",
            color: "#000",
            cursor: "pointer",
          }}
        >
          ✕
        </button>

        <h2
          style={{
            fontSize: "28px",
            fontWeight: 700,
            textAlign: "center",
            marginBottom: "0px",
          }}
        >
           <img src="/bg/purple-heart.png" alt="heart" width={50} height={50} /><br></br> Write Your Wish
        </h2>
        <p
          style={{
            fontSize: "15px",
            color: "#8f8f8fff",
            textAlign: "center",
            marginBottom: "40px",
          }}
        >
          Share your wish, intention, or blessing.
          <br />
          Your words will uplift others!
        </p>

        {/* Keep the existing form JSX unchanged below this point */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          {/* Name */}
          <div>
            <label style={{ fontSize: "14px", fontWeight: 600, fontFamily, }}>Your Name (Optional)</label>
            <input
              type="text"
              name="name"
              placeholder="Enter your name"
              value={name}
              onChange={e => setName(e.target.value)}
              disabled={anonymous}
              style={{
                width: "100%",
                height: "50px",
                background: "#EFEDFF",
                borderRadius: "12px",
                padding: "0 22px",
                fontSize: "15px",
                color: "#777",
                border: errors.name ? "2px solid #7559FF" : "0px solid #ccc",
                boxSizing: "border-box",
                fontFamily,
                opacity: anonymous ? 0.7 : 1,
                transition: "opacity 0.2s",
           
              }}
              required={!anonymous}
              autoComplete="off"
            />
            {errors.name && <p style={{ color: "#7559FF", fontSize: "12px", marginTop: 4 }}>{errors.name}</p>}
          </div>

          {/* Anonymous Checkbox - when ticked, posts anonymously with a random wellness name */}
          <label style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "13px", fontFamily, userSelect: "none" }}>
            <input
              type="checkbox"
              checked={anonymous}
              onChange={handleAnonymousChange}
              style={{
                width: "18px",
                height: "18px",
                border: "1px solid #979797",
                accentColor: "#7559FF",
                marginRight: "2px",
              }}
            />
            Post as anonymous 
          </label>

          {/* Wish Textarea */}
          <div>
            <label style={{ fontSize: "14px", fontWeight: 500, fontFamily }}>Your Wish</label>
            <textarea
              name="wish"
              placeholder="May everyone be happy and peaceful..."
              value={wish}
              onChange={e => setWish(e.target.value)}
              style={{
                width: "100%",
                minHeight: "90px",
                maxHeight: "180px",
                background: "#EFEDFF",
                borderRadius: "12px",
                padding: "14px 22px",
                fontSize: "15px",
                color: "#777",
                border: errors.wish ? "2px solid #7559FF" : "0px solid #ccc",
                boxSizing: "border-box",
                resize: "none",
                fontFamily,
                marginTop: "2px",
              }}
              required
              maxLength={500}
            />
            {errors.wish && <p style={{ color: "#000000ff", fontSize: "12px", marginTop: 4 }}>{errors.wish}</p>}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting}
            style={{
              width: "100%",
              height: "52px",
              background: gradientBtn,
              color: "#fff",
              border: "none",
              borderRadius: "28px",
              fontWeight: 700,
              fontFamily,
              fontSize: "18px",
              letterSpacing: "0.5px",
              textTransform: "none",
              cursor: submitting ? "not-allowed" : "pointer",
              boxShadow: "0 4px 16px #EFEDFF77",
              marginTop: "6px",
              transition: "opacity 0.2s",
              opacity: submitting ? 0.7 : 1,
            }}
          >
            Post Wish
          </button>
        </form>
        {/* Success animated heart overlay */}
        {success && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "120px",
              height: "120px",
              borderRadius: "50%",
              background: "rgba(255, 255, 255, 0.1)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 10,
            }}
          >
            <motion.img
              src="/bg/purple-heart.png"
              alt="Success Heart"
              initial={{ scale: 0.5, rotate: 0, opacity: 0 }}
              animate={{
                scale: [0.5, 1.3, 1],
                rotate: [0, 360],
                opacity: [0, 1, 1],
              }}
              transition={{
                duration: 1.2,
                ease: "easeOut",
                times: [0, 0.4, 1],
              }}
              style={{
                width: "80px",
                height: "80px",
                filter: "drop-shadow(0 0 20px rgba(255, 100, 200, 0.7))",
              }}
            />
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}