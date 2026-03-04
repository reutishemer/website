/* ============================================================
   shared.js — JavaScript משותף לכל האתר | יחידת שה"ד 339
   ============================================================ */

'use strict';

/* ─────────────────────────────────────────
   DATA
───────────────────────────────────────── */
const PRODUCTS = [
  // Movies
  { id: 'm1', category: 'movies',    title: 'חיסול הטרור',     unit: 'חיל האוויר',   type: 'סרטון',    imageUrl: 'https://picsum.photos/id/1/600/400' },
  { id: 'm2', category: 'movies',    title: 'חיבוק ברזל',      unit: 'פיקוד העורף',  type: 'סרט',      imageUrl: 'https://picsum.photos/id/2/600/400' },
  { id: 'm3', category: 'movies',    title: 'מבצע שלום',        unit: 'יהל"ם',        type: 'תיעוד',    imageUrl: 'https://picsum.photos/id/3/600/400' },
  { id: 'm4', category: 'movies',    title: 'כנפי האש',         unit: 'חיל האוויר',   type: 'סרטון',    imageUrl: 'https://picsum.photos/id/4/600/400' },
  { id: 'm5', category: 'movies',    title: 'שחר חדש',          unit: 'אג"מ',          type: 'תיעוד',    imageUrl: 'https://picsum.photos/id/5/600/400' },

  // Animation
  { id: 'a1', category: 'animation', title: 'הנפשה מונעת',      unit: 'חיל הקשר',     type: 'דו-מימד',  imageUrl: 'https://picsum.photos/id/10/600/400' },
  { id: 'a2', category: 'animation', title: 'סטיץ במדבר',       unit: 'אג"מ',          type: 'תלת-מימד', imageUrl: 'https://picsum.photos/id/11/600/400' },
  { id: 'a3', category: 'animation', title: 'מיקי הגה',          unit: 'חיל הים',      type: 'קלאסי',    imageUrl: 'https://picsum.photos/id/12/600/400' },
  { id: 'a4', category: 'animation', title: 'רובוטים ואנשים',   unit: 'מערך ההדרכה',  type: 'דו-מימד',  imageUrl: 'https://picsum.photos/id/13/600/400' },

  // Graphics
  { id: 'g1', category: 'graphics',  title: 'צבעוניות מופשטת', unit: 'מערך ההדרכה',  type: 'פוסטר',    imageUrl: 'https://picsum.photos/id/20/600/400' },
  { id: 'g2', category: 'graphics',  title: 'מיתוג יחידה',      unit: 'חיל האוויר',   type: 'לוגו',     imageUrl: 'https://picsum.photos/id/21/600/400' },
  { id: 'g3', category: 'graphics',  title: 'ממשק שליטה',       unit: 'תקשוב',        type: 'UX/UI',    imageUrl: 'https://picsum.photos/id/22/600/400' },
  { id: 'g4', category: 'graphics',  title: 'מדריך מותג',       unit: 'אג"מ',          type: 'פוסטר',    imageUrl: 'https://picsum.photos/id/23/600/400' },
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
    const target    = document.getElementById('firstRow');
    if (container && target) container.scrollTo({ top: target.offsetTop, behavior: 'smooth' });
  });
}

