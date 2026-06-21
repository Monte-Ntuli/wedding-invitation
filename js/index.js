gsap.registerPlugin(ScrollTrigger);

document.addEventListener('DOMContentLoaded', () => {

  /* ─────────────────────────────────────────────
     ELEMENT REFS
  ───────────────────────────────────────────── */
  const envScene  = document.getElementById('envScene');
  const envBg     = document.getElementById('envBg');
  const envelope  = document.getElementById('envelope');
  const envFlap   = document.getElementById('envFlap');
  const waxSeal   = document.getElementById('waxSeal');
  const cardOuter = document.getElementById('cardOuter');
  const scrollCue = document.getElementById('scrollCue');


  /* ─────────────────────────────────────────────
     INITIAL STATES
  ───────────────────────────────────────────── */
  gsap.set(cardOuter, { opacity: 0, y: 0 });
  gsap.set(envFlap,   { rotateX: 0, transformOrigin: 'top center' });


  /* ─────────────────────────────────────────────
     RISE AMOUNT
     Card rises from scene-center so its top sits
     at roughly 8% of viewport height when fully out.
  ───────────────────────────────────────────── */
  function getRise() {
    const vh    = window.innerHeight;
    // Card starts centred in the scene.
    // Initial card top ≈ (vh - cardH) / 2
    // We want final card top ≈ vh * 0.08
    const cardH = cardOuter.offsetHeight;
    const init  = (vh - cardH) / 2;
    const target = vh * 0.08;
    return -(init - target); // negative = upward
  }


  /* ─────────────────────────────────────────────
     MAIN SCROLL ANIMATION
     Timeline total = 10 units, mapped to 280% scroll.
     Phase 1 (0→3):   flap opens, card fades in
     Phase 2 (3→7.5): card rises
     Phase 3 (7.5→10): envelope exits
  ───────────────────────────────────────────── */
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: envScene,
      pin: true,
      pinSpacing: true,
      scrub: 1.5,
      start: 'top top',
      end: '+=280%',
      invalidateOnRefresh: true,
    },
  });

  // ── Phase 1: open ──────────────────────────
  tl
    .to(scrollCue,  { opacity: 0, y: -12, duration: 0.8 }, 0)
    .to(waxSeal,    { opacity: 0, scale: 0.75, duration: 1.2, ease: 'power2.in' }, 0)
    .to(envFlap,    { rotateX: -180, duration: 3, ease: 'power1.inOut' }, 0.3)
    // Card fades in as flap passes 50% open
    .to(cardOuter,  { opacity: 1, duration: 1.6 }, 1.8);

  // ── Phase 2: card rises ───────────────────
  tl.to(cardOuter, {
    y: () => getRise(),
    duration: 4.5,
    ease: 'power1.inOut',
  }, 3);

  // ── Phase 3: envelope exits ───────────────
  tl
    .to(envelope,  { opacity: 0, y: 70, scale: 0.94, duration: 2.5, ease: 'power2.in' }, 7.5)
    .to(envBg,     { opacity: 0.4, duration: 2.5 }, 7.5);


  /* ─────────────────────────────────────────────
     BACKGROUND PARALLAX
  ───────────────────────────────────────────── */
  gsap.to(envBg, {
    y: '12%',
    ease: 'none',
    scrollTrigger: {
      trigger: envScene,
      start: 'top top',
      end: 'bottom top',
      scrub: true,
    },
  });


  /* ─────────────────────────────────────────────
     CONTENT SECTION REVEALS
     Each .reveal-section staggers its children in.
  ───────────────────────────────────────────── */
  document.querySelectorAll('.reveal-section').forEach(section => {
    // Direct text elements fade up
    const headings = section.querySelectorAll(
      '.s-eyebrow, .s-title, .s-sub, .hero-couple, .hero-date, .rule-gem, .hero-tagline, .rsvp-form, .rsvp-contacts, .timeline'
    );
    if (headings.length) {
      gsap.from(headings, {
        scrollTrigger: {
          trigger: section,
          start: 'top 78%',
          toggleActions: 'play none none none',
        },
        opacity: 0,
        y: 28,
        duration: 1,
        stagger: 0.14,
        ease: 'power2.out',
      });
    }

    // Staggered child cards / timeline items
    const children = section.querySelectorAll('.reveal-child');
    if (children.length) {
      gsap.from(children, {
        scrollTrigger: {
          trigger: section,
          start: 'top 70%',
          toggleActions: 'play none none none',
        },
        opacity: 0,
        y: 36,
        duration: 0.9,
        stagger: 0.15,
        ease: 'power2.out',
      });
    }
  });


  /* ─────────────────────────────────────────────
     TIMELINE DOT HOVER (GSAP for smoothness)
  ───────────────────────────────────────────── */
  document.querySelectorAll('.tl-item').forEach(item => {
    const dot = item.querySelector('.tl-dot');
    item.addEventListener('mouseenter', () =>
      gsap.to(dot, { scale: 1.5, duration: 0.3, ease: 'back.out(2)' })
    );
    item.addEventListener('mouseleave', () =>
      gsap.to(dot, { scale: 1, duration: 0.3, ease: 'power2.out' })
    );
  });


  /* ─────────────────────────────────────────────
     RSVP FORM
  ───────────────────────────────────────────── */
  const rsvpForm    = document.getElementById('rsvpForm');
  const rsvpSuccess = document.getElementById('rsvpSuccess');

  rsvpForm.addEventListener('submit', e => {
    e.preventDefault();

    const name       = rsvpForm.querySelector('#f-name').value.trim();
    const attendance = rsvpForm.querySelector('input[name="attendance"]:checked');
    const contact    = rsvpForm.querySelector('input[name="contact"]:checked');

    if (!name || !attendance || !contact) {
      gsap.to(rsvpForm.querySelector('.form-btn'), {
        x: [-6, 6, -4, 4, -2, 2, 0],
        duration: 0.45,
        ease: 'none',
      });
      return;
    }

    const dietary = rsvpForm.querySelector('#f-dietary').value.trim();
    const song    = rsvpForm.querySelector('#f-song').value.trim();
    const attending = attendance.value === 'yes' ? 'Joyfully accepts ✓' : 'Regretfully declines ✗';

    // Build the WhatsApp message
    let msg = `*Lobola RSVP — Thompho & Renda*\n\n`;
    msg += `*Name:* ${name}\n`;
    msg += `*Attendance:* ${attending}\n`;
    if (dietary) msg += `*Dietary requirements:* ${dietary}\n`;
    if (song)    msg += `*Song request:* ${song}\n`;
    msg += `\n_29 December 2026 · Ha Daswa, Vondwe_`;

    // Open WhatsApp with the selected contact's number
    window.open(`https://wa.me/${contact.value}?text=${encodeURIComponent(msg)}`, '_blank');

    // Animate out form → show success
    gsap.to(rsvpForm, {
      opacity: 0,
      y: -16,
      duration: 0.4,
      ease: 'power2.in',
      onComplete: () => {
        rsvpForm.style.display = 'none';
        rsvpSuccess.style.display = 'block';
        gsap.from(rsvpSuccess, { opacity: 0, y: 20, duration: 0.6, ease: 'power2.out' });
      },
    });
  });


  /* ─────────────────────────────────────────────
     FOOTER — script name entrance
  ───────────────────────────────────────────── */
  gsap.from('.footer-names', {
    scrollTrigger: {
      trigger: '.site-footer',
      start: 'top 85%',
      toggleActions: 'play none none none',
    },
    opacity: 0,
    y: 20,
    duration: 1.2,
    ease: 'power2.out',
  });

});
