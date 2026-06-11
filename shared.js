/* ============================================================
   shared.js — JavaScript משותף לכל האתר | יחידת שה"ד 339
   ============================================================ */

'use strict';

/* ─────────────────────────────────────────
   SHAREPOINT CONFIG
───────────────────────────────────────── */
const SP_CONFIG = {
  siteUrl: '',
  libraryName: 'תוצרים',
  folders: {
    movies:    'סרטים',
    animation: 'אנימציה',
    graphics:  'גרפיקה',
    ai:        'AI',
  }
};

/* ─────────────────────────────────────────
   DATA — נטען דינמית מהשיירפוינט
   (הנתונים הסטטיים משמשים כגיבוי בלבד
    אם ה-API לא זמין)
───────────────────────────────────────── */
let PRODUCTS = [
  // Movies
  { id: 'm1', category: 'movies',    title: 'חיסול הטרור',     unit: 'חיל האוויר',   type: 'סרטון',    imageUrl: '../assets/newPhotos/animation/singing.jpeg', fileUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
  { id: 'm2', category: 'movies',    title: 'חיבוק ברזל',      unit: 'פיקוד העורף',  type: 'סרט',      imageUrl: '../assets/newPhotos/movies/musicMovies.jpeg' },
  { id: 'm3', category: 'movies',    title: 'מבצע שלום',        unit: 'יהל"ם',        type: 'תיעוד',    imageUrl: '../assets/newPhotos/movies/photograther.jpeg' },
  { id: 'm4', category: 'movies',    title: 'כנפי האש',         unit: 'חיל האוויר',   type: 'סרטון',    imageUrl: '../assets/newPhotos/movies/adler.jpeg' },
  { id: 'm5', category: 'movies',    title: 'שחר חדש',          unit: 'אג"מ',          type: 'תיעוד',    imageUrl: '../assets/newPhotos/movies/asafandYaahav.jpeg' },
  { id: 'a1', category: 'animation', title: 'הנפשה מונעת',      unit: 'חיל הקשר',     type: 'דו-מימד',  imageUrl: '../assets/newPhotos/animation/poster.jpeg' },
  { id: 'a2', category: 'animation', title: 'סטיץ במדבר',       unit: 'אג"מ',          type: 'תלת-מימד', imageUrl: '../assets/newPhotos/animation/animation.jpeg' },
  { id: 'a3', category: 'animation', title: 'מיקי הגה',          unit: 'חיל הים',      type: 'קלאסי',    imageUrl: '../assets/newPhotos/grafics/grafica.jpeg' },
  { id: 'a4', category: 'animation', title: 'רובוטים ואנשים',   unit: 'מערך ההדרכה',  type: 'דו-מימד',  imageUrl: '../assets/newPhotos/grafics/grafics.jpeg' },
  { id: 'g1', category: 'graphics',  title: 'צבעוניות מופשטת', unit: 'מערך ההדרכה',  type: 'פוסטר',    imageUrl: '../assets/newPhotos/animation/aiLogo.jpeg' },
  { id: 'g2', category: 'graphics',  title: 'מיתוג יחידה',      unit: 'חיל האוויר',   type: 'לוגו',     imageUrl: '../assets/newPhotos/grafics/grafics.jpeg' },
  { id: 'g3', category: 'graphics',  title: 'ממשק שליטה',       unit: 'תקשוב',        type: 'UX/UI',    imageUrl: '../assets/newPhotos/grafics/uiKit.jpeg' },
  { id: 'g4', category: 'graphics',  title: 'מדריך מותג',       unit: 'אג"מ',          type: 'פוסטר',    imageUrl: '../assets/newPhotos/grafics/grafica.jpeg' },
  { id: 'ai1', category: 'ai',       title: 'תלת מימד',          unit: 'מערך האוויר',  type: 'AI',       imageUrl: '../assets/newPhotos/animation/aiLogo.jpeg' },
  { id: 'ai2', category: 'ai',       title: 'סרטון AI',          unit: 'תקשוב',        type: 'AI',       imageUrl: '../assets/newPhotos/grafics/grafica.jpeg' },
];

const IAF_LOGO = 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/IAF_logo.svg/1024px-IAF_logo.svg.png';


/* ═══════════════════════════════════════════
   SHAREPOINT API — פונקציות עזר
═══════════════════════════════════════════ */

/**
 * קבלת Request Digest (נדרש לכתיבה ב-SharePoint)
 */
async function getRequestDigest() {
  const res = await fetch(`${SP_CONFIG.siteUrl}/_api/contextinfo`, {
    method: 'POST',
    headers: { 'Accept': 'application/json;odata=verbose' },
    credentials: 'include'
  });
  if (!res.ok) throw new Error('לא ניתן לקבל הרשאת כתיבה מהשיירפוינט');
  const data = await res.json();
  return data.d.GetContextWebInformation.FormDigestValue;
}

/**
 * טעינת כל התוצרים מרשימת השיירפוינט
 * מחליף את המערך הסטטי PRODUCTS בנתונים אמיתיים
 */
async function loadProductsFromSP() {
  const select = [
    'Id', 'Title', 'ProjectUnit', 'ProjectType', 'Category',
    'FileRef', 'FileLeafRef', 'ThumbUrl'
  ].join(',');

  const res = await fetch(
    `${SP_CONFIG.siteUrl}/_api/web/lists/getbytitle('${SP_CONFIG.libraryName}')/items` +
    `?$select=${select}&$top=500&$orderby=Created desc`,
    {
      credentials: 'include',
      headers: { 'Accept': 'application/json;odata=verbose' }
    }
  );

  if (!res.ok) throw new Error(`שגיאה בטעינת תוצרים: ${res.status}`);
  const data = await res.json();

  // ממפים את פריטי השיירפוינט למבנה שמצפה לו האתר
  PRODUCTS = data.d.results
    .filter(item => item.FileRef && !item.FileLeafRef?.startsWith('thumb_')) // מסנן תמונות ממוזערות
    .map(item => {
      // מחפשים תמונת תצוגה מקושרת (קובץ עם prefix "thumb_")
      const thumbItem = data.d.results.find(t =>
        t.FileLeafRef?.startsWith('thumb_') &&
        t.FileLeafRef?.includes(item.Title || '')
      );

      return {
        id:       'sp_' + item.Id,
        spId:     item.Id,                                      // ← ID ב-SharePoint לעריכה/מחיקה
        category: normalizeCategoryFromSP(item.Category),
        title:    item.Title || item.FileLeafRef || 'ללא שם',
        unit:     item.ProjectUnit  || '',
        type:     item.ProjectType  || '',
        imageUrl: thumbItem
                    ? window.location.origin + thumbItem.FileRef
                    : '../assets/placeholder.jpg',
        fileUrl:  window.location.origin + item.FileRef
      };
    });
}

/**
 * נרמול שם קטגוריה מהשיירפוינט (עברית/אנגלית) לערך פנימי
 */
function normalizeCategoryFromSP(cat) {
  if (!cat) return 'movies';
  const map = {
    'סרטים': 'movies', 'movies': 'movies',
    'אנימציה': 'animation', 'animation': 'animation',
    'גרפיקה': 'graphics', 'graphics': 'graphics',
    'ai': 'ai', 'AI': 'ai',
  };
  return map[cat] || cat.toLowerCase();
}

/**
 * וידוא שתיקייה קיימת — יצירה אם לא
 */
async function ensureFolder(digest, folderPath) {
  await fetch(`${SP_CONFIG.siteUrl}/_api/web/folders`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Accept': 'application/json;odata=verbose',
      'Content-Type': 'application/json;odata=verbose',
      'X-RequestDigest': digest
    },
    body: JSON.stringify({
      '__metadata': { 'type': 'SP.Folder' },
      'ServerRelativeUrl': `${SP_CONFIG.libraryName}/${folderPath}`
    })
  });
  // לא זורקים שגיאה — תיקייה שכבר קיימת מחזירה 409, זה בסדר
}

