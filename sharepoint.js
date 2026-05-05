'use strict';

/* ═══════════════════════════════════════════════════════
   sharepoint.js — תקשורת עם SharePoint 2016
   
   קובץ זה אחראי על כל התקשורת עם SharePoint.
   הוא משתמש ב-SharePoint REST API עם Windows Authentication
   (המשתמש כבר מחובר לרשת הארגונית).
   
   סדר הפעולות:
   1. getItemsFromSP()    — טעינת תוצרים בטעינת הדף
   2. createItemInSP()   — הוספת תוצר חדש
   3. updateItemInSP()   — עדכון תוצר קיים
   4. deleteItemFromSP() — מחיקת תוצר
═══════════════════════════════════════════════════════ */


/* ─────────────────────────────────────────
   הגדרות בסיסיות
   
   SP_URL   — כתובת הבסיס של הסייט בשייר פוינט
              לדוגמה: 'http://sharepoint.iaf.il/sites/shahad'
   LIST_NAME — שם הספרייה בשייר פוינט (חייב להיות זהה בדיוק)
───────────────────────────────────────── */
const SP_URL   = 'YOUR_SHAREPOINT_SITE_URL'; // ← החליפי בכתובת האמיתית
const LIST_NAME = 'תוצרים';                  // ← שם הספרייה בשייר פוינט


/* ─────────────────────────────────────────
   מיפוי קטגוריות
   
   ממיר את שם הקטגוריה מהאתר לשייר פוינט ובחזרה.
   חשוב: הערכים חייבים להתאים לעמודת Category בשייר פוינט.
───────────────────────────────────────── */
const CATEGORY_MAP = {
  'movies':    'סרטים',
  'animation': 'אנימציה',
  'graphics':  'גרפיקה',
  'ai':        'AI'
};

// הפוך — משייר פוינט לאתר
const CATEGORY_MAP_REVERSE = {
  'סרטים':   'movies',
  'אנימציה': 'animation',
  'גרפיקה':  'graphics',
  'AI':       'ai'
};


/* ═══════════════════════════════════════════════════════
   getRequestDigest()
   
   SharePoint דורש "חותמת אבטחה" לכל פעולת כתיבה
   (הוספה / עדכון / מחיקה). הפונקציה הזאת מקבלת אותה.
   
   איך זה עובד:
   - שולחת POST ל-/_api/contextinfo
   - מקבלת בחזרה FormDigestValue
   - הערך הזה מצורף לכל בקשת כתיבה ב-X-RequestDigest header
   
   הערה: הערך תקף לכ-30 דקות.
═══════════════════════════════════════════════════════ */
async function getRequestDigest() {
  try {
    const res = await fetch(`${SP_URL}/_api/contextinfo`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json;odata=verbose'
      },
      credentials: 'include' // שולח את ה-Windows credentials אוטומטית
    });

    if (!res.ok) throw new Error(`contextinfo נכשל: ${res.status}`);

    const data = await res.json();
    return data.d.GetContextWebInformation.FormDigestValue;

  } catch (err) {
    console.error('[SharePoint] שגיאה בקבלת Request Digest:', err);
    throw err; // מעביר את השגיאה למעלה כי בלי digest לא ניתן לכתוב
  }
}


/* ═══════════════════════════════════════════════════════
   getItemsFromSP()
   
   טוענת את כל התוצרים מספריית SharePoint.
   נקראת בטעינת עמוד התוצרים.
   
   מה היא עושה:
   - שולחת GET לספרייה עם $select לשדות הרלוונטיים
   - ממירה כל פריט לפורמט שהאתר מכיר
   - מחזירה מערך של תוצרים
   
   אם נכשלת — מחזירה מערך ריק (האתר ימשיך לעבוד)
═══════════════════════════════════════════════════════ */
async function getItemsFromSP() {
  try {
    const res = await fetch(
      // $select — מגדיר אילו עמודות לשלוף (יותר יעיל מלשלוף הכל)
      `${SP_URL}/_api/web/lists/getbytitle('${LIST_NAME}')/items` +
      `?$select=Id,Title,Unit,Type,Category,ImageUrl,FileUrl` +
      `&$orderby=Created desc`, // הכי חדש ראשון
      {
        headers: {
          'Accept': 'application/json;odata=verbose'
        },
        credentials: 'include'
      }
    );

    if (!res.ok) throw new Error(`getItems נכשל: ${res.status}`);

    const data = await res.json();

    // ממיר כל פריט שייר פוינט לפורמט של האתר
    return data.d.results.map(item => ({
      id:       'sp_' + item.Id,          // מוסיף sp_ כדי להבדיל מפריטים מקומיים
      spId:     item.Id,                  // שומר את ה-ID המקורי לצורך עדכון/מחיקה
      title:    item.Title    || '',
      unit:     item.Unit     || '',
      type:     item.Type     || '',
      // ממיר קטגוריה מעברית (שייר פוינט) לאנגלית (האתר)
      category: CATEGORY_MAP_REVERSE[item.Category] || 'graphics',
      imageUrl: item.ImageUrl || 'https://picsum.photos/id/100/600/400',
      fileUrl:  item.FileUrl  || null,
    }));

  } catch (err) {
    console.error('[SharePoint] שגיאה בטעינת תוצרים:', err);
    return []; // מחזיר ריק — האתר ימשיך לעבוד עם PRODUCTS הסטטי
  }
}


