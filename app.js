/* =========================================================
   EQTY — scroll choreography
   ========================================================= */
(() => {
  gsap.registerPlugin(ScrollTrigger);
  gsap.defaults({
    ease: 'power3.out',
    duration: 1,
    overwrite: 'auto'
  });
  ScrollTrigger.config({
    ignoreMobileResize: true
  });
  const screenSwitchTimelines = new WeakMap();
  const isWideScreen = window.matchMedia('(min-width: 1024px)').matches;

  initPremiumScroll();
  initCustomCursor();
  initCardTilt();
  initMagneticCTA();

  const softSectionEnter = (target, trigger = target, options = {}) => {
    const {
      y = 64,
      opacity = 0.24,
      start = 'top bottom',
      end = 'top 35%',
      scrub = 1.05
    } = options;

    gsap.fromTo(target, {
      y,
      opacity
    }, {
      y: 0,
      opacity: 1,
      ease: 'none',
      scrollTrigger: {
        trigger,
        start,
        end,
        scrub
      }
    });
  };

  /* ---------- 0. Clone the phone into the learning section ---------- */
  const phoneEl = document.getElementById('phone');
  const learnSlot = document.querySelector('.learn__phone-slot');
  const learnPhone = phoneEl.cloneNode(true);
  learnPhone.id = 'phoneLearn';
  const learningImageScreens = [
    { name: 'onb', src: 'assets/Frames/Section-3/1-Onboarding.png', alt: 'Onboarding screen preview' },
    { name: 'lessons', src: 'assets/Frames/Section-3/2-Lesson_overview.png', alt: 'Lesson overview screen preview' },
    { name: 'swipe', src: 'assets/Frames/Section-3/3-Visualisatie.png', alt: 'Visualisation screen preview' },
    { name: 'glossary', src: 'assets/Frames/Section-3/4-Glossary.png', alt: 'Glossary screen preview' },
    { name: 'reflect', src: 'assets/Frames/Section-3/5-Reflectie.png', alt: 'Reflection screen preview' },
    { name: 'done', src: 'assets/Frames/Section-3/6-succes.png', alt: 'Success screen preview' },
  ];
  const learnScreenHost = learnPhone.querySelector('.phone__screen');
  if (learnScreenHost) {
    learnScreenHost.innerHTML = learningImageScreens.map(({ name, src, alt }, index) => `
      <div class="screen screen--image${index === 0 ? ' is-on' : ''}" data-screen="${name}" aria-label="${alt}">
        <img class="screen__img" src="${src}" alt="${alt}">
      </div>
    `).join('');
  }
  learnPhone.classList.add('phone--image-mode');
  learnSlot.appendChild(learnPhone);

  /* ---------- 1. Nav background on scroll ---------- */
  const nav = document.getElementById('nav');
  ScrollTrigger.create({
    start: 60, end: 999999,
    onUpdate: self => nav.classList.toggle('is-scrolled', self.scroll() > 60),
    onToggle: self => nav.classList.toggle('is-scrolled', self.isActive)
  });

  /* ---------- 2. Color world transitions per section ---------- */
  const sections = gsap.utils.toArray('.sec');
  const rail = document.getElementById('railDot');
  const railLabel = document.getElementById('railLabel');
  const secondaryTextByFg = {
    '#111317': 'rgba(17, 19, 23, 0.55)',
    '#F2F4F6': 'rgba(242, 244, 246, 0.55)'
  };
  const ruleByFg = {
    '#111317': 'rgba(17, 19, 23, 0.12)',
    '#F2F4F6': 'rgba(242, 244, 246, 0.12)'
  };
  const setRailLabel = (label = '') => {
    const [num = '', text = ''] = label.split('·').map(part => part.trim());
    railLabel.innerHTML = `
      <span class="rail__label-num">${num}</span>
      <span class="rail__label-text">${text}</span>
    `;
  };

  const applyWorld = (sec, idx) => {
    const bg = sec.dataset.bg, fg = sec.dataset.fg, label = sec.dataset.label;
    const fgDim = sec.dataset.fgDim || secondaryTextByFg[fg] || secondaryTextByFg['#F2F4F6'];
    const rule = sec.dataset.rule || ruleByFg[fg] || ruleByFg['#F2F4F6'];
    gsap.to(document.body, {
      backgroundColor: bg, color: fg,
      duration: 1.05, ease: 'power2.out',
      overwrite: 'auto'
    });
    document.documentElement.style.setProperty('--bg', bg);
    document.documentElement.style.setProperty('--fg', fg);
    document.documentElement.style.setProperty('--fg-dim', fgDim);
    document.documentElement.style.setProperty('--rule', rule);
    document.documentElement.style.setProperty('--cursor-col', bg === '#FFD500' ? fg : '#FFD500');
    setRailLabel(label);
    gsap.to(rail, { top: `calc(50% - 110px + ${(idx / (sections.length - 1)) * 220}px)`, duration: .85, ease: 'power2.out', overwrite: 'auto' });
  };

  sections.forEach((sec, idx) => {
    ScrollTrigger.create({
      trigger: sec,
      start: 'top 50%',
      end: 'bottom 50%',
      onEnter:     () => applyWorld(sec, idx),
      onEnterBack: () => applyWorld(sec, idx)
    });
  });

  // Initial paint
  if (sections[0]) applyWorld(sections[0], 0);

  /* ---------- 3. Hero entrance ---------- */
  gsap.set('.hero__line > span', { y: '110%' });
  const heroTl = gsap.timeline({ delay: .2 });
  heroTl
    .to('.hero__line > span', { y: '0%', duration: 1.0, ease: 'power3.out', stagger: .12 })
    .from('.eyebrow', { opacity: 0, y: 20, duration: .6 }, 0)
    .from('.hero__sub', { opacity: 0, y: 20, duration: .6 }, .8)
    .from('.hero__cta > *', { opacity: 0, y: 20, duration: .5, stagger: .1 }, 1);

  // Hero parallax on scroll — drift the 3D scene + content
  gsap.to('.hv2-scene', {
    yPercent: -18,
    scale: 1.04,
    ease: 'none',
    scrollTrigger: { trigger: '.sec--hero', start: 'top top', end: 'bottom top', scrub: 1.15 }
  });
  gsap.to('.hv2-content', {
    yPercent: -8,
    opacity: 0,
    ease: 'none',
    scrollTrigger: { trigger: '.sec--hero', start: 'top top', end: 'bottom top', scrub: 1.15 }
  });

  /* ---------- 4. Problem section — platform cycling ---------- */
  softSectionEnter('.prob__stage .prob__inner', '.pin-wrap--problem', {
    y: 72,
    opacity: 0.4,
    end: 'top 30%',
    scrub: 1.1
  });

  // Headline em reveal
  gsap.utils.toArray('.prob__h .line > *').forEach(el => {
    gsap.set(el, { yPercent: 110 });
    gsap.to(el, { yPercent: 0, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 80%' } });
  });

  // Word stack — each word scrubs in as it enters the viewport
  gsap.utils.toArray('.prob__word').forEach(el => {
    gsap.to(el, {
      opacity: 1, y: 0,
      duration: 0.9, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 85%', end: 'top 40%', scrub: 0.5 }
    });
  });
  gsap.from('.prob__shift', {
    opacity: 0, y: 30,
    immediateRender: false,
    scrollTrigger: { trigger: '.prob__shift', start: 'top 80%' }
  });
  gsap.from('.shift__rule', {
    scaleX: 0, transformOrigin: 'left center', duration: 1.2, ease: 'power3.out',
    immediateRender: false,
    scrollTrigger: { trigger: '.prob__shift', start: 'top 75%' }
  });

  // Platform word cycling
  const platforms = [
    { text: 'TikTok.',    color: '#FFD500' },
    { text: 'Instagram.', color: '#FFD500' },
    { text: 'YouTube.',   color: '#FFD500' },
  ];
  const platformEl = document.querySelector('.prob__platform');
  if (platformEl) {
    platformEl.innerHTML = platforms
      .map(({ text }) => `<span class="prob__platform-word">${text}</span>`)
      .join('');

    const platformWords = Array.from(platformEl.querySelectorAll('.prob__platform-word'));

    const setPlatformWidth = () => {
      platformEl.style.width = 'auto';
      const maxWidth = Math.max(...platformWords.map(word => word.getBoundingClientRect().width));
      platformEl.style.width = `${Math.ceil(maxWidth)}px`;
    };

    setPlatformWidth();
    ScrollTrigger.addEventListener('refreshInit', setPlatformWidth);

    gsap.set(platformEl, { color: platforms[0].color });
    gsap.set(platformWords, { yPercent: 115, opacity: 0 });
    gsap.set(platformWords[0], { yPercent: 0, opacity: 1 });

    const platformTl = gsap.timeline({
      scrollTrigger: {
        trigger: '.pin-wrap--problem',
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1.2
      }
    });

    platforms.forEach((platform, index) => {
      if (index === 0) return;

      platformTl
        .to(platformWords[index - 1], {
          yPercent: -115,
          opacity: 0,
          duration: 1,
          ease: 'power2.inOut'
        })
        .fromTo(platformWords[index], {
          yPercent: 115,
          opacity: 0
        }, {
          yPercent: 0,
          opacity: 1,
          duration: 1,
          ease: 'power2.inOut'
        }, '<')
        .to(platformEl, {
          color: platform.color,
          duration: 1,
          ease: 'power2.inOut'
        }, '<');
    });

    platformTl
      .to(platformWords[platformWords.length - 1], {
        yPercent: -115,
        opacity: 0,
        duration: 1,
        ease: 'power2.inOut'
      })
      .fromTo(platformWords[0], {
        yPercent: 115,
        opacity: 0
      }, {
        yPercent: 0,
        opacity: 1,
        duration: 1,
        ease: 'power2.inOut'
      }, '<')
      .to(platformEl, {
        color: platforms[0].color,
        duration: 1,
        ease: 'power2.inOut'
      }, '<');
  }

  /* ---------- 5. WHAT section: stats + not-list reveal ---------- */
  softSectionEnter('.sec--what .pin-stage', '.sec--what', {
    y: 72,
    opacity: 0.28
  });
  gsap.from('.what__h', {
    opacity: 0, y: 40,
    duration: 1.15,
    immediateRender: false,
    scrollTrigger: { trigger: '.sec--what', start: 'top 72%' }
  });
  gsap.from('.what__stats .stat', {
    opacity: 0, y: 28, duration: 1.05, stagger: .1,
    immediateRender: false,
    scrollTrigger: { trigger: '.what__stats', start: 'top 78%' }
  });
  gsap.from('.not__list li', {
    opacity: 0, x: 30, duration: 0.95, stagger: .1,
    immediateRender: false,
    scrollTrigger: { trigger: '.not__list', start: 'top 78%' }
  });

  // Phone (in WHAT) intro + parallax inside its pin
  gsap.from('#phone .phone__shell', {
    opacity: 0, y: 60, scale: .92, rotateY: -10,
    duration: 1.2, ease: 'power3.out',
    immediateRender: false,
    scrollTrigger: { trigger: '.sec--what', start: 'top 70%' }
  });
  // Subtle phone Y drift while pinned
  gsap.to('#phone .phone__shell', {
    rotateY: 8,
    ease: 'none',
    scrollTrigger: { trigger: '.sec--what .pin-wrap', start: 'top top', end: 'bottom bottom', scrub: true }
  });
  // Cycle 2-3 screens in WHAT section
  const whatScreens = ['what-lessonoverview', 'what-bronnen', 'what-praktischeoefening'];
  const whatScreenSpan = 60;
  whatScreens.forEach((s, i) => {
    ScrollTrigger.create({
      trigger: '.sec--what .pin-wrap',
      start: `top+=${(i / whatScreens.length) * whatScreenSpan}% top`,
      end:   `top+=${((i + 1) / whatScreens.length) * whatScreenSpan}% top`,
      onEnter: () => switchScreen('#phone', s),
      onEnterBack: () => switchScreen('#phone', s)
    });
  });

  /* ---------- 6. LEARNING section: phone screen swap on scroll ---------- */
  softSectionEnter('.learn__layout', '.sec--learning', {
    y: 70,
    opacity: 0.26
  });
  const steps = gsap.utils.toArray('.lstep');
  const learningTrigger = '.sec--learning .pin-wrap--learning';
  const learningScrollSpan = 0.82;
  steps.forEach(step => {
    step.setAttribute('aria-pressed', step.classList.contains('on') ? 'true' : 'false');
    step.addEventListener('click', () => activateLearningStep(step));
    step.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        activateLearningStep(step);
      }
    });
  });

  // Mobile: inject screenshot below each step card + activate on scroll
  if (!isWideScreen) {
    steps.forEach(step => {
      const screenData = learningImageScreens.find(s => s.name === step.dataset.target);
      if (!screenData) return;
      const img = document.createElement('img');
      img.src = screenData.src;
      img.alt = screenData.alt;
      img.className = 'lstep__preview';
      step.insertAdjacentElement('afterend', img);
    });

    const stepObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const step = steps.find(s => s === entry.target);
        if (step) activateLearningStep(step);
      });
    }, { rootMargin: '-20% 0px -50% 0px', threshold: 0 });

    steps.forEach(step => stepObserver.observe(step));
  }
  if (isWideScreen) {
    ScrollTrigger.create({
      trigger: learningTrigger,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: self => {
        const progress = Math.min(self.progress / learningScrollSpan, 0.999999);
        const nextIndex = Math.floor(progress * steps.length);
        activateLearningStep(steps[nextIndex]);
      },
      onLeaveBack: () => activateLearningStep(steps[0], { force: true })
    });
  }

  // Phone learn intro
  gsap.from('#phoneLearn .phone__shell', {
    opacity: 0, y: 50, scale: .95,
    duration: 1.1, ease: 'power3.out',
    immediateRender: false,
    scrollTrigger: { trigger: '.sec--learning', start: 'top 64%' }
  });
  gsap.from('.learn__h', {
    opacity: 0, y: 34, duration: 1.05,
    immediateRender: false,
    scrollTrigger: { trigger: '.sec--learning', start: 'top 68%' }
  });
  gsap.from('.lstep', {
    opacity: 0, y: 18, duration: 0.9, stagger: .06,
    immediateRender: false,
    scrollTrigger: { trigger: '.learn__steps', start: 'top 80%' }
  });

  /* ---------- 7. AI section ---------- */
  softSectionEnter('.ai__inner', '.sec--ai');
  gsap.from('.ai__h', { opacity: 0, y: 36, duration: 1.1, immediateRender: false, scrollTrigger: { trigger: '.ai__h', start: 'top 82%' } });
  gsap.from('.ai__card', { opacity: 0, y: 28, duration: 0.9, immediateRender: false, scrollTrigger: { trigger: '.ai__grid', start: 'top 84%' } });
  gsap.from('.ai__foot', { opacity: 0, y: 26, duration: 1.05, immediateRender: false, scrollTrigger: { trigger: '.ai__foot', start: 'top 88%' } });

  /* ---------- 8. Philosophy section ---------- */
  softSectionEnter('.philo__inner', '.sec--philo');
  gsap.from('.philo__h', {
    opacity: 0, y: 40, duration: 1.1,
    immediateRender: false,
    scrollTrigger: { trigger: '.philo__h', start: 'top 82%' }
  });
  gsap.from('.philo__col--neg li', {
    opacity: 0, x: -30, duration: 0.95, stagger: .09,
    immediateRender: false,
    scrollTrigger: { trigger: '.philo__cols', start: 'top 80%' }
  });
  gsap.from('.philo__col--pos li', {
    opacity: 0, x: 30, duration: 0.95, stagger: .09,
    immediateRender: false,
    scrollTrigger: { trigger: '.philo__cols', start: 'top 80%' }
  });
  gsap.from('.philo__quote', {
    opacity: 0, scale: .94, y: 24, duration: 1.2,
    immediateRender: false,
    scrollTrigger: { trigger: '.philo__quote', start: 'top 84%' }
  });

  /* ---------- 9. Showcase: horizontal scroll (desktop only) ---------- */
  const rail2 = document.getElementById('showRail');
  if (rail2) {
    softSectionEnter('.show__head', '.sec--showcase', {
      y: 56,
      opacity: 0.3,
      end: 'top 40%'
    });
    if (isWideScreen) {
      const totalScroll = () => rail2.scrollWidth - window.innerWidth + 80;
      gsap.timeline({
        scrollTrigger: {
          trigger: '.sec--showcase',
          start: 'top top',
          end: () => `+=${totalScroll() + window.innerHeight * 1.5}`,
          scrub: 1.15,
          pin: '.show__track',
          invalidateOnRefresh: true
        }
      })
      .to(rail2, { x: () => -totalScroll(), ease: 'none', duration: 1 })
      .to({}, { duration: 1.5 });
    }
    gsap.from('.show__card', {
      opacity: 0,
      y: 42,
      scale: 0.97,
      duration: 1,
      stagger: 0.08,
      immediateRender: false,
      scrollTrigger: { trigger: '.show__track', start: 'top 78%' }
    });
    gsap.from('.show__h', {
      opacity: 0, y: 30, duration: 1.05,
      immediateRender: false,
      scrollTrigger: { trigger: '.show__head', start: 'top 82%' }
    });
  }

  /* ---------- 10. Brand grid ---------- */
  softSectionEnter('.brand__inner', '.sec--brand');
  gsap.from('.brand__h', { opacity: 0, y: 34, duration: 1.05, immediateRender: false, scrollTrigger: { trigger: '.brand__h', start: 'top 82%' } });
  gsap.from('.brand__cell', { opacity: 0, y: 24, duration: 0.95, stagger: .07, immediateRender: false, scrollTrigger: { trigger: '.brand__grid', start: 'top 84%' } });

  /* ---------- 11. Vision lines ---------- */
  softSectionEnter('.vision__inner', '.sec--vision');
  gsap.utils.toArray('.vline').forEach((line, i) => {
    gsap.to(line, {
      opacity: 1, y: 0,
      duration: 1.05, ease: 'power3.out',
      scrollTrigger: { trigger: line, start: 'top 82%' }
    });
  });
  gsap.from('.vision__sub', {
    opacity: 0, y: 24, duration: 1.05,
    immediateRender: false,
    scrollTrigger: { trigger: '.vision__sub', start: 'top 88%' }
  });

  /* ---------- 12. CTA ---------- */
  softSectionEnter('.cta__inner', '.sec--cta', {
    y: 54,
    opacity: 0.36,
    end: 'top 42%'
  });
  gsap.from('.cta__h', { opacity: 0, scale: .94, immediateRender: false, scrollTrigger: { trigger: '.cta__h', start: 'top 82%' }, duration: 1.2, ease: 'power3.out' });
  gsap.from('.cta__sub', { opacity: 0, y: 24, duration: 1.05, immediateRender: false, scrollTrigger: { trigger: '.cta__sub', start: 'top 88%' } });
  gsap.from('.cta__form', { opacity: 0, y: 30, duration: 1.1, immediateRender: false, scrollTrigger: { trigger: '.cta__form', start: 'top 88%' } });
  gsap.from('.foot > *', { opacity: 0, y: 20, duration: 0.9, stagger: .1, immediateRender: false, scrollTrigger: { trigger: '.foot', start: 'top 92%' } });

  /* ---------- Helpers ---------- */
  function switchScreen(phoneSel, name) {
    const phone = document.querySelector(phoneSel);
    if (!phone) return;
    const screens = Array.from(phone.querySelectorAll('.screen'));
    const nextScreen = screens.find(screen => screen.dataset.screen === name);
    if (!nextScreen) return;

    const currentScreen = screens.find(screen => screen.classList.contains('is-on'));
    const phoneShell = phone.querySelector('.phone__shell');

    if (currentScreen === nextScreen) {
      phone.classList.toggle('phone--image-mode', nextScreen.classList.contains('screen--image'));
      return;
    }

    phone.classList.toggle('phone--image-mode', nextScreen.classList.contains('screen--image'));

    const activeTimeline = screenSwitchTimelines.get(phone);
    if (activeTimeline) {
      activeTimeline.kill();
      screenSwitchTimelines.delete(phone);
    }

    screens.forEach(screen => {
      gsap.killTweensOf(screen);
      screen.classList.remove('is-on');
      gsap.set(screen, { autoAlpha: 0, scale: 0.965, y: 0, clearProps: 'zIndex' });
    });

    if (currentScreen) {
      currentScreen.classList.add('is-on');
      gsap.set(currentScreen, { autoAlpha: 1, scale: 1, y: 0, zIndex: 2 });
    }

    nextScreen.classList.add('is-on');
    gsap.set(nextScreen, { autoAlpha: 0, scale: 1.025, y: 18, zIndex: 3 });

    const switchTl = gsap.timeline({
      defaults: {
        ease: 'power2.inOut'
      },
      onComplete: () => {
        screens.forEach(screen => {
          const isActive = screen === nextScreen;
          screen.classList.toggle('is-on', isActive);
          gsap.set(screen, {
            autoAlpha: isActive ? 1 : 0,
            scale: isActive ? 1 : 0.965,
            y: 0,
            clearProps: 'zIndex'
          });
        });
        screenSwitchTimelines.delete(phone);
      }
    });

    if (currentScreen) {
      switchTl.to(currentScreen, {
        autoAlpha: 0,
        scale: 0.975,
        y: -14,
        duration: 0.38
      }, 0);
    }

    switchTl.to(nextScreen, {
      autoAlpha: 1,
      scale: 1,
      y: 0,
      duration: 0.54
    }, currentScreen ? 0.08 : 0);

    if (phoneShell) {
      gsap.killTweensOf(phoneShell);
      switchTl.to(phoneShell, {
        rotateY: '+=4',
        duration: 0.22,
        yoyo: true,
        repeat: 1,
        ease: 'power1.inOut'
      }, 0);
    }

    screenSwitchTimelines.set(phone, switchTl);
  }

  function activateLearningStep(step, options = {}) {
    const { force = false } = options;
    if (!step) return;
    if (!force && step.classList.contains('on')) return;
    steps.forEach(s => s.classList.remove('on'));
    step.classList.add('on');
    steps.forEach(s => s.setAttribute('aria-pressed', s === step ? 'true' : 'false'));
    switchScreen('#phoneLearn', step.dataset.target);
  }

  // Refresh after fonts load (Filson Pro / Inter) to remeasure pin offsets
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => ScrollTrigger.refresh());
  }
  window.addEventListener('load', () => ScrollTrigger.refresh());

  /* ---------- Custom cursor ---------- */
  function initCustomCursor() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

    const dotWrap  = document.createElement('div');
    dotWrap.className = 'cur';
    dotWrap.innerHTML = '<div class="cur__dot"></div>';

    const ringWrap = document.createElement('div');
    ringWrap.className = 'cur-ring';
    ringWrap.innerHTML = '<div class="cur-ring__track"></div>';

    document.body.append(dotWrap, ringWrap);
    document.body.classList.add('has-custom-cursor');

    const setDotX  = gsap.quickSetter(dotWrap,  'x', 'px');
    const setDotY  = gsap.quickSetter(dotWrap,  'y', 'px');
    const setRingX = gsap.quickSetter(ringWrap, 'x', 'px');
    const setRingY = gsap.quickSetter(ringWrap, 'y', 'px');

    let mx = -200, my = -200, rx = -200, ry = -200, raf = 0;

    window.addEventListener('mousemove', e => {
      mx = e.clientX; my = e.clientY;
      setDotX(mx); setDotY(my);
      if (!raf) raf = requestAnimationFrame(ringTick);
    }, { passive: true });

    function ringTick() {
      rx += (mx - rx) * 0.11;
      ry += (my - ry) * 0.11;
      setRingX(rx); setRingY(ry);
      raf = (Math.abs(mx - rx) + Math.abs(my - ry) > 0.05)
        ? requestAnimationFrame(ringTick)
        : 0;
    }

    const HOVER_SEL = 'a, button, .btn, .lstep, .ai__card, [role="button"]';
    document.addEventListener('mouseover', e => {
      if (e.target.closest(HOVER_SEL)) document.body.classList.add('cur-hover');
    }, { passive: true });
    document.addEventListener('mouseout', e => {
      if (e.target.closest(HOVER_SEL)) document.body.classList.remove('cur-hover');
    }, { passive: true });

    window.addEventListener('mousedown', () => document.body.classList.add('cur-click'), { passive: true });
    window.addEventListener('mouseup',   () => document.body.classList.remove('cur-click'), { passive: true });
  }

  /* ---------- AI card 3D tilt on hover ---------- */
  function initCardTilt() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

    document.querySelectorAll('.ai__card').forEach(card => {
      card.addEventListener('mousemove', e => {
        const r  = card.getBoundingClientRect();
        const nx = ((e.clientX - r.left) / r.width  - 0.5) * 2;
        const ny = ((e.clientY - r.top)  / r.height - 0.5) * 2;
        gsap.to(card, {
          rotateY:  nx * 6,
          rotateX: -ny * 5,
          transformPerspective: 700,
          ease: 'power3.out',
          duration: 0.5,
          overwrite: 'auto'
        });
      });
      card.addEventListener('mouseleave', () => {
        gsap.to(card, {
          rotateY: 0, rotateX: 0,
          ease: 'power3.out',
          duration: 0.8,
          overwrite: 'auto'
        });
      });
    });
  }

  /* ---------- Magnetic nav CTA ---------- */
  function initMagneticCTA() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

    document.querySelectorAll('.nav__cta').forEach(el => {
      el.addEventListener('mousemove', e => {
        const r  = el.getBoundingClientRect();
        const dx = (e.clientX - (r.left + r.width  / 2)) * 0.28;
        const dy = (e.clientY - (r.top  + r.height / 2)) * 0.28;
        gsap.to(el, { x: dx, y: dy, duration: 0.4, ease: 'power2.out', overwrite: 'auto' });
      });
      el.addEventListener('mouseleave', () => {
        gsap.to(el, { x: 0, y: 0, duration: 0.8, ease: 'elastic.out(1, 0.45)', overwrite: 'auto' });
      });
    });
  }

  /* ---------- Mobile nav hamburger ---------- */
  (() => {
    const toggle = document.querySelector('.nav__toggle');
    const navEl2 = document.getElementById('nav');
    if (!toggle || !navEl2) return;
    toggle.addEventListener('click', () => {
      const open = navEl2.classList.toggle('nav--open');
      toggle.setAttribute('aria-expanded', open);
      document.body.style.overflow = open ? 'hidden' : '';
    });
    document.querySelectorAll('.nav__links a').forEach(link => {
      link.addEventListener('click', () => {
        navEl2.classList.remove('nav--open');
        toggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });
  })();

  function initPremiumScroll() {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const supportsFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    if (prefersReducedMotion || !supportsFinePointer) return;

    let currentY = window.scrollY;
    let targetY = currentY;
    let rafId = 0;
    let syncingToScroll = false;

    const getMaxScroll = () => Math.max(
      0,
      document.documentElement.scrollHeight - window.innerHeight
    );

    const clampTarget = value => gsap.utils.clamp(0, getMaxScroll(), value);

    const hasScrollableParent = (node, deltaY) => {
      let current = node instanceof Element ? node : null;

      while (current && current !== document.body) {
        const style = window.getComputedStyle(current);
        const canScroll = /(auto|scroll|overlay)/.test(style.overflowY);
        if (canScroll && current.scrollHeight > current.clientHeight + 2) {
          const { scrollTop, scrollHeight, clientHeight } = current;
          const scrollingDown = deltaY > 0;
          const scrollingUp = deltaY < 0;

          if ((scrollingDown && scrollTop + clientHeight < scrollHeight - 1) ||
              (scrollingUp && scrollTop > 1)) {
            return true;
          }
        }
        current = current.parentElement;
      }

      return false;
    };

    const startTick = () => {
      if (!rafId) rafId = window.requestAnimationFrame(tick);
    };

    const tick = () => {
      const delta = targetY - currentY;
      const distance = Math.abs(delta);
      const ease = distance > 180 ? 0.13 : 0.18;

      currentY += delta * ease;
      if (distance < 0.35) currentY = targetY;

      syncingToScroll = true;
      window.scrollTo(0, currentY);
      ScrollTrigger.update();
      syncingToScroll = false;

      if (currentY !== targetY) {
        rafId = window.requestAnimationFrame(tick);
        return;
      }

      rafId = 0;
    };

    const queueScrollTo = value => {
      targetY = clampTarget(value);
      currentY = window.scrollY;
      startTick();
    };

    window.addEventListener('wheel', event => {
      if (
        event.defaultPrevented ||
        event.ctrlKey ||
        event.metaKey ||
        Math.abs(event.deltaX) > Math.abs(event.deltaY) ||
        hasScrollableParent(event.target, event.deltaY)
      ) {
        return;
      }

      event.preventDefault();

      const deltaScale = event.deltaMode === 1
        ? 18
        : event.deltaMode === 2
          ? window.innerHeight
          : 1;

      queueScrollTo(targetY + (event.deltaY * deltaScale));
    }, { passive: false });

    window.addEventListener('scroll', () => {
      if (syncingToScroll || rafId) return;
      currentY = window.scrollY;
      targetY = currentY;
    }, { passive: true });

    window.addEventListener('resize', () => {
      targetY = clampTarget(targetY);
      currentY = clampTarget(window.scrollY);
    }, { passive: true });

    document.querySelectorAll('a[href^="#"]').forEach(link => {
      link.addEventListener('click', event => {
        const href = link.getAttribute('href');
        if (!href || href === '#') return;

        const section = document.querySelector(href);
        if (!section) return;

        event.preventDefault();
        const navOffset = 20;
        const top = section.getBoundingClientRect().top + window.scrollY - navOffset;
        queueScrollTo(top);
        window.history.pushState(null, '', href);
      });
    });
  }
})();

/* ---- Launch video modal ---- */
(() => {
  const btn   = document.getElementById('launchBtn');
  const modal = document.getElementById('launchModal');
  const close = document.getElementById('launchClose');
  const video = document.getElementById('launchVideo');

  function openModal() {
    modal.hidden = false;
    requestAnimationFrame(() => modal.style.opacity = '');
    video.play();
    document.body.style.overflow = 'hidden';
    close.focus();
  }

  function closeModal() {
    video.pause();
    video.currentTime = 0;
    modal.hidden = true;
    document.body.style.overflow = '';
    btn.focus();
  }

  btn.addEventListener('click', openModal);
  close.addEventListener('click', closeModal);
  modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !modal.hidden) closeModal(); });
})();
