/* ============================================================
   shared.js — JavaScript משותף לכל האתר | יחידת שה"ד 339
   ============================================================ */

'use strict';

/* ─────────────────────────────────────────
   DATA
───────────────────────────────────────── */
let PRODUCTS = [
  // Movies
  { id: 'm1', category: 'movies',    title: 'חיסול הטרור',     unit: 'חיל האוויר',   type: 'סרטון',    imageUrl: '../assets/newPhotos/animation/singing.jpeg', fileUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
  { id: 'm2', category: 'movies',    title: 'חיבוק ברזל',      unit: 'פיקוד העורף',  type: 'סרט',      imageUrl: '../assets/newPhotos/movies/musicMovies.jpeg' },
  { id: 'm3', category: 'movies',    title: 'מבצע שלום',        unit: 'יהל"ם',        type: 'תיעוד',    imageUrl: '../assets/newPhotos/movies/photograther.jpeg' },
  { id: 'm4', category: 'movies',    title: 'כנפי האש',         unit: 'חיל האוויר',   type: 'סרטון',    imageUrl: '..//assets/newPhotos/movies/adler.jpeg' },
  { id: 'm5', category: 'movies',    title: 'שחר חדש',          unit: 'אג"מ',          type: 'תיעוד',    imageUrl: '../assets/newPhotos/movies/asafandYaahav.jpeg' },
  // Animation
  { id: 'a1', category: 'animation', title: 'הנפשה מונעת',      unit: 'חיל הקשר',     type: 'דו-מימד',  imageUrl: '../assets/newPhotos/animation/poster.jpeg'},
  { id: 'a2', category: 'animation', title: 'סטיץ במדבר',       unit: 'אג"מ',          type: 'תלת-מימד', imageUrl: '../assets/newPhotos/animation/animation.jpeg'},
  { id: 'a3', category: 'animation', title: 'מיקי הגה',          unit: 'חיל הים',      type: 'קלאסי',    imageUrl: '../assets/newPhotos/grafics/grafica.jpeg'},
  { id: 'a4', category: 'animation', title: 'רובוטים ואנשים',   unit: 'מערך ההדרכה',  type: 'דו-מימד',  imageUrl: '../assets/newPhotos/grafics/grafics.jpeg'},
  // Graphics
  { id: 'g1', category: 'graphics',  title: 'צבעוניות מופשטת', unit: 'מערך ההדרכה',  type: 'פוסטר',    imageUrl: '../assets/newPhotos/animation/aiLogo.jpeg' },
  { id: 'g2', category: 'graphics',  title: 'מיתוג יחידה',      unit: 'חיל האוויר',   type: 'לוגו',     imageUrl: '../assets/newPhotos/grafics/grafics.jpeg'},
  { id: 'g3', category: 'graphics',  title: 'ממשק שליטה',       unit: 'תקשוב',        type: 'UX/UI',    imageUrl: '../assets/newPhotos/grafics/uiKit.jpeg'},
  { id: 'g4', category: 'graphics',  title: 'מדריך מותג',       unit: 'אג"מ',          type: 'פוסטר',    imageUrl: '../assets/newPhotos/grafics/grafica.jpeg' },
  // AI
  { id: 'ai1', category: 'ai', title: 'תלת מימד', unit: 'מערך האוויר', type: 'AI', imageUrl: '../assets/newPhotos/animation/aiLogo.jpeg' },
  { id: 'ai2', category: 'ai', title: 'סרטון AI', unit: 'תקשוב', type: 'AI', imageUrl: '../assets/newPhotos/grafics/grafica.jpeg' },
];

const IAF_LOGO = 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/IAF_logo.svg/1024px-IAF_logo.svg.png';

/* ─────────────────────────────────────────
   SHARED — Scroll Reveal (שני עמודים)
───────────────────────────────────────── */
function initScrollReveal() {
  const els = document.querySelectorAll('.reveal');
  if (!els.length) return;
  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('revealed'); observer.unobserve(e.target); }
    });
  }, { threshold: 0.12 });
  els.forEach(el => observer.observe(el));
}

