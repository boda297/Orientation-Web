# 📘 Backend Integration & Improvements Guide | دليل وملاحظات الربط لمطور الباك إند

This document outlines key updates, observed issues, and recommended backend enhancements to ensure seamless integration between the frontend and backend.

يحتوي هذا الملف على ملاحظات وتوصيات تقنية هامة موجهة لمطور الباك إند (Backend Developer) لضمان توافق تام واستقرار بين السيرفر والفرونت إند.

---

# 🇬🇧 English Section

## 1. 📍 Location Query Normalization (`/projects/location`)

### 🔍 The Problem:
- The endpoint `GET /projects/location?location=...` currently performs an **exact string match** on the `location` database field.
- In the database, some projects have locations saved with different spellings/spacings (e.g. `northcoast` vs `North Coast`, `sidi abdelrahman` vs `Sidi Abdelrhman`, `ras el hekma` vs `Ras Alhekma`).
- When a user requests `/projects/location?location=North Coast`, the API returns an empty array `[]` because the database contains `northcoast` without a space.

### 💡 Recommended Backend Solution:
Make the location filter query **case-insensitive** and **whitespace-insensitive** (flexible regex matching).

#### Example (MongoDB / Mongoose):
```javascript
// Before (exact match - fails on space differences):
const projects = await Project.find({ location: req.query.location });

// After (flexible regex match):
const locationQuery = req.query.location?.trim() || '';
// Escape special regex chars and allow optional spaces between words
const flexibleRegex = new RegExp(
  locationQuery.replace(/\s+/g, '\\s*'),
  'i'
);

const projects = await Project.find({
  location: { $regex: flexibleRegex }
});
```

---

## 2. 🎥 🖼️ Hero Background Media Support (Video or Image)

### 🔍 Update Details:
- In the dashboard (`/dashboard/project/create` and `/dashboard/project/edit`), admins can now upload either a **Video** (`video/*`) or an **Image Banner** (`image/*`) for the Project Hero Background.
- The file is uploaded via `multipart/form-data` under the field key: `heroVideo`.

### 💡 Recommended Backend Solution:
- Ensure the upload middleware (e.g., `multer` fileFilter) accepts both **video MIME types** (`video/mp4`, `video/webm`, `video/quicktime`, etc.) and **image MIME types** (`image/jpeg`, `image/png`, `image/webp`, `image/avif`).
- Save the file and return its URL in `heroVideoUrl`.

#### Example (Multer File Filter):
```javascript
const fileFilter = (req, file, cb) => {
  if (file.fieldname === 'heroVideo') {
    const isVideoOrImage =
      file.mimetype.startsWith('video/') || file.mimetype.startsWith('image/');
    if (isVideoOrImage) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type for hero background. Allowed: video/*, image/*'), false);
    }
  } else {
    cb(null, true);
  }
};
```

---

## 3. 👤 User Role on Creation (`POST /users`)

### 🔍 Update Details:
- The Create User form (`/dashboard/users/create`) now allows admins to select a **Role** when creating a new user (`user`, `admin`, `superadmin`).
- The payload sent in `POST /users`:
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "phoneNumber": "+201000000000",
  "password": "StrongPassword123!",
  "role": "admin"
}
```

### 💡 Recommended Backend Solution:
- Accept the `role` property in `CreateUserDto` / schema validation.
- Assign the passed `role` (or default to `'user'` if not provided).

---
---

# 🇸🇦 القسم العربي

## 1. 📍 تحسين البحث عن المناطق (`/projects/location`)

### 🔍 المشكلة الحالية:
- الـ endpoint الحالي `GET /projects/location?location=...` بيبحث في الداتابيز بمطابقة حرفية تامة (Exact Match).
- بعض المشاريع متخزنة في الداتابيز بصيغ مختلفة بدون مسافات (مثال: `northcoast` بدلاً من `North Coast`، أو `sidi abdelrahman` بدلاً من `Sidi Abdelrhman`).
- لما المستخدم بيطلب مشاريع منطقة `/projects/location?location=North Coast`، السيرفر بيرجع مصفوفة فاضية `[]` لأن الكلمة في الداتابيز مكتوبة بدون مسافة.

### 💡 الحل المقترح في الباك إند:
جعل استعلام البحث عن المنطقة **غير حساس لحالة الأحرف (Case-insensitive)** و**غير حساس للمسافات (Whitespace-insensitive)** عبر Regex مرن.

#### مثال بلغة Node.js / Mongoose:
```javascript
const locationQuery = req.query.location?.trim() || '';

// Regex يتجاهل المسافات وحالة الأحرف
const flexibleRegex = new RegExp(
  locationQuery.replace(/\s+/g, '\\s*'),
  'i'
);

const projects = await Project.find({
  location: { $regex: flexibleRegex }
});
```

---

## 2. 🎥 🖼️ دعم رفع فيديو أو صورة لخلفية المشروع (Hero Background)

### 🔍 تفاصيل التحديث:
- في الداشبورد تم إضافة إمكانية اختيار رفع **فيديو** أو **صورة عريضة (Banner Image)** لخلفية المشروع في صفحة الإنشاء والتعديل.
- الملف بيتبعت عبر الـ FormData في حقل باسم: `heroVideo`.

### 💡 المطلوب من الباك إند:
- التأكد من أن الـ File Upload Middleware (مثل Multer) بيقبل أنواع ملفات الصور (`image/*`) بالإضافة لملفات الفيديو (`video/*`) لنفس الحقل.
- تخزين الملف وإرجاع مساره في الحقل `heroVideoUrl`.

---

## 3. 👤 إسناد الرتبة (Role) عند إنشاء مستخدم جديد (`POST /users`)

### 🔍 تفاصيل التحديث:
- تم إضافة حقل لاختيار الرتبة (`role`) في صفحة إنشاء مستخدم جديد بالداشبورد (`user` | `admin` | `superadmin`).
- شكل الـ Request Payload المرسل:
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "phoneNumber": "+201000000000",
  "password": "StrongPassword123!",
  "role": "admin"
}
```

### 💡 المطلوب من الباك إند:
- استقبال حقل `role` في الـ Controller والـ Validation Schema وتخزينه مع بيانات المستخدم المنشأ.

---
*تم إنشاء هذا الملف ليكون مرجعاً سريعاً وواضحاً لفريق التطوير.*
