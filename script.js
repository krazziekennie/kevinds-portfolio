// ===== Preloader =====
(function () {
  document.body.classList.add('loading');
  const preloader = document.getElementById('preloader');
  const fill = document.getElementById('preloaderFill');
  const statusEl = document.getElementById('preloaderStatus');
  const videos = document.querySelectorAll('video');
  const images = document.querySelectorAll('img');
  const total = videos.length + images.length;
  let loaded = 0;

  function tick() {
    loaded++;
    const pct = Math.min(Math.round((loaded / total) * 100), 100);
    if (fill) fill.style.width = pct + '%';
    if (statusEl) statusEl.textContent = pct + '%';
    if (loaded >= total) finish();
  }

  function finish() {
    if (fill) fill.style.width = '100%';
    if (statusEl) statusEl.textContent = 'Ready';
    setTimeout(() => {
      preloader?.classList.add('done');
      document.body.classList.remove('loading');
    }, 400);
  }

  images.forEach(img => {
    if (img.complete) tick();
    else { img.addEventListener('load', tick); img.addEventListener('error', tick); }
  });

  videos.forEach(vid => {
    if (vid.readyState >= 3) tick();
    else { vid.addEventListener('canplay', tick, { once: true }); vid.addEventListener('error', tick, { once: true }); }
  });

  if (total === 0) finish();
  setTimeout(finish, 6000);
})();

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
