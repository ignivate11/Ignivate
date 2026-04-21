'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useSession, signOut } from 'next-auth/react'

interface Launch {
  id: string
  productName: string
  creatorName: string
  creatorDescription: string
  productDescription: string
  usp: string
  price: number
  images: string[]
  launchType: 'LIVE' | 'PREORDER'
}

interface PreorderProduct {
  id: string
  title: string
  description: string
  price: number
  preorderPrice: number | null
  fundingGoal: number | null
  currentFunding: number | null
  launchDate: Date | null
  estimatedCompletion: Date | null
  images: string[]
  founderName: string | null
  usp: string | null
  creator: { name: string }
}

interface ReadyProduct {
  id: string
  title: string
  description: string
  price: number
  images: string[]
  category: string
  usp: string | null
  founderName: string | null
  creator: { name: string }
}

/* ─── ALL CSS FROM THE LANDING PAGE ─────────────────────────────────────── */
const css = `
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=Space+Mono:wght@400;700&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --orange-500:#E8651A;--orange-400:#F07B2E;--orange-300:#F59542;
  --orange-600:#D4520F;--amber:#F5B731;
  --black:#0A0A0A;--dark:#111111;--dark-card:#1A1A1A;
  --dark-border:#2A2A2A;--dark-elevated:#222222;
  --gray-100:#F5F5F5;--gray-300:#BBBBBB;--gray-500:#777777;
  --white:#FFFFFF;
  --green-muted:#4ADE80;--green-bg:rgba(74,222,128,.08);
  --font-display:'Outfit',sans-serif;--font-mono:'Space Mono',monospace;
  --section-gap:clamp(48px,6vw,80px);
}
html{scroll-behavior:smooth}
body{font-family:var(--font-display);background:var(--black);color:var(--gray-100);line-height:1.6;overflow-x:hidden;-webkit-font-smoothing:antialiased}
a{color:inherit;text-decoration:none}img{max-width:100%;display:block}
.container{width:100%;max-width:1120px;margin:0 auto;padding:0 24px}
.section{padding:var(--section-gap) 0}
.section-label{font-family:var(--font-mono);font-size:12px;letter-spacing:3px;text-transform:uppercase;color:var(--orange-400);margin-bottom:16px;display:block}
.section-heading{font-size:clamp(32px,5vw,56px);font-weight:800;line-height:1.1;letter-spacing:-1.5px;margin-bottom:24px}
.section-sub{font-size:clamp(16px,2vw,20px);color:var(--gray-300);max-width:580px;font-weight:300;line-height:1.7}
.btn{display:inline-flex;align-items:center;gap:8px;padding:14px 32px;border-radius:60px;font-family:var(--font-display);font-weight:600;font-size:15px;cursor:pointer;border:none;transition:all .3s ease;text-decoration:none}
.btn-primary{background:linear-gradient(135deg,var(--orange-500),var(--orange-400));color:var(--white);box-shadow:0 4px 24px rgba(232,101,26,.35)}
.btn-primary:hover{transform:translateY(-2px);box-shadow:0 8px 32px rgba(232,101,26,.5)}
.btn-secondary{background:transparent;border:1.5px solid var(--dark-border);color:var(--gray-100)}
.btn-secondary:hover{border-color:var(--orange-400);color:var(--orange-300)}
.btn-green{background:rgba(74,222,128,.12);border:1.5px solid rgba(74,222,128,.25);color:var(--green-muted)}
.btn-green:hover{background:rgba(74,222,128,.18);border-color:rgba(74,222,128,.4);transform:translateY(-2px)}
.btn-small{padding:10px 24px;font-size:13px}
.btn-xs{padding:8px 18px;font-size:12px;border-radius:40px}
.nav{position:fixed;top:0;left:0;right:0;z-index:100;padding:14px 0;background:rgba(10,10,10,.85);backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px);border-bottom:1px solid rgba(255,255,255,.04)}
.nav-inner{display:flex;align-items:center;justify-content:space-between}
.nav-logo{display:flex;align-items:center;gap:10px}
.nav-logo span{font-weight:700;font-size:20px;letter-spacing:-0.5px}
.nav-links{display:flex;align-items:center;gap:24px}
.nav-links a{font-size:14px;color:var(--gray-300);font-weight:400;transition:color .2s}
.nav-links a:hover{color:var(--orange-300)}
.nav-ctas{display:flex;gap:10px;align-items:center}
.nav-ctas .btn{padding:9px 20px;font-size:13px}
.nav-mobile-toggle{display:none;background:none;border:none;cursor:pointer;padding:8px}
.nav-mobile-toggle span{display:block;width:22px;height:2px;background:var(--gray-100);margin:5px 0;border-radius:1px}
@media(max-width:860px){
  .nav-links,.nav-ctas{display:none}
  .nav-mobile-toggle{display:block}
  .nav-links.open{display:flex;flex-direction:column;position:absolute;top:100%;left:0;right:0;background:rgba(10,10,10,.97);backdrop-filter:blur(24px);padding:20px 24px;gap:20px;border-bottom:1px solid var(--dark-border)}
  .nav-links.open+.nav-ctas{display:flex;position:absolute;top:calc(100% + 160px);left:0;right:0;padding:0 24px 20px;background:rgba(10,10,10,.97);justify-content:center}
}
.hero{min-height:100vh;display:flex;align-items:center;position:relative;padding-top:100px;padding-bottom:60px;overflow:hidden}
.hero::before{content:'';position:absolute;top:-20%;right:-15%;width:700px;height:700px;background:radial-gradient(circle,rgba(232,101,26,.1),transparent 70%);pointer-events:none}
.hero::after{content:'';position:absolute;bottom:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,var(--dark-border),transparent)}
.hero-grid{display:grid;grid-template-columns:1fr 1fr;gap:48px;align-items:center;position:relative;z-index:2;width:100%}
.hero-badge{display:inline-flex;align-items:center;gap:8px;padding:6px 16px 6px 8px;border-radius:40px;background:rgba(232,101,26,.1);border:1px solid rgba(232,101,26,.2);margin-bottom:32px;font-size:13px;font-weight:500;color:var(--orange-300)}
.hero-badge .dot{width:8px;height:8px;border-radius:50%;background:var(--orange-400);animation:pulse 2s infinite}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
.hero h1{font-size:clamp(40px,6.5vw,76px);font-weight:900;line-height:1.02;letter-spacing:-3px;margin-bottom:24px;max-width:600px}
.hero h1 .gradient{background:linear-gradient(135deg,var(--orange-400),var(--amber));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.hero-sub{font-size:clamp(18px,2.5vw,24px);color:var(--gray-300);font-weight:300;margin-bottom:40px;max-width:480px}
.hero-sub .arrow{font-family:var(--font-mono);color:var(--orange-400)}
.hero-ctas{display:flex;gap:14px;flex-wrap:wrap;margin-bottom:20px}
.hero-discover{font-size:14px;color:var(--gray-500);margin-bottom:48px;display:flex;align-items:center;gap:6px}
.hero-discover a{color:var(--green-muted);text-decoration:underline;text-underline-offset:3px;transition:color .2s}
.hero-discover a:hover{color:#6ee7a0}
.hero-tagline{font-family:var(--font-mono);font-size:12px;letter-spacing:2px;text-transform:uppercase;color:var(--gray-500)}
.hero-anim{position:relative;width:100%;max-width:420px;justify-self:end;display:flex;align-items:center;justify-content:center;min-height:480px}
.hero-anim-inner{position:relative;width:320px;height:420px}
.anim-bulb{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);animation:floatUp 4s ease-in-out infinite}
@keyframes floatUp{0%,100%{transform:translate(-50%,-50%) translateY(0)}50%{transform:translate(-50%,-50%) translateY(-18px)}}
.anim-bulb svg{filter:drop-shadow(0 8px 32px rgba(232,101,26,.3))}
.orbit-ring{position:absolute;top:50%;left:50%;width:300px;height:300px;margin:-150px 0 0 -150px;border:1px dashed rgba(232,101,26,.12);border-radius:50%;animation:orbitSpin 20s linear infinite}
@keyframes orbitSpin{to{transform:rotate(360deg)}}
.orbit-dot{position:absolute;width:40px;height:40px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:18px;background:var(--dark-card);border:1px solid var(--dark-border);box-shadow:0 4px 16px rgba(0,0,0,.3)}
.orbit-dot:nth-child(1){top:-20px;left:50%;margin-left:-20px}
.orbit-dot:nth-child(2){bottom:-20px;left:50%;margin-left:-20px}
.orbit-dot:nth-child(3){top:50%;left:-20px;margin-top:-20px}
.orbit-dot:nth-child(4){top:50%;right:-20px;margin-top:-20px}
.orbit-dot>span{animation:orbitCounter 20s linear infinite}
@keyframes orbitCounter{to{transform:rotate(-360deg)}}
.particles{position:absolute;inset:0;pointer-events:none;overflow:hidden}
.particle{position:absolute;bottom:0;width:4px;height:4px;border-radius:50%;background:var(--orange-400);opacity:0;animation:rise 3s ease-in infinite}
.particle:nth-child(1){left:30%;animation-delay:0s;animation-duration:3.2s}
.particle:nth-child(2){left:50%;animation-delay:.8s;animation-duration:2.8s}
.particle:nth-child(3){left:70%;animation-delay:1.6s;animation-duration:3.5s}
.particle:nth-child(4){left:40%;animation-delay:2.2s;animation-duration:2.6s}
.particle:nth-child(5){left:60%;animation-delay:.4s;animation-duration:3.1s}
.particle:nth-child(6){left:45%;animation-delay:1.2s;animation-duration:2.9s}
@keyframes rise{0%{opacity:0;transform:translateY(0) scale(1)}20%{opacity:.8}80%{opacity:.3}100%{opacity:0;transform:translateY(-400px) scale(0)}}
.anim-tagline{position:absolute;bottom:0;left:50%;transform:translateX(-50%);white-space:nowrap;font-family:var(--font-mono);font-size:11px;letter-spacing:2px;text-transform:uppercase;color:var(--gray-500);opacity:.7}
.anim-glow{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:120%;height:120%;background:radial-gradient(ellipse,rgba(232,101,26,.08),transparent 60%);pointer-events:none;animation:glowP 4s ease-in-out infinite}
@keyframes glowP{0%,100%{opacity:.7}50%{opacity:1}}
@media(max-width:900px){
  .hero-anim{justify-self:center;max-width:300px;min-height:380px}
  .hero-anim-inner{width:260px;height:340px}
  .orbit-ring{width:240px;height:240px;margin:-120px 0 0 -120px}
  .hero-grid{grid-template-columns:1fr;text-align:center}
  .hero-ctas{justify-content:center}
  .hero-discover{justify-content:center}
}
.cta-strip{padding:28px 0;text-align:center;position:relative;border-top:1px solid var(--dark-border);border-bottom:1px solid var(--dark-border)}
.cta-strip .inner{display:flex;align-items:center;justify-content:center;gap:16px;flex-wrap:wrap}
.cta-strip p{font-size:15px;color:var(--gray-500);font-weight:400}
.cta-strip p strong{color:var(--gray-300);font-weight:600}
.cta-strip.buyer p strong{color:var(--green-muted)}
.pain-card,.usp-item,.step,.trust-card{background:var(--dark-card);border:1px solid var(--dark-border);border-radius:16px;padding:32px;transition:all .3s;position:relative;overflow:hidden}
.pain-card:hover,.usp-item:hover,.step:hover,.trust-card:hover{border-color:rgba(232,101,26,.25);transform:translateY(-3px)}
.pain-card::before,.step::after{content:'';position:absolute;height:3px;background:linear-gradient(90deg,var(--orange-500),var(--amber));opacity:0;transition:opacity .3s;left:0;right:0}
.pain-card::before{top:0}.step::after{bottom:0}
.pain-card:hover::before,.step:hover::after{opacity:1}
.pain-icon{width:48px;height:48px;border-radius:12px;background:rgba(232,101,26,.1);display:flex;align-items:center;justify-content:center;margin-bottom:20px;font-size:22px}
.pain-card h3,.trust-card h3{font-size:18px;font-weight:700;margin-bottom:8px}
.pain-card p,.trust-card p{font-size:14px;color:var(--gray-500);line-height:1.6}
.buyer-card{border-color:rgba(74,222,128,.1)}
.buyer-card:hover{border-color:rgba(74,222,128,.25)}
.buyer-card::before{background:linear-gradient(90deg,rgba(74,222,128,.6),var(--green-muted)) !important}
.buyer-icon{background:var(--green-bg) !important}
.grid-3{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:20px;margin-top:32px}
.grid-4{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:24px;margin-top:36px;counter-reset:step}
.what-list{margin-top:48px;display:flex;flex-direction:column}
.what-item{display:flex;align-items:center;gap:20px;padding:28px 0;border-bottom:1px solid var(--dark-border);transition:all .3s;cursor:default}
.what-item:first-child{border-top:1px solid var(--dark-border)}
.what-item:hover{padding-left:16px}
.what-item:hover .what-num{color:var(--amber)}
.what-num{font-family:var(--font-mono);font-size:13px;color:var(--orange-400);min-width:40px;transition:color .3s}
.what-item h3{font-size:clamp(18px,2.5vw,24px);font-weight:600;letter-spacing:-0.5px}
.launches-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:24px;margin-top:32px}
.coming-soon-card{background:var(--dark-card);border:1px solid var(--dark-border);border-radius:20px;min-height:380px;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:40px;position:relative;overflow:hidden;transition:all .4s}
.coming-soon-card::before{content:'';position:absolute;inset:0;background:radial-gradient(ellipse at bottom,rgba(232,101,26,.04),transparent 70%);pointer-events:none}
.cs-pulse{width:10px;height:10px;border-radius:50%;background:var(--orange-400);margin-bottom:16px;position:relative;animation:csPulse 2s ease infinite}
@keyframes csPulse{0%,100%{box-shadow:0 0 0 0 rgba(232,101,26,.5)}50%{box-shadow:0 0 0 14px rgba(232,101,26,0)}}
.coming-soon-card .cs-icon{font-size:44px;margin-bottom:20px;opacity:.7;position:relative}
.coming-soon-card h3{font-size:20px;font-weight:700;margin-bottom:8px;position:relative;background:linear-gradient(135deg,var(--orange-400),var(--amber));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.coming-soon-card p{font-size:14px;color:var(--gray-500);position:relative;line-height:1.7}
.step{border-radius:20px;counter-increment:step;padding:36px 28px}
.step::before{content:counter(step,decimal-leading-zero);font-family:var(--font-mono);font-size:52px;font-weight:700;color:rgba(232,101,26,.1);line-height:1;display:block;margin-bottom:16px}
.step h3{font-size:18px;font-weight:700;margin-bottom:8px}
.step p{font-size:14px;color:var(--gray-500);line-height:1.6}
.step-green::before{color:rgba(74,222,128,.1) !important}
.step-green::after{background:linear-gradient(90deg,rgba(74,222,128,.6),var(--green-muted)) !important}
.usp-icon{font-size:28px;margin-bottom:16px;display:block}
.usp-item h3{font-size:17px;font-weight:700;margin-bottom:8px}
.usp-item p{font-size:14px;color:var(--gray-500);line-height:1.6}
.usp-item{padding:28px;border-radius:16px}
.cta-section{text-align:center;padding:var(--section-gap) 0}
.cta-section .section-heading{margin-left:auto;margin-right:auto}
.cta-section .section-sub{margin-left:auto;margin-right:auto;margin-bottom:40px}
.cta-box{background:linear-gradient(135deg,rgba(232,101,26,.08),rgba(245,183,49,.04));border:1px solid rgba(232,101,26,.15);border-radius:28px;padding:clamp(48px,8vw,80px) clamp(24px,5vw,60px);text-align:center;position:relative;overflow:hidden}
.cta-box::before{content:'';position:absolute;top:-50%;left:-50%;width:200%;height:200%;background:radial-gradient(circle at 50% 80%,rgba(232,101,26,.06),transparent 50%);pointer-events:none}
.cta-box>*{position:relative;z-index:2}
.cta-box-green{background:linear-gradient(135deg,rgba(74,222,128,.06),rgba(74,222,128,.02));border-color:rgba(74,222,128,.12)}
.cta-box-green::before{background:radial-gradient(circle at 50% 80%,rgba(74,222,128,.05),transparent 50%)}
.audience-divider{padding:16px 0;text-align:center;display:flex;align-items:center;gap:16px;margin:0 auto;max-width:400px}
.audience-divider::before,.audience-divider::after{content:'';flex:1;height:1px;background:var(--dark-border)}
.audience-divider span{font-family:var(--font-mono);font-size:11px;letter-spacing:2px;text-transform:uppercase;color:var(--gray-500);white-space:nowrap}
.trust-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:20px;margin-top:32px}
.trust-card{padding:28px}
.trust-card .trust-icon{font-size:28px;margin-bottom:16px}
.apply-section{padding:var(--section-gap) 0}
.apply-layout{display:grid;grid-template-columns:1fr 1.1fr;gap:64px;align-items:start;margin-top:32px}
@media(max-width:900px){.apply-layout{grid-template-columns:1fr;gap:40px}}
.apply-info h3{font-size:24px;font-weight:700;margin-bottom:16px}
.apply-info p{font-size:15px;color:var(--gray-500);line-height:1.7;margin-bottom:28px}
.apply-perks{list-style:none;display:flex;flex-direction:column;gap:16px}
.apply-perks li{display:flex;align-items:flex-start;gap:12px;font-size:15px;color:var(--gray-300)}
.apply-perks .perk-icon{width:36px;height:36px;min-width:36px;border-radius:10px;background:rgba(232,101,26,.1);display:flex;align-items:center;justify-content:center;font-size:17px}
.form-card{background:var(--dark-card);border:1px solid var(--dark-border);border-radius:24px;overflow:hidden}
.gform-iframe-wrap iframe{width:100%;border:none;background:var(--dark-card);display:block;transition:height .3s ease}
.legal-zone{padding:0 0 20px;border-top:1px solid var(--dark-border)}
.legal-zone-header{text-align:center;padding:var(--section-gap) 0 48px}
.legal-zone-header .shield{width:56px;height:56px;border-radius:16px;background:rgba(232,101,26,.08);border:1px solid rgba(232,101,26,.12);display:flex;align-items:center;justify-content:center;margin:0 auto 20px;font-size:26px}
.legal-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(480px,1fr));gap:24px}
@media(max-width:540px){.legal-grid{grid-template-columns:1fr}}
.legal-card{background:var(--dark-card);border:1px solid var(--dark-border);border-radius:20px;padding:32px;transition:border-color .3s}
.legal-card:hover{border-color:rgba(255,255,255,.06)}
.legal-card-header{display:flex;align-items:center;gap:12px;margin-bottom:20px}
.legal-card-icon{width:40px;height:40px;min-width:40px;border-radius:10px;background:rgba(232,101,26,.08);display:flex;align-items:center;justify-content:center;font-size:18px}
.legal-card-header h3{font-size:18px;font-weight:700;letter-spacing:-0.3px}
.legal-card p{font-size:14px;color:var(--gray-300);line-height:1.7;margin-bottom:12px}
.legal-card p.muted{color:var(--gray-500)}
.legal-list{list-style:none;display:flex;flex-direction:column;gap:8px;margin-bottom:16px}
.legal-list li{font-size:14px;color:var(--gray-500);line-height:1.6;padding-left:20px;position:relative}
.legal-list li::before{content:'';position:absolute;left:0;top:9px;width:6px;height:6px;border-radius:50%;background:var(--orange-500);opacity:.4}
.legal-list.check li::before{background:var(--green-muted);opacity:.5}
.legal-list.cross li::before{background:#f87171;opacity:.5}
.legal-note{margin-top:16px;padding:16px;border-radius:12px;background:rgba(232,101,26,.04);border:1px solid rgba(232,101,26,.08);font-size:13px;color:var(--gray-300);line-height:1.7}
.legal-note strong{color:var(--gray-100);font-weight:600}
.legal-card.full{grid-column:1/-1}
.contact-section{padding:var(--section-gap) 0}
.contact-grid{display:grid;grid-template-columns:1fr 1fr;gap:48px;margin-top:48px;align-items:start}
@media(max-width:700px){.contact-grid{grid-template-columns:1fr;gap:32px}}
.contact-channels{display:flex;flex-direction:column;gap:16px}
.contact-channel{display:flex;align-items:center;gap:14px;padding:18px 20px;border-radius:14px;background:var(--dark-card);border:1px solid var(--dark-border);transition:all .3s}
.contact-channel:hover{border-color:rgba(232,101,26,.2);transform:translateX(4px)}
.contact-channel .ch-icon{width:44px;height:44px;min-width:44px;border-radius:12px;background:rgba(232,101,26,.08);display:flex;align-items:center;justify-content:center;font-size:20px}
.contact-channel .ch-label{font-size:12px;color:var(--gray-500);font-weight:600;letter-spacing:0.5px;text-transform:uppercase}
.contact-channel .ch-value{font-size:15px;font-weight:600;color:var(--gray-100);margin-top:2px}
.contact-response{margin-top:24px;padding:16px 20px;border-radius:12px;background:rgba(74,222,128,.05);border:1px solid rgba(74,222,128,.1);font-size:13px;color:var(--green-muted);display:flex;align-items:center;gap:8px}
.final-legal{padding:48px 0;border-top:1px solid var(--dark-border)}
.final-legal-inner{background:var(--dark-card);border:1px solid var(--dark-border);border-radius:20px;padding:36px;text-align:center;max-width:720px;margin:0 auto}
.final-legal-inner h3{font-size:18px;font-weight:700;margin-bottom:16px;display:flex;align-items:center;justify-content:center;gap:8px}
.final-legal-inner .terms-list{list-style:none;display:flex;flex-direction:column;gap:8px;margin-bottom:16px;text-align:left;max-width:420px;margin-left:auto;margin-right:auto}
.final-legal-inner .terms-list li{font-size:14px;color:var(--gray-300);line-height:1.6;padding-left:24px;position:relative}
.final-legal-inner .terms-list li::before{content:'';position:absolute;left:0;top:8px;width:8px;height:8px;border-radius:2px;background:var(--orange-400);opacity:.3}
.final-legal-inner p.note{font-size:12px;color:var(--gray-500);margin-top:16px;line-height:1.6}
.footer{padding:60px 0 40px;border-top:1px solid var(--dark-border)}
.footer-inner{display:flex;align-items:flex-start;justify-content:space-between;flex-wrap:wrap;gap:40px}
.footer-brand p{font-size:14px;color:var(--gray-500);margin-top:8px;max-width:280px}
.footer-links{display:flex;gap:48px}
.footer-col h4{font-size:13px;font-weight:700;margin-bottom:12px;color:var(--gray-300)}
.footer-col a{display:block;font-size:13px;color:var(--gray-500);margin-bottom:8px;transition:color .2s}
.footer-col a:hover{color:var(--orange-300)}
.footer-bottom{margin-top:48px;padding-top:24px;border-top:1px solid var(--dark-border);display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px}
.footer-bottom p{font-size:12px;color:var(--gray-500)}
.fade-up{opacity:0;transform:translateY(30px);transition:all .7s cubic-bezier(.16,1,.3,1)}
.fade-up.visible{opacity:1;transform:translateY(0)}
.s1{transition-delay:.1s}.s2{transition-delay:.2s}.s3{transition-delay:.3s}.s4{transition-delay:.4s}
@media(max-width:640px){
  .hero h1{letter-spacing:-1.5px}
  .hero-ctas{flex-direction:column}.hero-ctas .btn{width:100%;justify-content:center}
  .footer-inner{flex-direction:column}.footer-links{flex-direction:column;gap:24px}
  .launches-grid{grid-template-columns:1fr}
}
.launch-card{background:var(--dark-card);border:1px solid var(--dark-border);border-radius:20px;overflow:hidden;transition:all .4s;display:flex;flex-direction:column}
.launch-card:hover{border-color:rgba(232,101,26,.25);transform:translateY(-4px);box-shadow:0 16px 48px rgba(232,101,26,.08)}
.preorder-card{background:var(--dark-card);border:1px solid rgba(245,183,49,.15);border-radius:20px;overflow:hidden;transition:all .4s;display:flex;flex-direction:column}
.preorder-card:hover{border-color:rgba(245,183,49,.35);transform:translateY(-4px);box-shadow:0 16px 48px rgba(245,183,49,.08)}
.funding-bar-wrap{height:8px;background:rgba(255,255,255,.06);border-radius:99px;overflow:hidden;margin:8px 0 4px}
.funding-bar-fill{height:100%;border-radius:99px;background:linear-gradient(90deg,var(--orange-600),var(--amber))}
.launch-img-wrap{position:relative;width:100%;padding-top:56.25%;overflow:hidden;background:#111}
.launch-img-dots{position:absolute;bottom:10px;left:50%;transform:translateX(-50%);display:flex;gap:5px;z-index:3}
.launch-img-dot{width:6px;height:6px;border-radius:50%;background:rgba(255,255,255,.3);cursor:pointer;transition:background .2s;border:none}
.launch-img-dot.active{background:var(--orange-400)}
.launch-img-nav{position:absolute;top:50%;transform:translateY(-50%);z-index:3;background:rgba(0,0,0,.5);border:none;color:white;width:32px;height:32px;border-radius:50%;cursor:pointer;display:flex;align-items:center;justify-content:center;opacity:0;transition:opacity .2s;font-size:14px}
.launch-card:hover .launch-img-nav{opacity:1}
.launch-img-nav.prev{left:10px}
.launch-img-nav.next{right:10px}
.launch-badge{display:inline-flex;align-items:center;gap:5px;padding:4px 10px;border-radius:30px;font-family:var(--font-mono);font-size:11px;font-weight:700;letter-spacing:1px}
.launch-badge-live{background:rgba(232,101,26,.15);border:1px solid rgba(232,101,26,.25);color:var(--orange-400)}
.launch-badge-preorder{background:rgba(245,183,49,.12);border:1px solid rgba(245,183,49,.2);color:var(--amber)}
.launch-badge-live::before{content:'';display:inline-block;width:6px;height:6px;border-radius:50%;background:var(--orange-400);animation:csPulse 2s ease infinite}
.launch-body{padding:22px;flex:1;display:flex;flex-direction:column;gap:10px}
.launch-title{font-size:18px;font-weight:700;letter-spacing:-0.3px;color:var(--white)}
.launch-creator{font-size:13px;color:var(--gray-500)}
.launch-usp{font-size:13px;color:var(--gray-300);line-height:1.6;flex:1}
.launch-footer{display:flex;align-items:center;justify-content:space-between;margin-top:auto;padding-top:14px;border-top:1px solid var(--dark-border)}
.launch-price{font-size:20px;font-weight:800;color:var(--white)}
.launch-price span{font-size:12px;font-weight:400;color:var(--gray-500);margin-left:2px}
`