/* ─────────────────────────────────────────
   HOME — Scroll Chevron
───────────────────────────────────────── */
function initScrollChevron() {
  const chevron = document.getElementById('scrollChevron');
  if (!chevron) return;
  chevron.addEventListener('click', () => {
    const container = document.querySelector('.scroll-snap-container');
    const target    = document.querySelector('.categories-section'); // ← שינוי כאן
    if (container && target) container.scrollTo({ top: target.offsetTop, behavior: 'smooth' });
  });
}

/* ─────────────────────────────────────────
   path in homePage
───────────────────────────────────────── */
function drawMagicPath() {
  const steps = document.querySelectorAll('.magic-img-wrap');
  const svg = document.querySelector('.magic-path');
  const pathEl = document.getElementById('magicPathLine');
  if (!steps.length || !svg || !pathEl) return;

  const container = document.querySelector('.magic-steps');
  const containerRect = container.getBoundingClientRect();

  const points = Array.from(steps).map(el => {
    const rect = el.getBoundingClientRect();
    return {
      x: rect.left + rect.width / 2 - containerRect.left,
      y: rect.top + rect.height / 2 - containerRect.top
    };
  });

  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const cy = (prev.y + curr.y) / 2;
    d += ` C ${prev.x} ${cy}, ${curr.x} ${cy}, ${curr.x} ${curr.y}`;
  }

  pathEl.setAttribute('d', d);
}

window.addEventListener('load', drawMagicPath);
window.addEventListener('resize', drawMagicPath);


