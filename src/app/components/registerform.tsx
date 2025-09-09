"use client";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

export default function RegisterForm() {
  const pathname = usePathname();

  // ✅ detect linetype from pathname
  const derivedLineType = pathname?.includes("/f1")
    ? "f1"
    : pathname?.includes("/standard")
    ? "standard"
    : "standard";

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    nationality: "",
    age: "",
    subscribe: false,
    line_type: derivedLineType,
  });

  const [errors, setErrors] = useState<any>({});

  useEffect(() => {
    console.log("📍 line_type being used:", formData.line_type);
  }, [formData.line_type]);

  const nationalities = [
    { code: "SG", name: "Singapore", flag: "🇸🇬" },
    { code: "US", name: "United States", flag: "🇺🇸" },
    { code: "GB", name: "United Kingdom", flag: "🇬🇧" },
    { code: "IN", name: "India", flag: "🇮🇳" },
    { code: "CN", name: "China", flag: "🇨🇳" },
    { code: "JP", name: "Japan", flag: "🇯🇵" },
    { code: "KR", name: "South Korea", flag: "🇰🇷" },
  ];

  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === "checkbox" ? checked : value });
  };

  const validateField = (field: string, value: string | boolean) => {
    switch (field) {
      case "name":
        if (!value) return "Full name is required.";
        break;
      case "email":
        if (!value) return "Email is required.";
        break;
      case "phone":
        if (!value) return "Phone number is required.";
        break;
      case "nationality":
        if (!value) return "Select a nationality.";
        break;
      case "age":
        if (!value) return "Select an age group.";
        break;
      case "subscribe":
        if (!value) return "Consent is required.";
        break;
      default:
        return "";
    }
    return "";
  };

  const validate = () => {
    const newErrors: any = {};
    Object.keys(formData).forEach((field) => {
      const value = (formData as any)[field];
      const error = validateField(field, value);
      if (error) newErrors[field] = error;
    });
    return newErrors;
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    const newErrors = validate();
    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      console.log("🚀 Sending payload:", formData);

      try {
        const res = await fetch("https://www.innerdrive.sg/api/pre-register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        const data = await res.json();
        console.log("✅ API Response:", data);

        if (data?.deduped) {
          console.log("ℹ️ User already exists → row updated");
          window.location.href = "https://www.meuraki.com/registration-complete";
        } else {
          console.log("🎉 New user created");
          window.location.href = "https://www.meuraki.com/registration-success";
        }
      } catch (err) {
        console.error("❌ Network or server error:", err);
      }
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        overflowX: "hidden",
        minHeight: "100vh",
      }}
    >
      {/* Hero */}
      <img
        src="/bg/innerdrive-registration-mobile.jpg"
        alt="Hero"
        style={{ width: "100%", maxWidth: "420px", display: "block" }}
      />

      {/* White Card */}
      <div
        style={{
          background: "#fff",
          color: "#000",
          width: "100%",
          maxWidth: "400px",
          marginTop: "-24px",
          borderTopLeftRadius: "54px",
          borderTopRightRadius: "54px",
          padding: "24px 16px",
          boxShadow: "0 20px 60px rgba(0,0,0,0.35)",
        }}
      >
        <h2
          style={{
            fontSize: "32px",
            fontWeight: 600,
            lineHeight: "32px",
            letterSpacing: "-1px",
            textAlign: "center",
            marginBottom: "18px",
          }}
        >
          Fill in your details to <br />
          start your inner race
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
          Fill in your details to unlock your INNERDRIVE™ leaderboard, secure your lucky draw
          entry, and join the MEURAKI community.
        </p>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Name */}
          <div>
            <label style={{ fontSize: "13px", fontWeight: 500 }}>Full Name</label>
            <input
              type="text"
              name="name"
              placeholder="Jane Doe"
              value={formData.name}
              onChange={handleChange}
              onBlur={(e) => setErrors({ ...errors, name: validateField("name", e.target.value) })}
              style={{
                width: "100%",
                height: "50px",
                background: "#EFEDFF",
                borderRadius: "12px",
                padding: "0 22px",
                fontSize: "15px",
                color: "#777",
                border: errors.name ? "2px solid #7559FF" : "1px solid #ccc",
              }}
              required
            />
            {errors.name && <p style={{ color: "#7559FF", fontSize: "12px" }}>{errors.name}</p>}
          </div>

          {/* Email */}
          <div>
            <label style={{ fontSize: "13px", fontWeight: 500 }}>Email Address</label>
            <input
              type="email"
              name="email"
              placeholder="janedoe@gmail.com"
              value={formData.email}
              onChange={handleChange}
              onBlur={(e) => setErrors({ ...errors, email: validateField("email", e.target.value) })}
              style={{
                width: "100%",
                height: "50px",
                background: "#EFEDFF",
                borderRadius: "12px",
                padding: "0 22px",
                fontSize: "15px",
                color: "#777",
                border: errors.email ? "2px solid #7559FF" : "1px solid #ccc",
              }}
              required
            />
            {errors.email && <p style={{ color: "#7559FF", fontSize: "12px" }}>{errors.email}</p>}
          </div>

          {/* Phone */}
          <div>
            <label style={{ fontSize: "13px", fontWeight: 500 }}>Phone Number</label>
            <input
              type="tel"
              name="phone"
              placeholder="+65 3020 3003"
              value={formData.phone}
              onChange={handleChange}
              onBlur={(e) => setErrors({ ...errors, phone: validateField("phone", e.target.value) })}
              style={{
                width: "100%",
                height: "50px",
                background: "#EFEDFF",
                borderRadius: "12px",
                padding: "0 22px",
                fontSize: "15px",
                color: "#777",
                border: errors.phone ? "2px solid #7559FF" : "1px solid #ccc",
              }}
              required
            />
            {errors.phone && <p style={{ color: "#7559FF", fontSize: "12px" }}>{errors.phone}</p>}
          </div>

          {/* Nationality */}
          <div>
            <label style={{ fontSize: "13px", fontWeight: 500 }}>Nationality</label>
            <select
              name="nationality"
              value={formData.nationality}
              onChange={handleChange}
              onBlur={(e) =>
                setErrors({ ...errors, nationality: validateField("nationality", e.target.value) })
              }
              style={{
                width: "100%",
                height: "50px",
                background: "#fff",
                borderRadius: "12px",
                padding: "0 16px",
                fontSize: "15px",
                color: "#777",
                border: errors.nationality ? "2px solid #7559FF" : "1px solid #ccc",
              }}
              required
            >
              <option value="">Select</option>
              {nationalities.map((n) => (
                <option key={n.code} value={n.name}>
                  {n.flag} {n.name}
                </option>
              ))}
            </select>
            {errors.nationality && (
              <p style={{ color: "#7559FF", fontSize: "12px" }}>{errors.nationality}</p>
            )}
          </div>

          {/* Age */}
          <div>
            <label style={{ fontSize: "13px", fontWeight: 500 }}>Age Group</label>
            <select
              name="age"
              value={formData.age}
              onChange={handleChange}
              onBlur={(e) => setErrors({ ...errors, age: validateField("age", e.target.value) })}
              style={{
                width: "100%",
                height: "50px",
                background: "#fff",
                borderRadius: "12px",
                padding: "0 16px",
                fontSize: "15px",
                color: "#777",
                border: errors.age ? "2px solid #7559FF" : "1px solid #ccc",
              }}
              required
            >
              <option value="">Select</option>
              <option value="Under 18">Under 18</option>
              <option value="18-24">18 – 24</option>
              <option value="25-34">25 – 34</option>
            </select>
            {errors.age && <p style={{ color: "#7559FF", fontSize: "12px" }}>{errors.age}</p>}
          </div>

          {/* Consent */}
          <label style={{ display: "flex", gap: "10px", fontSize: "12px" }}>
            <input
              type="checkbox"
              name="subscribe"
              checked={formData.subscribe}
              onChange={handleChange}
              required
              style={{
                width: "18px",
                height: "18px",
                border: "1px solid #979797",
                accentColor: "#7559FF",
              }}
            />
            Yes, I agree to receive updates and join the MEURAKI community.
          </label>
          {errors.subscribe && (
            <p style={{ color: "#7559FF", fontSize: "12px" }}>{errors.subscribe}</p>
          )}

          <button
            type="submit"
            style={{
              width: "100%",
              height: "50px",
              background: "#000",
              color: "#fff",
              border: "none",
              borderRadius: "28px",
              fontWeight: 700,
              textTransform: "uppercase",
              cursor: "pointer",
            }}
          >
            START
          </button>

          <input type="hidden" name="line_type" value={formData.line_type} />
        </form>
      </div>
    </div>
  );
}