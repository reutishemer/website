'use strict';

(function () {

  const track     = document.getElementById('timelineTrack');
  const wrapper   = document.querySelector('.timeline-track-wrapper');
  const section   = document.querySelector('.timeline-section-ambient');
  const stickyVP  = document.querySelector('.timeline-sticky-viewport');
  const snapCont  = document.querySelector('.scroll-snap-container');

  if (!track || !wrapper || !section || !stickyVP) return;

  /* ─── INTERSECTION OBSERVER ─── */
  let sectionVisible = false;
  const observer = new IntersectionObserver(
    ([entry]) => { sectionVisible = entry.isIntersecting; },
    { threshold: 0.5 }
  );
  observer.observe(section);

  /* ─── LERP ─── */
  let current = 0;
  let target  = 0;

  function lerp(a, b, t) { return a + (b - a) * t; }
  function getMaxScroll() { return Math.max(0, track.scrollWidth - wrapper.clientWidth); }

  function tick() {
    current = lerp(current, target, 0.08);
    if (Math.abs(current - target) < 0.3) current = target;
    track.style.transform = `translateX(${-current}px)`;
    requestAnimationFrame(tick);
  }

  /* ─── WHEEL ─── */
  section.addEventListener('wheel', (e) => {
    if (!sectionVisible) return;

    const NAV_TOP    = 16;
   const NAV_BOTTOM = 112;
   if (e.clientY >= NAV_TOP && e.clientY <= NAV_BOTTOM) return;
    const delta   = e.deltaY;
    const max     = getMaxScroll();
    const atStart = target <= 0 && delta < 0;
    const atEnd   = target >= max && delta > 0;

    if (atStart || atEnd) {
      if (snapCont) snapCont.scrollTop += delta;
      return;
    }

    e.preventDefault();
    target = Math.max(0, Math.min(max, target + delta));
    setTimeout(updateActiveItem, 100);
  }, { passive: false });

  /* ─── ACTIVE ITEM ─── */
  function updateActiveItem() {
    const items  = track.querySelectorAll('.timeline-item');
    const centre = wrapper.clientWidth / 2;
    let closest = null, closestDist = Infinity;
    items.forEach(item => {
      const rect       = item.getBoundingClientRect();
      const itemCentre = rect.left + rect.width / 2;
      const dist       = Math.abs(itemCentre - centre);
      if (dist < closestDist) { closestDist = dist; closest = item; }
    });
    items.forEach(i => i.classList.remove('timeline-active'));
    if (closest) closest.classList.add('timeline-active');
  }

  /* ─── DETAIL OVERLAY DATA ─── */
const DETAILS = {
  0: { year: '1975', title: 'ייסוד ענף שה״ד - המעבר מ״מקל וגיר״ להדרכה מודרנית', description: 'לאחר לקחי מלחמת יום הכיפורים, קבע אלוף בני פלד כי ההדרכה בחיל האוויר מיושנת ואינה מתאימה לעידן המודרני. בראשית 1975 יצאה פקודת ארגון להקמת ענף "שירותי הדרכה", שהתבסס על אנשי מקצוע שגויסו מהשוק האזרחי ומכל רחבי הצבא.\n\nלראשות הענף התמנה א.ע.צ צבי תירוש, לשעבר מפקד משלחת ח"א באוגנדה, שאסף סביבו אנשים מתאימים ולא היסס לפנות באמצעות העיתונות לאזרחי המדינה.', img: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1200&q=80' },
  1: { year: '1979', title: 'המעבר לעידן הווידאו', description: 'בהנחיית רמ"ח הדרכה אל"מ יהודה קורן, יצא ענף שה"ד לדרך חדשה בתקציב של 26,000 דולר. נרכשו עשרות מערכות תצוגה לטייסות ברחבי החיל, שיצרו לחץ גובר לייצור הפקות וידאו מקצועיות.\n\nסכום התקציב לא הספיק לבניית אולפן וידאו ראוי, אך הספיק ליצור דרישה שלא ניתן היה להתעלם ממנה.', img: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80' },
  2: { year: '1982', title: 'שיא טכנולוגי - ספינת הדגל של תעשיית הווידאו בישראל', description: 'עם המעבר למשכן החדש ברח׳ איבן גבירול, הגיעה היחידה לשיאים חסרי תקדים. ברשותה עמד ציוד הפקה מהמתקדם ביותר בישראל - חדר עריכה ממוחשב ראשון בארץ, מצלמות Ikegami, ומערכת צליל רב-ערוצית Studer.\n\nכל תעשיית הווידאו האזרחית ראתה ביחידה את ספינת הדגל, והיחידה זכתה לאינספור ביקורי לימוד מצד כל מי שהוא היום איש עשייה בווידאו.', img: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1200&q=80' },
  3: { year: '1984', title: 'הקמת יח׳ שה״ד 339 כיחידה עצמאית', description: 'בהנהגת סא"ל אבנר אילנאי עבר ענף שה"ד ארגון מחדש והפך ליחידת רישום עצמאית - יח׳ שה"ד 339. המבנה החדש כלל גפי סרטים, הוצאה לאור, ספרות, טכני ואפסנאות.\n\nלראשונה קיבלה היחידה שלישה ומחסן לוגיסטי עצמאי. עם חלוף השנים הוחל בגיוס חיילים בוגרי מגמות תקשורת והרמה הגבוהה חזרה אט-אט.', img: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1200&q=80' },
  4: { year: 'שנות ה-90', title: 'עידן האנימציה התלת-ממדית', description: 'ביוזמת אביטל בר-גפן נרכשו מחשבי אנימציה תלת-ממדית של Silicon Graphics - מהראשונים בעולם ובארץ. הוקם גף תלת-מימד שאפשר להמחיש מצבים שלא ניתן לצלם.\n\nמנועי סילון, מסלולי גישה, מערכות אוויוניקה - כולם תוארו בצורה ויזואלית שלא הייתה אפשרית בצילום חי לפני כן. הגף הורחב עם השנים לשני גפים: תלת-מימד ומולטימדיה.', img: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80' },
  5: { year: '2004', title: 'החזרה לקריה - סיום 22 שנות מתקן חוץ', description: 'ביולי 2004, לאחר 22 שנים ברח׳ איבן גבירול, חזרה יח׳ שה"ד 339 לתוך הקריה ושוכנה בבניין ב׳. המעבר היה חלק מהחלטה כוללת לרכז את כל מבני מפקדת חיל האוויר.\n\nהיחידה המתינה למשכנה הקבוע במרפ"מ תוך כדי המשך פעילות שוטפת מבניין ב׳.', img: 'https://images.unsplash.com/photo-1549490349-8643362247b5?auto=format&fit=crop&w=1200&q=80' },
  6: { year: '2009', title: 'מעבר למשכן קבוע במרפ״מ', description: 'לאחר שנים של המתנה ועיכובים בבנייה, עברה היחידה למשכנה הקבוע בקומה השישית של מבנה המרפ"מ. סיום תקופת הנדודים וביסוס היחידה במתקן מודרני ויציב.\n\nבניית הקומה השישית במבנה המרפ"מ התעכבה מאד, והיחידה עברה למשכנה החדש באוגוסט 2009.', img: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1200&q=80' },
  7: { year: '2014', title: 'הקמת ארכיון היחידה', description: '', img: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1200&q=80' },
  8: { year: '2016', title: 'עיצוב מחדש של היחידה - משכן יצירתי לאנשי היצירה', description: 'במסגרת חידוש פני היחידה, עוצבו המסדרונות בצבעי הזהות של שה"ד - ירוק וצהוב - ועל הרצפה נמתחו שני קווים אדומים המזכירים את המשמעת הצבאית וגאוות היחידה.\n\nהעיצוב לא היה רק אסתטי - הוא נבע מתפיסה שסביבת עבודה נעימה ומעוררת השראה משפיעה ישירות על האיכות היצירתית. אנשי היצירה עובדים טוב יותר כשהמרחב סביבם מדבר את שפתם.', img: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1200&q=80' },
  9: { year: '2023', title: 'ה-7 באוקטובר - מלחמת חרבות ברזל', description: 'עם פרוץ מלחמת חרבות ברזל, עברה יחידת שה"ד 339 הסבה מהירה לתחום התיעוד המבצעי. אנשי היחידה יצאו לשטח ותרמו ישירות למאמץ המלחמתי - מתעדים, מפיקים ומנכיחים את המציאות הלוחמת.\n\nהיחידה הוכיחה שוב את חיוניותה בעת חירום, ואת יכולתה להסב את כלי ההפקה שלה לצרכים מבצעיים תוך זמן קצר.', img: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1200&q=80' },
  10: { year: '2025', title: 'עידן הבינה המלאכותית - AI', description: 'יחידת שה"ד 339 אינה מסתפקת במעקב אחר הטכנולוגיה - היא מובילה אותה. כלי בינה מלאכותית שולבו בתהליכי העבודה היומיומיים: בתכנות, באנימציה, בגרפיקה ובעריכה.\n\nהשילוב החכם של AI מייעל תהליכים, מקצר זמני הפקה ומאפשר לאנשי היצירה להתמקד במה שחשוב - התוכן. היחידה ממשיכה להישאר מודרנית, מעודכנת ורלוונטית לאתגרי ההדרכה של עידן חדש.', img: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1200&q=80' },
};

  /* ─── OVERLAY ─── */
  let overlayEl = null;

  function buildOverlay() {
    const o = document.createElement('div');
    o.className = 'detail-overlay';
    o.id = 'detailOverlay';
    o.innerHTML = `
      <div class="detail-content-wrapper">
        <button class="close-overlay-btn" id="closeOverlayBtn" aria-label="סגור">✕</button>
        <div class="overlay-info">
          <div class="overlay-year" id="overlayYear"></div>
          <h2 class="overlay-title" id="overlayTitle"></h2>
          <div class="overlay-divider"></div>
          <p class="overlay-description" id="overlayDesc"></p>
        </div>
        <div class="overlay-image-container">
          <img class="overlay-image" id="overlayImg" src="" alt="" />
        </div>
      </div>`;
    document.body.appendChild(o);
    o.querySelector('#closeOverlayBtn').addEventListener('click', closeOverlay);
    o.addEventListener('click', e => { if (e.target === o) closeOverlay(); });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && o.classList.contains('active')) closeOverlay();
    });
    overlayEl = o;
  }

  function openOverlay(index) {
    const data = DETAILS[index];
    if (!data || !overlayEl) return;
    overlayEl.querySelector('#overlayYear').textContent  = data.year;
    overlayEl.querySelector('#overlayTitle').textContent = data.title;
    overlayEl.querySelector('#overlayDesc').textContent  = data.description;
    const img = overlayEl.querySelector('#overlayImg');
    img.src = data.img; img.alt = data.title;
    overlayEl.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeOverlay() {
    if (!overlayEl) return;
    overlayEl.classList.remove('active');
    document.body.style.overflow = '';
  }

  /* ─── CARD CLICKS ─── */
  function wireCardClicks() {
    track.querySelectorAll('.timeline-card').forEach(card => {
      const item  = card.closest('.timeline-item');
      const index = parseInt(item?.dataset.index ?? '-1', 10);
      if (index < 0) return;
      card.addEventListener('click', e => { e.stopPropagation(); openOverlay(index); });
    });
  }

  /* ─── INIT ─── */
  window.addEventListener('load', () => {
    current = 0; target = 0;
    track.style.transform = 'translateX(0px)';
    buildOverlay();
    wireCardClicks();
    tick();
    updateActiveItem();
  });

  /* ─── CONTACT LINK ─── */
  const contactLink = document.getElementById('contactLink');
  if (contactLink) {
    contactLink.addEventListener('click', (e) => {
      e.preventDefault();
      const footer = document.querySelector('.site-footer');
      if (footer) footer.scrollIntoView({ behavior: 'smooth' });
    });
  }

  /* ─── ADMIN MODAL ─── */
  const modal      = document.getElementById('loginModal');
  const adminBtn   = document.getElementById('adminLoginBtn');
  const closeMdl   = document.getElementById('closeModal');
  const doLogin    = document.getElementById('doLogin');
  const loginError = document.getElementById('loginError');

  if (adminBtn) adminBtn.addEventListener('click', () => modal.classList.add('active'));

  if (closeMdl) closeMdl.addEventListener('click', () => {
    modal.classList.remove('active');
    if (loginError) { loginError.style.display = 'none'; loginError.textContent = ''; }
  });

  if (doLogin) {
    doLogin.addEventListener('click', () => {
      const user = document.getElementById('adminUser')?.value.trim();
      const pass = document.getElementById('adminPass')?.value.trim();
      if (user === 'admin' && pass === '1234') {
        modal.classList.remove('active');
        window.location.href = 'admin.html';
      } else {
        if (loginError) {
          loginError.textContent = 'שם משתמש או סיסמה שגויים';
          loginError.style.display = 'block';
        }
      }
    });
  }

  modal?.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.remove('active');
  });

})();