/* ─────────────────────────────────────────
   PRODUCTS PAGE
───────────────────────────────────────── */
function initProductsPage() {
  const gridMovies    = document.getElementById('grid-movies');
  const gridAnimation = document.getElementById('grid-animation');
  const gridGraphics  = document.getElementById('grid-graphics');
  const gridAi        = document.getElementById('grid-ai');    
  if (!gridMovies) return; // לא בעמוד תוצרים

  const searchInput   = document.getElementById('searchInput');
  const filterCount   = document.getElementById('filterCount');
  const emptyState    = document.getElementById('emptyState');
  const clearBtn      = document.getElementById('clearBtn');
  const jumpLinks     = document.querySelectorAll('.jump-link');
  const filterTrigger = document.getElementById('filterTrigger');
  const filterPanel   = document.getElementById('filterPanel');
  const filterTriggerText = document.getElementById('filterTriggerText');
  const filterClear   = document.getElementById('filterClear');
  const filterOptBtns = document.querySelectorAll('.fopt');

  // כל הסוגים מסומנים כברירת מחדל
  let selectedFilters = new Set(Array.from(filterOptBtns).map(b => b.dataset.filter));
  let searchTerm = '';

  /* ── עדכון תווית הדרופדאון ── */
  function updateTriggerLabel() {
    if (!filterTriggerText) return;
    filterTriggerText.textContent =
      selectedFilters.size === filterOptBtns.length ? 'הכל' :
      selectedFilters.size === 0 ? 'ללא' : `נבחרו ${selectedFilters.size}`;
  }

  /* ── פתיחה/סגירה של הפאנל ── */
  if (filterTrigger && filterPanel) {
    filterTrigger.addEventListener('click', e => {
      e.stopPropagation();
      const isOpen = !filterPanel.classList.contains('hidden');
      filterPanel.classList.toggle('hidden', isOpen);
      filterTrigger.setAttribute('aria-expanded', String(!isOpen));
    });
    document.addEventListener('click', () => filterPanel.classList.add('hidden'));
    filterPanel.addEventListener('click', e => e.stopPropagation());
  }

  /* ── לחיצה על אפשרות סינון ── */
  filterOptBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const f = btn.dataset.filter;
      if (selectedFilters.has(f)) { selectedFilters.delete(f); }
      else { selectedFilters.add(f); }
      btn.classList.toggle('active', selectedFilters.has(f));
      updateTriggerLabel();
      render();
    });
  });

  /* ── נקה סינון ── */
  if (filterClear) {
    filterClear.addEventListener('click', () => {
      filterOptBtns.forEach(b => { selectedFilters.add(b.dataset.filter); b.classList.add('active'); });
      updateTriggerLabel();
      render();
    });
  }

  /* ── Render all grids ── */
  function render() {
    const q = searchTerm.toLowerCase();
    let total = 0;

    const grids = {
      movies:    gridMovies,
      animation: gridAnimation,
      graphics:  gridGraphics,
      ai:        gridAi,    
    };

    Object.entries(grids).forEach(([cat, grid]) => {
      const filtered = PRODUCTS.filter(p => {
        if (p.category !== cat) return false;
        if (selectedFilters.size > 0 && !selectedFilters.has(p.type)) return false;
        if (q && !p.title.includes(q) && !p.unit.includes(q) && !p.type.includes(q)) return false;
        return true;
      });

      total += filtered.length;
      grid.innerHTML = '';
      filtered.forEach((product, i) => {
        const card = createCard(product, i);
        grid.appendChild(card);
      });

      const section = document.getElementById('section-' + cat);
      if (section) section.style.display = filtered.length === 0 ? 'none' : '';
    });

    filterCount.textContent = total === PRODUCTS.length ? 'מציג הכל' : `מציג ${total} תוצרים`;
    emptyState.classList.toggle('hidden', total > 0);
  }

  /* ── Build product card ── */
  function createCard(product, index) {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.style.animationDelay = `${index * 55}ms`;
    card.innerHTML = `
      <div class="card-img">
        <img class="card-img-el" src="${product.imageUrl}" alt="${product.title}" loading="lazy"
             onerror="this.src='https://picsum.photos/id/100/600/400'" />
        <div class="card-badge">שה"ד 339</div>
        <div class="card-overlay">
          <button class="card-view-btn">צפייה בפרטי הפרויקט</button>
        </div>
        ${isAdmin ? buildAdminBtns(product.id) : ''}
      </div>
      <div class="card-body">
        <div class="card-header-row">
          <div>
            <p class="card-type">${product.type}</p>
            <h3 class="card-title">${product.title}</h3>
          </div>
        </div>
        <div class="card-footer">
          <span>${product.unit}</span>
          <span class="card-dot"></span>
        </div>
      </div>
    `;
    // לחיצה על כפתור צפייה
    card.querySelector('.card-view-btn').addEventListener('click', e => {
      e.stopPropagation();
      openViewModal(product);
    });
    // לחיצה על הכרטיס עצמו
    card.addEventListener('click', () => openViewModal(product));

    return card;
  }

  /* ── View Modal ── */
  function openViewModal(product) {
    const isVideo = product.fileUrl && /\.(mp4|mov|avi|webm)$/i.test(product.fileUrl);
    const isPoster = ['פוסטר','לוגו','UX/UI','דו-מימד','תלת-מימד','קלאסי'].includes(product.type);

    let mediaHtml;
    if (isVideo) {
      mediaHtml = `<video src="${product.fileUrl}" controls autoplay style="width:100%;max-height:70vh;border-radius:1rem;background:#000;display:block;"></video>`;
    } else if (product.fileUrl && /\.(pdf|pptx)$/i.test(product.fileUrl)) {
      mediaHtml = `
        <img src="${product.imageUrl}" alt="${product.title}" style="width:100%;max-height:70vh;object-fit:contain;border-radius:1rem;display:block;" />
        <a href="${product.fileUrl}" download style="display:inline-flex;align-items:center;gap:0.5rem;margin-top:1rem;background:#1a3a4a;color:#fff;text-decoration:none;padding:0.65rem 1.5rem;border-radius:999px;font-weight:900;font-size:0.95rem;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          הורדת קובץ
        </a>`;
    } else {
      mediaHtml = `<img src="${product.imageUrl}" alt="${product.title}" style="width:100%;max-height:70vh;object-fit:${isPoster?'contain':'cover'};border-radius:1rem;display:block;" />`;
    }

    const o = document.createElement('div');
    o.id = 'viewModal';
    o.style.cssText = `position:fixed;inset:0;background:rgba(10,20,30,0.85);backdrop-filter:blur(6px);z-index:4000;display:flex;align-items:center;justify-content:center;padding:1.5rem;opacity:0;transition:opacity 0.25s ease;`;
    o.innerHTML = `
      <div style="background:#000000;border-radius:1.75rem;width:min(900px,95vw);max-height:92vh;overflow-y:auto;position:relative;padding:2rem;direction:rtl;transform:scale(0.96);transition:transform 0.25s ease;">
       <div style="display:flex;align-items:flex-start;gap:1rem;margin-bottom:1.25rem;">
          <button id="closeViewModal" style="background:#2a2a2a;border:none;border-radius:50%;width:2.4rem;height:2.4rem;min-width:2.4rem;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:background 0.2s;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
          <div>
            <p style="font-size:0.72rem;font-weight:900;color:#94a3b8;letter-spacing:0.18em;text-transform:uppercase;margin-bottom:0.35rem;">${product.type} · ${product.unit}</p>
            <h2 style="font-size:clamp(1.4rem,3vw,2rem);font-weight:900;color:#ffffff;line-height:1.2;">${product.title}</h2>
          </div>
        </div>
        <div style="text-align:center;">${mediaHtml}</div>
      </div>`;
    document.body.appendChild(o);
    requestAnimationFrame(() => {
      o.style.opacity = '1';
      o.querySelector('div').style.transform = 'scale(1)';
    });

    const close = () => {
      o.style.opacity = '0';
      o.querySelector('div').style.transform = 'scale(0.96)';
      o.addEventListener('transitionend', () => o.remove(), { once: true });
    };
    o.querySelector('#closeViewModal').addEventListener('click', close);
    o.addEventListener('click', e => { if (e.target === o) close(); });
    document.addEventListener('keydown', function esc(e) {
      if (e.key === 'Escape') { close(); document.removeEventListener('keydown', esc); }
    });
  }

  /* ── Search ── */
  if (searchInput) searchInput.addEventListener('input', e => {
    searchTerm = e.target.value;
    render();
  });

  /* ── Clear empty state btn ── */
  if (clearBtn) clearBtn.addEventListener('click', () => {
    searchTerm = '';
    if (searchInput) searchInput.value = '';
    filterOptBtns.forEach(b => { selectedFilters.add(b.dataset.filter); b.classList.add('active'); });
    updateTriggerLabel();
    render();
  });

  /* ── Highlight active jump link on scroll ── */
  const sections = [
    document.getElementById('section-movies'),
    document.getElementById('section-animation'),
    document.getElementById('section-graphics'),
    document.getElementById('section-ai'),
];

  const scrollObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id.replace('section-', '');
        jumpLinks.forEach(link => {
          link.classList.toggle('active-section', link.getAttribute('href') === '#section-' + id);
        });
      }
    });
  }, { rootMargin: '-40% 0px -55% 0px' });

  sections.forEach(s => { if (s) scrollObserver.observe(s); });

  /* ── Scroll to hash on load (e.g. products.html#section-animation) ── */
  if (window.location.hash) {
    setTimeout(() => {
      const target = document.querySelector(window.location.hash);
      if (target) target.scrollIntoView({ behavior: 'smooth' });
    }, 150);
  }

  /* ── Init ── */
  render();
  initAdminTools(render);
}

