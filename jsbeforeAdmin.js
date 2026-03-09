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
   PRODUCTS PAGE
───────────────────────────────────────── */
function initProductsPage() {
  const gridMovies    = document.getElementById('grid-movies');
  const gridAnimation = document.getElementById('grid-animation');
  const gridGraphics  = document.getElementById('grid-graphics');
  if (!gridMovies) return; // לא בעמוד תוצרים

  const searchInput = document.getElementById('searchInput');
  const filterChips = document.querySelectorAll('.fchip');
  const filterCount = document.getElementById('filterCount');
  const emptyState  = document.getElementById('emptyState');
  const clearBtn    = document.getElementById('clearBtn');
  const jumpLinks   = document.querySelectorAll('.jump-link');

  let activeFilter = 'all';
  let searchTerm   = '';

  /* ── Render all grids ── */
  function render() {
    const q = searchTerm.toLowerCase();
    let total = 0;

    const grids = {
      movies:    gridMovies,
      animation: gridAnimation,
      graphics:  gridGraphics,
    };

    Object.entries(grids).forEach(([cat, grid]) => {
      const filtered = PRODUCTS.filter(p => {
        if (p.category !== cat) return false;
        if (activeFilter !== 'all' && p.type !== activeFilter) return false;
        if (q && !p.title.includes(q) && !p.unit.includes(q) && !p.type.includes(q)) return false;
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
    filterCount.textContent = total === PRODUCTS.length ? 'מציג הכל' : `מציג ${total} תוצרים`;

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
          <button class="card-view-btn">צפייה בפרטי הפרויקט</button>
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
          <span>${product.unit}</span>
          <span class="card-dot"></span>
        </div>
      </div>
    `;
    return card;
  }

  /* ── Filter chips ── */
  filterChips.forEach(chip => {
    chip.addEventListener('click', () => {
      filterChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      activeFilter = chip.dataset.filter;
      render();
    });
  });

  /* ── Search ── */
  searchInput.addEventListener('input', e => {
    searchTerm = e.target.value;
    render();
  });

  /* ── Clear ── */
  clearBtn.addEventListener('click', () => {
    searchTerm = '';
    searchInput.value = '';
    activeFilter = 'all';
    filterChips.forEach(c => c.classList.remove('active'));
    document.querySelector('.fchip[data-filter="all"]').classList.add('active');
    render();
  });

  /* ── Highlight active jump link on scroll ── */
  const sections = [
    document.getElementById('section-movies'),
    document.getElementById('section-animation'),
    document.getElementById('section-graphics'),
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
}

/* ─────────────────────────────────────────
   BOOT
───────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initScrollReveal();
  initScrollChevron();
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
