# Online-Quiz-Application

A web-based quiz app built for the Web Engineering course (Semester V, Sukkur IBA University).
Built with HTML, CSS, vanilla JavaScript and Firebase.

## Done so far (Part 1)

- Register, login, logout and password reset (Firebase Authentication)
- User details saved in Firestore (`users` collection)
- Light / dark theme toggle
- Home page that only logged-in users can open

## Setup

1. Create a Firebase project and add a Web app.
2. Turn on **Authentication > Email/Password** and create a **Firestore** database.
3. Put your Firebase config into `firebase.js`.
4. Open the project with a local server (for example the VS Code **Live Server** extension) and start from `login.html`.

## Files

| File | Purpose |
|---|---|
| `index.html` | Home page (after login) |
| `login.html`, `register.html`, `forgot-password.html` | Account pages |
| `auth.js` | Theme toggle, form validation, login / register / reset logic |
| `firebase.js` | Firebase config and setup |
| `style.css` | Styles for all pages, including dark theme |
