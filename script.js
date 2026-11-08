// ===== Design 4: Luxe =====
const isDesktop = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
const isMobile = () => window.innerWidth <= 760;

/* 1. Split the hero title into letters so each one can slide up */
document.querySelectorAll('.split').forEach(line => {
  const text = line.textContent;
  line.innerHTML = [...text].map((ch, i) =>
    `<span class="ch" style="transition-delay:${0.15 + i * 0.05}s">${ch}</span>`
  ).join('');
});

/* 2. Preloader: count to 100 while images load, then slide away */
const loader = document.getElementById('loader');
const loaderBar = document.getElementById('loaderBar');
const loaderCount = document.getElementById('loaderCount');
const images = [...document.images];
let loadedImgs = 0;
let shown = 0;

images.forEach(img => {
  if (img.complete) {
    loadedImgs++;
  } else {
    img.addEventListener('load', () => loadedImgs++, { once: true });
    img.addEventListener('error', () => loadedImgs++, { once: true });
  }
});

function tickLoader() {
  const target = Math.max(loadedImgs / images.length, 0.15) * 100;
  shown += (target - shown) * 0.08 + 0.4; // always creeps forward
  shown = Math.min(shown, 100);
  loaderCount.textContent = Math.floor(shown);
  loaderBar.style.width = shown + '%';
  if (shown < 100) requestAnimationFrame(tickLoader);
  else finishLoading();
}
function finishLoading() {
  setTimeout(() => {
    loader.classList.add('done');
    document.body.classList.remove('is-loading');
    document.body.classList.add('loaded');
  }, 250);
}
requestAnimationFrame(tickLoader);