/* ─── LAUNCH CARD COMPONENT ─────────────────────────────────────────────── */
function LaunchCard({ launch }: { launch: Launch }) {
  const [imgIdx, setImgIdx] = useState(0)
  const imgs = launch.images

  return (
    <div className="launch-card fade-up">
      <div className="launch-img-wrap">
        {imgs.map((src, i) => (
          <Image
            key={i}
            src={src}
            alt={`${launch.productName} ${i + 1}`}
            fill
            className="object-cover"
            style={{ opacity: i === imgIdx ? 1 : 0, transition: 'opacity 0.4s', position: 'absolute', inset: 0 }}
          />
        ))}
        {imgs.length > 1 && (
          <>
            <button className="launch-img-nav prev" onClick={() => setImgIdx(i => (i - 1 + imgs.length) % imgs.length)}>‹</button>
            <button className="launch-img-nav next" onClick={() => setImgIdx(i => (i + 1) % imgs.length)}>›</button>
            <div className="launch-img-dots">
              {imgs.map((_, i) => (
                <button key={i} className={`launch-img-dot${i === imgIdx ? ' active' : ''}`} onClick={() => setImgIdx(i)} />
              ))}
            </div>
          </>
        )}
      </div>
      <div className="launch-body">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span className={`launch-badge ${launch.launchType === 'LIVE' ? 'launch-badge-live' : 'launch-badge-preorder'}`}>
            {launch.launchType === 'LIVE' ? 'LIVE' : 'PRE-ORDER'}
          </span>
        </div>
        <h3 className="launch-title">{launch.productName}</h3>
        <p className="launch-creator">by {launch.creatorName}</p>
        <p className="launch-usp">{launch.usp}</p>
        <div className="launch-footer">
          <div className="launch-price">
            ₹{launch.price.toLocaleString('en-IN')}<span>INR</span>
          </div>
          <Link href="/products" className="btn btn-primary" style={{ padding: '10px 20px', fontSize: '13px', borderRadius: '40px' }}>
            {launch.launchType === 'LIVE' ? 'Buy Now' : 'Pre-order'} →
          </Link>
        </div>
      </div>
    </div>
  )
}

