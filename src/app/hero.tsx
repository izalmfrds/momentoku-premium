'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowDownRight, ArrowRight, Menu, Mouse, Sparkles } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const cards = [
  { title: 'Cerita kita', category: 'WEDDING', image: '/cards/wedding.jpg', alt: 'Pasangan merayakan pernikahan di luar ruangan', color: '#bd835f' },
  { title: 'Another year', category: 'BIRTHDAY', image: '/cards/birthday.jpg', alt: 'Perayaan ulang tahun dengan lilin dan dekorasi', color: '#e6868a' },
  { title: 'Go somewhere', category: 'TRAVEL', image: '/cards/travel.jpg', alt: 'Pemandangan perjalanan di alam terbuka', color: '#6897a6' },
  { title: 'Momen kita', category: 'SPECIAL MOMENTS', image: '/cards/family.jpg', alt: 'Keluarga menikmati waktu bersama', color: '#a7856e' },
  { title: 'Feel the beat', category: 'MUSIC', image: '/cards/music.jpg', alt: 'Suasana konser musik dengan cahaya panggung', color: '#674f80' },
  { title: 'The next chapter', category: 'GRADUATION', image: '/cards/graduation.jpg', alt: 'Teman-teman merayakan kelulusan', color: '#849968' },
  { title: 'Make it happen', category: 'EVENTS', image: '/cards/corporate.jpg', alt: 'Pertemuan dan acara profesional', color: '#6f8196' },
];

const fan = [
  { x: -3, y: 64, r: -14, z: 1 },
  { x: -2, y: 29, r: -10, z: 2 },
  { x: -1, y: 8, r: -6, z: 3 },
  { x: 0, y: 0, r: 0, z: 7 },
  { x: 1, y: 8, r: 6, z: 3 },
  { x: 2, y: 29, r: 10, z: 2 },
  { x: 3, y: 64, r: 14, z: 1 },
];