/**
 * העלאת קובץ לשיירפוינט
 * מחזיר את ה-ServerRelativeUrl של הקובץ
 */
async function uploadFileToSP(digest, file, folderPath, fileName) {
  const arrayBuffer   = await file.arrayBuffer();
  const encodedName   = encodeURIComponent(fileName);
  const encodedFolder = encodeURIComponent(`${SP_CONFIG.libraryName}/${folderPath}`);

  const url = `${SP_CONFIG.siteUrl}/_api/web/GetFolderByServerRelativeUrl('${encodedFolder}')/Files/add(url='${encodedName}',overwrite=true)`;

  const res = await fetch(url, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Accept': 'application/json;odata=verbose',
      'X-RequestDigest': digest,
      'Content-Length': arrayBuffer.byteLength
    },
    body: arrayBuffer
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`שגיאה בהעלאת קובץ: ${err}`);
  }

  const data = await res.json();
  return data.d.ServerRelativeUrl;
}

/**
 * עדכון עמודות מטא-דאטה על פריט קיים בשיירפוינט
 * אפשר לקרוא לפי fileUrl (ServerRelativeUrl) או לפי spId ישירות
 */
async function updateFileMetadata(digest, fileUrl, metadata) {
  const encodedUrl = encodeURIComponent(fileUrl);

  // קבלת ה-Id של הפריט
  const itemRes = await fetch(
    `${SP_CONFIG.siteUrl}/_api/web/GetFileByServerRelativeUrl('${encodedUrl}')/ListItemAllFields`,
    {
      credentials: 'include',
      headers: { 'Accept': 'application/json;odata=verbose' }
    }
  );
  if (!itemRes.ok) return;

  const itemData = await itemRes.json();
  const itemId   = itemData.d.Id;
  const listTitle = SP_CONFIG.libraryName;

  await fetch(
    `${SP_CONFIG.siteUrl}/_api/web/lists/getbytitle('${listTitle}')/items(${itemId})`,
    {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Accept': 'application/json;odata=verbose',
        'Content-Type': 'application/json;odata=verbose',
        'X-RequestDigest': digest,
        'X-HTTP-Method': 'MERGE',
        'If-Match': '*'
      },
      body: JSON.stringify({
        '__metadata': { 'type': 'SP.Data.' + listTitle.replace(/\s/g, '_x0020_') + 'Item' },
        'Title':       metadata.title,
        'ProjectUnit': metadata.unit,
        'ProjectType': metadata.type,
        'Category':    metadata.category
      })
    }
  );
}