/* ─────────────────────────────────────────
   BOOT
───────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initScrollReveal();
  initScrollChevron();
  initGlobalNav();
  initProductsPage();
});

/* ─────────────────────────────────────────
   PRODUCTS PAGE — Logo scroll into filter bar
   מופעל רק בעמוד תוצרים
───────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  const hero = document.querySelector('.products-hero');
  if (!hero) return;

  let ticking = false;

  function toggleScrolled() {
    // עובר למצב scrolled כשתחתית הגיבור עוברת מעבר לחלון
    const heroBottom = hero.getBoundingClientRect().bottom;
    document.body.classList.toggle('scrolled', heroBottom <= 0);
    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(toggleScrolled);
    }
  }, { passive: true });

  toggleScrolled(); // בדיקה ראשונית
});

/* ─────────────────────────────────────────
   ADMIN STATE — נשמר ב-sessionStorage בין דפים
───────────────────────────────────────── */
if (window.location.search.includes('admin=1')) {
  sessionStorage.setItem('isAdmin', '1');
}
let isAdmin = sessionStorage.getItem('isAdmin') === '1';

/* ─────────────────────────────────────────
   GLOBAL NAV — Login modal + contact + admin
───────────────────────────────────────── */
function initGlobalNav() {
  const loginBtn    = document.getElementById('adminLoginBtn');
  const modal       = document.getElementById('loginModal');
  const closeModalBtn = document.getElementById('closeModal');
  const doLogin     = document.getElementById('doLogin');
  const contactLink = document.getElementById('contactLink');

  // צור קשר — גלילה לפוטר
  if (contactLink) {
    contactLink.addEventListener('click', e => {
      e.preventDefault();
      const footer = document.querySelector('footer, .site-footer, .page-footer');
      if (footer) footer.scrollIntoView({ behavior: 'smooth' });
    });
  }

  if (loginBtn && modal) loginBtn.addEventListener('click', () => {
    if (isAdmin) { showAlreadyLoggedIn(modal); }
    else { modal.classList.add('active'); }
  });
  if (closeModalBtn && modal) closeModalBtn.addEventListener('click', () => { modal.classList.remove('active'); clearForm(); });
  if (modal) modal.addEventListener('click', e => { if (e.target === modal) { modal.classList.remove('active'); clearForm(); } });

  if (doLogin) {
    doLogin.addEventListener('click', handleLogin);
    document.addEventListener('keydown', e => {
      if (e.key === 'Enter' && modal && modal.classList.contains('active')) handleLogin();
    });
  }

  function handleLogin() {
    // אם כבר מחובר — הצג פופ-אפ "שלום"
    if (isAdmin) { showAlreadyLoggedIn(modal); return; }

    const user  = (document.getElementById('adminUser')?.value || '').trim();
    const pass  = (document.getElementById('adminPass')?.value || '').trim();
    const errEl = document.getElementById('loginError');
    if (user === 'admin' && pass === '1234') {
      sessionStorage.setItem('adminUser', user);
      showWelcome(user, modal);
    } else {
      if (errEl) {
        errEl.textContent = 'שם משתמש או סיסמה שגויים';
        errEl.style.display = 'block';
        errEl.style.color = '#e53e3e';
        errEl.style.fontWeight = '700';
        errEl.style.fontSize = '0.9rem';
        errEl.style.marginTop = '0.5rem';
        errEl.style.textAlign = 'center';
      }
      const p = document.getElementById('adminPass');
      if (p) { p.value = ''; p.focus(); }
    }
  }

  function showWelcome(username, modal) {
    const content = modal.querySelector('.modal-content');
   content.innerHTML = `
      <div style="text-align:center; padding:0.5rem 0; position:relative;">
        <button id="closeWelcome" style="position:absolute;top:-0.5rem;left:-0.5rem;background:none;border:none;cursor:pointer;color:#666;font-size:1.3rem;line-height:1;padding:0.25rem;">✕</button>
        <h3 style="font-size:1.4rem;font-weight:900;color:#ffffff;margin-bottom:0.4rem;">ברוך הבא!</h3>
        <p style="color:#94a3b8;font-weight:700;font-size:1rem;margin-bottom:1.5rem;">${username}</p>
        <button id="goToAdmin" style="background:#1a3a4a;color:#fff;border:none;border-radius:0.85rem;padding:0.75rem 2rem;font-family:'Assistant',sans-serif;font-weight:900;font-size:1rem;cursor:pointer;width:100%;transition:background 0.2s;margin-bottom:0.6rem;">
          כניסה לממשק ניהול ←
        </button>
        <button id="logoutFromWelcome" style="background:none;border:1.5px solid rgba(255,255,255,0.12);border-radius:0.85rem;padding:0.65rem 2rem;font-family:'Assistant',sans-serif;font-weight:900;font-size:0.95rem;color:#ffffff;cursor:pointer;width:100%;">
          התנתקות
        </button>
      </div>`;
    document.getElementById('closeWelcome').addEventListener('click', () => modal.classList.remove('active'));
    document.getElementById('goToAdmin').addEventListener('click', () => {
      modal.classList.remove('active');
      window.location.href = 'products.html?admin=1';
    });
    document.getElementById('logoutFromWelcome').addEventListener('click', () => {
      doLogout(); modal.classList.remove('active');
    });
  }

  function showAlreadyLoggedIn(modal) {
    const username = sessionStorage.getItem('adminUser') || 'מנהל';
    const content = modal.querySelector('.modal-content');
    content.innerHTML = `
      <div style="text-align:center;padding:0.5rem 0;position:relative;">
        <button id="closeAdminPopup" style="position:absolute;top:-0.5rem;left:-0.5rem;background:none;border:none;cursor:pointer;color:#94a3b8;font-size:1.3rem;line-height:1;padding:0.25rem;">✕</button>
        <h3 style="font-size:1.4rem;font-weight:900;color:#ffffff;margin-bottom:0.4rem;">שלום,</h3>
        <p style="color:#64748b;font-weight:700;font-size:1rem;margin-bottom:1.5rem;">${username}</p>
        <button id="logoutBtn" style="background:#ff4d4d;color:#fff;border:none;border-radius:0.85rem;padding:0.75rem 2rem;font-family:'Assistant',sans-serif;font-weight:900;font-size:1rem;cursor:pointer;width:100%;transition:background 0.2s;">
          התנתקות
        </button>
      </div>`;
    modal.classList.add('active');
    document.getElementById('closeAdminPopup').addEventListener('click', () => modal.classList.remove('active'));
    document.getElementById('logoutBtn').addEventListener('click', () => {
      doLogout(); modal.classList.remove('active');
    });
  }

  function doLogout() {
    sessionStorage.removeItem('isAdmin');
    sessionStorage.removeItem('adminUser');
    isAdmin = false;
    // הסר כפתורי מנהל
    document.querySelector('.admin-fab')?.remove();
    document.querySelectorAll('.admin-card-btns').forEach(el => el.remove());
    document.body.classList.remove('admin-mode');
    // אפס את תוכן הפופ-אפ חזרה לטופס כניסה
    const mc = document.querySelector('.modal-content');
    if (mc) {
      mc.innerHTML = `
        <h3>כניסת מנהלים</h3>
        <input type="text" id="adminUser" placeholder="שם משתמש" />
        <input type="password" id="adminPass" placeholder="סיסמה" />
        <p id="loginError" style="color:#e53e3e;font-weight:700;font-size:0.9rem;text-align:center;margin-top:0.5rem;display:none;"></p>
        <div class="modal-btns">
          <button id="doLogin">התחבר</button>
          <button id="closeModal">ביטול</button>
        </div>`;
      // חבר מחדש את האזנות
      mc.querySelector('#doLogin').addEventListener('click', handleLogin);
      mc.querySelector('#closeModal').addEventListener('click', () => {
        modal.classList.remove('active'); clearForm();
      });
    }
  }

  function clearForm() {
    const u = document.getElementById('adminUser');
    const p = document.getElementById('adminPass');
    const e = document.getElementById('loginError');
    if (u) u.value = '';
    if (p) p.value = '';
    if (e) e.style.display = 'none';
  }
}

