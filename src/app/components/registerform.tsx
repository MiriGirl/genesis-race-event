"use client";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";


type RegisterFormProps = {
  initialLineType: string;
};

export default function RegisterForm({ initialLineType }: RegisterFormProps) {
  const pathname = usePathname();

// If prop is passed, prefer it; otherwise fall back to URL detection
const derivedLineType =
  initialLineType ||
  (pathname?.includes("/f1")
    ? "f1"
    : pathname?.includes("/standard")
    ? "standard"
    : "standard");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    nationality: "",
    age_group: "",
    subscribe: false,
    line_type: derivedLineType,
  });

  
  const [errors, setErrors] = useState<any>({});

  useEffect(() => {
    console.log("📍 line_type being used:", formData.line_type);
  }, [formData.line_type]);

  
  const nationalities = [
  { code: "AF", name: "Afghanistan", flag: "🇦🇫" },
  { code: "AL", name: "Albania", flag: "🇦🇱" },
  { code: "DZ", name: "Algeria", flag: "🇩🇿" },
  { code: "AD", name: "Andorra", flag: "🇦🇩" },
  { code: "AO", name: "Angola", flag: "🇦🇴" },
  { code: "AR", name: "Argentina", flag: "🇦🇷" },
  { code: "AM", name: "Armenia", flag: "🇦🇲" },
  { code: "AU", name: "Australia", flag: "🇦🇺" },
  { code: "AT", name: "Austria", flag: "🇦🇹" },
  { code: "AZ", name: "Azerbaijan", flag: "🇦🇿" },
  { code: "BS", name: "Bahamas", flag: "🇧🇸" },
  { code: "BH", name: "Bahrain", flag: "🇧🇭" },
  { code: "BD", name: "Bangladesh", flag: "🇧🇩" },
  { code: "BB", name: "Barbados", flag: "🇧🇧" },
  { code: "BY", name: "Belarus", flag: "🇧🇾" },
  { code: "BE", name: "Belgium", flag: "🇧🇪" },
  { code: "BZ", name: "Belize", flag: "🇧🇿" },
  { code: "BJ", name: "Benin", flag: "🇧🇯" },
  { code: "BT", name: "Bhutan", flag: "🇧🇹" },
  { code: "BO", name: "Bolivia", flag: "🇧🇴" },
  { code: "BA", name: "Bosnia and Herzegovina", flag: "🇧🇦" },
  { code: "BW", name: "Botswana", flag: "🇧🇼" },
  { code: "BR", name: "Brazil", flag: "🇧🇷" },
  { code: "BN", name: "Brunei", flag: "🇧🇳" },
  { code: "BG", name: "Bulgaria", flag: "🇧🇬" },
  { code: "BF", name: "Burkina Faso", flag: "🇧🇫" },
  { code: "KH", name: "Cambodia", flag: "🇰🇭" },
  { code: "CM", name: "Cameroon", flag: "🇨🇲" },
  { code: "CA", name: "Canada", flag: "🇨🇦" },
  { code: "CL", name: "Chile", flag: "🇨🇱" },
  { code: "CN", name: "China", flag: "🇨🇳" },
  { code: "CO", name: "Colombia", flag: "🇨🇴" },
  { code: "CR", name: "Costa Rica", flag: "🇨🇷" },
  { code: "HR", name: "Croatia", flag: "🇭🇷" },
  { code: "CU", name: "Cuba", flag: "🇨🇺" },
  { code: "CY", name: "Cyprus", flag: "🇨🇾" },
  { code: "CZ", name: "Czech Republic", flag: "🇨🇿" },
  { code: "DK", name: "Denmark", flag: "🇩🇰" },
  { code: "DO", name: "Dominican Republic", flag: "🇩🇴" },
  { code: "EC", name: "Ecuador", flag: "🇪🇨" },
  { code: "EG", name: "Egypt", flag: "🇪🇬" },
  { code: "EE", name: "Estonia", flag: "🇪🇪" },
  { code: "ET", name: "Ethiopia", flag: "🇪🇹" },
  { code: "FI", name: "Finland", flag: "🇫🇮" },
  { code: "FR", name: "France", flag: "🇫🇷" },
  { code: "DE", name: "Germany", flag: "🇩🇪" },
  { code: "GH", name: "Ghana", flag: "🇬🇭" },
  { code: "GR", name: "Greece", flag: "🇬🇷" },
  { code: "HK", name: "Hong Kong", flag: "🇭🇰" },
  { code: "HU", name: "Hungary", flag: "🇭🇺" },
  { code: "IS", name: "Iceland", flag: "🇮🇸" },
  { code: "IN", name: "India", flag: "🇮🇳" },
  { code: "ID", name: "Indonesia", flag: "🇮🇩" },
  { code: "IR", name: "Iran", flag: "🇮🇷" },
  { code: "IQ", name: "Iraq", flag: "🇮🇶" },
  { code: "IE", name: "Ireland", flag: "🇮🇪" },
  { code: "IL", name: "Israel", flag: "🇮🇱" },
  { code: "IT", name: "Italy", flag: "🇮🇹" },
  { code: "JP", name: "Japan", flag: "🇯🇵" },
  { code: "JO", name: "Jordan", flag: "🇯🇴" },
  { code: "KE", name: "Kenya", flag: "🇰🇪" },
  { code: "KW", name: "Kuwait", flag: "🇰🇼" },
  { code: "KG", name: "Kyrgyzstan", flag: "🇰🇬" },
  { code: "LA", name: "Laos", flag: "🇱🇦" },
  { code: "LV", name: "Latvia", flag: "🇱🇻" },
  { code: "LB", name: "Lebanon", flag: "🇱🇧" },
  { code: "LT", name: "Lithuania", flag: "🇱🇹" },
  { code: "LU", name: "Luxembourg", flag: "🇱🇺" },
  { code: "MY", name: "Malaysia", flag: "🇲🇾" },
  { code: "MV", name: "Maldives", flag: "🇲🇻" },
  { code: "ML", name: "Mali", flag: "🇲🇱" },
  { code: "MT", name: "Malta", flag: "🇲🇹" },
  { code: "MX", name: "Mexico", flag: "🇲🇽" },
  { code: "MC", name: "Monaco", flag: "🇲🇨" },
  { code: "MN", name: "Mongolia", flag: "🇲🇳" },
  { code: "ME", name: "Montenegro", flag: "🇲🇪" },
  { code: "MA", name: "Morocco", flag: "🇲🇦" },
  { code: "MM", name: "Myanmar", flag: "🇲🇲" },
  { code: "NP", name: "Nepal", flag: "🇳🇵" },
  { code: "NL", name: "Netherlands", flag: "🇳🇱" },
  { code: "NZ", name: "New Zealand", flag: "🇳🇿" },
  { code: "NG", name: "Nigeria", flag: "🇳🇬" },
  { code: "NO", name: "Norway", flag: "🇳🇴" },
  { code: "OM", name: "Oman", flag: "🇴🇲" },
  { code: "PK", name: "Pakistan", flag: "🇵🇰" },
  { code: "PH", name: "Philippines", flag: "🇵🇭" },
  { code: "PL", name: "Poland", flag: "🇵🇱" },
  { code: "PT", name: "Portugal", flag: "🇵🇹" },
  { code: "QA", name: "Qatar", flag: "🇶🇦" },
  { code: "RO", name: "Romania", flag: "🇷🇴" },
  { code: "RU", name: "Russia", flag: "🇷🇺" },
  { code: "RW", name: "Rwanda", flag: "🇷🇼" },
  { code: "SA", name: "Saudi Arabia", flag: "🇸🇦" },
  { code: "RS", name: "Serbia", flag: "🇷🇸" },
  { code: "SG", name: "Singapore", flag: "🇸🇬" },
  { code: "KR", name: "South Korea", flag: "🇰🇷" },
  { code: "ES", name: "Spain", flag: "🇪🇸" },
  { code: "LK", name: "Sri Lanka", flag: "🇱🇰" },
  { code: "SE", name: "Sweden", flag: "🇸🇪" },
  { code: "CH", name: "Switzerland", flag: "🇨🇭" },
  { code: "TW", name: "Taiwan", flag: "🇹🇼" },
  { code: "TH", name: "Thailand", flag: "🇹🇭" },
  { code: "TR", name: "Turkey", flag: "🇹🇷" },
  { code: "UA", name: "Ukraine", flag: "🇺🇦" },
  { code: "AE", name: "United Arab Emirates", flag: "🇦🇪" },
  { code: "GB", name: "United Kingdom", flag: "🇬🇧" },
  { code: "US", name: "United States", flag: "🇺🇸" },
  { code: "VN", name: "Vietnam", flag: "🇻🇳" },
  { code: "ZA", name: "South Africa", flag: "🇿🇦" },
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
     case "age_group":
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
   const payload = {
      ...formData,
      source_system: "react",      // set to "react" or "react-dev/prod"
      source_id: "react-form-1"    // unique identifier for this form
    };
    
    console.log("🚀 Sending payload:", formData);

    try {
  const res = await fetch("/api/proxy-pre-register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
console.log("✅ FULL API Response:", data);

// try to resolve fno regardless of structure
const fno = data?.race_no || data?.fno || data?.FNO;

if (fno) {
  console.log("➡️ Redirecting with Race No:", fno);
  window.location.href = `/loading?fno=${encodeURIComponent(fno)}`;
} else {
  console.warn("⚠️ No race number found in API response");
}
  // 👉 STEP 1: Redirect to loading page with fno
  if (data?.fno) {
    window.location.href = `/loading?fno=${data.fno}`;
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
                width: "85%",
                height: "50px",
                background: "#EFEDFF",
                borderRadius: "12px",
                padding: "0 22px",
                fontSize: "15px",
                color: "#777",
                border: errors.name ? "2px solid #7559FF" : "0px solid #ccc",
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
                width: "85%",
                height: "50px",
                background: "#EFEDFF",
                borderRadius: "12px",
                padding: "0 22px",
                fontSize: "15px",
                color: "#777",
                border: errors.email ? "2px solid #7559FF" : "0px solid #ccc",
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
                width: "85%",
                height: "50px",
                background: "#EFEDFF",
                borderRadius: "12px",
                padding: "0 22px",
                fontSize: "15px",
                color: "#777",
                border: errors.phone ? "2px solid #7559FF" : "0px solid #ccc",
              }}
              required
            />
            {errors.phone && <p style={{ color: "#7559FF", fontSize: "12px" }}>{errors.phone}</p>}
          </div>

         {/* Nationality */}
<div>
  <label style={{ fontSize: "13px", fontWeight: 500 }}>Nationality</label>
  <div style={{ position: "relative" }}>
    <select
      name="nationality"
      value={formData.nationality}
      onChange={handleChange}
      onBlur={(e) =>
        setErrors({ ...errors, nationality: validateField("nationality", e.target.value) })
      }
      style={{
        width: "98%",
        height: "50px",
        background: "#fff",
        boxShadow: "0 4px 4px rgba(0,0,0,0.07)",
        borderRadius: "12px",
        padding: "0 16px",
        fontSize: "15px",
        color: "#777",
        border: errors.nationality ? "2px solid #7559FF" : "1px solid #e5e5e5ff",
        appearance: "none", // hide default arrow
        outline: "none",
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

    {/* Custom Arrow */}
    <span
      style={{
        position: "absolute",
        right: "16px",
        top: "50%",
        transform: "translateY(-50%)",
        width: "30px",
        height: "30px",
        borderRadius: "50%",
        background: "#EFEDFF",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        pointerEvents: "none", // don’t block select clicks
      }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="18"
        height="18"
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
  {errors.nationality && (
    <p style={{ color: "#7559FF", fontSize: "12px" }}>{errors.nationality}</p>
  )}
</div>

          {/* Age */}
<div>
  <label style={{ fontSize: "13px", fontWeight: 500 }}>Age Group</label>
  <div style={{ position: "relative" }}>
    <select
      name="age_group"
      value={formData.age_group}
      onChange={handleChange}
      onBlur={(e) =>
        setErrors({
          ...errors,
          age_group: validateField("age_group", e.target.value),
        })
      }
      style={{
        width: "98%",
        height: "50px",
        background: "#fff",
        borderRadius: "12px",
        padding: "0 16px",
        fontSize: "15px",
          boxShadow: "0 4px 4px rgba(0,0,0,0.07)",
        color: "#777",
        border: errors.age_group ? "2px solid #7559FF" : "1px solid #e5e5e5ff",
        appearance: "none", // hide native arrow
        outline: "none",
      }}
      required
    >
      <option value="">Select</option>
      <option value="Under 18">Under 18</option>
      <option value="18-24">18 – 24</option>
      <option value="25-34">25 – 34</option>
      <option value="35-44">35 – 44</option>
      <option value="45-54">45 – 54</option>
      <option value="55-64">55 – 64</option>
      <option value="65+">65+</option>
    </select>

    {/* Custom Arrow */}
    <span
      style={{
        position: "absolute",
        right: "16px",
        top: "50%",
        transform: "translateY(-50%)",
        width: "30px",
        height: "30px",
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
        width="18"
        height="18"
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
  {errors.age_group && (
    <p style={{ color: "#7559FF", fontSize: "12px" }}>{errors.age_group}</p>
  )}
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