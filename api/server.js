const pool = require('./db');
const crypto = require('crypto');

module.exports = async (req, res) => {

  try {

    // ---------------------------------
    // LEGACY CORE LANDING PAGE
    // ---------------------------------

    if (req.method === 'GET') {

      return res.send(`

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>LEGACY CORE API</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=JetBrains+Mono:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <style>
        :root {
            --bg: #020204;
            --surface: rgba(12, 12, 22, 0.6);
            --primary: #00f0ff;
            --primary-glow: rgba(0, 240, 255, 0.3);
            --accent: #ffd700;
            --text: #f0f0f5;
            --text-dim: #6b6b7b;
            --success: #00ff9d;
            --border: rgba(255, 255, 255, 0.05);
        }

        * { margin: 0; padding: 0; box-sizing: border-box; }
        html { scroll-behavior: smooth; }

        body {
            background: var(--bg);
            color: var(--text);
            font-family: 'Space Grotesk', sans-serif;
            min-height: 100vh;
            overflow-x: hidden;
            cursor: none;
        }

        /* ===== PRELOADER ===== */
        .preloader {
            position: fixed; inset: 0; z-index: 100000;
            background: var(--bg);
            display: flex; flex-direction: column;
            align-items: center; justify-content: center;
            transition: opacity 1s cubic-bezier(0.16, 1, 0.3, 1), visibility 1s;
        }
        .preloader.done { opacity: 0; visibility: hidden; pointer-events: none; }
        .preloader-logo {
            font-size: 14px; font-weight: 700;
            letter-spacing: 0.3em; text-transform: uppercase;
            color: var(--text-dim); margin-bottom: 40px;
        }
        .preloader-logo span { color: var(--primary); }
        .preloader-bar {
            width: 200px; height: 1px;
            background: rgba(255,255,255,0.05);
            position: relative; overflow: hidden;
        }
        .preloader-bar::after {
            content: ''; position: absolute; left: 0; top: 0;
            height: 100%; width: 0%;
            background: linear-gradient(90deg, var(--primary), var(--accent));
            animation: loadBar 1.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes loadBar { 0% { width: 0%; } 50% { width: 60%; } 100% { width: 100%; } }
        .preloader-percent {
            margin-top: 16px;
            font-family: 'JetBrains Mono', monospace;
            font-size: 11px; color: var(--text-dim); letter-spacing: 0.1em;
        }

        /* ===== CURSOR ===== */
        .cursor {
            position: fixed; width: 8px; height: 8px;
            background: var(--primary); border-radius: 50%;
            pointer-events: none; z-index: 99999;
            mix-blend-mode: difference;
            transition: transform 0.15s ease, width 0.3s ease, height 0.3s ease;
            transform: translate(-50%, -50%);
        }
        .cursor.hover {
            width: 40px; height: 40px;
            background: transparent;
            border: 1.5px solid var(--primary);
            mix-blend-mode: normal;
        }
        .cursor-trail {
            position: fixed; width: 30px; height: 30px;
            border: 1px solid rgba(0, 240, 255, 0.15);
            border-radius: 50%; pointer-events: none; z-index: 99998;
            transform: translate(-50%, -50%);
            transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }

        /* ===== BACKGROUND ===== */
        #bg-canvas {
            position: fixed; top: 0; left: 0;
            width: 100%; height: 100%;
            z-index: 0; pointer-events: none;
        }
        .noise {
            position: fixed; inset: 0; z-index: 1;
            pointer-events: none; opacity: 0.035;
            background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
            background-repeat: repeat; background-size: 256px 256px;
        }
        .vignette {
            position: fixed; inset: 0; z-index: 2;
            pointer-events: none;
            background: radial-gradient(ellipse at center, transparent 0%, transparent 40%, rgba(0,0,0,0.6) 100%);
        }

        /* ===== FLOATING SHAPES ===== */
        .geo-shape {
            position: fixed; pointer-events: none; z-index: 1; opacity: 0.04;
        }
        .geo-ring {
            width: 400px; height: 400px;
            border: 1px solid var(--primary); border-radius: 50%;
            top: 10%; right: -100px;
            animation: geoFloat1 25s ease-in-out infinite;
        }
        .geo-ring-2 {
            width: 300px; height: 300px;
            border: 1px solid var(--accent); border-radius: 50%;
            bottom: 15%; left: -80px;
            animation: geoFloat2 30s ease-in-out infinite;
        }
        .geo-diamond {
            width: 150px; height: 150px;
            border: 1px solid var(--primary); transform: rotate(45deg);
            top: 60%; right: 15%;
            animation: geoFloat3 20s ease-in-out infinite;
        }
        @keyframes geoFloat1 { 0%,100% { transform: translate(0,0) rotate(0deg); } 33% { transform: translate(-30px, 40px) rotate(120deg); } 66% { transform: translate(20px, -20px) rotate(240deg); } }
        @keyframes geoFloat2 { 0%,100% { transform: translate(0,0) rotate(0deg); } 50% { transform: translate(40px, -30px) rotate(180deg); } }
        @keyframes geoFloat3 { 0%,100% { transform: translate(0,0) rotate(45deg); } 50% { transform: translate(-20px, 30px) rotate(225deg); } }

        /* ===== MAIN ===== */
        .main-wrap {
            position: relative; z-index: 10;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 40px 20px;
            perspective: 1200px;
        }

        /* ===== 3D CARD ===== */
        .card-3d {
            width: 720px; max-width: 95vw;
            position: relative;
            transform-style: preserve-3d;
            transition: transform 0.1s ease-out;
        }

        .card {
            background: linear-gradient(165deg, rgba(14,14,26,0.65) 0%, rgba(8,8,18,0.55) 100%);
            backdrop-filter: blur(50px);
            -webkit-backdrop-filter: blur(50px);
            border: 1px solid var(--border);
            border-radius: 28px;
            padding: 48px 44px;
            position: relative;
            overflow: hidden;
            transform-style: preserve-3d;
            box-shadow:
                0 0 0 1px rgba(255,255,255,0.015),
                0 25px 80px rgba(0,0,0,0.6),
                0 0 100px rgba(0, 240, 255, 0.03);
            animation: cardReveal 1.2s cubic-bezier(0.16, 1, 0.3, 1) 0.3s both,
                       cardBreathe 6s ease-in-out infinite 2s;
        }

        @keyframes cardReveal {
            from { opacity: 0; transform: translateY(60px) rotateX(15deg) scale(0.92); }
            to { opacity: 1; transform: translateY(0) rotateX(0) scale(1); }
        }
        @keyframes cardBreathe {
            0%, 100% { box-shadow: 0 25px 80px rgba(0,0,0,0.6), 0 0 100px rgba(0, 240, 255, 0.03); }
            50% { box-shadow: 0 25px 80px rgba(0,0,0,0.6), 0 0 140px rgba(0, 240, 255, 0.06); }
        }

        .card::before {
            content: '';
            position: absolute; inset: 0;
            border-radius: 28px;
            padding: 1.5px;
            background: conic-gradient(
                from 0deg at 50% 50%,
                rgba(0, 240, 255, 0.35) 0deg,
                rgba(255, 215, 0, 0.15) 72deg,
                rgba(255,255,255,0) 144deg,
                rgba(255,255,255,0) 216deg,
                rgba(0, 240, 255, 0.15) 288deg,
                rgba(0, 240, 255, 0.35) 360deg
            );
            -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
            -webkit-mask-composite: xor;
            mask-composite: exclude;
            pointer-events: none;
            animation: borderSpin 12s linear infinite;
        }
        @keyframes borderSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

        .card::after {
            content: '';
            position: absolute;
            top: -50%; left: -50%;
            width: 200%; height: 200%;
            background: radial-gradient(circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(0, 240, 255, 0.05) 0%, transparent 50%);
            pointer-events: none;
            transition: background 0.3s ease;
        }

        /* ===== HEADER ===== */
        .header {
            text-align: center;
            margin-bottom: 36px;
            position: relative; z-index: 2;
        }

        .logo-icon {
            width: 64px; height: 64px;
            margin: 0 auto 20px;
            position: relative;
            animation: fadeSlideUp 0.8s 0.5s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        .logo-icon svg {
            width: 100%; height: 100%;
            filter: drop-shadow(0 0 20px rgba(0, 240, 255, 0.3));
        }

        .badge {
            display: inline-flex; align-items: center; gap: 8px;
            padding: 8px 18px;
            background: linear-gradient(135deg, rgba(0, 255, 157, 0.08), rgba(0, 240, 255, 0.04));
            border: 1px solid rgba(0, 255, 157, 0.15);
            border-radius: 100px;
            font-size: 10px;
            font-weight: 700;
            letter-spacing: 0.12em;
            text-transform: uppercase;
            color: var(--success);
            margin-bottom: 24px;
            animation: fadeSlideUp 0.8s 0.6s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        .badge-dot {
            width: 5px; height: 5px;
            background: var(--success);
            border-radius: 50%;
            box-shadow: 0 0 10px var(--success), 0 0 20px rgba(0, 255, 157, 0.3);
            animation: dotPulse 2.5s ease-in-out infinite;
        }
        @keyframes dotPulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.4; transform: scale(0.7); } }

        h1 {
            font-size: 42px;
            font-weight: 700;
            letter-spacing: -0.04em;
            line-height: 1.05;
            animation: fadeSlideUp 0.8s 0.7s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        h1 .line1 {
            display: block;
            background: linear-gradient(135deg, #fff 0%, #a0a0b8 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }
        h1 .line2 {
            display: block;
            background: linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            margin-top: 2px;
        }

        .subtitle {
            margin-top: 14px;
            font-size: 14px;
            color: var(--text-dim);
            font-weight: 400;
            letter-spacing: 0.02em;
            animation: fadeSlideUp 0.8s 0.8s cubic-bezier(0.16, 1, 0.3, 1) both;
        }

        @keyframes fadeSlideUp {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
        }

        /* ===== DIVIDER ===== */
        .divider {
            height: 1px;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent);
            margin: 32px 0;
            position: relative;
            animation: fadeSlideUp 0.8s 0.85s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        .divider::after {
            content: '';
            position: absolute; left: 50%; top: 50%;
            transform: translate(-50%, -50%);
            width: 6px; height: 6px;
            background: var(--primary);
            border-radius: 50%;
            box-shadow: 0 0 10px var(--primary);
        }

        /* ===== STATUS GRID ===== */
        .status-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
            gap: 14px;
            margin-bottom: 32px;
            position: relative; z-index: 2;
            animation: fadeSlideUp 0.8s 0.9s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        .status-item {
            background: linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01));
            border: 1px solid var(--border);
            border-radius: 16px;
            padding: 18px;
            text-align: center;
            transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .status-item:hover {
            transform: translateY(-3px);
            border-color: rgba(0, 240, 255, 0.15);
            box-shadow: 0 8px 25px rgba(0,0,0,0.3), 0 0 30px rgba(0, 240, 255, 0.04);
        }
        .status-item svg {
            width: 20px; height: 20px;
            color: var(--primary);
            margin-bottom: 10px;
            filter: drop-shadow(0 0 6px var(--primary-glow));
        }
        .status-item .label {
            font-size: 10px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            color: var(--text-dim);
            margin-bottom: 6px;
        }
        .status-item .value {
            font-size: 13px;
            font-weight: 600;
            color: var(--text);
        }
        .status-item .value.ok { color: var(--success); }

        /* ===== INFO BOX ===== */
        .info-box {
            background: linear-gradient(135deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01));
            border: 1px solid var(--border);
            border-radius: 20px;
            padding: 24px;
            margin-bottom: 28px;
            position: relative; z-index: 2;
            animation: fadeSlideUp 0.8s 0.95s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        .info-box::before {
            content: '';
            position: absolute; top: 0; left: 0; right: 0;
            height: 2px;
            background: linear-gradient(90deg, transparent, var(--primary), transparent);
            opacity: 0.4;
        }
        .info-title {
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.12em;
            color: var(--primary);
            margin-bottom: 16px;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        .info-title svg { width: 14px; height: 14px; }
        .info-item {
            display: flex;
            align-items: center;
            gap: 10px;
            color: var(--text-dim);
            margin-bottom: 10px;
            font-size: 13px;
            transition: all 0.3s ease;
        }
        .info-item:hover { color: var(--text); }
        .info-item svg {
            width: 14px; height: 14px;
            color: var(--success);
            flex-shrink: 0;
        }
        .info-item:last-child { margin-bottom: 0; }

        /* ===== TELEGRAM ===== */
        .telegram {
            display: inline-flex;
            align-items: center;
            gap: 10px;
            padding: 12px 24px;
            background: linear-gradient(135deg, rgba(0, 240, 255, 0.08), rgba(255, 215, 0, 0.04));
            border: 1px solid rgba(0, 240, 255, 0.12);
            border-radius: 14px;
            color: var(--primary);
            font-size: 13px;
            font-weight: 600;
            text-decoration: none;
            cursor: none;
            transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
            position: relative; z-index: 2;
            animation: fadeSlideUp 0.8s 1s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        .telegram:hover {
            transform: translateY(-2px);
            border-color: var(--primary);
            box-shadow: 0 8px 25px rgba(0, 240, 255, 0.15);
            background: linear-gradient(135deg, rgba(0, 240, 255, 0.12), rgba(255, 215, 0, 0.06));
        }
        .telegram svg {
            width: 18px; height: 18px;
        }

        /* ===== FOOTER ===== */
        .footer {
            margin-top: 32px;
            text-align: center;
            position: relative; z-index: 2;
            animation: fadeSlideUp 0.8s 1.05s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        .footer-line {
            display: flex; align-items: center;
            justify-content: center; gap: 12px;
            font-size: 11px;
            color: rgba(255,255,255,0.12);
            font-weight: 500;
            letter-spacing: 0.08em;
            text-transform: uppercase;
        }
        .footer-line::before, .footer-line::after {
            content: '';
            width: 40px; height: 1px;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1));
        }
        .footer-line::after {
            background: linear-gradient(90deg, rgba(255,255,255,0.1), transparent);
        }
        .credit {
            margin-top: 12px;
            font-size: 12px;
            color: var(--text-dim);
        }
        .credit a {
            color: var(--primary);
            text-decoration: none;
            font-weight: 600;
            transition: all 0.3s ease;
        }
        .credit a:hover {
            text-shadow: 0 0 10px var(--primary-glow);
        }

        /* ===== RESPONSIVE ===== */
        @media (max-width: 760px) {
            .card { padding: 36px 24px; border-radius: 22px; }
            h1 { font-size: 32px; }
            .status-grid { grid-template-columns: repeat(2, 1fr); }
            .cursor, .cursor-trail { display: none; }
            body { cursor: auto; }
            .telegram { cursor: pointer; }
        }
        @media (max-width: 400px) {
            .status-grid { grid-template-columns: 1fr; }
        }
    </style>
</head>
<body>

    <!-- PRELOADER -->
    <div class="preloader" id="preloader">
        <div class="preloader-logo">LEGACY CORE <span>API</span></div>
        <div class="preloader-bar"></div>
        <div class="preloader-percent" id="preloaderPercent">0%</div>
    </div>

    <!-- CURSOR -->
    <div class="cursor" id="cursor"></div>
    <div class="cursor-trail" id="cursorTrail"></div>

    <!-- BACKGROUND -->
    <canvas id="bg-canvas"></canvas>
    <div class="noise"></div>
    <div class="vignette"></div>

    <!-- FLOATING SHAPES -->
    <div class="geo-shape geo-ring"></div>
    <div class="geo-shape geo-ring-2"></div>
    <div class="geo-shape geo-diamond"></div>

    <!-- MAIN -->
    <div class="main-wrap">
        <div class="card-3d" id="card3d">
            <div class="card" id="card">

                <div class="header">
                    <div class="logo-icon">
                        <svg viewBox="0 0 64 64" fill="none">
                            <defs>
                                <linearGradient id="logoGrad" x1="12" y1="12" x2="52" y2="52">
                                    <stop stop-color="#00f0ff"/>
                                    <stop offset="1" stop-color="#ffd700"/>
                                </linearGradient>
                            </defs>
                            <circle cx="32" cy="32" r="30" stroke="url(#logoGrad)" stroke-width="1.2" opacity="0.35"/>
                            <circle cx="32" cy="32" r="24" stroke="url(#logoGrad)" stroke-width="0.5" opacity="0.15"/>
                            <path d="M32 14L44 32L32 40L20 32L32 14Z" fill="url(#logoGrad)" opacity="0.15"/>
                            <path d="M32 14L44 32L32 40L20 32L32 14Z" stroke="url(#logoGrad)" stroke-width="1.5" stroke-linejoin="round"/>
                            <circle cx="32" cy="32" r="5" fill="url(#logoGrad)"/>
                        </svg>
                    </div>
                    <div class="badge">
                        <span class="badge-dot"></span>
                        Server Online
                    </div>
                    <h1>
                        <span class="line1">LEGACY CORE</span>
                        <span class="line2">API</span>
                    </h1>
                    <p class="subtitle">Secure Authentication Server & Real-Time License Management System</p>
                </div>

                <div class="divider"></div>

                <div class="status-grid">
                    <div class="status-item">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                        <div class="label">Auth Service</div>
                        <div class="value ok">Running</div>
                    </div>
                    <div class="status-item">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"></ellipse><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path></svg>
                        <div class="label">Database</div>
                        <div class="value ok">Connected</div>
                    </div>
                    <div class="status-item">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                        <div class="label">License</div>
                        <div class="value ok">Active</div>
                    </div>
                    <div class="status-item">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>
                        <div class="label">Device Lock</div>
                        <div class="value ok">Enabled</div>
                    </div>
                </div>

                <div class="info-box">
                    <div class="info-title">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                        System Status
                    </div>
                    <div class="info-item">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                        Authentication Service Running
                    </div>
                    <div class="info-item">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                        Database Connected Successfully
                    </div>
                    <div class="info-item">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                        License Validation Active
                    </div>
                    <div class="info-item">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                        Device Lock System Enabled
                    </div>
                </div>

                <div style="text-align:center;">
                    <a href="https://t.me/LegacyDevX" target="_blank" class="telegram" id="tgBtn">
                        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
                        T.me/LegacyDevX
                    </a>
                </div>

                <div class="footer">
                    <div class="footer-line">LEGACY CORE SECURITY v2.0</div>
                    <div class="credit">Developed By <a href="https://t.me/LegacyDevX" target="_blank">@LegacyDevX</a></div>
                </div>
            </div>
        </div>
    </div>

    <script>
        // ===== PRELOADER =====
        const preloader = document.getElementById('preloader');
        const preloaderPercent = document.getElementById('preloaderPercent');
        let loadProgress = 0;
        const loadInterval = setInterval(() => {
            loadProgress += Math.random() * 15 + 5;
            if (loadProgress >= 100) {
                loadProgress = 100;
                clearInterval(loadInterval);
                setTimeout(() => { preloader.classList.add('done'); }, 400);
            }
            preloaderPercent.textContent = Math.floor(loadProgress) + '%';
        }, 120);

        // ===== CURSOR =====
        const cursor = document.getElementById('cursor');
        const cursorTrail = document.getElementById('cursorTrail');
        let mouseX = 0, mouseY = 0;
        let trailX = 0, trailY = 0;

        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX; mouseY = e.clientY;
            cursor.style.left = mouseX + 'px';
            cursor.style.top = mouseY + 'px';
        });
        function animateCursor() {
            trailX += (mouseX - trailX) * 0.15;
            trailY += (mouseY - trailY) * 0.15;
            cursorTrail.style.left = trailX + 'px';
            cursorTrail.style.top = trailY + 'px';
            requestAnimationFrame(animateCursor);
        }
        animateCursor();

        const tgBtn = document.getElementById('tgBtn');
        if (tgBtn) {
            tgBtn.addEventListener('mouseenter', () => cursor.classList.add('hover'));
            tgBtn.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
        }

        // ===== 3D PARTICLE SPHERE =====
        const canvas = document.getElementById('bg-canvas');
        const ctx = canvas.getContext('2d');
        let particles = [];
        let rotX = 0, rotY = 0, targetRotX = 0, targetRotY = 0;

        function resizeCanvas() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        const PARTICLE_COUNT = 350;
        const SPHERE_RADIUS = Math.min(window.innerWidth, window.innerHeight) * 0.35;

        for (let i = 0; i < PARTICLE_COUNT; i++) {
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            const r = SPHERE_RADIUS * (0.3 + Math.random() * 0.7);
            particles.push({
                x: r * Math.sin(phi) * Math.cos(theta),
                y: r * Math.sin(phi) * Math.sin(theta),
                z: r * Math.cos(phi),
                baseX: r * Math.sin(phi) * Math.cos(theta),
                baseY: r * Math.sin(phi) * Math.sin(theta),
                baseZ: r * Math.cos(phi),
                size: Math.random() * 1.5 + 0.5,
                opacity: Math.random() * 0.6 + 0.2,
                speed: Math.random() * 0.002 + 0.001
            });
        }

        function project3D(x, y, z) {
            const fov = 800;
            const scale = fov / (fov + z);
            return { x: x * scale + canvas.width / 2, y: y * scale + canvas.height / 2, scale, z };
        }
        function rotate3D(x, y, z, rx, ry) {
            let x1 = x * Math.cos(ry) - z * Math.sin(ry);
            let z1 = x * Math.sin(ry) + z * Math.cos(ry);
            let y2 = y * Math.cos(rx) - z1 * Math.sin(rx);
            let z2 = y * Math.sin(rx) + z1 * Math.cos(rx);
            return { x: x1, y: y2, z: z2 };
        }

        let time = 0;
        function animateBG() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            time += 0.003;
            rotX += (targetRotX - rotX) * 0.05;
            rotY += (targetRotY - rotY) * 0.05;
            rotY += 0.002;

            const projected = [];
            particles.forEach((p, i) => {
                const orbitSpeed = p.speed * 50;
                const angle = time * orbitSpeed + i;
                const orbitRadius = 20;
                const ox = p.baseX + Math.cos(angle) * orbitRadius;
                const oy = p.baseY + Math.sin(angle * 0.7) * orbitRadius;
                const oz = p.baseZ + Math.sin(angle * 0.5) * orbitRadius;
                const rotated = rotate3D(ox, oy, oz, rotX, rotY);
                const proj = project3D(rotated.x, rotated.y, rotated.z);
                proj.opacity = p.opacity * (0.5 + 0.5 * ((rotated.z + SPHERE_RADIUS) / (2 * SPHERE_RADIUS)));
                proj.size = p.size * proj.scale;
                projected.push({ ...proj, original: p });
            });

            projected.sort((a, b) => b.z - a.z);

            for (let i = 0; i < projected.length; i++) {
                for (let j = i + 1; j < Math.min(i + 8, projected.length); j++) {
                    const dx = projected[i].x - projected[j].x;
                    const dy = projected[i].y - projected[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < 120) {
                        const alpha = 0.04 * (1 - dist / 120) * projected[i].opacity;
                        ctx.beginPath();
                        ctx.moveTo(projected[i].x, projected[i].y);
                        ctx.lineTo(projected[j].x, projected[j].y);
                        ctx.strokeStyle = \`rgba(0, 240, 255, \${alpha})\`;
                        ctx.lineWidth = 0.5;
                        ctx.stroke();
                    }
                }
            }

            projected.forEach(p => {
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = \`rgba(0, 240, 255, \${p.opacity})\`;
                ctx.fill();
                if (p.z > 0) {
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
                    ctx.fillStyle = \`rgba(0, 240, 255, \${p.opacity * 0.1})\`;
                    ctx.fill();
                }
            });

            requestAnimationFrame(animateBG);
        }
        animateBG();

        document.addEventListener('mousemove', (e) => {
            targetRotY = (e.clientX / window.innerWidth - 0.5) * 1.5;
            targetRotX = (e.clientY / window.innerHeight - 0.5) * 1;
        });

        // ===== 3D CARD TILT + LIGHT =====
        const card3d = document.getElementById('card3d');
        const card = document.getElementById('card');

        document.addEventListener('mousemove', (e) => {
            const rect = card3d.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            const rotateY = ((e.clientX - centerX) / rect.width) * 12;
            const rotateX = ((centerY - e.clientY) / rect.height) * 12;
            card3d.style.transform = \`rotateX(\${rotateX}deg) rotateY(\${rotateY}deg)\`;

            const lightX = ((e.clientX - rect.left) / rect.width) * 100;
            const lightY = ((e.clientY - rect.top) / rect.height) * 100;
            card.style.setProperty('--mouse-x', lightX + '%');
            card.style.setProperty('--mouse-y', lightY + '%');
        });

        document.addEventListener('mouseleave', () => {
            card3d.style.transform = 'rotateX(0) rotateY(0)';
        });
    </script>
</body>
</html>

      `);
    }

    // ---------------------------------
    // READ BODY SAFELY
    // ---------------------------------

    let body = req.body || {};

    if (typeof body === 'string') {

      try {

        body = JSON.parse(body);

      } catch {}
    }

    // ---------------------------------
    // RAW FORM SUPPORT
    // ---------------------------------

    if (
      req.method === 'POST' &&
      (
        !req.body ||
        Object.keys(req.body).length === 0
      )
    ) {

      let raw = '';

      await new Promise((resolve) => {

        req.on('data', chunk => {
          raw += chunk;
        });

        req.on('end', resolve);
      });

      body = Object.fromEntries(
        new URLSearchParams(raw)
      );
    }

    console.log("BODY:", body);

    // ---------------------------------
    // GET KEY / HWID
    // ---------------------------------

    const key = (
      body.key ||
      body.game ||
      body.user_key ||
      body.token ||
      body.license ||
      ''
    )
    .toString()
    .trim();

    const hwid = (
      body.hwid ||
      body.serial ||
      body.device_id ||
      body.uuid ||
      body.device ||
      body.android_id ||
      ''
    )
    .toString()
    .trim();

    console.log("KEY:", key);
    console.log("HWID:", hwid);

    // ---------------------------------
    // VALIDATION
    // ---------------------------------

    if (!key || !hwid) {

      return res.json({

        status: false,

        reason: 'Invalid Request'
      });
    }

    // ---------------------------------
    // DATABASE CHECK
    // ---------------------------------

    const result =
      await pool.query(

        'SELECT * FROM keys WHERE TRIM(license_key)=$1 LIMIT 1',

        [key]
      );

    if (result.rows.length <= 0) {

      return res.json({

        status: false,

        reason: 'Invalid Key'
      });
    }

    const row =
      result.rows[0];

    // ---------------------------------
    // STATUS CHECK
    // ---------------------------------

    if (
      row.status &&
      row.status.toLowerCase() !== 'active'
    ) {

      return res.json({

        status: false,

        reason: 'Key Disabled'
      });
    }

    // ---------------------------------
    // EXPIRY CHECK
    // ---------------------------------

    const expire =
      new Date(
        row.expires_at
      ).getTime();

    if (
      Date.now() > expire
    ) {

      return res.json({

        status: false,

        reason: 'Key Expired'
      });
    }

    // ---------------------------------
    // MULTI DEVICE SYSTEM
    // ---------------------------------

    let hwids =
      row.hwids || [];

    if (
      typeof hwids === 'string'
    ) {

      try {

        hwids =
          JSON.parse(hwids);

      } catch {

        hwids = [];
      }
    }

    if (
      !Array.isArray(hwids)
    ) {

      hwids = [];
    }

    const maxDevices =
      parseInt(
        row.max_devices || 1
      );

    console.log(
      "MAX DEVICES:",
      maxDevices
    );

    console.log(
      "CURRENT DEVICES:",
      hwids.length
    );

    // ---------------------------------
    // DEVICE EXISTS
    // ---------------------------------

    if (
      hwids.includes(hwid)
    ) {

      console.log(
        "KNOWN DEVICE"
      );

    } else {

      // ---------------------------------
      // DEVICE LIMIT
      // ---------------------------------

      if (
        hwids.length >= maxDevices
      ) {

        return res.json({

          status: false,

          reason:
            'Device Limit Reached'
        });
      }

      // ---------------------------------
      // ADD DEVICE
      // ---------------------------------

      hwids.push(hwid);

      await pool.query(

        'UPDATE keys SET hwids=$1 WHERE license_key=$2',

        [
          JSON.stringify(hwids),
          key
        ]
      );

      console.log(
        "NEW DEVICE ADDED"
      );
    }

    // ---------------------------------
    // SAVE USER LOGIN
    // ---------------------------------

    const ip =
      req.headers['x-forwarded-for'] ||
      req.socket?.remoteAddress ||
      'unknown';

    try {

      await pool.query(

        'INSERT INTO users (license_key, hwid, ip_address) VALUES ($1, $2, $3)',

        [
          key,
          hwid,
          ip
        ]
      );

      console.log(
        "USER SAVED"
      );

    } catch (e) {

      console.log(
        "USER SAVE ERROR:",
        e.message
      );
    }

    // ---------------------------------
    // TOKEN
    // ---------------------------------

    const token =
      crypto
      .createHash('md5')
      .update(key + hwid)
      .digest('hex');

    // ---------------------------------
    // FORMAT EXP DATE
    // ---------------------------------

    let expString = '';

    try {

      expString =
        new Date(row.expires_at)
        .toLocaleString(
          'en-IN',
          {
            timeZone:
              'Asia/Kolkata'
          }
        );

    } catch {

      expString =
        String(
          row.expires_at
        );
    }

    console.log(
      "LOGIN SUCCESS"
    );

    // ---------------------------------
    // SUCCESS RESPONSE
    // ---------------------------------

    return res.json({

      status: true,

      data: {

        token,

        rng:
          Math.floor(
            Date.now() / 1000
          ),

        EXP:
          expString,

        expiry:
          expString,

        key:
          key,

        devices_used:
          hwids.length,

        max_devices:
          maxDevices
      }
    });

  } catch (e) {

    console.log(
      "SERVER ERROR:",
      e
    );

    return res.json({

      status: false,

      reason:
        e.message ||
        'Unknown Error'
    });
  }
};
