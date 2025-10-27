document.addEventListener("DOMContentLoaded", () => {
  // === PRELOADER ===
  const preloader = document.getElementById('preloader');
  const hidePreloader = () => {
    if (!preloader) return;
    preloader.classList.add('hidden');
    preloader.setAttribute('aria-hidden', 'true');
    // Remove from DOM after transition
    preloader.addEventListener('transitionend', () => { preloader.remove(); if (typeof runHeroTitleReveal === 'function') runHeroTitleReveal(); }, { once: true });
  };
  // Fallback timeout in case 'load' is slow or blocked
  const fallback = setTimeout(hidePreloader, 2500);
  window.addEventListener('load', () => { clearTimeout(fallback); hidePreloader(); });
  if (!preloader && typeof runHeroTitleReveal === 'function') runHeroTitleReveal();

  // === NAVBAR REVEAL ===
  const navbar = document.getElementById("navbar");
  setTimeout(() => navbar.classList.add("reveal"), 150);

  // === HERO ANIMATION ===
  const hero = document.querySelector(".hero-content");
  if (hero) hero.classList.add("hero-animate");
  // Letter-by-letter reveal for hero title
  const heroTitle = hero?.querySelector('h1');
  let runHeroTitleReveal = null;
  if (heroTitle) {
    const wrapChars = (el) => {
      const nodes = Array.from(el.childNodes);
      nodes.forEach(node => {
        if (node.nodeType === Node.TEXT_NODE) {
          const frag = document.createDocumentFragment();
          String(node.textContent || '').split('').forEach(ch => {
            const span = document.createElement('span');
            span.className = 'char';
            span.textContent = ch;
            frag.appendChild(span);
          });
          el.replaceChild(frag, node);
        } else if (node.nodeType === Node.ELEMENT_NODE) {
          // wrap inner text of highlight, keep element
          wrapChars(node);
        }
      });
    };
    wrapChars(heroTitle);
    const chars = heroTitle.querySelectorAll('.char');
    const useGSAP = !!window.gsap;
    runHeroTitleReveal = () => {
      if (useGSAP) {
        gsap.set(chars, { opacity: 0, y: 8 });
        gsap.to(chars, { opacity: 1, y: 0, duration: 0.6, stagger: 0.03, ease: 'power2.out', delay: 0.05 });
      } else {
        chars.forEach((c, idx) => setTimeout(() => { c.style.transition = 'opacity .4s, transform .4s'; c.style.opacity = '1'; c.style.transform = 'translateY(0)'; }, 30 * idx));
      }
    };
  }

  // === TYPING EFFECT ===
  const typing = document.getElementById("typing");
  const texts = ["Web Developer", "Designer", "Problem Solver"];
  let i = 0, j = 0, isDeleting = false;
  function type() {
    if (i >= texts.length) i = 0;
    const text = texts[i];
    typing.textContent = text.substring(0, j + (isDeleting ? -1 : 1));
    j += isDeleting ? -1 : 1;
    if (!isDeleting && j === text.length) {
      isDeleting = true;
      setTimeout(type, 1400);
    } else if (isDeleting && j === 0) {
      isDeleting = false;
      i++;
      setTimeout(type, 400);
    } else setTimeout(type, isDeleting ? 70 : 120);
  }
  type();

  // === THEME: Auto-detect + Toggle ===
  const toggleButton = document.getElementById("modeToggle");
  const body = document.body;
  const clickSound = new Audio("https://cdn.pixabay.com/download/audio/2022/03/15/audio_7d1c64b2d4.mp3?filename=switch-1-30359.mp3");
  clickSound.volume = 0.3;

  const applyTheme = (mode, persist = false) => {
    body.classList.toggle("dark-mode", mode === "dark");
    if (persist) localStorage.setItem("theme", mode);
  };

  const media = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)');
  const storedTheme = localStorage.getItem("theme");
  if (storedTheme === "dark" || storedTheme === "light") {
    applyTheme(storedTheme);
  } else {
    applyTheme(media && media.matches ? "dark" : "light");
  }

  const mediaListener = (e) => {
    if (!localStorage.getItem("theme")) applyTheme(e.matches ? "dark" : "light");
  };
  if (media) {
    if (typeof media.addEventListener === 'function') media.addEventListener('change', mediaListener);
    else if (typeof media.addListener === 'function') media.addListener(mediaListener);
  }

  toggleButton.addEventListener("click", () => {
    const next = body.classList.contains("dark-mode") ? "light" : "dark";
    applyTheme(next, true);
    clickSound.currentTime = 0;
    clickSound.play().catch(() => {});
  });

  // Ambient sound toggle (user-initiated only)
  const soundToggle = document.getElementById('soundToggle');
  if (soundToggle) {
    const ambient = new Audio('https://cdn.pixabay.com/download/audio/2022/02/23/audio_8d0a53d6e6.mp3?filename=calm-ambient-110241.mp3');
    ambient.loop = true; ambient.volume = 0.08;
    soundToggle.addEventListener('click', async () => {
      try {
        if (ambient.paused) {
          await ambient.play();
          soundToggle.classList.add('active');
          soundToggle.setAttribute('aria-pressed', 'true');
          soundToggle.innerHTML = '<i class="ri-volume-up-line" aria-hidden="true"></i>';
        } else {
          ambient.pause();
          soundToggle.classList.remove('active');
          soundToggle.setAttribute('aria-pressed', 'false');
          soundToggle.innerHTML = '<i class="ri-volume-mute-line" aria-hidden="true"></i>';
        }
      } catch (_) {}
    });
  }

  // Smooth scroll for all in-page links
  document.querySelectorAll('a[href^="#"]:not([href="#"])').forEach(link => {
    link.addEventListener('click', (e) => {
      const targetID = link.getAttribute('href');
      const target = document.querySelector(targetID);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  // Parallax hero background (subtle, performant)
  const heroEl = document.querySelector('.hero');
  const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (heroEl && !reduceMotion) {
    let ticking = false;
    let lastOffset = 0;
    const heroContent = heroEl.querySelector('.hero-content');
    const layerA = heroEl.querySelector('.layer-a');
    const layerB = heroEl.querySelector('.layer-b');
    const updateParallax = () => {
      const y = (window.scrollY || window.pageYOffset) - heroEl.offsetTop;
      // Clamp movement to avoid extreme shifts on long pages
      lastOffset = Math.max(-80, Math.min(80, y * 0.15));
      heroEl.style.backgroundPosition = `center ${lastOffset}px`;
      // 3D tilt and parallax layers
      const tilt = Math.max(-8, Math.min(8, y * 0.03));
      if (heroContent) heroContent.style.transform = `translateY(0) rotateX(${tilt}deg)`;
      if (layerA) layerA.style.transform = `translateY(${y * 0.12}px)`;
      if (layerB) layerB.style.transform = `translateY(${y * -0.08}px)`;
      ticking = false;
    };
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(updateParallax);
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    updateParallax();
  }

  // Magnetic hover effect for interactive elements
  const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!prefersReduced) {
    const attachMagnetic = (el, strength = 8) => {
      let rect;
      const onMove = (e) => {
        rect = rect || el.getBoundingClientRect();
        const x = e.clientX - (rect.left + rect.width / 2);
        const y = e.clientY - (rect.top + rect.height / 2);
        const mx = (x / (rect.width / 2)) * strength;
        const my = (y / (rect.height / 2)) * strength;
        el.style.setProperty('--mx', `${mx.toFixed(2)}px`);
        el.style.setProperty('--my', `${my.toFixed(2)}px`);
      };
      const onEnter = () => { rect = el.getBoundingClientRect(); };
      const onLeave = () => {
        rect = null;
        el.style.setProperty('--mx', '0px');
        el.style.setProperty('--my', '0px');
      };
      el.addEventListener('mouseenter', onEnter);
      el.addEventListener('mousemove', onMove);
      el.addEventListener('mouseleave', onLeave);
    };

    document.querySelectorAll('.btn').forEach(btn => attachMagnetic(btn, 10));
    document.querySelectorAll('.social-link').forEach(icon => attachMagnetic(icon, 6));
    document.querySelectorAll('.sound-toggle').forEach(icon => attachMagnetic(icon, 6));
  }

  // Scroll indicator: highlight navbar link on scroll
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = Array.from(document.querySelectorAll('section[id]'));
  const updateActiveLink = () => {
    let current = sections[0]?.id || '';
    const scrollPos = window.scrollY + 130; // account for fixed navbar
    sections.forEach(sec => {
      if (scrollPos >= sec.offsetTop) current = sec.id;
    });
    navLinks.forEach(link => {
      const isActive = link.getAttribute('href') === `#${current}`;
      link.classList.toggle('active', isActive);
    });
  };
  window.addEventListener('scroll', updateActiveLink, { passive: true });
  window.addEventListener('resize', updateActiveLink);
  window.addEventListener('load', updateActiveLink);
  updateActiveLink();

  // === PROJECT MODAL (optional) ===
  const modal = document.getElementById("projectModal");
  if (modal) {
    const modalImg = document.getElementById("modalImage");
    const modalTitle = document.getElementById("modalTitle");
    const modalDesc = document.getElementById("modalDesc");
    const modalLink = document.getElementById("modalLink");
    const closeModal = document.querySelector(".close-modal");

    document.querySelectorAll(".project-card").forEach(card => {
      if (card.tagName.toLowerCase() === "a") return;
      card.addEventListener("click", e => {
        e.preventDefault();
        modalImg.src = card.dataset.img || card.querySelector("img")?.src || "";
        modalTitle.textContent = card.dataset.title || "Untitled Project";
        modalDesc.textContent = card.dataset.desc || "No description available.";
        modalLink.href = card.dataset.link || "#";
        modal.classList.add("active");
        modal.setAttribute("aria-hidden", "false");
        closeModal?.focus();
        gsap.fromTo(".modal-content", { scale: 0.9, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.4, ease: "power2.out" });
      });
    });

    const hideModal = () => {
      gsap.to(".modal-content", {
        scale: 0.9,
        opacity: 0,
        duration: 0.3,
        onComplete: () => {
          modal.classList.remove("active");
          modal.setAttribute("aria-hidden", "true");
        }
      });
    };

    closeModal.addEventListener("click", hideModal);
    closeModal.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        hideModal();
      }
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && modal.classList.contains("active")) hideModal();
    });

    modal.addEventListener("click", e => {
      if (e.target === modal) hideModal();
    });
  }

  // Scroll progress bar removed per request

  // === CONTACT FORM MOCK SUBMIT ===
  const form = document.getElementById("contactForm");
  const status = document.getElementById("formStatus");
  const sendBtn = document.querySelector('.send-btn');
  form.addEventListener("submit", e => {
    e.preventDefault();
    if (window.gsap) gsap.to(".send-btn", { scale: 0.95, duration: 0.1, yoyo: true, repeat: 1 });
    if (sendBtn) sendBtn.disabled = true;
    status.textContent = "Sending...";
    status.style.opacity = "1";
    setTimeout(() => {
      // Build success animation
      const buildSuccess = () => {
        const wrap = document.createElement('div');
        wrap.className = 'success-check';
        wrap.innerHTML = `
          <svg viewBox="0 0 52 52" class="shadow" aria-hidden="true">
            <circle class="circle" cx="26" cy="26" r="24" fill="none" stroke="#22c55e" stroke-width="3" />
            <path class="check" fill="none" stroke="#22c55e" stroke-linecap="round" stroke-width="3" d="M14 27 l8 8 16-16" />
          </svg>`;
        return wrap;
      };

      if (window.gsap) {
        status.innerHTML = "<strong>Message sent!</strong>";
        const icon = buildSuccess();
        status.appendChild(icon);

        // Animate drawing
        const circle = icon.querySelector('.circle');
        const check = icon.querySelector('.check');
        const cLen = circle.getTotalLength();
        const kLen = check.getTotalLength();
        gsap.set([circle, check], { strokeDasharray: (i, t) => (t === circle ? cLen : kLen), strokeDashoffset: (i, t) => (t === circle ? cLen : kLen) });
        const tl = gsap.timeline({ defaults: { ease: 'power2.out' } });
        tl.fromTo(icon, { scale: 0.8, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.35 })
          .to(circle, { strokeDashoffset: 0, duration: 0.5 }, "<")
          .to(check, { strokeDashoffset: 0, duration: 0.45 }, "-=0.2");
        // Fade out status after delay
        tl.to(status, { opacity: 0, duration: 0.6, delay: 2, onComplete: () => {
          status.innerHTML = "";
          if (sendBtn) sendBtn.disabled = false;
        }});
      } else {
        status.textContent = "Message sent!";
        status.style.opacity = "1";
        setTimeout(() => { status.style.opacity = "0"; if (sendBtn) sendBtn.disabled = false; }, 2500);
      }
      form.reset();
    }, 1200);
  });

  // === SECTION REVEAL (pop-in on view) ===
  const ioSupported = 'IntersectionObserver' in window;
  if (ioSupported) {
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          // Unobserve after first reveal for performance
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -10%' });

    document.querySelectorAll('section').forEach(sec => {
      // add baseline class for pop-in (skip hero which has its own intro)
      if (!sec.classList.contains('reveal-section') && sec.id !== 'hero') {
        sec.classList.add('reveal-section');
      }
      if (sec.id !== 'hero') io.observe(sec);
    });
  }

  // === PROJECT FILTERING ===
  const projectsData = [
    {
      title: "Luxury Landing Page",
      category: "web",
      href: "project1/index.html",
      img: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
      desc: "A cinematic one-page experience with refined details."
    },
    {
      title: "Brand Identity",
      category: "design",
      href: "project2/index.html",
      img: "project2/thumbnail.svg",
      desc: "Minimalist logo and visual identity."
    },
    {
      title: "Developer Portfolio (Alt)",
      category: "web",
      href: "project3/index.html",
      img: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80",
      desc: "Another minimalist portfolio, inspired by this site."
    }
  ];

  const grid = document.querySelector('.projects-grid');
  function renderProjects(filter = 'all') {
    if (!grid) return;
    grid.innerHTML = '';
    const frag = document.createDocumentFragment();
    projectsData
      .filter(p => filter === 'all' || p.category === filter)
      .forEach(p => {
        const a = document.createElement('a');
        a.className = 'project-card';
        a.href = p.href;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        a.dataset.category = p.category;

        const img = document.createElement('img');
        img.src = p.img; img.alt = p.title;
        const h3 = document.createElement('h3');
        h3.textContent = p.title;
        const pdesc = document.createElement('p');
        pdesc.textContent = p.desc;
        a.append(img, h3, pdesc);
        frag.appendChild(a);
      });
    grid.appendChild(frag);
  }

  // Initial render
  renderProjects('all');

  // Filter buttons re-render
  const filterButtons = document.querySelectorAll('.filter-btn');
  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelector('.filter-btn.active')?.classList.remove('active');
      btn.classList.add('active');
      renderProjects(btn.dataset.filter || 'all');
    });
  });
}); // END DOMContentLoaded

// === CUSTOM CURSOR ===
const cursor = document.createElement("div");
cursor.classList.add("cursor");
document.body.appendChild(cursor);
let cursorX = 0, cursorY = 0, targetX = 0, targetY = 0;
function animateCursor() {
  cursorX += (targetX - cursorX) * 0.15;
  cursorY += (targetY - cursorY) * 0.15;
  cursor.style.transform = `translate(${cursorX}px, ${cursorY}px)`;
  requestAnimationFrame(animateCursor);
}
animateCursor();
document.addEventListener("mousemove", e => {
  targetX = e.clientX;
  targetY = e.clientY;
});
document.querySelectorAll("a, button, .btn, .project-card").forEach(el => {
  el.addEventListener("mouseenter", () => cursor.classList.add("hover"));
  el.addEventListener("mouseleave", () => cursor.classList.remove("hover"));
});
document.addEventListener("mousedown", () => cursor.classList.add("click"));
document.addEventListener("mouseup", () => setTimeout(() => cursor.classList.remove("click"), 150));




