/* =========================================================
   EQTY — scroll choreography
   ========================================================= */
(() => {
  gsap.registerPlugin(ScrollTrigger);

  /* ---------- 0. Clone the phone into the learning section ---------- */
  const phoneEl = document.getElementById('phone');
  const learnSlot = document.querySelector('.learn__phone-slot');
  const learnPhone = phoneEl.cloneNode(true);
  learnPhone.id = 'phoneLearn';
  // reset cloned phone to the learning flow's default screen
  learnPhone.querySelectorAll('.screen').forEach(s => s.classList.toggle('is-on', s.dataset.screen === 'lessons'));
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
      duration: .8, ease: 'power2.inOut',
      overwrite: 'auto'
    });
    document.documentElement.style.setProperty('--bg', bg);
    document.documentElement.style.setProperty('--fg', fg);
    railLabel.textContent = label || '';
    gsap.to(rail, { top: `calc(50% - 110px + ${(idx / (sections.length - 1)) * 220}px)`, duration: .6, ease: 'power2.out', overwrite: 'auto' });
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
    scrollTrigger: { trigger: '.sec--hero', start: 'top top', end: 'bottom top', scrub: true }
  });
  gsap.to('.hv2-content', {
    yPercent: -8,
    opacity: 0,
    ease: 'none',
    scrollTrigger: { trigger: '.sec--hero', start: 'top top', end: 'bottom top', scrub: true }
  });

  /* ---------- 4. Problem section — platform cycling ---------- */
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
    { text: 'Instagram.', color: '#E1306C' },
    { text: 'YouTube.',   color: '#FF0000' },
  ];
  const platformEl = document.querySelector('.prob__platform');

  function swapPlatform(idx) {
    const { text, color } = platforms[idx];
    gsap.killTweensOf(platformEl);
    gsap.to(platformEl, {
      opacity: 0,
      duration: 0.25,
      ease: 'power2.in',
      onComplete: () => {
        platformEl.textContent = text;
        gsap.to(platformEl, { opacity: 1, color, duration: 0.4, ease: 'power3.out' });
      }
    });
  }

  [
    { at: '25%', enter: 1, back: 0 },
    { at: '50%', enter: 2, back: 1 },
    { at: '75%', enter: 0, back: 2 },
  ].forEach(({ at, enter, back }) => {
    ScrollTrigger.create({
      trigger: '.pin-wrap--problem',
      start: `top+=${at} top`,
      onEnter:     () => swapPlatform(enter),
      onLeaveBack: () => swapPlatform(back),
    });
  });

  /* ---------- 5. WHAT section: stats + not-list reveal ---------- */
  gsap.from('.what__h', {
    opacity: 0, y: 40,
    scrollTrigger: { trigger: '.sec--what', start: 'top 70%' }
  });
  gsap.from('.what__stats .stat', {
    opacity: 0, y: 24, stagger: .08,
    scrollTrigger: { trigger: '.what__stats', start: 'top 75%' }
  });
  gsap.from('.not__list li', {
    opacity: 0, x: 30, stagger: .08,
    scrollTrigger: { trigger: '.not__list', start: 'top 75%' }
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
      onToggle: self => { if (self.isActive) switchScreen('#phone', s); }
    });
  });

  /* ---------- 6. LEARNING section: phone screen swap on scroll ---------- */
  const steps = gsap.utils.toArray('.lstep');
  steps.forEach((step, i) => {
    ScrollTrigger.create({
      trigger: '.sec--learning .pin-wrap--learning',
      start: `top+=${(i / steps.length) * 100}% top`,
      end:   `top+=${((i + 1) / steps.length) * 100}% top`,
      onToggle: self => {
        if (self.isActive) {
          steps.forEach(s => s.classList.remove('on'));
          step.classList.add('on');
          switchScreen('#phoneLearn', step.dataset.target);
        }
      }
    });
  });

  // Phone learn intro
  gsap.from('#phoneLearn .phone__shell', {
    opacity: 0, y: 50, scale: .95,
    duration: 1, ease: 'power3.out',
    scrollTrigger: { trigger: '.sec--learning', start: 'top 60%' }
  });
  gsap.from('.learn__h', {
    opacity: 0, y: 30,
    scrollTrigger: { trigger: '.sec--learning', start: 'top 60%' }
  });
  gsap.from('.lstep', {
    opacity: 0, x: -20, stagger: .07,
    scrollTrigger: { trigger: '.learn__steps', start: 'top 75%' }
  });

  /* ---------- 7. AI section ---------- */
  gsap.from('.ai__h', { opacity: 0, y: 30, scrollTrigger: { trigger: '.ai__h', start: 'top 80%' } });
  gsap.from('.ai__card', { opacity: 0, y: 40, stagger: .08, scrollTrigger: { trigger: '.ai__grid', start: 'top 80%' } });
  gsap.from('.ai__foot', { opacity: 0, y: 20, scrollTrigger: { trigger: '.ai__foot', start: 'top 85%' } });

  /* ---------- 8. Philosophy section ---------- */
  gsap.from('.philo__h', {
    opacity: 0, y: 40,
    scrollTrigger: { trigger: '.philo__h', start: 'top 80%' }
  });
  gsap.from('.philo__col--neg li', {
    opacity: 0, x: -30, stagger: .08,
    scrollTrigger: { trigger: '.philo__cols', start: 'top 75%' }
  });
  gsap.from('.philo__col--pos li', {
    opacity: 0, x: 30, stagger: .08,
    scrollTrigger: { trigger: '.philo__cols', start: 'top 75%' }
  });
  gsap.from('.philo__quote', {
    opacity: 0, scale: .92,
    scrollTrigger: { trigger: '.philo__quote', start: 'top 80%' }
  });

  /* ---------- 9. Showcase: horizontal scroll ---------- */
  const rail2 = document.getElementById('showRail');
  if (rail2) {
    const totalScroll = () => rail2.scrollWidth - window.innerWidth + 80;
    gsap.to(rail2, {
      x: () => -totalScroll(),
      ease: 'none',
      scrollTrigger: {
        trigger: '.sec--showcase',
        start: 'top top',
        end: () => `+=${totalScroll() + window.innerHeight}`,
        scrub: 1,
        pin: '.show__track',
        invalidateOnRefresh: true
      }
    });
    gsap.from('.show__h', {
      opacity: 0, y: 30,
      scrollTrigger: { trigger: '.show__head', start: 'top 80%' }
    });
  }

  /* ---------- 10. Brand grid ---------- */
  gsap.from('.brand__h', { opacity: 0, y: 30, scrollTrigger: { trigger: '.brand__h', start: 'top 80%' } });
  gsap.from('.brand__cell', { opacity: 0, y: 20, stagger: .06, scrollTrigger: { trigger: '.brand__grid', start: 'top 80%' } });

  /* ---------- 11. Vision lines ---------- */
  gsap.utils.toArray('.vline').forEach((line, i) => {
    gsap.to(line, {
      opacity: 1, y: 0,
      duration: 1, ease: 'power3.out',
      scrollTrigger: { trigger: line, start: 'top 78%' }
    });
  });
  gsap.from('.vision__sub', {
    opacity: 0, y: 20,
    scrollTrigger: { trigger: '.vision__sub', start: 'top 85%' }
  });

  /* ---------- 12. CTA ---------- */
  gsap.from('.cta__h', { opacity: 0, scale: .92, scrollTrigger: { trigger: '.cta__h', start: 'top 80%' }, duration: 1.2, ease: 'power3.out' });
  gsap.from('.cta__sub', { opacity: 0, y: 20, scrollTrigger: { trigger: '.cta__sub', start: 'top 85%' } });
  gsap.from('.cta__form', { opacity: 0, y: 30, scrollTrigger: { trigger: '.cta__form', start: 'top 85%' } });
  gsap.from('.foot > *', { opacity: 0, y: 20, stagger: .1, scrollTrigger: { trigger: '.foot', start: 'top 90%' } });

  /* ---------- Helpers ---------- */
  function switchScreen(phoneSel, name) {
    const phone = document.querySelector(phoneSel);
    if (!phone) return;
    let activeScreen = null;
    phone.querySelectorAll('.screen').forEach(s => {
      const isActive = s.dataset.screen === name;
      s.classList.toggle('is-on', isActive);
      if (isActive) activeScreen = s;
    });
    phone.classList.toggle('phone--image-mode', !!activeScreen?.classList.contains('screen--image'));
  }

  // Refresh after fonts load (Filson Pro / Inter) to remeasure pin offsets
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => ScrollTrigger.refresh());
  }
  window.addEventListener('load', () => ScrollTrigger.refresh());
})();
