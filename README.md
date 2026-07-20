# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
# Firestore/Auth bootstrap

CRUD aplikasi kini memakai Firestore; `src/lib/store.js` hanya adapter kompatibilitas cache realtime (`onSnapshot`) agar UI lama tetap bekerja.

## Membuat pengguna secara aman
Jangan gunakan `createUserWithEmailAndPassword` dari sesi admin browser: API itu mengganti sesi aktif ke akun baru.

1. Buat akun di **Firebase Console ? Authentication ? Users ? Add user** (atau gunakan Admin SDK pada backend tepercaya).
2. Salin UID, lalu buat dokumen `users/{uid}` di Firestore:
   - `nama`, `email`
   - `role`: `admin | pengawas | kamad | guru`
   - `madrasahId` untuk kamad/guru
   - `madrasahBinaanIds` (array) untuk pengawas
3. Akun admin awal juga harus di-bootstrap manual melalui Console. Service-account JSON tidak boleh disimpan/commit di repo.

## Query/RBAC
Setiap data tenant wajib memiliki `ownerId` dan `madrasahId`. Guru: milik sendiri; kamad: madrasah sendiri; pengawas: daftar binaan; admin: semua. Deploy rules/indexes hanya setelah review: `firebase deploy --only firestore:rules,firestore:indexes`.
