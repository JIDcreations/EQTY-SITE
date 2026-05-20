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

  const applyWorld = (sec, idx) => {
    const bg = sec.dataset.bg, fg = sec.dataset.fg, label = sec.dataset.label;
    gsap.to(document.body, {
      backgroundColor: bg, color: fg,
      duration: 1.05, ease: 'power2.out',
      overwrite: 'auto'
    });
    document.documentElement.style.setProperty('--bg', bg);
    document.documentElement.style.setProperty('--fg', fg);
    railLabel.textContent = label || '';
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
    scrollTrigger: { trigger: '.prob__shift', start: 'top 80%' }
  });
  gsap.from('.shift__rule', {
    scaleX: 0, transformOrigin: 'left center', duration: 1.2, ease: 'power3.out',
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
    scrollTrigger: { trigger: '.sec--what', start: 'top 72%' }
  });
  gsap.from('.what__stats .stat', {
    opacity: 0, y: 28, duration: 1.05, stagger: .1,
    scrollTrigger: { trigger: '.what__stats', start: 'top 78%' }
  });
  gsap.from('.not__list li', {
    opacity: 0, x: 30, duration: 0.95, stagger: .1,
    scrollTrigger: { trigger: '.not__list', start: 'top 78%' }
  });

  // Phone (in WHAT) intro + parallax inside its pin
  gsap.from('#phone .phone__shell', {
    opacity: 0, y: 60, scale: .92, rotateY: -10,
    duration: 1.2, ease: 'power3.out',
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
  steps.forEach((step, i) => {
    ScrollTrigger.create({
      trigger: '.sec--learning .pin-wrap--learning',
      start: `top+=${(i / steps.length) * 100}% top`,
      end:   `top+=${((i + 1) / steps.length) * 100}% top`,
      onEnter: () => activateLearningStep(step),
      onEnterBack: () => activateLearningStep(step)
    });
  });

  // Phone learn intro
  gsap.from('#phoneLearn .phone__shell', {
    opacity: 0, y: 50, scale: .95,
    duration: 1.1, ease: 'power3.out',
    scrollTrigger: { trigger: '.sec--learning', start: 'top 64%' }
  });
  gsap.from('.learn__h', {
    opacity: 0, y: 34, duration: 1.05,
    scrollTrigger: { trigger: '.sec--learning', start: 'top 68%' }
  });
  gsap.from('.lstep', {
    opacity: 0, y: 18, duration: 0.9, stagger: .06,
    scrollTrigger: { trigger: '.learn__steps', start: 'top 80%' }
  });

  /* ---------- 7. AI section ---------- */
  softSectionEnter('.ai__inner', '.sec--ai');
  gsap.from('.ai__h', { opacity: 0, y: 36, duration: 1.1, scrollTrigger: { trigger: '.ai__h', start: 'top 82%' } });
  gsap.from('.ai__card', { opacity: 0, y: 44, duration: 1, stagger: .1, scrollTrigger: { trigger: '.ai__grid', start: 'top 84%' } });
  gsap.from('.ai__foot', { opacity: 0, y: 26, duration: 1.05, scrollTrigger: { trigger: '.ai__foot', start: 'top 88%' } });

  /* ---------- 8. Philosophy section ---------- */
  softSectionEnter('.philo__inner', '.sec--philo');
  gsap.from('.philo__h', {
    opacity: 0, y: 40, duration: 1.1,
    scrollTrigger: { trigger: '.philo__h', start: 'top 82%' }
  });
  gsap.from('.philo__col--neg li', {
    opacity: 0, x: -30, duration: 0.95, stagger: .09,
    scrollTrigger: { trigger: '.philo__cols', start: 'top 80%' }
  });
  gsap.from('.philo__col--pos li', {
    opacity: 0, x: 30, duration: 0.95, stagger: .09,
    scrollTrigger: { trigger: '.philo__cols', start: 'top 80%' }
  });
  gsap.from('.philo__quote', {
    opacity: 0, scale: .94, y: 24, duration: 1.2,
    scrollTrigger: { trigger: '.philo__quote', start: 'top 84%' }
  });

  /* ---------- 9. Showcase: horizontal scroll ---------- */
  const rail2 = document.getElementById('showRail');
  if (rail2) {
    softSectionEnter('.show__head', '.sec--showcase', {
      y: 56,
      opacity: 0.3,
      end: 'top 40%'
    });
    const totalScroll = () => rail2.scrollWidth - window.innerWidth + 80;
    gsap.to(rail2, {
      x: () => -totalScroll(),
      ease: 'none',
      scrollTrigger: {
        trigger: '.sec--showcase',
        start: 'top top',
        end: () => `+=${totalScroll() + window.innerHeight * 0.35}`,
        scrub: 1.15,
        pin: '.show__track',
        invalidateOnRefresh: true
      }
    });
    gsap.from('.show__card', {
      opacity: 0,
      y: 42,
      scale: 0.97,
      duration: 1,
      stagger: 0.08,
      scrollTrigger: { trigger: '.show__track', start: 'top 78%' }
    });
    gsap.from('.show__h', {
      opacity: 0, y: 30, duration: 1.05,
      scrollTrigger: { trigger: '.show__head', start: 'top 82%' }
    });
  }

  /* ---------- 10. Brand grid ---------- */
  softSectionEnter('.brand__inner', '.sec--brand');
  gsap.from('.brand__h', { opacity: 0, y: 34, duration: 1.05, scrollTrigger: { trigger: '.brand__h', start: 'top 82%' } });
  gsap.from('.brand__cell', { opacity: 0, y: 24, duration: 0.95, stagger: .07, scrollTrigger: { trigger: '.brand__grid', start: 'top 84%' } });

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
    scrollTrigger: { trigger: '.vision__sub', start: 'top 88%' }
  });

  /* ---------- 12. CTA ---------- */
  softSectionEnter('.cta__inner', '.sec--cta', {
    y: 54,
    opacity: 0.36,
    end: 'top 42%'
  });
  gsap.from('.cta__h', { opacity: 0, scale: .94, scrollTrigger: { trigger: '.cta__h', start: 'top 82%' }, duration: 1.2, ease: 'power3.out' });
  gsap.from('.cta__sub', { opacity: 0, y: 24, duration: 1.05, scrollTrigger: { trigger: '.cta__sub', start: 'top 88%' } });
  gsap.from('.cta__form', { opacity: 0, y: 30, duration: 1.1, scrollTrigger: { trigger: '.cta__form', start: 'top 88%' } });
  gsap.from('.foot > *', { opacity: 0, y: 20, duration: 0.9, stagger: .1, scrollTrigger: { trigger: '.foot', start: 'top 92%' } });

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

    screens.forEach(screen => {
      gsap.killTweensOf(screen);
      if (screen !== currentScreen && screen !== nextScreen) {
        screen.classList.remove('is-on');
        gsap.set(screen, { autoAlpha: 0, scale: 0.965, y: 0, clearProps: 'zIndex' });
      }
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
      switchTl.to(phoneShell, {
        rotateY: '+=4',
        duration: 0.22,
        yoyo: true,
        repeat: 1,
        ease: 'power1.inOut'
      }, 0);
    }
  }

  function activateLearningStep(step) {
    steps.forEach(s => s.classList.remove('on'));
    step.classList.add('on');
    switchScreen('#phoneLearn', step.dataset.target);
  }

  // Refresh after fonts load (Filson Pro / Inter) to remeasure pin offsets
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => ScrollTrigger.refresh());
  }
  window.addEventListener('load', () => ScrollTrigger.refresh());
})();
