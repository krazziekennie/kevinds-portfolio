// ===== Preloader =====
(function () {
  document.body.classList.add('loading');
  const preloader = document.getElementById('preloader');
  const fillBar = document.getElementById('preFill');
  const counterEl = document.getElementById('preCounter');
  const images = [...document.querySelectorAll('img')];
  const total = Math.max(images.length, 1);
  let loaded = 0;
  let current = 0;
  let target = 0;
  let done = false;

  function loop() {
    if (current < target) {
      current += Math.max(1, (target - current) * 0.18);
      if (current > target) current = target;
      const val = Math.round(current);
      if (counterEl) counterEl.textContent = val;
      if (fillBar) fillBar.style.width = val + '%';
    }
    if (!done || current < 100) requestAnimationFrame(loop);
    else exit();
  }

  function tick() {
    loaded++;
    target = Math.min(Math.round((loaded / total) * 100), 100);
    if (loaded >= total) complete();
  }

  function complete() {
    if (done) return;
    done = true;
    target = 100;
  }

  function exit() {
    if (counterEl) counterEl.textContent = '100';
    if (fillBar) fillBar.style.width = '100%';
    setTimeout(() => {
      preloader?.classList.add('exit');
      document.body.classList.remove('loading');
      setTimeout(() => preloader?.classList.add('gone'), 1000);
    }, 200);
  }

  images.forEach(img => {
    if (img.complete) tick();
    else { img.addEventListener('load', tick); img.addEventListener('error', tick); }
  });

  if (images.length === 0) { done = true; target = 100; }
  setTimeout(complete, 3000);
  requestAnimationFrame(loop);
})();

// ===== Security hardening =====
document.addEventListener('contextmenu', e => e.preventDefault());
document.addEventListener('keydown', e => {
  if (e.key === 'F12') e.preventDefault();
  if (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) e.preventDefault();
  if (e.ctrlKey && e.key === 'u') e.preventDefault();
  if (e.ctrlKey && e.key === 's') e.preventDefault();
});
document.addEventListener('dragstart', e => e.preventDefault());
document.addEventListener('selectstart', e => {
  if (!e.target.closest('input, textarea')) e.preventDefault();
});

// ===== Custom cursor =====
const cursor = document.getElementById('cursor');
const follower = document.getElementById('cursorFollower');
let mouseX = 0, mouseY = 0, fX = 0, fY = 0;

if (window.matchMedia('(pointer: fine)').matches) {
  window.addEventListener('mousemove', e => {
    mouseX = e.clientX; mouseY = e.clientY;
    cursor.style.left = mouseX + 'px';
    cursor.style.top = mouseY + 'px';
  });
  const animateFollower = () => {
    fX += (mouseX - fX) * 0.15;
    fY += (mouseY - fY) * 0.15;
    follower.style.left = fX + 'px';
    follower.style.top = fY + 'px';
    requestAnimationFrame(animateFollower);
  };
  animateFollower();

  document.querySelectorAll('a, button, .work-item, .service').forEach(el => {
    el.addEventListener('mouseenter', () => cursor.classList.add('grow'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('grow'));
  });
}

// ===== Nav scroll state + progress =====
const nav = document.getElementById('nav');
const progressBar = document.getElementById('progressBar');
window.addEventListener('scroll', () => {
  const scroll = window.scrollY;
  nav.classList.toggle('scrolled', scroll > 40);
  const height = document.documentElement.scrollHeight - window.innerHeight;
  progressBar.style.width = (scroll / height * 100) + '%';
});

// ===== Mobile menu =====
const burger = document.getElementById('burger');
const mobileMenu = document.getElementById('mobileMenu');
function setMenu(open) {
  mobileMenu?.classList.toggle('open', open);
  burger?.setAttribute('aria-expanded', String(open));
}
burger?.addEventListener('click', () => setMenu(!mobileMenu?.classList.contains('open')));
document.querySelectorAll('.mobile-links a').forEach(link =>
  link.addEventListener('click', () => setMenu(false))
);

// ===== Reveal on scroll =====
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });
document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// ===== Animate stats =====
const statsObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const el = entry.target;
    const target = parseInt(el.dataset.target, 10);
    const duration = 1800;
    const start = performance.now();
    const tick = (now) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      el.textContent = Math.floor(eased * target);
      if (t < 1) requestAnimationFrame(tick);
      else el.textContent = target;
    };
    requestAnimationFrame(tick);
    statsObserver.unobserve(el);
  });
}, { threshold: 0.5 });
document.querySelectorAll('.stat-num').forEach(el => statsObserver.observe(el));

// ===== Parallax blobs =====
const blobs = document.querySelectorAll('.blob');
window.addEventListener('scroll', () => {
  const scroll = window.scrollY;
  blobs.forEach((blob, i) => {
    const speed = (i + 1) * 0.08;
    blob.style.transform = `translateY(${scroll * speed}px)`;
  });
});

// ===== Smooth anchors =====
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', (e) => {
    const id = link.getAttribute('href');
    const target = document.querySelector(id);
    e.preventDefault();
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