/**
 * עדכון עמודות לפי spId ישירות (לעריכה)
 */
async function updateItemById(digest, spId, metadata) {
  const listTitle = SP_CONFIG.libraryName;

  const res = await fetch(
    `${SP_CONFIG.siteUrl}/_api/web/lists/getbytitle('${listTitle}')/items(${spId})`,
    {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Accept': 'application/json;odata=verbose',
        'Content-Type': 'application/json;odata=verbose',
        'X-RequestDigest': digest,
        'X-HTTP-Method': 'MERGE',
        'If-Match': '*'
      },
      body: JSON.stringify({
        '__metadata': { 'type': 'SP.Data.' + listTitle.replace(/\s/g, '_x0020_') + 'Item' },
        'Title':       metadata.title,
        'ProjectUnit': metadata.unit,
        'ProjectType': metadata.type,
        'Category':    metadata.category
      })
    }
  );

  if (!res.ok && res.status !== 204) {
    throw new Error(`שגיאה בעדכון פריט: ${res.status}`);
  }
}

/**
 * מחיקת פריט מהשיירפוינט לפי spId
 */
async function deleteItemFromSP(digest, spId) {
  const listTitle = SP_CONFIG.libraryName;

  const res = await fetch(
    `${SP_CONFIG.siteUrl}/_api/web/lists/getbytitle('${listTitle}')/items(${spId})`,
    {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Accept': 'application/json;odata=verbose',
        'X-RequestDigest': digest,
        'X-HTTP-Method': 'DELETE',
        'If-Match': '*'
      }
    }
  );

  if (!res.ok && res.status !== 204) {
    throw new Error(`שגיאה במחיקת פריט: ${res.status}`);
  }
}

/**
 * פונקציה ראשית — מעלה קובץ + תמונה + מטא-דאטה
 * מחזירה { projectUrl, imageUrl } מלאים
 */
async function uploadProductToSharePoint(productData, projectFile, imageFile) {
  const digest = await getRequestDigest();
  const folder  = SP_CONFIG.folders[productData.category] || productData.category;
  const ts      = Date.now();

  await ensureFolder(digest, folder);

  let projectUrl = null;
  let imageUrl   = null;

  if (projectFile) {
    const ext  = projectFile.name.split('.').pop();
    const name = `${productData.title}_${ts}.${ext}`;
    projectUrl = await uploadFileToSP(digest, projectFile, folder, name);
  }

  if (imageFile) {
    const ext  = imageFile.name.split('.').pop();
    const name = `thumb_${productData.title}_${ts}.${ext}`;
    imageUrl = await uploadFileToSP(digest, imageFile, folder, name);
  }

  if (projectUrl) {
    await updateFileMetadata(digest, projectUrl, productData);
  }

  const baseUrl = window.location.origin;
  return {
    projectUrl: projectUrl ? baseUrl + projectUrl : null,
    imageUrl:   imageUrl   ? baseUrl + imageUrl   : null
  };
}


/* ═══════════════════════════════════════════
   SHARED — Scroll Reveal
═══════════════════════════════════════════ */
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
    const target    = document.querySelector('.categories-section');
    if (container && target) container.scrollTo({ top: target.offsetTop, behavior: 'smooth' });
  });
}