/* ─── LOGO SVG ───────────────────────────────────────────────────────────── */
function LogoSVG({ size = 38 }: { size?: number }) {
  return (
    <Image
      src="/ignivate-logo.png"
      alt="Ignivate"
      width={size}
      height={size}
      style={{ objectFit: 'contain' }}
    />
  )
}

/* ─── ARROW ICON ─────────────────────────────────────────────────────────── */
const Arrow = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

/* ─── HOME CLIENT ────────────────────────────────────────────────────────── */
export default function HomeClient({ launches, readyProducts = [], preorderProducts = [] }: { launches: Launch[]; readyProducts?: ReadyProduct[]; preorderProducts?: PreorderProduct[] }) {
  const { data: session } = useSession()

  // Determine dashboard link based on role
  const getDashboardHref = () => {
    if (!session) return null
    if (session.user.role === 'ADMIN') return { href: '/admin', label: 'Admin Dashboard' }
    if (session.user.role === 'CREATOR') return { href: '/creator', label: 'Dashboard' }
    return { href: '/orders', label: 'My Orders' }
  }
  const dashLink = getDashboardHref()

  useEffect(() => {
    // Scroll-reveal animations
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible') }),
      { threshold: 0.08, rootMargin: '0px 0px -30px 0px' }
    )
    document.querySelectorAll('.fade-up').forEach(el => obs.observe(el))

    // Google Form iframe auto-resize
    const f = document.getElementById('gformFrame') as HTMLIFrameElement | null
    const msgHandler = (e: MessageEvent) => {
      if (!e.origin || !e.origin.includes('google.com')) return
      const d = e.data
      let h = 0
      if (typeof d === 'object' && d !== null) h = d.height || d.frameHeight || parseInt((d.style || '').replace(/[^0-9]/g, '')) || 0
      if (typeof d === 'number') h = d
      if (typeof d === 'string') { const m = d.match(/([0-9]+)/); if (m) h = parseInt(m[1]) }
      if (h > 200 && f) f.style.height = h + 'px'
    }
    window.addEventListener('message', msgHandler)

    // Mobile nav toggle
    const toggle = document.getElementById('navToggle')
    const navLinks = document.getElementById('navLinks')
    const handleToggle = () => navLinks?.classList.toggle('open')
    toggle?.addEventListener('click', handleToggle)

    // Smooth anchor scrolling
    const anchors = document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]')
    const handleAnchor = (e: Event) => {
      e.preventDefault()
      const link = e.currentTarget as HTMLAnchorElement
      const href = link.getAttribute('href')
      if (!href) return
      const target = document.querySelector(href)
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' })
      navLinks?.classList.remove('open')
    }
    anchors.forEach(l => l.addEventListener('click', handleAnchor))

    return () => {
      obs.disconnect()
      window.removeEventListener('message', msgHandler)
      toggle?.removeEventListener('click', handleToggle)
      anchors.forEach(l => l.removeEventListener('click', handleAnchor))
    }
  }, [])

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: css }} />

      {/* ── NAV ──────────────────────────────────────────────────────────── */}
      <nav className="nav">
        <div className="container nav-inner">
          <Link href="/" className="nav-logo">
            <LogoSVG size={38} />
            <span>Ignivate</span>
          </Link>

          <div className="nav-links" id="navLinks">
            <a href="#launches">Launches</a>
            <a href="#how-creators">For Creators</a>
            <a href="#how-buyers">For Buyers</a>
            <a href="#legal">Trust</a>
            <a href="#apply">Apply</a>
            {dashLink && (
              <Link href={dashLink.href} style={{ color: 'var(--orange-400)' }}>
                {dashLink.label}
              </Link>
            )}
          </div>

          <div className="nav-ctas">
            {session ? (
              <>
                {dashLink && (
                  <Link href={dashLink.href} className="btn btn-secondary btn-small">
                    {dashLink.label}
                  </Link>
                )}
                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="btn btn-primary btn-small"
                  style={{ cursor: 'pointer' }}
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="btn btn-secondary btn-small">Login</Link>
                <Link href="/signup" className="btn btn-primary btn-small">Sign Up</Link>
              </>
            )}
          </div>

          <button className="nav-mobile-toggle" id="navToggle" aria-label="Menu">
            <span /><span /><span />
          </button>
        </div>
      </nav>

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="hero" id="hero">
        <div className="container">
          <div className="hero-grid">
            <div>
              <div className="hero-badge fade-up">
                <span className="dot" />
                Now onboarding creators across India
              </div>
              <h1 className="fade-up s1">
                We launch what<br />you <span className="gradient">build.</span>
              </h1>
              <p className="hero-sub fade-up s2">
                From idea <span className="arrow">→</span> first customers.
              </p>
              <div className="hero-ctas fade-up s3">
                <a href="#apply" className="btn btn-primary">
                  Apply to launch <Arrow />
                </a>
                <Link href="/products" className="btn btn-secondary">Explore launches</Link>
              </div>
              <p className="hero-discover fade-up s3">
                <Link href="/products">Discover and support new products →</Link>
              </p>
              <p className="hero-tagline fade-up s4">Launching new ideas across India</p>
            </div>

            <div className="hero-anim fade-up s2">
              <div className="anim-glow" />
              <div className="hero-anim-inner">
                <div className="orbit-ring">
                  <div className="orbit-dot"><span>💡</span></div>
                  <div className="orbit-dot"><span>🚀</span></div>
                  <div className="orbit-dot"><span>🎯</span></div>
                  <div className="orbit-dot"><span>🤝</span></div>
                </div>
                <div className="anim-bulb">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 280" fill="none" width="180" height="220">
                    <defs>
                      <linearGradient id="hfg1" x1="110" y1="135" x2="110" y2="210" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stopColor="#E8651A" />
                        <stop offset="50%" stopColor="#F5B731" />
                        <stop offset="100%" stopColor="#FFFBE6" />
                      </linearGradient>
                      <linearGradient id="hfg2" x1="110" y1="150" x2="110" y2="195" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stopColor="#FFFBE6" />
                        <stop offset="100%" stopColor="#F5B731" />
                      </linearGradient>
                      <mask id="hbm">
                        <rect width="240" height="280" fill="white" />
                        <path d="M110 30 C110 30 88 56 88 94 L88 132 L96 146 L110 152 L124 146 L132 132 L132 94 C132 56 110 30 110 30Z" fill="black" />
                        <circle cx="110" cy="72" r="14" fill="white" />
                        <path d="M88 108 L66 126 L66 150 L88 136Z" fill="black" />
                        <path d="M132 108 L154 126 L154 150 L132 136Z" fill="black" />
                      </mask>
                    </defs>
                    <path d="M110 10 C58 10 20 50 20 98 C20 128 36 156 62 170 L62 200 C62 206 68 210 76 210 L144 210 C152 210 158 206 158 200 L158 170 C184 156 200 128 200 98 C200 50 162 10 110 10Z" fill="white" mask="url(#hbm)" />
                    <path d="M80 210 L80 228 C80 236 92 244 110 244 C128 244 140 236 140 228 L140 210" fill="white" />
                    <line x1="80" y1="218" x2="140" y2="218" stroke="rgba(0,0,0,0.1)" strokeWidth="2.5" />
                    <line x1="80" y1="228" x2="140" y2="228" stroke="rgba(0,0,0,0.1)" strokeWidth="2.5" />
                    <path d="M96 148 C96 148 88 170 82 184 C90 198 100 210 110 220 C120 210 130 198 138 184 C132 170 124 148 124 148 L110 160Z" fill="url(#hfg1)" />
                    <path d="M102 150 C102 150 97 168 93 178 C98 188 104 196 110 202 C116 196 122 188 127 178 C123 168 118 150 118 150 L110 158Z" fill="url(#hfg2)" />
                    <path d="M176 192 L181 178 L186 192 L181 206Z" fill="#F5B731" />
                    <path d="M176 192 L162 186 L176 180 L190 186Z" fill="#F5B731" />
                    <path d="M196 218 L199 208 L202 218 L199 228Z" fill="#F5B731" opacity="0.7" />
                    <path d="M196 218 L186 214 L196 210 L206 214Z" fill="#F5B731" opacity="0.7" />
                  </svg>
                </div>
                <div className="particles">
                  <div className="particle" /><div className="particle" /><div className="particle" />
                  <div className="particle" /><div className="particle" /><div className="particle" />
                </div>
                <div className="anim-tagline">idea → launch → customers</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── WHY NOW ──────────────────────────────────────────────────────── */}
      <section className="section" id="why-now">
        <div className="container">
          <span className="section-label fade-up">The problem</span>
          <h2 className="section-heading fade-up">Why now.</h2>
          <p className="section-sub fade-up">Creators build incredible products every day. Most never get their first customer.</p>
          <div className="grid-3">
            <div className="pain-card fade-up s1"><div className="pain-icon">👁️</div><h3>No visibility</h3><p>Great products die in silence. Without eyeballs, nothing moves.</p></div>
            <div className="pain-card fade-up s2"><div className="pain-icon">📡</div><h3>No distribution</h3><p>Building is the easy part. Getting it in front of the right people? That&apos;s the hard part.</p></div>
            <div className="pain-card fade-up s3"><div className="pain-icon">🚀</div><h3>No launch support</h3><p>Most creators launch alone — no strategy, no audience, no momentum.</p></div>
          </div>
          <p style={{ marginTop: '48px', fontSize: 'clamp(20px,3vw,28px)', fontWeight: 700, color: 'var(--orange-300)' }} className="fade-up">
            That&apos;s where Ignivate comes in.
          </p>
        </div>
      </section>

      {/* ── WHAT WE DO ───────────────────────────────────────────────────── */}
      <section className="section" id="what">
        <div className="container">
          <span className="section-label fade-up">Our role</span>
          <h2 className="section-heading fade-up">What we do.</h2>
          <p className="section-sub fade-up">We don&apos;t just list your product. We launch it.</p>
          <div className="what-list">
            <div className="what-item fade-up s1"><span className="what-num">01</span><h3>Turn ideas into real products</h3></div>
            <div className="what-item fade-up s2"><span className="what-num">02</span><h3>Help shape your story</h3></div>
            <div className="what-item fade-up s3"><span className="what-num">03</span><h3>Launch with distribution</h3></div>
            <div className="what-item fade-up s4"><span className="what-num">04</span><h3>Help you get your first customers</h3></div>
          </div>
        </div>
      </section>

      {/* ── BUYER STRIP 1 ────────────────────────────────────────────────── */}
      <div className="cta-strip buyer">
        <div className="container"><div className="inner">
          <p><strong>Explore products launching now</strong> — discover what creators are building</p>
          <Link href="/products" className="btn btn-green btn-xs">Browse launches →</Link>
        </div></div>
      </div>

      {/* ── FOR EARLY ADOPTERS ───────────────────────────────────────────── */}
      <section className="section" id="for-adopters">
        <div className="container">
          <div className="audience-divider"><span>For early adopters</span></div>
          <div style={{ marginTop: '40px' }}>
            <span className="section-label fade-up" style={{ color: 'var(--green-muted)' }}>Discover</span>
            <h2 className="section-heading fade-up">For early adopters.</h2>
            <p className="section-sub fade-up">Discover new products before they go mainstream. Support creators early and get exclusive access.</p>
            <div className="grid-3">
              <div className="pain-card buyer-card fade-up s1"><div className="pain-icon buyer-icon">🌟</div><h3>Be the first</h3><p>Try new ideas and products before anyone else. Get early access to what&apos;s next.</p></div>
              <div className="pain-card buyer-card fade-up s2"><div className="pain-icon buyer-icon">🤝</div><h3>Support creators early</h3><p>Your pre-order directly supports the creator and helps bring their vision to life.</p></div>
              <div className="pain-card buyer-card fade-up s3"><div className="pain-icon buyer-icon">💰</div><h3>Early access pricing</h3><p>Pre-order at special early pricing before the product launches at full price.</p></div>
            </div>
            <div style={{ marginTop: '36px' }} className="fade-up">
              <Link href="/products" className="btn btn-green">Explore live launches <Arrow /></Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── LIVE LAUNCHES (dynamic from DB) ──────────────────────────────── */}
      <section className="section" id="launches">
        <div className="container">
          <span className="section-label fade-up">Marketplace</span>
          <h2 className="section-heading fade-up">Live Launches.</h2>
          <p className="section-sub fade-up">Real products from real creators. Ready to buy today.</p>

          {readyProducts.length > 0 ? (
            <>
              <div className="launches-grid" style={{ marginTop: '48px' }}>
                {readyProducts.map((p, i) => (
                  <div key={p.id} className={`launch-card fade-up s${Math.min(i + 1, 4)}`}>
                    <div style={{ position: 'relative', width: '100%', paddingTop: '56.25%', background: '#0f0f0f', overflow: 'hidden' }}>
                      {p.images[0] ? (
                        <Image src={p.images[0]} alt={p.title} fill style={{ objectFit: 'cover' }} />
                      ) : (
                        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '40px' }}>📦</div>
                      )}
                      <div style={{ position: 'absolute', top: '12px', left: '12px', background: 'rgba(74,222,128,.85)', color: '#000', fontSize: '11px', fontWeight: 700, padding: '4px 10px', borderRadius: '30px' }}>
                        ✅ LIVE
                      </div>
                    </div>
                    <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <div>
                        <p style={{ fontSize: '12px', color: 'var(--gray-500)', marginBottom: '4px' }}>{p.category} · by {p.creator.name}</p>
                        <h3 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--white)', marginBottom: '6px' }}>{p.title}</h3>
                        {p.usp && <p style={{ fontSize: '13px', color: 'var(--gray-300)', lineHeight: 1.6 }}>{p.usp}</p>}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,.06)', marginTop: 'auto' }}>
                        <span style={{ fontSize: '20px', fontWeight: 800, color: 'var(--orange-400)' }}>₹{p.price.toLocaleString('en-IN')}</span>
                        <Link href={`/products/${p.id}`} className="btn btn-primary" style={{ padding: '8px 18px', fontSize: '13px', borderRadius: '40px' }}>
                          Buy Now →
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ textAlign: 'center', marginTop: '36px' }} className="fade-up">
                <Link href="/products?type=ready" className="btn btn-secondary">
                  View all live products <Arrow />
                </Link>
              </div>
            </>
          ) : launches.length > 0 ? (
            <div className="launches-grid" style={{ marginTop: '48px' }}>
              {launches.map(l => <LaunchCard key={l.id} launch={l} />)}
            </div>
          ) : (
            <div className="launches-grid" style={{ gridTemplateColumns: '1fr', maxWidth: '600px', marginLeft: 'auto', marginRight: 'auto', marginTop: '48px' }}>
              <div className="coming-soon-card fade-up s1" style={{ minHeight: '320px' }}>
                <div className="cs-pulse" />
                <div className="cs-icon">🚀</div>
                <h3>Coming Soon..</h3>
                <p>We&apos;re preparing exciting launches from real creators.<br />Stay tuned — or <a href="#apply" style={{ color: 'var(--orange-400)', textDecoration: 'underline' }}>apply to be among the first →</a></p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── BUYER STRIP 2 ────────────────────────────────────────────────── */}
      <div className="cta-strip buyer">
        <div className="container"><div className="inner">
          <p><strong>Support a product today</strong> — every pre-order helps a creator ship</p>
          <Link href="/products" className="btn btn-green btn-xs">Pre-order now →</Link>
        </div></div>
      </div>

      {/* ── PRE-ORDER PRODUCTS (from DB) ─────────────────────────────────── */}
      {preorderProducts.length > 0 && (
        <section className="section" id="preorders">
          <div className="container">
            <span className="section-label fade-up" style={{ color: 'var(--amber)' }}>Funding Now</span>
            <h2 className="section-heading fade-up">Pre-Order Launches.</h2>
            <p className="section-sub fade-up">Back these products before they ship. Get early pricing and help bring them to life.</p>
            <div className="launches-grid" style={{ marginTop: '40px' }}>
              {preorderProducts.map((p, i) => {
                const pct = p.fundingGoal && p.fundingGoal > 0
                  ? Math.min(100, Math.round(((p.currentFunding || 0) / p.fundingGoal) * 100))
                  : 0
                const displayPrice = p.preorderPrice || p.price
                const daysLeft = p.launchDate
                  ? Math.max(0, Math.ceil((new Date(p.launchDate).getTime() - Date.now()) / 86400000))
                  : null
                return (
                  <div key={p.id} className={`preorder-card fade-up s${Math.min(i + 1, 4)}`}>
                    <div style={{ position: 'relative', width: '100%', paddingTop: '56.25%', background: '#0f0f0f', overflow: 'hidden' }}>
                      {p.images[0] ? (
                        <Image src={p.images[0]} alt={p.title} fill style={{ objectFit: 'cover' }} />
                      ) : (
                        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '40px' }}>📦</div>
                      )}
                      <div style={{ position: 'absolute', top: '12px', left: '12px', background: 'rgba(245,183,49,.9)', color: '#000', fontSize: '11px', fontWeight: 700, padding: '4px 10px', borderRadius: '30px' }}>
                        🚀 PRE-ORDER
                      </div>
                      {daysLeft !== null && (
                        <div style={{ position: 'absolute', top: '12px', right: '12px', background: 'rgba(0,0,0,.75)', color: 'var(--gray-300)', fontSize: '11px', fontWeight: 600, padding: '4px 10px', borderRadius: '30px' }}>
                          {daysLeft}d left
                        </div>
                      )}
                    </div>
                    <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <div>
                        <h3 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--white)', marginBottom: '4px' }}>{p.title}</h3>
                        <p style={{ fontSize: '12px', color: 'var(--gray-500)' }}>by {p.creator.name}</p>
                      </div>
                      {p.usp && <p style={{ fontSize: '13px', color: 'var(--gray-300)', lineHeight: 1.6, flex: 1 }}>{p.usp}</p>}
                      {p.fundingGoal && (
                        <div>
                          <div className="funding-bar-wrap">
                            <div className="funding-bar-fill" style={{ width: `${pct}%` }} />
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                            <span style={{ color: 'var(--amber)', fontWeight: 700 }}>{pct}% funded</span>
                            <span style={{ color: 'var(--gray-500)' }}>of ₹{p.fundingGoal.toLocaleString('en-IN')} goal</span>
                          </div>
                        </div>
                      )}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,.06)', marginTop: 'auto' }}>
                        <div>
                          <span style={{ fontSize: '20px', fontWeight: 800, color: 'var(--amber)' }}>₹{displayPrice.toLocaleString('en-IN')}</span>
                          {p.preorderPrice && (
                            <span style={{ fontSize: '12px', color: 'var(--gray-500)', textDecoration: 'line-through', marginLeft: '8px' }}>₹{p.price.toLocaleString('en-IN')}</span>
                          )}
                        </div>
                        <Link href={`/products/${p.id}`} className="btn btn-primary" style={{ padding: '8px 18px', fontSize: '13px', borderRadius: '40px' }}>
                          Fund Now →
                        </Link>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
            <div style={{ textAlign: 'center', marginTop: '36px' }} className="fade-up">
              <Link href="/products?type=preorder" className="btn btn-secondary">
                View all pre-orders <Arrow />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ── HOW IT WORKS — CREATORS ──────────────────────────────────────── */}
      <section className="section" id="how-creators">
        <div className="container">
          <div className="audience-divider"><span>For creators</span></div>
          <div style={{ marginTop: '40px' }}>
            <span className="section-label fade-up">Process</span>
            <h2 className="section-heading fade-up">How it works <span style={{ fontSize: '.5em', color: 'var(--orange-300)', verticalAlign: 'middle' }}>(for creators)</span></h2>
            <p className="section-sub fade-up">Four steps. That&apos;s all it takes.</p>
            <div className="grid-4">
              <div className="step fade-up s1"><h3>Apply to Ignivate</h3><p>Tell us about your product, your vision, and where you are right now.</p></div>
              <div className="step fade-up s2"><h3>We shape your launch</h3><p>Together, we craft your story, positioning, and launch strategy.</p></div>
              <div className="step fade-up s3"><h3>We launch your product</h3><p>Your product goes live with distribution, visibility, and momentum.</p></div>
              <div className="step fade-up s4"><h3>You get first customers</h3><p>Real people discover, back, and pre-order your product.</p></div>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS — BUYERS ────────────────────────────────────────── */}
      <section className="section" id="how-buyers">
        <div className="container">
          <div className="audience-divider"><span>For customers</span></div>
          <div style={{ marginTop: '40px' }}>
            <span className="section-label fade-up" style={{ color: 'var(--green-muted)' }}>Your journey</span>
            <h2 className="section-heading fade-up">How it works <span style={{ fontSize: '.5em', color: 'var(--green-muted)', verticalAlign: 'middle' }}>(for customers)</span></h2>
            <p className="section-sub fade-up">Discover, support, and get early access in four simple steps.</p>
            <div className="grid-4" style={{ counterReset: 'step' }}>
              <div className="step step-green fade-up s1"><h3>Discover new products</h3><p>Browse live launches and find products that excite you.</p></div>
              <div className="step step-green fade-up s2"><h3>Pre-order early</h3><p>Support the creator with an early access pre-order at a special price.</p></div>
              <div className="step step-green fade-up s3"><h3>Creator builds &amp; ships</h3><p>Follow the creator&apos;s progress with regular updates as they build.</p></div>
              <div className="step step-green fade-up s4"><h3>You get early access</h3><p>Be among the first to receive the product before it goes mainstream.</p></div>
            </div>
          </div>
        </div>
      </section>

      {/* ── WHY IGNIVATE ─────────────────────────────────────────────────── */}
      <section className="section" id="why-ignivate">
        <div className="container">
          <span className="section-label fade-up">What sets us apart</span>
          <h2 className="section-heading fade-up">Why Ignivate.</h2>
          <div className="grid-3" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))' }}>
            <div className="usp-item fade-up s1"><span className="usp-icon">🤝</span><h3>Hands-on launch support</h3><p>We actively work with creators to make every launch succeed.</p></div>
            <div className="usp-item fade-up s2"><span className="usp-icon">🎯</span><h3>Focus on first customers</h3><p>Everything is optimized for getting creators their first paying customers.</p></div>
            <div className="usp-item fade-up s3"><span className="usp-icon">📖</span><h3>Story + distribution driven</h3><p>We help tell stories people care about, then reach the right audience.</p></div>
            <div className="usp-item fade-up s4"><span className="usp-icon">⚡</span><h3>Not just a listing platform</h3><p>Think of us as a full launch team — strategy, support, and distribution.</p></div>
          </div>
        </div>
      </section>

      {/* ── BUY WITH CONFIDENCE ──────────────────────────────────────────── */}
      <section className="section" id="trust-buyers">
        <div className="container">
          <span className="section-label fade-up" style={{ color: 'var(--green-muted)' }}>Trust</span>
          <h2 className="section-heading fade-up">Buy with confidence.</h2>
          <p className="section-sub fade-up">Pre-ordering on Ignivate is transparent, safe, and directly supports creators.</p>
          <div className="trust-grid">
            <div className="trust-card buyer-card fade-up s1"><div className="trust-icon">🔓</div><h3>Transparent pre-order model</h3><p>You always know exactly what you&apos;re pre-ordering, when it ships, and what to expect. No hidden terms.</p></div>
            <div className="trust-card buyer-card fade-up s2"><div className="trust-icon">🤝</div><h3>Direct support to creators</h3><p>Your pre-order goes directly to the creator. You&apos;re helping real people build real products.</p></div>
            <div className="trust-card buyer-card fade-up s3"><div className="trust-icon">📨</div><h3>Regular updates from founders</h3><p>Get progress updates directly from the creator throughout the build and shipping process.</p></div>
          </div>
        </div>
      </section>

      {/* ── BUYER STRIP 3 ────────────────────────────────────────────────── */}
      <div className="cta-strip buyer">
        <div className="container"><div className="inner">
          <p><strong>Be part of early launches</strong> — discover what&apos;s next before everyone else</p>
          <Link href="/products" className="btn btn-green btn-xs">Explore now →</Link>
        </div></div>
      </div>

      {/* ── EARLY TRACTION ───────────────────────────────────────────────── */}
      <section className="section" id="traction">
        <div className="container">
          <span className="section-label fade-up">Progress</span>
          <h2 className="section-heading fade-up">Early traction.</h2>
          <p className="section-sub fade-up">We&apos;re just getting started — and we&apos;re being upfront about it.</p>
          <div className="launches-grid" style={{ gridTemplateColumns: '1fr', maxWidth: '600px', marginLeft: 'auto', marginRight: 'auto', marginTop: '48px' }}>
            <div className="coming-soon-card fade-up s1" style={{ minHeight: '260px' }}>
              <div className="cs-pulse" />
              <div className="cs-icon">📊</div>
              <h3>Coming Soon..</h3>
              <p>We&apos;re tracking our progress and will share real numbers here soon.<br />We believe in transparency — no inflated metrics, just honest growth.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── CREATOR CTA ──────────────────────────────────────────────────── */}
      <section className="cta-section" id="creators">
        <div className="container">
          <div className="cta-box fade-up">
            <span className="section-label">For creators</span>
            <h2 className="section-heading">Building something?</h2>
            <p className="section-sub" style={{ marginLeft: 'auto', marginRight: 'auto', marginBottom: '40px' }}>
              We&apos;ll help you launch it and get your first customers.
            </p>
            <a href="#apply" className="btn btn-primary">Apply to launch <Arrow /></a>
          </div>
        </div>
      </section>

      {/* ── APPLICATION FORM ─────────────────────────────────────────────── */}
      <section className="apply-section" id="apply">
        <div className="container">
          <span className="section-label fade-up">Apply</span>
          <h2 className="section-heading fade-up">Ready to launch<br />your product?</h2>
          <p className="section-sub fade-up">Fill in the details below. Every submission goes straight to our team.</p>
          <div className="apply-layout">
            <div className="apply-info fade-up">
              <h3>What happens next?</h3>
              <p>Once you apply, our team reviews your submission within 48 hours. If selected, we&apos;ll schedule a call to plan your launch together.</p>
              <ul className="apply-perks">
                <li><span className="perk-icon">🚀</span><span>Hands-on launch strategy tailored to your product</span></li>
                <li><span className="perk-icon">📣</span><span>Promotion on Instagram, X, and LinkedIn</span></li>
                <li><span className="perk-icon">💡</span><span>Strategy and feedback to polish your project</span></li>
                <li><span className="perk-icon">🤝</span><span>Community support to keep you motivated</span></li>
                <li><span className="perk-icon">💰</span><span>Crowdfunding support to turbocharge growth</span></li>
              </ul>
            </div>
            <div className="form-card fade-up s1">
              <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--dark-border)' }}>
                <p style={{ fontSize: '15px', fontWeight: 600, color: 'var(--gray-300)', textAlign: 'center' }}>Apply via Google Form</p>
              </div>
              <div className="gform-iframe-wrap">
                <iframe
                  id="gformFrame"
                  loading="lazy"
                  src="https://docs.google.com/forms/d/e/1FAIpQLSd8VbGsI4S5OIETRt3pHVJycZTeqK9nwXhiCpX0rm9e_XKUoQ/viewform?embedded=true"
                  title="Application Form"
                  style={{ height: '600px' }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── BUYER FINAL CTA ──────────────────────────────────────────────── */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-box cta-box-green fade-up">
            <span className="section-label" style={{ color: 'var(--green-muted)' }}>For early adopters</span>
            <h2 className="section-heading">Discover products<br />before everyone else.</h2>
            <p className="section-sub" style={{ marginLeft: 'auto', marginRight: 'auto', marginBottom: '40px' }}>
              Be the first to try, support, and pre-order what&apos;s next.
            </p>
            <Link href="/products" className="btn btn-green" style={{ padding: '16px 36px', fontSize: '16px' }}>
              Explore launches <Arrow />
            </Link>
          </div>
        </div>
      </section>

      {/* ── LEGAL ZONE ───────────────────────────────────────────────────── */}
      <section className="legal-zone" id="legal">
        <div className="container">
          <div className="legal-zone-header">
            <div className="shield fade-up">🛡</div>
            <span className="section-label fade-up">Transparency</span>
            <h2 className="section-heading fade-up" style={{ textAlign: 'center', marginLeft: 'auto', marginRight: 'auto' }}>Trust &amp; Transparency.</h2>
            <p className="section-sub fade-up" style={{ textAlign: 'center', marginLeft: 'auto', marginRight: 'auto' }}>
              We believe in being completely upfront about how Ignivate works. Read through our platform policies below.
            </p>
          </div>
          <div className="legal-grid">
            <div className="legal-card fade-up s1">
              <div className="legal-card-header"><div className="legal-card-icon">📋</div><h3>Platform Disclaimer</h3></div>
              <p>Ignivate is a product discovery and launch platform. We connect creators with early adopters through pre-orders.</p>
              <p className="muted" style={{ fontWeight: 600, marginBottom: '8px' }}>We do not:</p>
              <ul className="legal-list cross">
                <li>Offer any form of financial opportunity or returns</li>
                <li>Provide equity stakes or ownership in products</li>
                <li>Act as a financial intermediary or broker</li>
              </ul>
              <p className="muted" style={{ fontWeight: 600, marginBottom: '8px' }}>All transactions on Ignivate are:</p>
              <ul className="legal-list check">
                <li>Pre-orders for products listed by creators</li>
                <li>Payments made directly in support of creators and their products</li>
              </ul>
            </div>
            <div className="legal-card fade-up s2">
              <div className="legal-card-header"><div className="legal-card-icon">📦</div><h3>Pre-order Model</h3></div>
              <p>All purchases made through Ignivate are pre-orders. This means the product may not be immediately available at the time of purchase.</p>
              <ul className="legal-list">
                <li>Products may be in development or early stages at the time of listing</li>
                <li>Delivery timelines are determined by the creator, not Ignivate</li>
                <li>Pricing reflects early access rates set by the creator</li>
              </ul>
              <div className="legal-note"><strong>By placing a pre-order,</strong> you acknowledge that the product may still be in development, and delivery timelines may vary based on the creator&apos;s progress.</div>
            </div>
            <div className="legal-card fade-up s1">
              <div className="legal-card-header"><div className="legal-card-icon">👤</div><h3>Creator Responsibility</h3></div>
              <p>Creators listed on Ignivate are solely responsible for:</p>
              <ul className="legal-list">
                <li>Product quality, design, and functionality</li>
                <li>Manufacturing, production, and delivery</li>
                <li>Customer support related to their product</li>
              </ul>
              <p className="muted" style={{ fontWeight: 600, marginBottom: '8px' }}>Ignivate does not guarantee:</p>
              <ul className="legal-list cross">
                <li>Product performance or suitability</li>
                <li>Specific delivery timelines or dates</li>
                <li>Product outcomes or results</li>
              </ul>
            </div>
            <div className="legal-card fade-up s2">
              <div className="legal-card-header"><div className="legal-card-icon">💳</div><h3>Payments</h3></div>
              <p>Payment processing on Ignivate is handled securely and transparently.</p>
              <ul className="legal-list">
                <li>Payments are processed via trusted third-party payment providers</li>
                <li>Ignivate may collect a platform fee to support operations</li>
                <li>Ignivate is not liable for disputes arising between creators and customers</li>
                <li>All payment details are handled by the payment provider — Ignivate does not store card information</li>
              </ul>
            </div>
            <div className="legal-card full fade-up">
              <div className="legal-card-header"><div className="legal-card-icon">⚠️</div><h3>Risk Disclosure</h3></div>
              <p>By pre-ordering or supporting products on Ignivate, you understand and accept the following:</p>
              <ul className="legal-list">
                <li>Products listed may be in early stages of development and are not finished goods at the time of pre-order</li>
                <li>Delays in production or delivery may occur due to factors outside the creator&apos;s or Ignivate&apos;s control</li>
                <li>Outcomes, features, or final specifications are not guaranteed and may differ from initial descriptions</li>
                <li>Users participate and place pre-orders at their own discretion and judgment</li>
              </ul>
              <div className="legal-note"><strong>Please note:</strong> Ignivate carefully reviews all creators before listing, but cannot guarantee the success or completion of any individual product. We encourage customers to review all product details thoroughly before placing a pre-order.</div>
            </div>
            <div className="legal-card full fade-up">
              <div className="legal-card-header"><div className="legal-card-icon">🔄</div><h3>Refunds &amp; Disputes</h3></div>
              <p>We aim to create a fair environment for both creators and customers.</p>
              <ul className="legal-list">
                <li>Refund policies are determined by individual creators and may vary by product</li>
                <li>Users should carefully review all product details, timelines, and creator information before pre-ordering</li>
                <li>Ignivate may assist in facilitating communication between creators and customers in case of disputes</li>
                <li>Ignivate is not directly responsible for processing refunds — this responsibility lies with the creator</li>
              </ul>
              <div className="legal-note"><strong>Tip:</strong> If you have concerns about a product, reach out to the creator directly through the product page, or contact Ignivate support and we&apos;ll help facilitate the conversation.</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CONTACT ──────────────────────────────────────────────────────── */}
      <section className="contact-section" id="contact">
        <div className="container">
          <span className="section-label fade-up">Get in touch</span>
          <h2 className="section-heading fade-up">Contact us.</h2>
          <p className="section-sub fade-up">For any questions, support, or concerns — we&apos;re here to help.</p>
          <div className="contact-grid">
            <div className="fade-up">
              <div className="contact-channels">
                <a href="mailto:ignivatee@gmail.com" className="contact-channel">
                  <div className="ch-icon">✉️</div>
                  <div><div className="ch-label">Email</div><div className="ch-value">ignivatee@gmail.com</div></div>
                </a>
                <a href="https://instagram.com/ignivate" target="_blank" rel="noopener noreferrer" className="contact-channel">
                  <div className="ch-icon">📷</div>
                  <div><div className="ch-label">Instagram</div><div className="ch-value">@ignivate</div></div>
                </a>
              </div>
              <div className="contact-response">⏱ We aim to respond within 24–48 hours.</div>
            </div>
            <div className="fade-up s1">
              <div className="legal-card" style={{ height: '100%' }}>
                <div className="legal-card-header"><div className="legal-card-icon">💬</div><h3>How can we help?</h3></div>
                <ul className="legal-list check">
                  <li>Questions about a product or creator</li>
                  <li>Pre-order status or delivery inquiries</li>
                  <li>Reporting an issue with a listing</li>
                  <li>Creator onboarding questions</li>
                  <li>Partnership or press inquiries</li>
                  <li>General feedback and suggestions</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FINAL LEGAL NOTE ─────────────────────────────────────────────── */}
      <section className="final-legal">
        <div className="container">
          <div className="final-legal-inner fade-up">
            <h3>📜 Important</h3>
            <p style={{ fontSize: '15px', color: 'var(--gray-300)', marginBottom: '20px', lineHeight: 1.7 }}>
              By using Ignivate, you acknowledge and agree to the following:
            </p>
            <ul className="terms-list">
              <li>Our platform terms and conditions</li>
              <li>The pre-order nature of all transactions</li>
              <li>The creator-led fulfillment model</li>
              <li>That Ignivate is a discovery and launch platform — not a financial platform</li>
            </ul>
            <p className="note">
              Ignivate reserves the right to update these terms at any time. Continued use of the platform constitutes acceptance of any updated terms. For the most current version, please contact us directly.
            </p>
          </div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────────────── */}
      <footer className="footer">
        <div className="container">
          <div className="footer-inner">
            <div className="footer-brand">
              <Link href="/" className="nav-logo">
                <LogoSVG size={32} />
                <span style={{ fontWeight: 700, fontSize: '18px' }}>Ignivate</span>
              </Link>
              <p>Launching products, one idea at a time.</p>
            </div>
            <div className="footer-links">
              <div className="footer-col">
                <h4>For Creators</h4>
                <a href="#how-creators">How it works</a>
                <a href="#apply">Apply to launch</a>
                <a href="#why-ignivate">Why Ignivate</a>
              </div>
              <div className="footer-col">
                <h4>For Customers</h4>
                <Link href="/products">Explore launches</Link>
                <a href="#how-buyers">How buying works</a>
                <a href="#trust-buyers">Buy with confidence</a>
              </div>
              <div className="footer-col">
                <h4>Trust &amp; Legal</h4>
                <a href="#legal">Platform disclaimer</a>
                <a href="#legal">Pre-order model</a>
                <a href="#legal">Risk disclosure</a>
                <a href="#contact">Contact us</a>
              </div>
              <div className="footer-col">
                <h4>Account</h4>
                <Link href="/login">Login</Link>
                <Link href="/signup">Sign Up</Link>
                <a href="mailto:ignivatee@gmail.com">ignivatee@gmail.com</a>
                <a href="https://instagram.com/ignivate" target="_blank" rel="noopener noreferrer">Instagram</a>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <p>© 2026 Ignivate. All rights reserved.</p>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--gray-500)' }}>Built in India 🇮🇳</p>
          </div>
        </div>
      </footer>
    </>
  )
}