/* ─────────────────────────────────────────
   ADMIN — כפתורי FAB + עריכה/מחיקה
───────────────────────────────────────── */
function initAdminTools(renderFn) {
  if (!isAdmin) return;

  // FAB +
  if (!document.querySelector('.admin-fab')) {
    const fab = document.createElement('button');
    fab.className = 'admin-fab';
    fab.title = 'הוספת מוצר חדש';
    fab.innerHTML = `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`;
    fab.addEventListener('click', () => openAddModal(renderFn));
    document.body.appendChild(fab);
  }

  // האזנה לכפתורים על הכרטיסים
  document.addEventListener('click', e => {
    const delBtn  = e.target.closest('.admin-btn--delete');
    const editBtn = e.target.closest('.admin-btn--edit');
    if (delBtn)  { e.stopPropagation(); openDeleteModal(delBtn.dataset.id, renderFn); }
    if (editBtn) { e.stopPropagation(); openEditModal(editBtn.dataset.id, renderFn); }
  });
}

function buildAdminBtns(productId) {
  return `
    <div class="admin-card-btns">
      <button class="admin-btn admin-btn--edit" title="עריכה" data-id="${productId}">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
        </svg>
      </button>
      <button class="admin-btn admin-btn--delete" title="מחיקה" data-id="${productId}">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="3 6 5 6 21 6"/>
          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
          <path d="M10 11v6"/><path d="M14 11v6"/>
          <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
        </svg>
      </button>
    </div>`;
}