// ===== Horizontal slide galleries =====
document.querySelectorAll('.client').forEach(client => {
  const gallery = client.querySelector('.client-gallery');
  if (!gallery) return;

  const nav = document.createElement('div');
  nav.className = 'gallery-nav';
  nav.innerHTML = '<button class="prev" aria-label="Previous">←</button><button class="next" aria-label="Next">→</button>';
  client.appendChild(nav);
  const [prevBtn, nextBtn] = nav.querySelectorAll('button');

  const updateNav = () => {
    const canScroll = gallery.scrollWidth > gallery.clientWidth + 10;
    nav.style.display = canScroll ? 'flex' : 'none';
    prevBtn.disabled = gallery.scrollLeft <= 5;
    nextBtn.disabled = gallery.scrollLeft >= gallery.scrollWidth - gallery.clientWidth - 5;
  };
  const step = () => Math.max(gallery.clientWidth * 0.8, 260);
  prevBtn.addEventListener('click', () => gallery.scrollBy({ left: -step(), behavior: 'smooth' }));
  nextBtn.addEventListener('click', () => gallery.scrollBy({ left: step(), behavior: 'smooth' }));
  gallery.addEventListener('scroll', updateNav, { passive: true });
  window.addEventListener('resize', updateNav);
  updateNav();

  let isDown = false, startX = 0, startScroll = 0, moved = false;
  gallery.addEventListener('pointerdown', e => {
    if (e.pointerType === 'touch') return;
    isDown = true; moved = false;
    startX = e.clientX; startScroll = gallery.scrollLeft;
    gallery.classList.add('dragging');
  });
  window.addEventListener('pointermove', e => {
    if (!isDown) return;
    const dx = e.clientX - startX;
    if (Math.abs(dx) > 4) moved = true;
    gallery.scrollLeft = startScroll - dx;
  });
  window.addEventListener('pointerup', () => {
    isDown = false;
    gallery.classList.remove('dragging');
    if (moved) window.__kdsDragEnd = Date.now();
  });
});

// ===== Lightbox =====
(function () {
  const overlay = document.createElement('div');
  overlay.className = 'lightbox';
  overlay.innerHTML = `
    <button class="lightbox-close" aria-label="Close">✕</button>
    <button class="lightbox-btn lightbox-prev" aria-label="Previous">←</button>
    <button class="lightbox-btn lightbox-next" aria-label="Next">→</button>
    <div class="lightbox-stage"></div>
    <div class="lightbox-count"></div>`;
  document.body.appendChild(overlay);

  const stage = overlay.querySelector('.lightbox-stage');
  const countEl = overlay.querySelector('.lightbox-count');
  const closeBtn = overlay.querySelector('.lightbox-close');
  const prevBtn = overlay.querySelector('.lightbox-prev');
  const nextBtn = overlay.querySelector('.lightbox-next');

  let items = [], index = 0;

  function render() {
    stage.innerHTML = '';
    const src = items[index].querySelector('img, video');
    const clone = src.cloneNode();
    if (clone.tagName === 'VIDEO') { clone.autoplay = true; clone.muted = true; clone.loop = true; clone.controls = false; clone.playsInline = true; }
    stage.appendChild(clone);
    countEl.textContent = `${index + 1} / ${items.length}`;
  }
  function show(list, i) { items = list; index = i; render(); overlay.classList.add('open'); document.body.style.overflow = 'hidden'; }
  function hide() { overlay.classList.remove('open'); document.body.style.overflow = ''; }
  function step(d) {
    index = (index + d + items.length) % items.length;
    render();
  }

  closeBtn.addEventListener('click', hide);
  prevBtn.addEventListener('click', () => step(-1));
  nextBtn.addEventListener('click', () => step(1));
  overlay.addEventListener('click', (e) => { if (e.target === overlay) hide(); });

  document.querySelectorAll('.client-gallery').forEach(gallery => {
    const itemsInGallery = [...gallery.querySelectorAll('.work-item')];
    itemsInGallery.forEach((item, i) => {
      item.addEventListener('click', () => {
        if (window.__kdsDragEnd && Date.now() - window.__kdsDragEnd < 350) return;
        show(itemsInGallery, i);
      });
    });
  });

  window.addEventListener('keydown', (e) => {
    if (!overlay.classList.contains('open')) return;
    if (e.key === 'Escape') hide();
    if (e.key === 'ArrowRight') step(1);
    if (e.key === 'ArrowLeft') step(-1);
  });
})();

// ===== Remove Netlify badge =====
new MutationObserver((mutations, obs) => {
  const badge = document.querySelector('[data-netlify-site-id], .netlify-badge, [class*="netlify"]');
  if (badge) { badge.remove(); obs.disconnect(); }
}).observe(document.body, { childList: true, subtree: true });

// ===== Contact form (Formspree AJAX) =====
const form = document.getElementById('contactForm');
const status = document.getElementById('formStatus');
const submit = document.getElementById('formSubmit');
const submitLabel = submit?.querySelector('.submit-label');

if (form) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    submit.disabled = true;
    if (submitLabel) submitLabel.textContent = 'Sending…';
    status.className = 'form-status';
    status.textContent = '';
    try {
      const res = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' }
      });
      if (res.ok) {
        status.textContent = '✓ Message sent — I\'ll get back to you soon.';
        status.classList.add('success');
        form.reset();
      } else {
        const data = await res.json().catch(() => ({}));
        status.textContent = data?.errors?.[0]?.message || 'Something went wrong. Try the email link below.';
        status.classList.add('error');
      }
    } catch (err) {
      status.textContent = 'Network error — try the email link below.';
      status.classList.add('error');
    } finally {
      submit.disabled = false;
      if (submitLabel) submitLabel.textContent = 'Send message';
    }
  });
}