/* ─────────────────────────────────────────
   HOME — Posters Carousel
───────────────────────────────────────── */
function initPostersCarousel() {
  const track = document.getElementById('carouselTrack');
  if (!track) return;

  const CARD_W = 220;
  const GAP    = 19.2;
  const STEP   = CARD_W + GAP;

  const POSTERS = [
    { title: 'מבצע שחר',       img: '../assets/posters/פוסטרים דוגמאות/166.png' },
    { title: 'כנפי האש',       img: '../assets/posters/פוסטרים דוגמאות/bhh8.png' },
    { title: 'לב האריה',       img: '../assets/posters/פוסטרים דוגמאות/moviePoster.png' },
    { title: 'רוח מדבר',       img: '../assets/posters/פוסטרים דוגמאות/yanshuf.png' },
    { title: 'שמי הצפון',      img: '../assets/posters/פוסטרים דוגמאות/moviePoster.png' },
    { title: 'גיבורי הסדרים',  img: '../assets/posters/פוסטרים דוגמאות/166.png' },
    { title: 'גבול הברזל',     img: '../assets/posters/פוסטרים דוגמאות/moviePoster.png' },
    { title: 'קול הסערה',      img: '../assets/posters/פוסטרים דוגמאות/bhh8.png' },
  ];

  const n        = POSTERS.length;
  const extended = [ ...POSTERS.slice(-3), ...POSTERS, ...POSTERS.slice(0, 3) ];

  extended.forEach((p, i) => {
    const realIndex = i - 3;
    const card      = document.createElement('div');
    card.className  = 'poster-card' + (realIndex === 0 ? ' active' : '');
    card.dataset.real = realIndex;
    card.innerHTML = `
      <img src="${p.img}" alt="${p.title}" loading="lazy"
           onerror="this.src='https://picsum.photos/id/${20 + ((realIndex % n + n) % n)}/300/420'" />
      <div class="poster-overlay"><span>${p.title}</span></div>`;
    card.addEventListener('click', () => goTo(realIndex));
    track.appendChild(card);
  });

  let current   = 0;
  let isJumping = false;

  function updateActive() {
    document.querySelectorAll('.poster-card').forEach(c => {
      c.classList.toggle('active', parseInt(c.dataset.real) === current);
    });
  }

  function goTo(index) {
    if (isJumping) return;
    current = index;
    const visualIndex = current + 3;
    track.style.transition = 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
    track.style.transform  = `translateX(${visualIndex * STEP}px)`;
    updateActive();

    track.addEventListener('transitionend', function onEnd() {
      track.removeEventListener('transitionend', onEnd);
      if (current >= n) {
        isJumping = true;
        current -= n;
        track.style.transition = 'none';
        track.style.transform  = `translateX(${(current + 3) * STEP}px)`;
        updateActive();
        requestAnimationFrame(() => { isJumping = false; });
      } else if (current < 0) {
        isJumping = true;
        current += n;
        track.style.transition = 'none';
        track.style.transform  = `translateX(${(current + 3) * STEP}px)`;
        updateActive();
        requestAnimationFrame(() => { isJumping = false; });
      }
    });
  }

  track.style.transition = 'none';
  track.style.transform  = `translateX(${3 * STEP}px)`;

  document.getElementById('arrowRight')?.addEventListener('click', () => goTo(current - 1));
  document.getElementById('arrowLeft')?.addEventListener('click',  () => goTo(current + 1));

  let startX = 0;
  track.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend',   e => {
    const dx = e.changedTouches[0].clientX - startX;
    if (Math.abs(dx) > 40) goTo(dx > 0 ? current - 1 : current + 1);
  });
}

/* ─────────────────────────────────────────
   path in homePage
───────────────────────────────────────── */
function drawMagicPath() {
  const steps     = document.querySelectorAll('.magic-img-wrap');
  const svg       = document.querySelector('.magic-path');
  const pathEl    = document.getElementById('magicPathLine');
  if (!steps.length || !svg || !pathEl) return;

  const container     = document.querySelector('.magic-steps');
  const containerRect = container.getBoundingClientRect();

  const points = Array.from(steps).map(el => {
    const rect = el.getBoundingClientRect();
    return {
      x: rect.left + rect.width  / 2 - containerRect.left,
      y: rect.top  + rect.height / 2 - containerRect.top
    };
  });

  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1], curr = points[i];
    const cy   = (prev.y + curr.y) / 2;
    d += ` C ${prev.x} ${cy}, ${curr.x} ${cy}, ${curr.x} ${curr.y}`;
  }
  pathEl.setAttribute('d', d);
}

window.addEventListener('load',   drawMagicPath);
window.addEventListener('resize', drawMagicPath);