/* 3. Custom cursor */
if (isDesktop) {
  const dot = document.getElementById('cursor');
  const ring = document.getElementById('cursorRing');
  const ringText = document.getElementById('cursorText');
  let mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my;

  window.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    dot.style.transform = `translate(${mx}px, ${my}px) translate(-50%, -50%)`;
  });
  (function loop() {
    rx += (mx - rx) * 0.18;
    ry += (my - ry) * 0.18;
    ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%, -50%)`;
    requestAnimationFrame(loop);
  })();

  // grow on links, show a word on elements with data-cursor
  document.querySelectorAll('a, button').forEach(el => {
    el.addEventListener('mouseenter', () => { if (!el.dataset.cursor) ring.classList.add('hover'); });
    el.addEventListener('mouseleave', () => ring.classList.remove('hover'));
  });
  document.querySelectorAll('[data-cursor]').forEach(el => {
    el.addEventListener('mouseenter', () => { ringText.textContent = el.dataset.cursor; ring.classList.add('text'); });
    el.addEventListener('mouseleave', () => ring.classList.remove('text'));
  });

  // magnetic buttons: they pull slightly towards the mouse
  document.querySelectorAll('.magnetic').forEach(btn => {
    btn.addEventListener('mousemove', e => {
      const r = btn.getBoundingClientRect();
      const x = e.clientX - r.left - r.width / 2;
      const y = e.clientY - r.top - r.height / 2;
      btn.style.transform = `translate(${x * 0.25}px, ${y * 0.3}px)`;
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transition = 'transform .6s cubic-bezier(.16,1,.3,1)';
      btn.style.transform = '';
      setTimeout(() => (btn.style.transition = ''), 600);
    });
  });

  // 3D tilt on gallery images
  document.querySelectorAll('.tilt').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      card.style.transform = `rotateY(${px * 12}deg) rotateX(${-py * 12}deg) scale(1.02)`;
    });
    card.addEventListener('mouseleave', () => (card.style.transform = ''));
  });
}

/* 4. Fullscreen menu */
const menuToggle = document.getElementById('menuToggle');
const overlay = document.getElementById('overlay');
function setMenu(open) {
  document.body.classList.toggle('menu-open', open);
  menuToggle.querySelector('.menu-toggle__label').textContent = open ? 'Close' : 'Menu';
  menuToggle.setAttribute('aria-expanded', open);
  overlay.setAttribute('aria-hidden', !open);
  document.body.style.overflow = open ? 'hidden' : '';
}
menuToggle.addEventListener('click', () => setMenu(!document.body.classList.contains('menu-open')));
overlay.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setMenu(false)));
document.addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });

/* 5. Header: hide when scrolling down, show when scrolling up */
const header = document.getElementById('header');
let lastY = 0;

/* 6. Horizontal scroll section */
const hSection = document.querySelector('.hscroll');
const hTrack = document.getElementById('hTrack');
const hProgress = document.getElementById('hProgress');

function sizeHorizontal() {
  if (isMobile()) { hSection.style.height = ''; return; }
  const distance = hTrack.scrollWidth - window.innerWidth;
  hSection.style.height = window.innerHeight + distance + 'px';
}

function updateHorizontal() {
  if (isMobile()) return;
  const rect = hSection.getBoundingClientRect();
  const distance = hTrack.scrollWidth - window.innerWidth;
  const progress = Math.min(Math.max(-rect.top / (hSection.offsetHeight - window.innerHeight), 0), 1);
  hTrack.style.transform = `translateX(${-distance * progress}px)`;
  hProgress.style.width = progress * 100 + '%';
}

/* 7. Parallax + marquee driven by scroll */
const parallaxEls = document.querySelectorAll('[data-parallax]');
const marquee = document.getElementById('marquee');

function onScroll() {
  const y = window.scrollY;

  header.classList.toggle('scrolled', y > 60);
  header.classList.toggle('hide', y > lastY && y > 300 && !document.body.classList.contains('menu-open'));
  lastY = y;

  parallaxEls.forEach(el => {
    const speed = parseFloat(el.dataset.parallax);
    const r = el.getBoundingClientRect();
    const offset = (r.top + r.height / 2 - window.innerHeight / 2) * speed;
    el.style.transform = `translateY(${-offset}px)`;
  });

  // marquee moves with scroll (plus a slow drift in the loop below)
  marqueeScroll = y * 0.35;

  updateHorizontal();
}

let marqueeDrift = 0;
let marqueeScroll = 0;
(function marqueeLoop() {
  marqueeDrift += 0.4;
  const half = marquee.scrollWidth / 2;
  const x = (marqueeDrift + marqueeScroll) % half;
  marquee.style.transform = `translateX(${-x}px)`;
  requestAnimationFrame(marqueeLoop);
})();

window.addEventListener('scroll', onScroll, { passive: true });
window.addEventListener('resize', () => { sizeHorizontal(); onScroll(); });
window.addEventListener('load', () => { sizeHorizontal(); onScroll(); });
sizeHorizontal();
onScroll();

/* 8. Reveal things as they enter the screen */
document.querySelectorAll('.manifesto__cols p, .coach__text > *, .gallery__head, .book__text, .glass, .footer__top')
  .forEach(el => el.classList.add('reveal'));

const io = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in');
      // the photo mask is clipped to nothing, so we watch its parent instead
      const mask = entry.target.querySelector('.reveal-mask');
      if (mask) mask.classList.add('in');
      io.unobserve(entry.target);
    }
  });
}, { threshold: 0.2 });
document.querySelectorAll('.reveal, .coach__media, .manifesto__text').forEach(el => io.observe(el));

/* 9. Booking form (front-end check only; connect to Formspree / backend later) */
const form = document.getElementById('form');
const formMsg = document.getElementById('formMsg');

form.addEventListener('submit', e => {
  e.preventDefault();
  const checks = [
    [form.name, form.name.value.trim() !== ''],
    [form.email, /^\S+@\S+\.\S+$/.test(form.email.value)],
    [form.goal, form.goal.value !== '']
  ];
  let ok = true;
  checks.forEach(([field, valid]) => {
    field.closest('.field').classList.toggle('invalid', !valid);
    if (!valid) ok = false;
  });

  if (!ok) {
    formMsg.textContent = 'Please add your name, email and goal.';
    formMsg.className = 'form-msg err';
    return;
  }
  formMsg.textContent = `Thank you, ${form.name.value.split(' ')[0]}. Dillon will be in touch within 24 hours.`;
  formMsg.className = 'form-msg ok';
  form.reset();
});

/* 10. Footer year */
document.getElementById('year').textContent = new Date().getFullYear();