/* ═══════════════════════════════════════════════════════
   createItemInSP(product)
   
   יוצרת פריט חדש בספריית SharePoint.
   נקראת כשמנהל מוסיף תוצר דרך האתר.
   
   פרמטרים:
   - product: אובייקט עם title, unit, type, category, imageUrl, fileUrl
   
   מחזירה:
   - את ה-ID החדש בשייר פוינט (לשמירה מקומית)
   - null אם נכשלה
═══════════════════════════════════════════════════════ */
async function createItemInSP(product) {
  try {
    // שלב 1: קבל חותמת אבטחה
    const digest = await getRequestDigest();

    // שלב 2: שלח את הפריט החדש
    const res = await fetch(
      `${SP_URL}/_api/web/lists/getbytitle('${LIST_NAME}')/items`,
      {
        method: 'POST',
        headers: {
          'Accept':         'application/json;odata=verbose',
          'Content-Type':   'application/json;odata=verbose',
          'X-RequestDigest': digest // חותמת האבטחה
        },
        credentials: 'include',
        body: JSON.stringify({
          // __metadata חובה בשייר פוינט 2016
          __metadata: { type: `SP.Data.${LIST_NAME}ListItem` },
          Title:    product.title,
          Unit:     product.unit,
          Type:     product.type,
          // ממיר קטגוריה מאנגלית (האתר) לעברית (שייר פוינט)
          Category: CATEGORY_MAP[product.category] || product.category,
          ImageUrl: product.imageUrl || '',
          FileUrl:  product.fileUrl  || ''
        })
      }
    );

    if (!res.ok) throw new Error(`createItem נכשל: ${res.status}`);

    const data = await res.json();
    console.log('[SharePoint] נוצר פריט חדש, ID:', data.d.Id);
    return 'sp_' + data.d.Id; // מחזיר את ה-ID החדש

  } catch (err) {
    console.error('[SharePoint] שגיאה ביצירת פריט:', err);
    return null;
  }
}


/* ═══════════════════════════════════════════════════════
   updateItemInSP(spId, product)
   
   מעדכנת פריט קיים בשייר פוינט.
   נקראת כשמנהל עורך תוצר דרך האתר.
   
   פרמטרים:
   - spId:    המספר הפנימי של הפריט בשייר פוינט (לא sp_123, רק 123)
   - product: האובייקט המעודכן
   
   שייר פוינט משתמש ב-MERGE ולא ב-PUT —
   כך שרק השדות שנשלחים מתעדכנים, השאר נשמרים.
═══════════════════════════════════════════════════════ */
async function updateItemInSP(spId, product) {
  try {
    const digest = await getRequestDigest();

    const res = await fetch(
      `${SP_URL}/_api/web/lists/getbytitle('${LIST_NAME}')/items(${spId})`,
      {
        method: 'POST',
        headers: {
          'Accept':          'application/json;odata=verbose',
          'Content-Type':    'application/json;odata=verbose',
          'X-RequestDigest': digest,
          'X-HTTP-Method':   'MERGE', // עדכון חלקי (לא החלפה מלאה)
          'If-Match':        '*'      // מאשר עדכון ללא בדיקת גרסה
        },
        credentials: 'include',
        body: JSON.stringify({
          __metadata: { type: `SP.Data.${LIST_NAME}ListItem` },
          Title:    product.title,
          Unit:     product.unit,
          Type:     product.type,
          Category: CATEGORY_MAP[product.category] || product.category,
          ImageUrl: product.imageUrl || '',
          FileUrl:  product.fileUrl  || ''
        })
      }
    );

    // MERGE מחזיר 204 No Content בהצלחה (לא 200)
    if (res.status !== 204) throw new Error(`updateItem נכשל: ${res.status}`);

    console.log('[SharePoint] עודכן פריט, ID:', spId);

  } catch (err) {
    console.error('[SharePoint] שגיאה בעדכון פריט:', err);
  }
}


/* ═══════════════════════════════════════════════════════
   deleteItemFromSP(spId)
   
   מוחקת פריט משייר פוינט.
   נקראת כשמנהל מוחק תוצר דרך האתר.
   
   פרמטרים:
   - spId: המספר הפנימי של הפריט בשייר פוינט
   
   הערה: מחיקה היא סופית! אין Recycle Bin בקריאת API.
═══════════════════════════════════════════════════════ */
async function deleteItemFromSP(spId) {
  try {
    const digest = await getRequestDigest();

    const res = await fetch(
      `${SP_URL}/_api/web/lists/getbytitle('${LIST_NAME}')/items(${spId})`,
      {
        method: 'POST',
        headers: {
          'Accept':          'application/json;odata=verbose',
          'X-RequestDigest': digest,
          'X-HTTP-Method':   'DELETE', // מחיקה
          'If-Match':        '*'
        },
        credentials: 'include'
      }
    );

    // DELETE מחזיר 204 No Content בהצלחה
    if (res.status !== 204) throw new Error(`deleteItem נכשל: ${res.status}`);

    console.log('[SharePoint] נמחק פריט, ID:', spId);

  } catch (err) {
    console.error('[SharePoint] שגיאה במחיקת פריט:', err);
  }
}