/* ═══════════════════════════════════════════
   PRODUCTS PAGE
═══════════════════════════════════════════ */
async function initProductsPage() {
  const gridMovies    = document.getElementById('grid-movies');
  const gridAnimation = document.getElementById('grid-animation');
  const gridGraphics  = document.getElementById('grid-graphics');
  const gridAi        = document.getElementById('grid-ai');
  if (!gridMovies) return;

  // ── טעינת ספינר בזמן שליפה מהשיירפוינט ──────────────────
  showLoadingSpinner();

  try {
    await loadProductsFromSP();       // ← טוען מהשיירפוינט
  } catch (err) {
    console.warn('⚠️ טעינה מהשיירפוינט נכשלה — עובד עם נתונים מקומיים:', err.message);
    // PRODUCTS נשאר עם הנתונים הסטטיים כגיבוי
  } finally {
    hideLoadingSpinner();
  }

  // ── אלמנטים ───────────────────────────────────────────────
  const searchInput       = document.getElementById('searchInput');
  const filterCount       = document.getElementById('filterCount');
  const emptyState        = document.getElementById('emptyState');
  const clearBtn          = document.getElementById('clearBtn');
  const jumpLinks         = document.querySelectorAll('.jump-link');
  const filterTrigger     = document.getElementById('filterTrigger');
  const filterPanel       = document.getElementById('filterPanel');
  const filterTriggerText = document.getElementById('filterTriggerText');
  const filterClear       = document.getElementById('filterClear');
  const filterOptBtns     = document.querySelectorAll('.fopt');

  let selectedFilters = new Set(Array.from(filterOptBtns).map(b => b.dataset.filter));
  let searchTerm = '';

  function updateTriggerLabel() {
    if (!filterTriggerText) return;
    filterTriggerText.textContent =
      selectedFilters.size === filterOptBtns.length ? 'הכל' :
      selectedFilters.size === 0 ? 'ללא' : `נבחרו ${selectedFilters.size}`;
  }

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

  if (filterClear) {
    filterClear.addEventListener('click', () => {
      filterOptBtns.forEach(b => { selectedFilters.add(b.dataset.filter); b.classList.add('active'); });
      updateTriggerLabel();
      render();
    });
  }

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
      filtered.forEach((product, i) => grid.appendChild(createCard(product, i)));

      const section = document.getElementById('section-' + cat);
      if (section) section.style.display = filtered.length === 0 ? 'none' : '';
    });

    if (filterCount) filterCount.textContent = total === PRODUCTS.length ? 'מציג הכל' : `מציג ${total} תוצרים`;
    if (emptyState)  emptyState.classList.toggle('hidden', total > 0);
  }

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
      </div>`;
    card.querySelector('.card-view-btn').addEventListener('click', e => {
      e.stopPropagation();
      openViewModal(product);
    });
    card.addEventListener('click', () => openViewModal(product));
    return card;
  }

  function openViewModal(product) {
    const isVideo  = product.fileUrl && /\.(mp4|mov|avi|webm)$/i.test(product.fileUrl);
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
    o.id    = 'viewModal';
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

  if (searchInput) searchInput.addEventListener('input', e => { searchTerm = e.target.value; render(); });

  if (clearBtn) clearBtn.addEventListener('click', () => {
    searchTerm = '';
    if (searchInput) searchInput.value = '';
    filterOptBtns.forEach(b => { selectedFilters.add(b.dataset.filter); b.classList.add('active'); });
    updateTriggerLabel();
    render();
  });

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

  if (window.location.hash) {
    setTimeout(() => {
      const target = document.querySelector(window.location.hash);
      if (target) target.scrollIntoView({ behavior: 'smooth' });
    }, 150);
  }

  render();
  initAdminTools(render);
}

/* ─────────────────────────────────────────
   Loading Spinner
───────────────────────────────────────── */
function showLoadingSpinner() {
  if (document.getElementById('sp-loading')) return;
  const el = document.createElement('div');
  el.id = 'sp-loading';
  el.style.cssText = `
    position:fixed;inset:0;z-index:9998;
    display:flex;flex-direction:column;align-items:center;justify-content:center;
    background:rgba(0,0,0,0.55);backdrop-filter:blur(4px);
    gap:1rem;
  `;
  el.innerHTML = `
    <div style="width:48px;height:48px;border:3px solid rgba(255,255,255,0.15);border-top-color:#fff;border-radius:50%;animation:sp-spin 0.8s linear infinite;"></div>
    <p style="color:#fff;font-family:'Assistant',sans-serif;font-weight:700;font-size:1rem;margin:0;">טוען תוצרים מהשיירפוינט...</p>
    <style>@keyframes sp-spin{to{transform:rotate(360deg)}}</style>
  `;
  document.body.appendChild(el);
}

function hideLoadingSpinner() {
  const el = document.getElementById('sp-loading');
  if (!el) return;
  el.style.opacity = '0';
  el.style.transition = 'opacity 0.3s ease';
  el.addEventListener('transitionend', () => el.remove(), { once: true });
}


/* ═══════════════════════════════════════════
   BOOT
═══════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  initScrollReveal();
  initScrollChevron();
  initPostersCarousel();
  initGlobalNav();
  initProductsPage();   // ← async, לא צריך await כאן
});

document.addEventListener('DOMContentLoaded', () => {
  const hero = document.querySelector('.products-hero');
  if (!hero) return;
  let ticking = false;
  function toggleScrolled() {
    const heroBottom = hero.getBoundingClientRect().bottom;
    document.body.classList.toggle('scrolled', heroBottom <= 0);
    ticking = false;
  }
  window.addEventListener('scroll', () => {
    if (!ticking) { ticking = true; requestAnimationFrame(toggleScrolled); }
  }, { passive: true });
  toggleScrolled();
});


/* ═══════════════════════════════════════════
   ADMIN STATE
═══════════════════════════════════════════ */
if (window.location.search.includes('admin=1')) {
  sessionStorage.setItem('isAdmin', '1');
}
let isAdmin = sessionStorage.getItem('isAdmin') === '1';


/* ═══════════════════════════════════════════
   GLOBAL NAV
═══════════════════════════════════════════ */
function initGlobalNav() {
  const loginBtn      = document.getElementById('adminLoginBtn');
  const modal         = document.getElementById('loginModal');
  const closeModalBtn = document.getElementById('closeModal');
  const doLogin       = document.getElementById('doLogin');
  const contactLink   = document.getElementById('contactLink');

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
    if (isAdmin) { showAlreadyLoggedIn(modal); return; }
    const user  = (document.getElementById('adminUser')?.value || '').trim();
    const pass  = (document.getElementById('adminPass')?.value || '').trim();
    const errEl = document.getElementById('loginError');
    if (user === 'admin' && pass === '1234') {
      sessionStorage.setItem('adminUser', user);
      showWelcome(user, modal);
    } else {
      if (errEl) { errEl.textContent = 'שם משתמש או סיסמה שגויים'; errEl.style.display = 'block'; }
      const p = document.getElementById('adminPass');
      if (p) { p.value = ''; p.focus(); }
    }
  }

  function showWelcome(username, modal) {
    const content = modal.querySelector('.modal-content');
    content.innerHTML = `
      <div style="text-align:center;padding:0.5rem 0;position:relative;">
        <button id="closeWelcome" style="position:absolute;top:-0.5rem;left:-0.5rem;background:none;border:none;cursor:pointer;color:#666;font-size:1.3rem;line-height:1;padding:0.25rem;">✕</button>
        <h3 style="font-size:1.4rem;font-weight:900;color:#ffffff;margin-bottom:0.4rem;">ברוך הבא!</h3>
        <p style="color:#94a3b8;font-weight:700;font-size:1rem;margin-bottom:1.5rem;">${username}</p>
        <button id="goToAdmin" style="background:#1a3a4a;color:#fff;border:none;border-radius:0.85rem;padding:0.75rem 2rem;font-family:'Assistant',sans-serif;font-weight:900;font-size:1rem;cursor:pointer;width:100%;transition:background 0.2s;margin-bottom:0.6rem;">כניסה לממשק ניהול ←</button>
        <button id="logoutFromWelcome" style="background:none;border:1.5px solid rgba(255,255,255,0.12);border-radius:0.85rem;padding:0.65rem 2rem;font-family:'Assistant',sans-serif;font-weight:900;font-size:0.95rem;color:#ffffff;cursor:pointer;width:100%;">התנתקות</button>
      </div>`;
    document.getElementById('closeWelcome').addEventListener('click', () => modal.classList.remove('active'));
    document.getElementById('goToAdmin').addEventListener('click',  () => { modal.classList.remove('active'); window.location.href = 'products.html?admin=1'; });
    document.getElementById('logoutFromWelcome').addEventListener('click', () => { doLogout(); modal.classList.remove('active'); });
  }

  function showAlreadyLoggedIn(modal) {
    const username = sessionStorage.getItem('adminUser') || 'מנהל';
    const content  = modal.querySelector('.modal-content');
    content.innerHTML = `
      <div style="text-align:center;padding:0.5rem 0;position:relative;">
        <button id="closeAdminPopup" style="position:absolute;top:-0.5rem;left:-0.5rem;background:none;border:none;cursor:pointer;color:#94a3b8;font-size:1.3rem;line-height:1;padding:0.25rem;">✕</button>
        <h3 style="font-size:1.4rem;font-weight:900;color:#ffffff;margin-bottom:0.4rem;">שלום,</h3>
        <p style="color:#64748b;font-weight:700;font-size:1rem;margin-bottom:1.5rem;">${username}</p>
        <button id="logoutBtn" style="background:#ff4d4d;color:#fff;border:none;border-radius:0.85rem;padding:0.75rem 2rem;font-family:'Assistant',sans-serif;font-weight:900;font-size:1rem;cursor:pointer;width:100%;transition:background 0.2s;">התנתקות</button>
      </div>`;
    modal.classList.add('active');
    document.getElementById('closeAdminPopup').addEventListener('click', () => modal.classList.remove('active'));
    document.getElementById('logoutBtn').addEventListener('click', () => { doLogout(); modal.classList.remove('active'); });
  }

  function doLogout() {
    sessionStorage.removeItem('isAdmin');
    sessionStorage.removeItem('adminUser');
    isAdmin = false;
    document.querySelector('.admin-fab')?.remove();
    document.querySelectorAll('.admin-card-btns').forEach(el => el.remove());
    document.body.classList.remove('admin-mode');
    const mc = document.querySelector('.modal-content');
    if (mc) {
      mc.innerHTML = `
        <h3>כניסת מנהלים</h3>
        <input type="text"     id="adminUser" placeholder="שם משתמש" />
        <input type="password" id="adminPass" placeholder="סיסמה" />
        <p id="loginError" style="color:#e53e3e;font-weight:700;font-size:0.9rem;text-align:center;margin-top:0.5rem;display:none;"></p>
        <div class="modal-btns">
          <button id="doLogin">התחבר</button>
          <button id="closeModal">ביטול</button>
        </div>`;
      mc.querySelector('#doLogin').addEventListener('click', handleLogin);
      mc.querySelector('#closeModal').addEventListener('click', () => { modal.classList.remove('active'); clearForm(); });
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


/* ═══════════════════════════════════════════
   ADMIN — FAB + עריכה / מחיקה
═══════════════════════════════════════════ */
function initAdminTools(renderFn) {
  if (!isAdmin) return;

  if (!document.querySelector('.admin-fab')) {
    const fab      = document.createElement('button');
    fab.className  = 'admin-fab';
    fab.title      = 'הוספת מוצר חדש';
    fab.innerHTML  = `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`;
    fab.addEventListener('click', () => openAddModal(renderFn));
    document.body.appendChild(fab);
  }

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

/* ── Delete Modal — כולל מחיקה מהשיירפוינט ── */
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
    <p id="aDelErr" class="amodal-error" style="display:none">שגיאה במחיקה מהשיירפוינט</p>
    <div class="amodal-btns">
      <button class="amodal-btn amodal-btn--danger" id="aConfirmDel">מחק</button>
      <button class="amodal-btn amodal-btn--cancel" id="aCancelDel">ביטול</button>
    </div>`);

  m.querySelector('#aConfirmDel').addEventListener('click', async () => {
    const btn = m.querySelector('#aConfirmDel');
    btn.disabled = true;
    btn.textContent = 'מוחק...';

    try {
      // אם יש spId — מוחקים גם מהשיירפוינט
      if (product.spId) {
        const digest = await getRequestDigest();
        await deleteItemFromSP(digest, product.spId);
      }

      // מוחקים מהמערך המקומי
      PRODUCTS.splice(PRODUCTS.findIndex(p => p.id === id), 1);
      closeAModal(m);
      renderFn();
      showSuccessToast(`"${product.title}" נמחק בהצלחה`);

    } catch (err) {
      console.error('שגיאת מחיקה:', err);
      const errEl = m.querySelector('#aDelErr');
      errEl.textContent = `שגיאה: ${err.message}`;
      errEl.style.display = 'block';
      btn.disabled = false;
      btn.textContent = 'מחק';
    }
  });

  m.querySelector('#aCancelDel').addEventListener('click', () => closeAModal(m));
}