export default function Hero() {
  const heroRef = useRef<HTMLElement>(null);
  const fanRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const floatRefs = useRef<(HTMLDivElement | null)[]>([]);
  const hoverRefs = useRef<(HTMLDivElement | null)[]>([]);
  const readyRef = useRef(false);
  const scrollingRef = useRef(false);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const hero = heroRef.current;
    const fanEl = fanRef.current;
    if (!hero || !fanEl) return;
    const cardEls = cardRefs.current.filter((el): el is HTMLDivElement => Boolean(el));
    const floatEls = floatRefs.current.filter((el): el is HTMLDivElement => Boolean(el));
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isMobile = () => window.innerWidth < 768;
    const heroPositions = () => {
      const step = isMobile() ? Math.min(window.innerWidth * 0.16, 64) : Math.min(window.innerWidth * 0.115, 171);
      return fan.map((p) => ({ x: p.x * step, y: p.y * (isMobile() ? 0.55 : 1), rotation: p.r * (isMobile() ? 0.8 : 1) }));
    };
    const sectionPositions = () => {
      const mobile = isMobile();
      const step = mobile ? Math.min(window.innerWidth * 0.1, 40) : Math.min(window.innerWidth * 0.068, 98);
      const y = mobile ? [38, 18, 6, 0, 6, 18, 38] : [56, 28, 9, 0, 9, 28, 56];
      const rotation = mobile ? [-10, -7, -3, 0, 3, 7, 10] : [-13, -9, -5, 0, 5, 9, 13];
      return fan.map((p, i) => ({ x: p.x * step, y: y[i], rotation: rotation[i] }));
    };
    const sectionFanX = () => {
      if (isMobile()) return 0;
      const rightEdge = sectionPositions()[6].x + (cardEls[6]?.offsetWidth ?? 190) / 2 + 64;
      const targetCenter = Math.min(window.innerWidth * 0.74, window.innerWidth - rightEdge);
      return targetCenter - window.innerWidth / 2;
    };
    const visible = () => cardEls.forEach((el, i) => {
      gsap.set(el, { ...heroPositions()[i], opacity: 1, scale: 1 });
    });
    const ctx = gsap.context(() => {
      if (reduced) {
        gsap.set(['.hero-line', '.hero-description', '.hero-cta', '.hero-decoration'], { opacity: 1, y: 0 });
        visible();
        gsap.set('.section-two', { opacity: 1 });
        gsap.set('.section-two-copy > *', { opacity: 1, y: 0 });
        hero.classList.add('is-reduced');
        readyRef.current = true;
        return;
      }
      const initialDrop = window.innerHeight * (isMobile() ? 0.7 : 0.85);
      gsap.set(cardEls, { x: 0, y: initialDrop, opacity: 0, rotation: -8, scale: 0.85, transformOrigin: '50% 85%' });
      gsap.set(['.hero-line', '.hero-description', '.hero-cta', '.hero-decoration'], { opacity: 0, y: 25 });
      gsap.set('.section-two', { opacity: 0 });
      gsap.set('.section-two-copy > *', { opacity: 0, y: 28 });
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' }, onComplete: () => {
        readyRef.current = true;
        floatEls.forEach((el, i) => gsap.to(el, { y: i % 2 ? -5 : 5, duration: 2.8 + i * 0.27, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: i * 0.14 }));
      } });
      tl.addLabel('initial').to({}, { duration: 0.3 });
      tl.addLabel('firstCard').to(cardEls[3], { x: 0, y: 0, opacity: 1, rotation: 0, scale: 1, duration: 0.85 }, 'firstCard');
      tl.addLabel('headline', 'firstCard+=0.42').to('.hero-line', { y: 0, opacity: 1, duration: 0.65, stagger: 0.12 }, 'headline');
      tl.addLabel('description', 'headline+=0.4').to('.hero-description', { y: 0, opacity: 1, duration: 0.5 }, 'description').to('.hero-cta', { y: 0, opacity: 1, duration: 0.5, stagger: 0.13 }, 'description+=0.12');
      const order = [2, 4, 1, 5, 0, 6];
      tl.addLabel('fanSpread', 'description+=0.35');
      order.forEach((index, n) => {
        tl.to(cardEls[index], { ...heroPositions()[index], opacity: 1, scale: 1, duration: 1.05, ease: 'power3.out' }, `fanSpread+=${n * 0.13}`);
      });
      tl.addLabel('decorations', 'fanSpread+=1.05').to('.hero-decoration', { y: 0, opacity: 1, duration: 0.55, stagger: 0.11 }, 'decorations');
      tl.addLabel('completed');

      const stackPositions = cardEls.map((_, i) => ({ x: (i - 3) * 2, y: -Math.abs(i - 3) * 5, rotation: 0, scale: 0.96 }));
      const master = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: hero,
          start: 'top top',
          end: '+=300%',
          scrub: 1,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const active = self.progress > 0.002;
            if (active !== scrollingRef.current) {
              scrollingRef.current = active;
              if (active) {
                gsap.killTweensOf(floatEls);
                gsap.to(floatEls, { y: 0, duration: 0.25, overwrite: true });
                gsap.to(hoverRefs.current, { y: 0, scale: 1, opacity: 1, duration: 0.2, overwrite: true });
              }
            }
          },
        },
      });

      master.addLabel('collapse', 0);
      cardEls.forEach((el, i) => master.fromTo(el, {
        x: () => heroPositions()[i].x,
        y: () => heroPositions()[i].y,
        rotation: () => heroPositions()[i].rotation,
        scale: 1,
        opacity: 1,
      }, { ...stackPositions[i], opacity: 1, duration: 0.18, immediateRender: false }, 'collapse'));
      master.to(['.site-header', '.hero-content', '.hero-decoration', '.scroll-cue'], { opacity: 0, y: -34, duration: 0.18 }, 'collapse');
      master.fromTo(fanEl, { x: 0, y: 0 }, { x: 0, y: () => window.innerHeight * 0.05, duration: 0.14, immediateRender: false }, 0.18);
      master.to('.section-two', { opacity: 0.82, duration: 0.16 }, 0.32);
      master.to(fanEl, { y: () => window.innerHeight * 0.2, duration: 0.16 }, 0.32);
      master.to('.section-two', { opacity: 1, duration: 0.14 }, 0.48);
      master.to(fanEl, {
        x: sectionFanX,
        y: () => isMobile() ? 0 : -window.innerHeight * (window.innerWidth < 1100 ? 0.12 : 0.17),
        duration: 0.14,
      }, 0.48);
      cardEls.forEach((el, i) => master.to(el, {
        x: () => sectionPositions()[i].x,
        y: () => sectionPositions()[i].y,
        rotation: () => sectionPositions()[i].rotation,
        scale: 1,
        duration: 0.16,
      }, 0.62));
      master.to(cardEls, { scale: 1, duration: 0.07, ease: 'power2.out' }, 0.78);
      master.to('.section-two-copy > *', { opacity: 1, y: 0, duration: 0.045, stagger: 0.012, ease: 'power2.out' }, 0.85);
      master.to({}, { duration: 0.05 }, 0.95);
    }, hero);
    return () => { ctx.revert(); hero.classList.remove('is-reduced'); readyRef.current = false; scrollingRef.current = false; };
  }, []);

  const onEnter = (index: number) => {
    if (!readyRef.current || scrollingRef.current || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const target = hoverRefs.current[index];
    if (!target) return;
    cardRefs.current[index]?.style.setProperty('z-index', '20');
    gsap.to(target, { y: -25, scale: 1.05, duration: 0.4, ease: 'power3.out', boxShadow: '0 32px 60px rgba(28, 21, 20, .22)', overwrite: 'auto' });
    hoverRefs.current.forEach((el, i) => { if (i !== index) gsap.to(el, { opacity: 0.82, duration: 0.3, overwrite: 'auto' }); });
  };
  const onLeave = (index: number) => {
    const target = hoverRefs.current[index];
    if (!target) return;
    gsap.to(target, { y: 0, scale: 1, duration: 0.45, ease: 'power3.out', boxShadow: '0 18px 42px rgba(30, 24, 23, .16)', overwrite: 'auto', onComplete: () => cardRefs.current[index]?.style.setProperty('z-index', String(fan[index].z)) });
    hoverRefs.current.forEach((el) => gsap.to(el, { opacity: 1, duration: 0.35, overwrite: 'auto' }));
  };

  return <main>
    <section className="hero" ref={heroRef} aria-labelledby="hero-title">
      <header className="site-header">
        <Link href="/" className="brand" aria-label="Momentoku, beranda"><span className="brand-mark"><span /><span /><span /><span /></span><span>momentoku<span className="brand-dot">.</span></span></Link>
        <nav className="desktop-nav" aria-label="Navigasi utama"><a href="#produk">Produk</a><a href="#cara-kerja">Cara Kerja</a><a href="#inspirasi">Inspirasi</a><a href="mailto:halo@momentoku.id">Kontak</a></nav>
        <a className="header-cta" href="mailto:halo@momentoku.id?subject=Mulai%20dengan%20Momentoku">Mulai Sekarang <ArrowUpRightIcon /></a>
        <button className="mobile-menu" type="button" aria-label="Buka menu" onClick={() => document.querySelector('.mobile-nav')?.classList.toggle('open')}><Menu size={22} /></button>
      </header>
      <nav className="mobile-nav" aria-label="Navigasi seluler"><a href="#produk">Produk</a><a href="#cara-kerja">Cara Kerja</a><a href="#inspirasi">Inspirasi</a><a href="mailto:halo@momentoku.id">Kontak</a></nav>

      <div className="hero-content">
        <div className="eyebrow hero-line"><span className="eyebrow-line" />YOUR MOMENTS, BEAUTIFULLY KEPT<span className="eyebrow-line" /></div>
        <h1 id="hero-title"><span className="hero-line">Satu tempat untuk</span><span className="hero-line gradient-text">semua momen spesial.</span></h1>
        <p className="hero-description">Dari undangan digital, berbagi foto, hingga mengirim hadiah. Semua yang kamu butuhkan untuk merayakan momen spesial, dalam satu tempat.</p>
        <div className="hero-actions"><a className="hero-cta primary" href="mailto:halo@momentoku.id?subject=Mulai%20dengan%20Momentoku">Mulai Sekarang <ArrowRight size={18} strokeWidth={1.8} /></a><a className="hero-cta secondary" href="#produk">Jelajahi Produk <ArrowDownRight size={18} strokeWidth={1.8} /></a></div>
      </div>

      <div className="visual-area" id="produk">
        <div className="hero-decoration decor-left"><span className="scribble">Every moment<br />has a story.</span><svg viewBox="0 0 100 90" fill="none" aria-hidden="true"><path d="M5 80C39 75 13 13 68 18c15 1 20 10 21 24m0 0-9-10m9 10 8-10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg></div>
        <div className="hero-decoration decor-right"><svg viewBox="0 0 100 90" fill="none" aria-hidden="true"><path d="M5 9c59-9 27 61 81 58m0 0-11-8m11 8-11 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg><span className="scribble">Made to<br />remember.</span></div>
        <div className="hero-decoration chip chip-left">#momenberharga <Sparkles size={12} /></div>
        <div className="hero-decoration chip chip-right">#ceritakita <span>✳</span></div>
        <div className="fan" ref={fanRef} aria-label="Ragam momen yang dapat dirayakan dengan Momentoku">
          {cards.map((card, i) => <div key={card.category} className={`fan-card card-${i}`} style={{ zIndex: fan[i].z }} ref={(el) => { cardRefs.current[i] = el; }} onMouseEnter={() => onEnter(i)} onMouseLeave={() => onLeave(i)}>
            <div className="float-card" ref={(el) => { floatRefs.current[i] = el; }}><div className="card-face" ref={(el) => { hoverRefs.current[i] = el; }}><Image src={card.image} alt={card.alt} fill sizes="(max-width: 767px) 145px, (max-width: 1023px) 175px, 230px" priority={i === 3} className="card-image" /><div className="card-shade" /><div className="card-top"><span className="card-emblem">m<span>.</span></span><span>0{i + 1} / 07</span></div><div className="card-caption"><span className="card-category">{card.category}</span><strong>{card.title}</strong><span className="card-rule" style={{ backgroundColor: card.color }} /></div></div></div>
          </div>)}
        </div>
      </div>
      <section className="section-two" id="fitur" aria-labelledby="section-two-title">
        <div className="section-two-copy">
          <p className="section-two-eyebrow"><span />TIGA PRODUK, SATU PENGALAMAN LENGKAP</p>
          <h2 id="section-two-title">Rayakan setiap<br />momen dengan<br /><span>lebih mudah.</span></h2>
          <p className="section-two-description">Momentoku menghadirkan tiga produk yang saling terhubung untuk membuat setiap acara menjadi lebih berkesan, praktis, dan penuh makna.</p>
          <a className="section-two-cta" href="#cara-kerja">Lihat Semua Fitur <ArrowRight size={17} strokeWidth={1.8} /></a>
        </div>
        <div className="section-two-accent accent-left" aria-hidden="true">⌁</div>
        <div className="section-two-accent accent-right" aria-hidden="true">⌁</div>
      </section>
      <div className="scroll-cue"><Mouse size={20} strokeWidth={1.25} /><span>SCROLL TO EXPLORE</span></div>
      <div className="hero-bottom"><span>CAPTURE THE FEELING</span><span>01 — EVERY MOMENT MATTERS</span></div>
    </section>
  </main>;
}

function ArrowUpRightIcon() { return <ArrowRight size={16} strokeWidth={1.8} className="header-arrow" />; }
