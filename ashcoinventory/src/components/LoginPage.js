import React, { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import ashLogoImg from "../assets/ash-logo.jpg";

/* ═══════════════════════════════════════════════════
   GLOBAL STYLES
═══════════════════════════════════════════════════ */
const CSS = `
@import url("https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap");
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

.al-root {
  height: 100vh; width: 100vw;
  display: flex; align-items: center;
  position: relative; overflow: hidden;
  background: linear-gradient(145deg, #0F6E36 0%, #094D25 44%, #042B14 100%);
  font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

.al-white-panel {
  position: absolute; top: 0; left: 0;
  width: 48%; height: 100vh;
  background: #F8FAFC;
  border-top-right-radius: 52px;
  border-bottom-right-radius: 0;
  z-index: 10;
  display: flex; align-items: center; justify-content: flex-end;
}

/* Left col wrapping the card to overlay on the white panel */
.al-left-col {
  flex: 0 0 48%; position: relative; z-index: 20;
  display: flex; flex-direction: column;
  align-items: flex-end; justify-content: center;
  padding: 0; height: 100vh;
}

/* THE CARD — Match reference proportions exactly */
.al-card {
  position: relative; z-index: 30;
  width: 100%; max-width: 520px;
  background: #ffffff; border-radius: 16px;
  padding: 48px 56px;
  box-shadow: 0 20px 60px rgba(4,43,20,0.16);
  border: 1px solid #F1F5F9;
  margin-right: -48px; /* 48px overhang onto green panel */
  display: flex; flex-direction: column; justify-content: center;
}

/* Background Wrapper to clip watermarks without clipping popovers */
.al-card-bg-wrap {
  position: absolute; top: 0; left: 0; right: 0; bottom: 0;
  border-radius: 16px; overflow: hidden; pointer-events: none; z-index: 0;
}

/* Subtle Geometric Watermarks */
.al-card-wm {
  position: absolute; top: -30px; right: -30px;
  opacity: 0.06; pointer-events: none; width: 180px;
  color: #0F172A;
}
.al-panel-wm {
  position: absolute; bottom: 20px; left: -40px;
  opacity: 0.04; pointer-events: none; z-index: 0; width: 340px;
  color: #0F172A;
}

.al-logo-trigger {
  cursor: pointer; user-select: none;
  display: inline-block; position: relative; z-index: 10;
}
.al-logo-img {
  height: 64px; width: auto; object-fit: contain;
  border-radius: 8px; transition: transform 0.15s;
}
.al-logo-img:active { transform: scale(0.95); }

/* Quick Access Popover */
.al-popover {
  position: absolute; top: -16px; left: calc(100% + 24px);
  background: #ffffff;
  border-radius: 14px;
  box-shadow: 0 10px 40px rgba(15,23,42,0.12), 0 2px 10px rgba(0,0,0,0.05);
  border: 1px solid #E2E8F0;
  padding: 16px;
  min-width: 300px;
  z-index: 200;
  visibility: hidden; opacity: 0;
}
.al-popover-title {
  font-size: 11px; font-weight: 700; color: #94A3B8;
  letter-spacing: 1.2px; text-transform: uppercase;
  margin-bottom: 12px;
  font-family: "Inter", sans-serif;
}
.al-qa-btn {
  display: flex; align-items: center; justify-content: space-between;
  width: 100%; padding: 12px 16px;
  background: #F8FAFC; border: 1px solid #E2E8F0;
  border-radius: 12px; cursor: pointer;
  margin-bottom: 8px;
  transition: border-color 0.2s, background 0.2s;
  font-family: "Inter", sans-serif;
  text-align: left;
}
.al-qa-btn:last-child { margin-bottom: 0; }
.al-qa-btn:hover { background: #F0FDF4; border-color: #15803D; }
.al-qa-label { font-size: 13px; font-weight: 600; color: #0F172A; }
.al-qa-sub { font-size: 11px; color: #64748B; margin-top: 2px; }
.al-qa-pill {
  font-size: 10px; font-weight: 700; padding: 3px 10px;
  border-radius: 20px; white-space: nowrap; margin-left: 10px;
}

/* Form Styling */
.al-label {
  display: block; font-size: 14px; font-weight: 500;
  color: #334155; margin-bottom: 8px;
}
.al-input {
  width: 100%; background: #F1F5F9;
  border: 1px solid transparent; border-radius: 12px;
  padding: 14px 16px; font-size: 14px; color: #1E293B;
  font-family: "Inter", sans-serif; outline: none;
  transition: all 0.22s;
}
.al-input:focus {
  background: #ffffff; border-color: #0E6B34;
  box-shadow: 0 0 0 3px rgba(14,107,52,0.15);
}
.al-input::placeholder { color: #94A3B8; font-size: 14px; }

.al-pw-wrap { position: relative; }
.al-pw-wrap .al-input { padding-right: 46px; }
.al-pw-eye {
  position: absolute; right: 14px; top: 50%;
  transform: translateY(-50%); background: none;
  border: none; cursor: pointer; color: #94A3B8;
  padding: 4px; display: flex; align-items: center;
  transition: color 0.2s; line-height: 1;
}
.al-pw-eye:hover { color: #0F172A; }

.al-sw {
  width: 36px; height: 20px; border-radius: 10px;
  cursor: pointer; position: relative; border: none;
  outline: none; flex-shrink: 0; transition: background 0.28s; padding: 0;
}
.al-sw-thumb {
  position: absolute; top: 2px; left: 2px;
  width: 16px; height: 16px; border-radius: 50%;
  background: #fff; box-shadow: 0 1px 4px rgba(0,0,0,0.2);
  transition: transform 0.28s cubic-bezier(.4,0,.2,1);
  pointer-events: none;
}

.al-btn {
  width: 100%; background: #0E6B34; color: #fff;
  border: none; border-radius: 12px; padding: 14px 16px;
  font-size: 16px; font-weight: 600;
  font-family: "Inter", sans-serif; cursor: pointer;
  box-shadow: 0 6px 20px rgba(14,107,52,0.28);
  transition: background 0.2s, box-shadow 0.2s, transform 0.12s;
}
.al-btn:hover:not(:disabled) {
  background: #0A5227; box-shadow: 0 8px 24px rgba(10,82,39,0.35);
  transform: translateY(-1px);
}
.al-btn:active:not(:disabled) { transform: scale(0.99); }
.al-btn:disabled { opacity: 0.65; cursor: not-allowed; }

.al-link-btn {
  background: none; border: none; padding: 0; cursor: pointer;
  font-family: "Inter", sans-serif; font-size: 14px;
  font-weight: 600; color: #0E6B34; transition: color 0.2s;
}
.al-link-btn:hover { color: #0A5227; text-decoration: underline; }

/* Right Panel & Hero Text */
.al-right-col {
  flex: 1; position: relative; z-index: 10;
  display: flex; flex-direction: column;
  align-items: flex-start; justify-content: center;
  height: 100vh; padding: 0 64px 60px 76px;
}
.al-hero-text {
  text-align: left; color: #fff; z-index: 20; position: relative;
  width: 100%; max-width: 600px;
}
.al-hero-text h2 {
  font-size: 38px; font-weight: 700; line-height: 1.18;
  letter-spacing: -0.5px; margin-bottom: 16px;
}
@media (min-width: 1280px) {
  .al-hero-text h2 { font-size: 44px; }
}
.al-hero-line { display: block; }
.al-hero-text p {
  font-size: 14px; color: rgba(167,243,208,0.8);
  font-weight: 400; margin-top: 16px;
}

@media (max-width: 960px) {
  .al-root { flex-direction: column; background: #F8FAFC; align-items: stretch; height: auto; min-height: 100vh; overflow: auto; }
  .al-white-panel { display: none; }
  .al-left-col {
    flex: none; width: 100%; padding: 60px 24px; height: auto;
    background: #F8FAFC; align-items: center; min-height: 100vh;
  }
  .al-card { margin-right: 0; max-width: 480px; }
  .al-right-col { display: none; }
  .al-popover { left: 50%; transform: translateX(-50%); }
}
@media (max-width: 480px) {
  .al-card { padding: 32px 24px; border-radius: 16px; }
  .al-hero-text h2 { font-size: 32px; }
}
`;

/* ═══════════════════════════════════════════════════
   HVAC WATERMARK (Replacing logo stamps)
═══════════════════════════════════════════════════ */
const HVACWatermark = () => (
  <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" style={{width: '100%', height: 'auto'}}>
    <path d="M100 20 L100 180 M20 100 L180 100 M43 43 L157 157 M43 157 L157 43" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
    <circle cx="100" cy="100" r="30" stroke="currentColor" strokeWidth="4"/>
    <path d="M100 20 L115 45 L85 45 Z M100 180 L85 155 L115 155 Z M20 100 L45 85 L45 115 Z M180 100 L155 115 L155 85 Z" fill="currentColor" opacity="0.8"/>
  </svg>
);

/* ═══════════════════════════════════════════════════
   EYE ICON
═══════════════════════════════════════════════════ */
function EyeIcon({ open }) {
  return open ? (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
    </svg>
  ) : (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  );
}

/* ═══════════════════════════════════════════════════
   TOGGLE SWITCH
═══════════════════════════════════════════════════ */
function ToggleSwitch({ checked, onChange }) {
  return (
    <button type="button" role="switch" aria-checked={checked} onClick={() => onChange(!checked)} className="al-sw" style={{ background: checked ? "#0E6B34" : "#CBD5E1" }}>
      <span className="al-sw-thumb" style={{ transform: checked ? "translateX(16px)" : "translateX(0)" }}/>
    </button>
  );
}

/* ═══════════════════════════════════════════════════
   CITY SKYLINE (h: 55% of bottom)
═══════════════════════════════════════════════════ */
function CitySkyline() {
  const Windows = ({ id, ox, oy, cols, rows, cw, ch, gx, gy }) =>
    Array.from({ length: rows }, (_, r) =>
      Array.from({ length: cols }, (_, c) => (
        <rect key={`${id}-${r}-${c}`} className="tower-window" x={ox + c * (cw + gx)} y={oy + r * (ch + gy)} width={cw} height={ch} rx="1" fill="rgba(255,255,255,0.15)"/>
      ))
    );

  const buildings = [
    [30, 220, 110, 280, 5, 12, 40, 230, false],
    [160, 180, 120, 320, 6, 14, 172, 190, false],
    [310, 150, 140, 350, 7, 16, 322, 160, true], 
    [480, 240, 90, 260, 4, 10, 490, 250, false],
    [620, 50, 160, 450, 8, 20, 634, 62, true],   
    [800, 200, 80, 300, 3, 12, 810, 210, false],
  ];

  return (
    <svg viewBox="0 0 900 480" preserveAspectRatio="xMidYMax slice" xmlns="http://www.w3.org/2000/svg"
      style={{ position: 'absolute', bottom: 0, left: 0, right: 0, width: '100%', height: '55%', pointerEvents: 'none', zIndex: 10 }}>
      <defs>
        <linearGradient id="bg-far" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(255,255,255,0.04)"/><stop offset="100%" stopColor="rgba(52,211,153,0.18)"/>
        </linearGradient>
        <linearGradient id="bg-near" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(255,255,255,0.06)"/><stop offset="100%" stopColor="rgba(52,211,153,0.2)"/>
        </linearGradient>
        <linearGradient id="bg-super" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(255,255,255,0.08)"/><stop offset="100%" stopColor="rgba(52,211,153,0.25)"/>
        </linearGradient>
      </defs>

      <g className="skyline-far">
         <rect x="0" y="280" width="100" height="200" fill="url(#bg-far)"/>
         <rect x="120" y="240" width="140" height="240" fill="url(#bg-far)"/>
         <rect x="290" y="260" width="130" height="220" fill="url(#bg-far)"/>
         <rect x="450" y="210" width="110" height="270" fill="url(#bg-far)"/>
         <rect x="580" y="180" width="180" height="300" fill="url(#bg-far)"/>
         <rect x="780" y="250" width="120" height="230" fill="url(#bg-far)"/>
      </g>

      {buildings.map(([x, y, w, h, wc, wr, wx, wy, spire], i) => {
        const isSuperTall = i === 4;
        const isStepped = i === 2;
        return (
          <g key={`b${i}`} className={`skyline-tower ${isSuperTall ? "skyline-super" : "skyline-near"}`}>
             <rect x={x+w*0.1} y={y-15} width={w*0.8} height={15} rx="1" fill={isSuperTall ? "url(#bg-super)" : "url(#bg-near)"}/>
             <rect x={x} y={y} width={w} height={h} rx="2" fill={isSuperTall ? "url(#bg-super)" : "url(#bg-near)"}/>
             {spire && (
               <>
                 <rect x={x+w/2-2} y={y-40} width={4} height={25} fill="rgba(255,255,255,0.4)"/>
                 <circle cx={x+w/2} cy={y-42} r="4" fill="rgba(255,100,100,0.8)"/>
               </>
             )}
             <Windows id={`tw${i}`} ox={wx} oy={wy} cols={wc} rows={wr} cw={12} ch={16} gx={6} gy={6}/>
             {isSuperTall && (
               <>
                 <rect x={x+15} y={y-25} width={w-30} height={10} fill="url(#bg-super)"/>
                 <rect x={x+25} y={y-35} width={w-50} height={10} fill="url(#bg-super)"/>
               </>
             )}
             {isStepped && (
               <>
                 <rect x={x+10} y={y-15} width={w-20} height={15} fill="url(#bg-near)"/>
                 <rect x={x+20} y={y-25} width={w-40} height={10} fill="url(#bg-near)"/>
               </>
             )}
          </g>
        );
      })}
    </svg>
  );
}

/* ═══════════════════════════════════════════════════
   MAIN LOGIN PAGE
═══════════════════════════════════════════════════ */
export default function LoginPage({ onLogin }) {
  const containerRef = useRef(null);
  const cardRef      = useRef(null);
  const popoverRef   = useRef(null);

  const [email,    setEmail]    = useState("admin@ashcol.local");
  const [password, setPassword] = useState("admin123");
  const [showPw,   setShowPw]   = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [popOpen,  setPopOpen]  = useState(false);

  /* Preserve Exact Original Authentication Logic */
  const handleFinish = (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;
    setLoading(true);
    setTimeout(() => {
      const em = (email || "").trim().toLowerCase();
      if (em === "tech@ashcol.local" || em.includes("tech")) {
        onLogin({ email, role: "Technician", fullName: "Alex Reyes (Field Technician)" });
      } else {
        onLogin({
          email: email || "admin@ashcol.local",
          role: "Inventory Manager",
          fullName: "Ashcol Warehouse Officer",
        });
      }
      setLoading(false);
    }, 700);
  };

  /* Hidden Quick Access Handler */
  const handleQuickLogin = (qEmail, qPassword, role, fullName) => {
    setEmail(qEmail);
    setPassword(qPassword);
    if (popoverRef.current) {
      gsap.to(popoverRef.current, { autoAlpha: 0, x: -12, duration: 0.22, ease: "power2.in" });
    }
    setPopOpen(false);
    setTimeout(() => onLogin({ email: qEmail, role, fullName }), 280);
  };

  const togglePopover = (e) => {
    e.stopPropagation();
    if (!popoverRef.current) return;
    if (popOpen) {
      gsap.to(popoverRef.current, { autoAlpha: 0, x: -12, duration: 0.22, ease: "power2.in" });
      setPopOpen(false);
    } else {
      gsap.fromTo(popoverRef.current,
        { autoAlpha: 0, x: -15 },
        { autoAlpha: 1, x: 0, duration: 0.30, ease: "power2.out" }
      );
      setPopOpen(true);
    }
  };

  useEffect(() => {
    const handler = () => {
      if (popOpen && popoverRef.current) {
        gsap.to(popoverRef.current, { autoAlpha: 0, x: -12, duration: 0.22 });
        setPopOpen(false);
      }
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, [popOpen]);

  /* Zero Blur GSAP Animations */
  useEffect(() => {
    if (!containerRef.current) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" }, delay: 0.06 });

      // Card entrance without 3D rotation, completely sharp
      tl.from(cardRef.current, {
        y: 25, opacity: 0,
        duration: 0.7, ease: "power3.out",
        onComplete: () => gsap.set(cardRef.current, { clearProps: "transform" })
      });

      // Staggered Cascade
      tl.from(".gsap-item", {
        y: 15, opacity: 0, stagger: 0.06, duration: 0.5,
        onComplete: () => gsap.set(".gsap-item", { clearProps: "transform" })
      }, "-=0.35");

      // Skyscraper upward cascade
      tl.from(".skyline-tower", {
        y: 150, opacity: 0,
        stagger: 0.07, duration: 1, ease: "expo.out"
      }, 0.1);

      // Hero text reveal
      tl.from(".al-hero-line", {
        y: 20, opacity: 0,
        stagger: 0.12, duration: 0.80, ease: "power4.out"
      }, 0.3);
      tl.from(".al-hero-text p", { y: 12, opacity: 0, duration: 0.62 }, 0.8);

      // Window randomizer loop
      gsap.utils.toArray(".tower-window").forEach((win) => {
        gsap.to(win, {
          opacity: gsap.utils.random(0.08, 0.75),
          duration: gsap.utils.random(1.0, 4.0),
          repeat: -1, yoyo: true, ease: "sine.inOut",
          delay: gsap.utils.random(0, 3)
        });
      });
    }, containerRef);

    // Mouse Parallax Restricted to X Axis only
    const onMove = (e) => {
      const xR = (e.clientX / window.innerWidth) - 0.5;
      gsap.to(".skyline-near",  { x: xR * 12, duration: 0.85, overwrite: "auto" });
      gsap.to(".skyline-super", { x: xR * 8, duration: 0.85, overwrite: "auto" });
      gsap.to(".skyline-far",   { x: xR * 4,  duration: 0.85, overwrite: "auto" });
    };
    const onLeave = () => {
      gsap.to(".skyline-near, .skyline-super, .skyline-far", { x: 0, duration: 1.2 });
    };
    
    window.addEventListener("mousemove", onMove);
    document.addEventListener("mouseleave", onLeave);
    
    return () => {
      ctx.revert();
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return (
    <>
      <style>{CSS}</style>
      <div className="al-root" ref={containerRef}>
        
        {/* Left White Panel */}
        <div className="al-white-panel">
          <div className="al-panel-wm">
            <HVACWatermark />
          </div>
        </div>

        {/* Card Overlay Section */}
        <div className="al-left-col">
          <div className="al-card" ref={cardRef}>
            <div className="al-card-bg-wrap">
              <div className="al-card-wm">
                <HVACWatermark />
              </div>
            </div>

            {/* Logo -> Quick Access Popover */}
            <div className="gsap-item al-logo-trigger" onClick={togglePopover}>
              <img src={ashLogoImg} alt="Ashcol Corporation" className="al-logo-img" />
              
              <div className="al-popover" ref={popoverRef} onClick={(e) => e.stopPropagation()}>
                <div className="al-popover-title">Quick Demo Access</div>
                <button type="button" className="al-qa-btn"
                  onClick={() => handleQuickLogin("admin@ashcol.local", "admin123", "Inventory Manager", "Ashcol Warehouse Officer")}>
                  <div>
                    <div className="al-qa-label">🔑 Admin / Warehouse Officer</div>
                    <div className="al-qa-sub">Full control — add, edit, delete, prices</div>
                  </div>
                  <span className="al-qa-pill" style={{ background: "rgba(21,128,61,0.1)", color: "#15803D", border: "1px solid rgba(21,128,61,0.25)" }}>Admin</span>
                </button>
                <button type="button" className="al-qa-btn"
                  onClick={() => handleQuickLogin("tech@ashcol.local", "tech123", "Technician", "Alex Reyes (Field Technician)")}>
                  <div>
                    <div className="al-qa-label">🔧 Field Technician / Staff</div>
                    <div className="al-qa-sub">Log check-outs &amp; browse stock</div>
                  </div>
                  <span className="al-qa-pill" style={{ background: "rgba(37,99,235,0.08)", color: "#1D4ED8", border: "1px solid rgba(37,99,235,0.2)" }}>Tech</span>
                </button>
              </div>
            </div>

            <h2 className="gsap-item" style={{
              marginTop: 24, marginBottom: 32,
              fontSize: 24, fontWeight: 700, color: "#0F172A",
              letterSpacing: "-0.4px", fontFamily: "'Inter', sans-serif"
            }}>
              Nice to see you again
            </h2>

            {/* Preserved Authentic Login Form Fields */}
            <form onSubmit={handleFinish} noValidate style={{ display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'center', position: 'relative', zIndex: 10 }}>
              <div className="gsap-item" style={{ marginBottom: 20 }}>
                <label className="al-label" htmlFor="al-email">Work Email</label>
                <input id="al-email" type="text" className="al-input"
                  placeholder="e.g. admin@ashcol.local or tech@ashcol.local"
                  value={email} onChange={(e) => setEmail(e.target.value)} required/>
              </div>

              <div className="gsap-item" style={{ marginBottom: 0 }}>
                <label className="al-label" htmlFor="al-pw">Password</label>
                <div className="al-pw-wrap">
                  <input id="al-pw" type={showPw ? "text" : "password"} className="al-input"
                    placeholder="Enter password"
                    value={password} onChange={(e) => setPassword(e.target.value)} required/>
                  <button type="button" className="al-pw-eye" onClick={() => setShowPw(!showPw)}>
                    <EyeIcon open={showPw}/>
                  </button>
                </div>
              </div>

              <div className="gsap-item" style={{ marginTop: 24, marginBottom: 16 }}>
                <button type="submit" className="al-btn" disabled={loading}>
                  {loading ? "Signing in..." : "Sign In to Inventory"}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* ── RIGHT HERO PANEL ── */}
        <div className="al-right-col">
          <div className="al-hero-text">
            <h2>
              <span className="al-hero-line">Keeping every space</span>
              <span className="al-hero-line" style={{ color: "#fff" }}>Cool &amp; Reliable together.</span>
            </h2>
            <p>Delivering smart HVAC &amp; field service excellence together.</p>
          </div>
          <CitySkyline/>
        </div>

      </div>
    </>
  );
}