/* ── Delete Modal ── */
function openDeleteModal(id, renderFn) {
  const product = PRODUCTS.find(p => p.id === id);
  if (!product) return;
  const m = createAModal('amodal-delete', `
    <div class="amodal-icon amodal-icon--danger">
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="3 6 5 6 21 6"/>
        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
        <path d="M10 11v6"/><path d="M14 11v6"/>
        <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
      </svg>
    </div>
    <h3 class="amodal-title">מחיקת מוצר</h3>
    <p class="amodal-desc">האם אתם בטוחים שברצונכם למחוק את<br><strong>"${product.title}"</strong>?<br>פעולה זו אינה הפיכה.</p>
    <div class="amodal-btns">
      <button class="amodal-btn amodal-btn--danger" id="aConfirmDel">מחק</button>
      <button class="amodal-btn amodal-btn--cancel" id="aCancelDel">ביטול</button>
    </div>`);
  m.querySelector('#aConfirmDel').addEventListener('click', () => {
    PRODUCTS.splice(PRODUCTS.findIndex(p => p.id === id), 1);
    closeAModal(m); renderFn();
  });
  m.querySelector('#aCancelDel').addEventListener('click', () => closeAModal(m));
}

/* ── Edit Modal ── */
function openEditModal(id, renderFn) {
  const product = PRODUCTS.find(p => p.id === id);
  if (!product) return;
  let newImg = product.imageUrl;
  const m = createAModal('amodal-edit', `
    <h3 class="amodal-title">עריכת מוצר</h3>
    <div class="amodal-form">
      <label class="amodal-label">שם המוצר</label>
      <input class="amodal-input" id="aEditTitle" value="${product.title}" />
      <label class="amodal-label">יחידה מבצעת</label>
      <input class="amodal-input" id="aEditUnit" value="${product.unit}" />
      <label class="amodal-label">סוג תוצר</label>
      <input class="amodal-input" id="aEditType" value="${product.type}" />
      <label class="amodal-label">תמונת מוצר</label>
      <div class="amodal-upload-row">
        <img class="amodal-preview" id="aEditPreview" src="${product.imageUrl}" alt="תצוגה" />
        <label class="amodal-upload-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
          בחרי תמונה
          <input type="file" accept="image/*" id="aEditFile" style="display:none" />
        </label>
      </div>
    </div>
    <div class="amodal-btns">
      <button class="amodal-btn amodal-btn--primary" id="aConfirmEdit">שמור</button>
      <button class="amodal-btn amodal-btn--cancel" id="aCancelEdit">ביטול</button>
    </div>`);
  m.querySelector('#aEditFile').addEventListener('change', function() {
    const r = new FileReader();
    r.onload = e => { newImg = e.target.result; m.querySelector('#aEditPreview').src = newImg; };
    r.readAsDataURL(this.files[0]);
  });
  m.querySelector('#aConfirmEdit').addEventListener('click', () => {
    const idx = PRODUCTS.findIndex(p => p.id === id);
    PRODUCTS[idx] = { ...PRODUCTS[idx],
      title: m.querySelector('#aEditTitle').value.trim() || PRODUCTS[idx].title,
      unit:  m.querySelector('#aEditUnit').value.trim()  || PRODUCTS[idx].unit,
      type:  m.querySelector('#aEditType').value.trim()  || PRODUCTS[idx].type,
      imageUrl: newImg };
    closeAModal(m); renderFn();
  });
  m.querySelector('#aCancelEdit').addEventListener('click', () => closeAModal(m));
}