/* ─────────────────────────────────────────
   PRODUCTS PAGE (NEW: dropdown + multi-select + search in filter bar)
   דורש HTML חדש:
   - #filterTrigger, #filterPanel, #filterTriggerText, #filterClear
   - .fopt buttons with data-filter="..."
   - #searchInput moved into filter bar
───────────────────────────────────────── */
function initProductsPage() {
  const gridMovies    = document.getElementById('grid-movies');
  const gridAnimation = document.getElementById('grid-animation');
  const gridGraphics  = document.getElementById('grid-graphics');
  if (!gridMovies) return; // לא בעמוד תוצרים

  const searchInput = document.getElementById('searchInput');
  const filterCount = document.getElementById('filterCount');
  const emptyState  = document.getElementById('emptyState');
  const clearBtn    = document.getElementById('clearBtn');
  const jumpLinks   = document.querySelectorAll('.jump-link');

  // NEW: dropdown multi-filter elements
  const filterTrigger     = document.getElementById('filterTrigger');
  const filterPanel       = document.getElementById('filterPanel');
  const filterTriggerText = document.getElementById('filterTriggerText');
  const filterClear       = document.getElementById('filterClear');
  const filterOptions     = document.querySelectorAll('.fopt');

  // Multi select: default = all selected
  let selectedFilters = new Set(Array.from(filterOptions).map(b => b.dataset.filter));
  let searchTerm = '';

  function updateTriggerLabel() {
    const totalOptions = filterOptions.length;
    const count = selectedFilters.size;

    if (count === totalOptions) {
      filterTriggerText.textContent = 'הכל';
      return;
    }
    if (count === 0) {
      filterTriggerText.textContent = 'ללא';
      return;
    }
    filterTriggerText.textContent = `נבחרו ${count}`;
  }

  function applyOptionClasses() {
    filterOptions.forEach(btn => {
      btn.classList.toggle('active', selectedFilters.has(btn.dataset.filter));
    });
  }

  // Toggle panel
  function openPanel() {
    filterPanel.classList.remove('hidden');
    filterTrigger.setAttribute('aria-expanded', 'true');
  }
  function closePanel() {
    filterPanel.classList.add('hidden');
    filterTrigger.setAttribute('aria-expanded', 'false');
  }
  function togglePanel() {
    const isOpen = !filterPanel.classList.contains('hidden');
    isOpen ? closePanel() : openPanel();
  }

  if (filterTrigger && filterPanel) {
    filterTrigger.addEventListener('click', (e) => {
      e.stopPropagation();
      togglePanel();
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
      const dropdown = document.getElementById('filterDropdown');
      if (dropdown && !dropdown.contains(e.target)) closePanel();
    });
  }

  // Multi select click
  filterOptions.forEach(btn => {
    btn.addEventListener('click', () => {
      const key = btn.dataset.filter;
      if (selectedFilters.has(key)) selectedFilters.delete(key);
      else selectedFilters.add(key);

      applyOptionClasses();
      updateTriggerLabel();
      render();
    });
  });

  // Clear filters => select all
  if (filterClear) {
    filterClear.addEventListener('click', () => {
      selectedFilters = new Set(Array.from(filterOptions).map(b => b.dataset.filter));
      applyOptionClasses();
      updateTriggerLabel();
      render();
    });
  }

  /* ── Render all grids ── */
  function render() {
    const q = (searchTerm || '').toLowerCase().trim();
    let total = 0;

    const grids = {
      movies:    gridMovies,
      animation: gridAnimation,
      graphics:  gridGraphics,
    };

    Object.entries(grids).forEach(([cat, grid]) => {
      const filtered = PRODUCTS.filter(p => {
        if (p.category !== cat) return false;

        // Multi select filter (אם אין שום דבר מסומן → לא מציג כלום)
        if (selectedFilters.size > 0 && !selectedFilters.has(p.type)) return false;

        // Search (case-insensitive)
        if (q) {
          const hay = `${p.title} ${p.unit} ${p.type}`.toLowerCase();
          if (!hay.includes(q)) return false;
        }

        return true;
      });

      total += filtered.length;
      grid.innerHTML = '';
      filtered.forEach((product, i) => {
        const card = createCard(product, i);
        grid.appendChild(card);
      });

      // Hide/show entire section based on results
      const section = document.getElementById('section-' + cat);
      if (section) section.style.display = filtered.length === 0 ? 'none' : '';
    });

    // Update count
    const allCount = PRODUCTS.length;
    if (total === allCount && selectedFilters.size === filterOptions.length && !q) {
      filterCount.textContent = 'מציג הכל';
    } else {
      filterCount.textContent = `מציג ${total} תוצרים`;
    }

    // Empty state
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
          <button class="card-view-btn" type="button">צפייה בפרטי הפרויקט</button>
        </div>
      </div>
      <div class="card-body">
        <div class="card-header-row">
          <div>
            <p class="card-type">${product.type}</p>
            <h3 class="card-title">${product.title}</h3>
          </div>
          <div class="card-logo">
            <img src="${IAF_LOGO}" alt="לוגו" onerror="this.src='${IAF_LOGO}'" />
          </div>
        </div>
        <div class="card-footer">
          <span>יחידה מבצעת: ${product.unit}</span>
          <span class="card-dot"></span>
        </div>
      </div>
    `;
    return card;
  }

  /* ── Search ── */
  if (searchInput) {
    searchInput.addEventListener('input', e => {
      searchTerm = e.target.value || '';
      render();
    });
  }

  /* ── Clear (Empty state button) ── */
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      searchTerm = '';
      if (searchInput) searchInput.value = '';

      selectedFilters = new Set(Array.from(filterOptions).map(b => b.dataset.filter));
      applyOptionClasses();
      updateTriggerLabel();

      render();
    });
  }

  /* ── Highlight active jump link on scroll (אם יש jump links) ── */
  const sections = [
    document.getElementById('section-movies'),
    document.getElementById('section-animation'),
    document.getElementById('section-graphics'),
  ];

  if (jumpLinks && jumpLinks.length) {
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
  }

  /* ── Scroll to hash on load ── */
  if (window.location.hash) {
    setTimeout(() => {
      const target = document.querySelector(window.location.hash);
      if (target) target.scrollIntoView({ behavior: 'smooth' });
    }, 150);
  }

  /* ── Init ── */
  applyOptionClasses();
  updateTriggerLabel();
  render();
}

/* ─────────────────────────────────────────
   GLOBAL NAV (Logo menu + admin modal)
───────────────────────────────────────── */
function initGlobalNav() {
  const loginBtn = document.getElementById('adminLoginBtn');
  const modal = document.getElementById('loginModal');
  const closeModal = document.getElementById('closeModal');
  const doLogin = document.getElementById('doLogin');
  const contactLink = document.getElementById('contactLink');

  // גלילה לצור קשר (פוטר)
  if (contactLink) {
    contactLink.addEventListener('click', (e) => {
      e.preventDefault();
      const footer = document.querySelector('footer') || document.querySelector('.site-footer');
      if (footer) footer.scrollIntoView({ behavior: 'smooth' });
    });
  }

  // ניהול הפופ-אפ
  if (loginBtn && modal) loginBtn.addEventListener('click', () => modal.classList.add('active'));
  if (closeModal && modal) closeModal.addEventListener('click', () => modal.classList.remove('active'));

  if (doLogin && modal) {
    doLogin.addEventListener('click', () => {
      const user = (document.getElementById('adminUser')?.value || '').trim();
      const pass = (document.getElementById('adminPass')?.value || '').trim();

      if (user === 'admin' && pass === '1234') {
        alert('שלום מנהל!');
        modal.classList.remove('active');
        document.body.classList.add('admin-mode');
        // כאן אפשר להוסיף לוגיקה למחיקה/עריכה
      } else {
        alert('שם משתמש או סיסמה שגויים');
      }
    });
  }
}

/* ─────────────────────────────────────────
   BOOT
───────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initScrollReveal();
  initScrollChevron();
  initProductsPage();
  initGlobalNav();
});