/* ── Edit Modal — כולל עדכון בשיירפוינט ── */
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
      <p id="aEditErr" class="amodal-error" style="display:none">שגיאה בשמירה</p>
    </div>
    <div class="amodal-btns">
      <button class="amodal-btn amodal-btn--primary" id="aConfirmEdit">שמור</button>
      <button class="amodal-btn amodal-btn--cancel"  id="aCancelEdit">ביטול</button>
    </div>`);

  // תצוגה מקדימה
  m.querySelector('#aEditFile').addEventListener('change', function() {
    const r = new FileReader();
    r.onload = e => { newImg = e.target.result; m.querySelector('#aEditPreview').src = newImg; };
    r.readAsDataURL(this.files[0]);
  });

  m.querySelector('#aConfirmEdit').addEventListener('click', async () => {
    const title = m.querySelector('#aEditTitle').value.trim() || product.title;
    const unit  = m.querySelector('#aEditUnit').value.trim()  || product.unit;
    const type  = m.querySelector('#aEditType').value.trim()  || product.type;

    const btn = m.querySelector('#aConfirmEdit');
    btn.disabled = true;
    btn.textContent = 'שומר...';

    try {
      // עדכון בשיירפוינט אם יש spId
      if (product.spId) {
        const digest = await getRequestDigest();
        await updateItemById(digest, product.spId, {
          title, unit, type, category: product.category
        });
      }

      // עדכון מקומי
      const idx = PRODUCTS.findIndex(p => p.id === id);
      PRODUCTS[idx] = { ...PRODUCTS[idx], title, unit, type, imageUrl: newImg };

      closeAModal(m);
      renderFn();
      showSuccessToast(`"${title}" עודכן בהצלחה ✓`);

    } catch (err) {
      console.error('שגיאת עריכה:', err);
      const errEl = m.querySelector('#aEditErr');
      errEl.textContent = `שגיאה: ${err.message}`;
      errEl.style.display = 'block';
      btn.disabled = false;
      btn.textContent = 'שמור';
    }
  });

  m.querySelector('#aCancelEdit').addEventListener('click', () => closeAModal(m));
}

/* ── Add Modal — העלאה לשיירפוינט ── */
function openAddModal(renderFn) {
  let newImgDataUrl  = 'https://picsum.photos/id/100/600/400';
  let projectFileObj = null;
  let imageFileObj   = null;

  const m = createAModal('amodal-add', `
    <h3 class="amodal-title">הוספת מוצר חדש</h3>
    <div class="amodal-form">
      <label class="amodal-label">קטגוריה</label>
      <select class="amodal-input" id="aAddCat">
        <option value="movies">סרטים</option>
        <option value="animation">אנימציה</option>
        <option value="graphics">גרפיקה</option>
        <option value="ai">AI</option>
      </select>
      <label class="amodal-label">סוג תוצר</label>
      <input class="amodal-input" id="aAddType" placeholder="סרטון, פוסטר, לוגו..." />
      <label class="amodal-label">שם המוצר</label>
      <input class="amodal-input" id="aAddTitle" placeholder="שם המוצר" />
      <label class="amodal-label">יחידה מבצעת</label>
      <input class="amodal-input" id="aAddUnit" placeholder="שם היחידה" />

      <label class="amodal-label">תמונת תצוגה</label>
      <div class="amodal-upload-row">
        <img class="amodal-preview" id="aAddPreview" src="${newImgDataUrl}" alt="תצוגה" />
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
      <button class="amodal-btn amodal-btn--primary" id="aConfirmAdd">העלה לשיירפוינט</button>
      <button class="amodal-btn amodal-btn--cancel"  id="aCancelAdd">ביטול</button>
    </div>`);

  m.querySelector('#aAddFile').addEventListener('change', function() {
    imageFileObj = this.files[0];
    if (!imageFileObj) return;
    const r = new FileReader();
    r.onload = e => { newImgDataUrl = e.target.result; m.querySelector('#aAddPreview').src = newImgDataUrl; };
    r.readAsDataURL(imageFileObj);
  });

  m.querySelector('#aAddProjectFile').addEventListener('change', function() {
    projectFileObj = this.files[0];
    if (!projectFileObj) return;
    m.querySelector('#aAddProjectName').textContent = projectFileObj.name;
    m.querySelector('#aAddProjectChip').classList.add('has-file');
  });

  m.querySelector('#aConfirmAdd').addEventListener('click', async () => {
    const title = m.querySelector('#aAddTitle').value.trim();
    const unit  = m.querySelector('#aAddUnit').value.trim();
    const type  = m.querySelector('#aAddType').value.trim();
    const cat   = m.querySelector('#aAddCat').value;

    const errEl = m.querySelector('#aAddErr');

    if (!title || !unit || !type) {
      errEl.textContent = 'יש למלא את כל השדות';
      errEl.style.display = 'block';
      return;
    }

    const confirmBtn = m.querySelector('#aConfirmAdd');
    confirmBtn.disabled = true;
    confirmBtn.textContent = 'מעלה לשיירפוינט...';

    try {
      const { projectUrl, imageUrl } = await uploadProductToSharePoint(
        { title, unit, type, category: cat },
        projectFileObj,
        imageFileObj
      );

      // הוספה לרשימה המקומית עם הנתונים האמיתיים מהשיירפוינט
      PRODUCTS.push({
        id:       'p_' + Date.now(),
        // אין spId כי אחרי reload ייטען מחדש עם ID אמיתי
        category: cat,
        title,
        unit,
        type,
        imageUrl: imageUrl   || newImgDataUrl,
        fileUrl:  projectUrl || null
      });

      closeAModal(m);
      renderFn();
      showSuccessToast(`"${title}" הועלה לשיירפוינט בהצלחה ✓`);

      setTimeout(() => {
        const sec = document.getElementById('section-' + cat);
        if (sec) sec.scrollIntoView({ behavior: 'smooth' });
      }, 100);

    } catch (err) {
      console.error('SharePoint upload error:', err);
      confirmBtn.disabled = false;
      confirmBtn.textContent = 'העלה לשיירפוינט';
      errEl.textContent = `שגיאת העלאה: ${err.message}`;
      errEl.style.display = 'block';
    }
  });

  m.querySelector('#aCancelAdd').addEventListener('click', () => closeAModal(m));
}


/* ── Toast הצלחה ── */
function showSuccessToast(message) {
  const toast = document.createElement('div');
  toast.style.cssText = `
    position:fixed; bottom:2rem; right:2rem; z-index:9999;
    background:#1a3a4a; color:#fff;
    padding:0.85rem 1.5rem; border-radius:1rem;
    font-family:'Assistant',sans-serif; font-weight:800; font-size:1rem;
    box-shadow:0 8px 24px rgba(0,0,0,0.25);
    opacity:0; transform:translateY(12px);
    transition:opacity 0.3s ease, transform 0.3s ease;
  `;
  toast.textContent = message;
  document.body.appendChild(toast);
  requestAnimationFrame(() => {
    toast.style.opacity = '1';
    toast.style.transform = 'translateY(0)';
  });
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(12px)';
    toast.addEventListener('transitionend', () => toast.remove(), { once: true });
  }, 4000);
}

/* ── Modal helpers ── */
function createAModal(id, html) {
  document.getElementById(id)?.remove();
  const o      = document.createElement('div');
  o.className  = 'amodal-overlay';
  o.id         = id;
  o.innerHTML  = `<div class="amodal-box">${html}</div>`;
  document.body.appendChild(o);
  requestAnimationFrame(() => o.classList.add('amodal-visible'));
  o.addEventListener('click', e => { if (e.target === o) closeAModal(o); });
  return o;
}

function closeAModal(o) {
  o.classList.remove('amodal-visible');
  o.addEventListener('transitionend', () => o.remove(), { once: true });
}