/* ── Add Modal ── */
function openAddModal(renderFn) {
  let newImg = 'https://picsum.photos/id/100/600/400';
  const m = createAModal('amodal-add', `
    <h3 class="amodal-title">הוספת מוצר חדש</h3>
    <div class="amodal-form">
      <label class="amodal-label">קטגוריה</label>
      <select class="amodal-input" id="aAddCat">
        <option value="movies">סרטים</option>
        <option value="animation">אנימציה</option>
        <option value="graphics">גרפיקה</option>
      </select>
      <label class="amodal-label">סוג תוצר</label>
      <input class="amodal-input" id="aAddType" placeholder="סרטון, פוסטר, לוגו..." />
      <label class="amodal-label">שם המוצר</label>
      <input class="amodal-input" id="aAddTitle" placeholder="שם המוצר" />
      <label class="amodal-label">יחידה מבצעת</label>
      <input class="amodal-input" id="aAddUnit" placeholder="שם היחידה" />
      <label class="amodal-label">תמונת תצוגה</label>
      <div class="amodal-upload-row">
        <img class="amodal-preview" id="aAddPreview" src="${newImg}" alt="תצוגה" />
        <label class="amodal-upload-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
          בחרי תמונה
          <input type="file" accept="image/*" id="aAddFile" style="display:none" />
        </label>
      </div>
      <label class="amodal-label">קובץ הפרויקט</label>
      <div class="amodal-upload-row">
        <div class="amodal-file-chip" id="aAddProjectChip">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
          <span id="aAddProjectName">לא נבחר קובץ</span>
        </div>
        <label class="amodal-upload-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
          העלי קובץ
          <input type="file" accept="video/*,image/*,.pdf,.pptx,.mp4,.mov,.avi" id="aAddProjectFile" style="display:none" />
        </label>
      </div>
      <p id="aAddErr" class="amodal-error" style="display:none">יש למלא את כל השדות</p>
    </div>
    <div class="amodal-btns">
      <button class="amodal-btn amodal-btn--primary" id="aConfirmAdd">הוסף</button>
      <button class="amodal-btn amodal-btn--cancel" id="aCancelAdd">ביטול</button>
    </div>`);
  m.querySelector('#aAddFile').addEventListener('change', function() {
    const r = new FileReader();
    r.onload = e => { newImg = e.target.result; m.querySelector('#aAddPreview').src = newImg; };
    r.readAsDataURL(this.files[0]);
  });
  m.querySelector('#aAddProjectFile').addEventListener('change', function() {
    const file = this.files[0];
    if (!file) return;
    m.querySelector('#aAddProjectName').textContent = file.name;
    m.querySelector('#aAddProjectChip').classList.add('has-file');
  });
  m.querySelector('#aConfirmAdd').addEventListener('click', () => {
    const title = m.querySelector('#aAddTitle').value.trim();
    const unit  = m.querySelector('#aAddUnit').value.trim();
    const type  = m.querySelector('#aAddType').value.trim();
    const cat   = m.querySelector('#aAddCat').value;
    if (!title || !unit || !type) { m.querySelector('#aAddErr').style.display = 'block'; return; }
    PRODUCTS.push({ id: 'p_' + Date.now(), category: cat, title, unit, type, imageUrl: newImg });
    closeAModal(m);
    renderFn();
    setTimeout(() => {
      const sec = document.getElementById('section-' + cat);
      if (sec) sec.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  });
  m.querySelector('#aCancelAdd').addEventListener('click', () => closeAModal(m));
}

/* ── Modal helpers ── */
function createAModal(id, html) {
  document.getElementById(id)?.remove();
  const o = document.createElement('div');
  o.className = 'amodal-overlay'; o.id = id;
  o.innerHTML = `<div class="amodal-box">${html}</div>`;
  document.body.appendChild(o);
  requestAnimationFrame(() => o.classList.add('amodal-visible'));
  o.addEventListener('click', e => { if (e.target === o) closeAModal(o); });
  return o;
}
function closeAModal(o) {
  o.classList.remove('amodal-visible');
  o.addEventListener('transitionend', () => o.remove(), { once: true });
}
