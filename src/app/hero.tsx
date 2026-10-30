'use client';

import { useLayoutEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowDownRight, ArrowRight, Menu, Mouse, Sparkles } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Observer } from 'gsap/Observer';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';

const cards = [
  { title: 'Cerita kita', category: 'WEDDING', image: '/cards/wedding.jpg', alt: 'Pasangan merayakan pernikahan di luar ruangan', color: '#bd835f' },
  { title: 'Another year', category: 'BIRTHDAY', image: '/cards/birthday.jpg', alt: 'Perayaan ulang tahun dengan lilin dan dekorasi', color: '#e6868a' },
  { title: 'Go somewhere', category: 'TRAVEL', image: '/cards/travel.jpg', alt: 'Pemandangan perjalanan di alam terbuka', color: '#6897a6' },
  { title: 'Feel the beat', category: 'MUSIC', image: '/cards/music.jpg', alt: 'Suasana konser musik dengan cahaya panggung', color: '#674f80' },
  { title: 'The next chapter', category: 'GRADUATION', image: '/cards/graduation.jpg', alt: 'Teman-teman merayakan kelulusan', color: '#849968' },
];

const fan = [
  { x: -2, y: 35, r: -12, z: 1 },
  { x: -1, y: 9, r: -6, z: 2 },
  { x: 0, y: 0, r: 0, z: 5 },
  { x: 1, y: 9, r: 6, z: 2 },
  { x: 2, y: 35, r: 12, z: 1 },
];

