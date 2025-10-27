document.addEventListener("DOMContentLoaded", () => {
  // === HERO ENTRANCE ===
  gsap.from(".hero-content", {
    opacity: 0,
    y: 60,
    duration: 1.6,
    ease: "power3.out"
  });

  // === SCROLL ANIMATIONS ===
  gsap.registerPlugin(ScrollTrigger);
  gsap.utils.toArray("section").forEach((sec) => {
    gsap.from(sec.querySelectorAll("h2, p, img"), {
      scrollTrigger: { trigger: sec, start: "top 80%" },
      opacity: 0,
      y: 40,
      duration: 1,
      stagger: 0.2,
      ease: "power3.out"
    });
  });

  // === YEAR IN FOOTER ===
  document.getElementById("year").textContent = new Date().getFullYear();

  // === SCROLL PROGRESS BAR ===
  const progressBar = document.getElementById("progressBar");
  function updateProgressBar() {
    const scrollTop = window.scrollY;
    const docHeight = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight) - window.innerHeight;
    const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    progressBar.style.width = `${scrollPercent}%`;
    progressBar.style.opacity = scrollTop > 30 ? "1" : "0";
  }
  window.addEventListener("scroll", updateProgressBar);
  window.addEventListener("resize", updateProgressBar);
  updateProgressBar();

  // === CUSTOM CURSOR ===
  const cursor = document.createElement("div");
  cursor.classList.add("cursor");
  document.body.appendChild(cursor);

  let cx = 0, cy = 0, tx = 0, ty = 0;
  function follow() {
    cx += (tx - cx) * 0.15;
    cy += (ty - cy) * 0.15;
    cursor.style.transform = `translate(${cx}px, ${cy}px)`;
    requestAnimationFrame(follow);
  }
  follow();

  document.addEventListener("mousemove", e => {
    tx = e.clientX;
    ty = e.clientY;
  });

  document.querySelectorAll("a, button, .btn, img").forEach(el => {
    el.addEventListener("mouseenter", () => cursor.classList.add("hover"));
    el.addEventListener("mouseleave", () => cursor.classList.remove("hover"));
  });

  document.addEventListener("mousedown", () => cursor.classList.add("click"));
  document.addEventListener("mouseup", () => setTimeout(() => cursor.classList.remove("click"), 150));
});