export default function Hero() {
  const heroRef = useRef<HTMLElement>(null);
  const storyRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const fanRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const floatRefs = useRef<(HTMLDivElement | null)[]>([]);
  const hoverRefs = useRef<(HTMLDivElement | null)[]>([]);
  const sectionThreeRef = useRef<HTMLElement>(null);
  const sectionThreeTransitionRef = useRef<HTMLDivElement>(null);
  const trustedRef = useRef<HTMLElement>(null);
  const readyRef = useRef(false);

  useLayoutEffect(() => {
    gsap.registerPlugin(ScrollTrigger, Observer, ScrollToPlugin);
    const previousScrollRestoration = window.history.scrollRestoration;
    const resetScrollToStart = () => {
      window.history.scrollRestoration = 'manual';
      ScrollTrigger.clearScrollMemory('manual');
      window.scrollTo(0, 0);
    };
    resetScrollToStart();
    window.addEventListener('pageshow', resetScrollToStart);
    const hero = heroRef.current;
    const fanEl = fanRef.current;
    const story = storyRef.current;
    const section = sectionRef.current;
    const sectionThreeTransition = sectionThreeTransitionRef.current;
    if (!hero || !fanEl || !story || !section || !sectionThreeTransition) return;
    const cardEls = cardRefs.current.filter((el): el is HTMLDivElement => Boolean(el));
    const floatEls = floatRefs.current.filter((el): el is HTMLDivElement => Boolean(el));
    const sectionItems = Array.from(section.querySelectorAll<HTMLElement>('.section-two-content > *'));
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isMobile = () => window.innerWidth < 768;
    const fanPositions = () => {
      const step = isMobile() ? Math.min(window.innerWidth * 0.17, 70) : Math.min(window.innerWidth * 0.14, 190);
      return fan.map((p) => ({ x: p.x * step, y: p.y * (isMobile() ? 0.55 : 1), rotation: p.r * (isMobile() ? 0.8 : 1) }));
    };
    const stage = () => {
      const currentY = Number(gsap.getProperty(fanEl, 'y')) || 0;
      const baseTop = fanEl.getBoundingClientRect().top - currentY;
      return {
        x: isMobile() ? 0 : window.innerWidth * 0.22,
        y: window.innerHeight * (isMobile() ? 0.3 : 0.38) - baseTop,
        spread: isMobile() ? Math.min(window.innerWidth * 0.165, 70) : Math.min(window.innerWidth * 0.075, 108),
      };
    };
    let state = 0;
    let transitioning = false;
    let pinActive = false;
    let introReady = false;
    let parallaxReleased = false;
    let sectionThreeRevealed = false;
    let revealSectionThree = () => {};
    let activeTimeline: gsap.core.Timeline | null = null;
    let floatTweens: gsap.core.Tween[] = [];

    const stopFloatMotion = () => {
      floatTweens.forEach((tween) => tween.kill());
      floatTweens = [];
      gsap.set(floatEls, { y: 0 });
    };
    const startFloatMotion = () => {
      stopFloatMotion();
      floatTweens = floatEls.map((el, i) => gsap.to(el, {
        y: i % 2 ? -5 : 5,
        duration: 2.8 + i * 0.27,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
        delay: i * 0.14,
      }));
    };

    let observer: Observer | null = null;
    let pinTrigger: ScrollTrigger | null = null;
    const enableObserver = () => {
      if (pinActive && introReady && !reduced) observer?.enable();
    };
    const sectionThreeOffset = () => {
      const imageFrame = sectionThreeRef.current?.querySelector<HTMLElement>('.s3-video-frame');
      const imageOffset = imageFrame
        ? imageFrame.getBoundingClientRect().top - sectionThreeTransition.getBoundingClientRect().top
        : 0;
      return window.innerHeight * 0.5 + Math.max(0, imageOffset);
    };
    const releasePin = (direction: 1 | -1) => {
      if (direction < 0) {
        observer?.disable();
        pinActive = false;
        story.classList.remove('is-scrolling');
        window.scrollTo({ top: Math.max(0, (pinTrigger?.start ?? 0) - 2), behavior: 'smooth' });
        return;
      }

      transitioning = true;
      activeTimeline?.kill();
      revealSectionThree();
      activeTimeline = gsap.timeline({
        defaults: { ease: 'power2.inOut', overwrite: 'auto' },
        onUpdate: () => ScrollTrigger.update(),
        onComplete: () => {
          transitioning = false;
          pinActive = false;
          parallaxReleased = true;
          observer?.disable();
          story.classList.remove('is-scrolling');
          ScrollTrigger.refresh();
        },
      })
        .to(window, {
          scrollTo: { y: (pinTrigger?.end ?? window.scrollY) + 2, autoKill: false },
          duration: 1.05,
        }, 0)
        .to(sectionThreeTransition, {
          y: () => -sectionThreeOffset(),
          marginBottom: () => -sectionThreeOffset(),
          duration: 1.05,
        }, 0);
    };

    const setImmediateState = (nextState: number) => {
      const positions = fanPositions();
      const currentStage = stage();
      gsap.set(section, { opacity: nextState === 2 ? 1 : 0 });
      gsap.set(sectionItems, { opacity: nextState === 2 ? 1 : 0, y: 0 });
      gsap.set(['.hero-content', '.scroll-cue', '.hero-decoration'], {
        opacity: nextState === 0 ? 1 : 0,
        y: 0,
      });
      if (nextState === 0) {
        gsap.set(fanEl, { x: 0, y: 0 });
        cardEls.forEach((el, i) => gsap.set(el, { ...positions[i], opacity: 1, scale: 1 }));
      } else if (nextState === 1) {
        gsap.set(fanEl, { x: 0, y: currentStage.y });
        cardEls.forEach((el, i) => gsap.set(el, {
          x: 0,
          y: i === 2 ? 0 : 34,
          rotation: 0,
          opacity: i === 2 ? 1 : 0,
          scale: i === 2 ? 1.04 : 0.72,
        }));
      } else {
        gsap.set(fanEl, { x: currentStage.x, y: currentStage.y });
        cardEls.forEach((el, i) => gsap.set(el, {
          x: (i - 2) * currentStage.spread,
          y: Math.abs(i - 2) * (isMobile() ? 10 : 18),
          rotation: (i - 2) * (isMobile() ? 5 : 7),
          opacity: i === 0 || i === 2 || i === 4 ? 1 : 0,
          scale: 1,
        }));
      }
      story.classList.toggle('is-scrolling', nextState !== 0);
    };

    const transitionTo = (nextState: number) => {
      if (transitioning || nextState === state || nextState < 0 || nextState > 2) return;
      transitioning = true;
      stopFloatMotion();
      story.classList.add('is-scrolling');
      const positions = fanPositions();
      const currentStage = stage();
      activeTimeline?.kill();
      const tl = gsap.timeline({
        defaults: { ease: 'power3.inOut', overwrite: 'auto' },
        onComplete: () => {
          state = nextState;
          transitioning = false;
          if (state === 0) {
            story.classList.remove('is-scrolling');
            startFloatMotion();
          }
          enableObserver();
        },
      });
      activeTimeline = tl;

      if (state === 0 && nextState === 1) {
        tl.to(['.hero-content', '.scroll-cue', '.hero-decoration'], { opacity: 0, y: -12, duration: 0.42 }, 0)
          .to(fanEl, { x: 0, y: currentStage.y, duration: 0.65 }, 0)
          .to(cardEls, {
            x: 0,
            y: (i) => i === 2 ? 0 : 34,
            rotation: 0,
            opacity: (i) => i === 2 ? 1 : 0,
            scale: (i) => i === 2 ? 1.04 : 0.72,
            duration: 0.65,
            stagger: { each: 0.05, from: 'edges' },
            transformOrigin: 'center center',
          }, 0);
      } else if (state === 1 && nextState === 2) {
        gsap.set(section, { opacity: 1 });
        tl.to(fanEl, { x: currentStage.x, duration: 0.7 }, 0)
          .to(cardEls, {
            x: (i) => (i - 2) * currentStage.spread,
            y: (i) => Math.abs(i - 2) * (isMobile() ? 10 : 18),
            rotation: (i) => (i - 2) * (isMobile() ? 5 : 7),
            opacity: (i) => i === 0 || i === 2 || i === 4 ? 1 : 0,
            scale: 1,
            duration: 0.56,
            stagger: { each: 0.07, from: 'center' },
            transformOrigin: 'center center',
          }, 0)
          .fromTo(sectionItems, { opacity: 0, y: 22 }, {
            opacity: 1,
            y: 0,
            duration: 0.38,
            stagger: 0.045,
          }, 0.28);
      } else if (state === 2 && nextState === 1) {
        tl.to(sectionItems, { opacity: 0, y: 18, duration: 0.28, stagger: 0.025 }, 0)
          .to(fanEl, { x: 0, duration: 0.65 }, 0)
          .to(cardEls, {
            x: 0,
            y: (i) => i === 2 ? 0 : 34,
            rotation: 0,
            opacity: (i) => i === 2 ? 1 : 0,
            scale: (i) => i === 2 ? 1.04 : 0.72,
            duration: 0.65,
            stagger: { each: 0.05, from: 'edges' },
          }, 0)
          .set(section, { opacity: 0 });
      } else if (state === 1 && nextState === 0) {
        tl.to(fanEl, { x: 0, y: 0, duration: 0.65 }, 0)
          .to(cardEls, {
            x: (i) => positions[i].x,
            y: (i) => positions[i].y,
            rotation: (i) => positions[i].rotation,
            opacity: 1,
            scale: 1,
            duration: 0.65,
            stagger: { each: 0.05, from: 'center' },
            transformOrigin: 'center center',
          }, 0)
          .to(['.hero-content', '.scroll-cue', '.hero-decoration'], { opacity: 1, y: 0, duration: 0.42 }, 0.26);
      }
    };

    const ctx = gsap.context(() => {
      if (reduced) {
        gsap.set(['.hero-line', '.hero-description', '.hero-cta', '.hero-decoration'], { opacity: 1, y: 0 });
        gsap.set(story, { height: 'auto', overflow: 'visible' });
        gsap.set(hero, { position: 'relative' });
        gsap.set(section, { position: 'relative', minHeight: '100svh', opacity: 1 });
        gsap.set(sectionItems, { opacity: 1, y: 0 });
        cardEls.forEach((el, i) => gsap.set(el, { ...fanPositions()[i], opacity: 1, scale: 1 }));
        readyRef.current = true;
        return;
      }

      gsap.set(section, { opacity: 0 });
      gsap.set(sectionItems, { opacity: 0, y: 22 });
      const initialDrop = window.innerHeight * (isMobile() ? 0.7 : 0.85);
      gsap.set(cardEls, { x: 0, y: initialDrop, opacity: 0, rotation: -8, scale: 0.85, transformOrigin: '50% 85%' });
      gsap.set(['.hero-line', '.hero-description', '.hero-cta', '.hero-decoration'], { opacity: 0, y: 25 });
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' }, onComplete: () => {
        readyRef.current = true;
        introReady = true;
        startFloatMotion();
        enableObserver();
        ScrollTrigger.refresh();
      } });
      tl.addLabel('initial').to({}, { duration: 0.3 });
      tl.addLabel('firstCard').to(cardEls[2], { x: 0, y: 0, opacity: 1, rotation: 0, scale: 1, duration: 0.85 }, 'firstCard');
      tl.addLabel('headline', 'firstCard+=0.42').to('.hero-line', { y: 0, opacity: 1, duration: 0.65, stagger: 0.12 }, 'headline');
      tl.addLabel('description', 'headline+=0.4').to('.hero-description', { y: 0, opacity: 1, duration: 0.5 }, 'description').to('.hero-cta', { y: 0, opacity: 1, duration: 0.5, stagger: 0.13 }, 'description+=0.12');
      const order = [1, 3, 0, 4];
      tl.addLabel('fanSpread', 'description+=0.35');
      order.forEach((index, n) => {
        tl.to(cardEls[index], { ...fanPositions()[index], opacity: 1, scale: 1, duration: 1.05, ease: 'power3.out' }, `fanSpread+=${n * 0.13}`);
      });
      tl.addLabel('decorations', 'fanSpread+=1.05').to('.hero-decoration', { y: 0, opacity: 1, duration: 0.55, stagger: 0.11 }, 'decorations');
      tl.addLabel('completed');

      observer = Observer.create({
        target: window,
        type: 'wheel,touch',
        preventDefault: true,
        allowClicks: true,
        lockAxis: true,
        tolerance: 28,
        wheelSpeed: -1,
        onUp: () => {
          if (transitioning) return;
          if (state < 2) transitionTo(state + 1);
          else releasePin(1);
        },
        onDown: () => {
          if (transitioning) return;
          if (state > 0) transitionTo(state - 1);
          else releasePin(-1);
        },
      });
      observer.disable();

      pinTrigger = ScrollTrigger.create({
        trigger: story,
        start: 'top top',
        end: '+=100%',
        pin: true,
        anticipatePin: 1,
        onEnter: () => {
          pinActive = true;
          enableObserver();
        },
        onEnterBack: () => {
          pinActive = true;
          parallaxReleased = false;
          state = 2;
          setImmediateState(2);
          stopFloatMotion();
          transitioning = true;
          enableObserver();
          activeTimeline?.kill();
          activeTimeline = gsap.timeline({
            defaults: { ease: 'power3.inOut', overwrite: 'auto' },
            onComplete: () => {
              transitioning = false;
              enableObserver();
            },
          }).to(sectionThreeTransition, {
            y: 0,
            marginBottom: 0,
            duration: 0.7,
          });
        },
        onLeave: () => {
          pinActive = false;
          observer?.disable();
        },
        onLeaveBack: () => {
          pinActive = false;
          observer?.disable();
        },
      });

      const onResize = () => {
        if (!transitioning && introReady) setImmediateState(state);
        ScrollTrigger.refresh();
        if (parallaxReleased) {
          gsap.set(sectionThreeTransition, {
            y: -sectionThreeOffset(),
            marginBottom: -sectionThreeOffset(),
          });
        }
      };
      window.addEventListener('resize', onResize);
      return () => window.removeEventListener('resize', onResize);
    }, hero);

    // ── Section Three entrance & parallax ──
    const s3 = sectionThreeRef.current;
    const ctxThree = gsap.context(() => {
      if (!s3) return;
      const eyebrow = s3.querySelector<HTMLElement>('.s3-eyebrow');
      const titleRow = s3.querySelector<HTMLElement>('.s3-title-row');
      const videoWrap = s3.querySelector<HTMLElement>('.s3-video-wrap');
      const videoImage = s3.querySelector<HTMLElement>('.s3-video-img');
      if (!eyebrow || !titleRow || !videoWrap) return;

      if (reduced) {
        gsap.set([videoWrap, eyebrow, titleRow], { opacity: 1, y: 0, clipPath: 'inset(0% 0% 0% 0%)' });
        return;
      }

      gsap.set(videoWrap, { opacity: 0, y: 120, scale: 0.94, transformOrigin: 'center bottom' });
      gsap.set(eyebrow, { opacity: 0, y: 18 });
      gsap.set(titleRow, { opacity: 0, y: 40 });
      revealSectionThree = () => {
        if (sectionThreeRevealed) return;
        sectionThreeRevealed = true;
        const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
        tl.to(videoWrap, { opacity: 1, y: 0, scale: 1, duration: 1.05, ease: 'power2.out' });
        tl.to(eyebrow, { opacity: 1, y: 0, duration: 0.5 }, '-=0.68');
        tl.to(titleRow, { opacity: 1, y: 0, duration: 0.72 }, '-=0.42');
      };
      ScrollTrigger.create({
        trigger: s3,
        start: 'top 78%',
        once: true,
        onEnter: revealSectionThree,
      });

      // subtle parallax on scroll
      if (videoImage) gsap.to(videoImage, {
        yPercent: -4,
        ease: 'none',
        scrollTrigger: { trigger: s3, start: 'top bottom', end: 'bottom top', scrub: 0.8, invalidateOnRefresh: true },
      });
    });

    // ── Trusted-by section entrance ──
    const trusted = trustedRef.current;
    const ctxTrusted = gsap.context(() => {
      if (!trusted) return;
      const items = trusted.querySelectorAll<HTMLElement>('.trusted-eyebrow, .trusted-title, .trusted-description, .trusted-logos > *');
      if (reduced) {
        gsap.set(items, { opacity: 1, y: 0 });
        return;
      }
      gsap.set(items, { opacity: 0, y: 22 });
      ScrollTrigger.create({
        trigger: trusted,
        start: 'top 72%',
        once: true,
        onEnter: () => gsap.to(items, { opacity: 1, y: 0, duration: 0.65, stagger: 0.09, ease: 'power3.out' }),
      });
    });

    return () => {
      window.removeEventListener('pageshow', resetScrollToStart);
      window.history.scrollRestoration = previousScrollRestoration;
      observer?.kill();
      pinTrigger?.kill();
      activeTimeline?.kill();
      stopFloatMotion();
      ctx.revert();
      ctxThree.revert();
      ctxTrusted.revert();
      readyRef.current = false;
    };
  }, []);

  const onEnter = (index: number) => {
    if (!readyRef.current || storyRef.current?.classList.contains('is-scrolling') || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
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

  return <main><div className="story" ref={storyRef}>
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
            <div className="float-card" ref={(el) => { floatRefs.current[i] = el; }}><div className="card-face" ref={(el) => { hoverRefs.current[i] = el; }}><Image src={card.image} alt={card.alt} fill sizes="(max-width: 767px) 145px, (max-width: 1023px) 175px, 230px" priority={i === 2} className="card-image" /><div className="card-shade" /><div className="card-top"><span className="card-emblem">m<span>.</span></span><span>0{i + 1} / 05</span></div><div className="card-caption"><span className="card-category">{card.category}</span><strong>{card.title}</strong><span className="card-rule" style={{ backgroundColor: card.color }} /></div></div></div>
          </div>)}
        </div>
      </div>
      <div className="scroll-cue"><Mouse size={20} strokeWidth={1.25} /><span>SCROLL TO EXPLORE</span></div>
      <div className="hero-bottom"><span>CAPTURE THE FEELING</span><span>01 — EVERY MOMENT MATTERS</span></div>
    </section>
    <section className="section-two" ref={sectionRef} aria-labelledby="section-two-title"><div className="section-two-content"><p className="section-two-eyebrow">● &nbsp; TIGA PRODUK, SATU PENGALAMAN LENGKAP</p><h2 id="section-two-title">Rayakan setiap momen dengan <span>lebih mudah.</span></h2><p>Momentoku menghadirkan tiga produk yang saling terhubung untuk membuat setiap acara menjadi lebih berkesan, praktis, dan penuh makna.</p><a href="mailto:halo@momentoku.id?subject=Fitur%20Momentoku">Lihat Semua Fitur <ArrowRight size={17} /></a></div></section>
  </div>
  <div className="section-three-transition" ref={sectionThreeTransitionRef}>
  <section className="section-three" ref={sectionThreeRef} aria-labelledby="s3-title">
    <div className="s3-inner">

      {/* ── Header row ── */}
      <p className="s3-eyebrow">DIABADIKAN BERSAMA MOMENTOKU</p>
      <div className="s3-title-row">
        <h2 id="s3-title" className="s3-heading">Rayakan setiap<br />momen spesial.</h2>
        <span className="s3-handle" aria-hidden="true">@momentoku</span>
      </div>

      {/* ── Full-width image card ── */}
      <div className="s3-video-wrap">
        <div className="s3-video-frame" style={{ position: 'relative' }}>
          <Image src="/cards/travel.jpg" alt="Momen perjalanan bersama Momentoku" fill sizes="100vw" priority className="s3-video-img" />
          <div className="s3-video-shade" />

          {/* Logo mark top-left */}
          <div className="s3-mark" aria-hidden="true">
            <span className="s3-mark-a" />
            <span className="s3-mark-b" />
          </div>

          {/* Dots top-right */}
          <div className="s3-dots-top" aria-hidden="true">
            <span className="s3-dot s3-dot-active" />
            <span className="s3-dot" />
            <span className="s3-dot" />
          </div>

          {/* Play button center */}
          <button className="s3-play" aria-label="Tonton momen" type="button">
            <svg viewBox="0 0 24 24" fill="currentColor" width="26" height="26" aria-hidden="true"><path d="M8 5.14v14l11-7-11-7z"/></svg>
          </button>

          {/* Bottom bar: Watch left, arrows right */}
          <div className="s3-bar">
            <a className="s3-watch" href="mailto:halo@momentoku.id?subject=Lihat%20Momen">Watch</a>
            <div className="s3-arrows">
              <button type="button" aria-label="Sebelumnya" className="s3-arrow">
                <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><path d="M13 16l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
              <button type="button" aria-label="Berikutnya" className="s3-arrow">
                <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><path d="M7 4l6 6-6 6" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
            </div>
          </div>
        </div>
      </div>

    </div>
  </section>
  </div>
  <section className="trusted-section" ref={trustedRef} aria-labelledby="trusted-title">
    <div className="trusted-inner">
      <p className="trusted-eyebrow">DIPERCAYA UNTUK MOMEN BERARTI</p>
      <h2 id="trusted-title" className="trusted-title">Trusted by the best.</h2>
      <p className="trusted-description">Kami membantu pasangan, keluarga, dan komunitas merayakan cerita mereka dengan lebih berkesan.</p>
      <div className="trusted-logos" aria-label="Komunitas pengguna Momentoku">
        <span className="trusted-logo logo-serif">Momen<span>kita</span></span>
        <span className="trusted-logo logo-script">ruang cerita</span>
        <span className="trusted-logo logo-spaced">CERITA<span>·</span>KITA</span>
        <span className="trusted-logo logo-mono"><span className="logo-mark">✳</span> ruangtemu</span>
        <span className="trusted-logo logo-serif">Hari<span>Bahagia</span></span>
      </div>
      <div className="trusted-foot"><span>MADE FOR EVERY CHAPTER</span><span>05 — CERITA YANG TERUS BERLANJUT</span></div>
    </div>
  </section>
  </main>;
}

function ArrowUpRightIcon() { return <ArrowRight size={16} strokeWidth={1.8} className="header-arrow" />; }
