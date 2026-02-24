# Twitter Clone - React + NestJS + Firebase

A full-stack Twitter clone built with modern web technologies, featuring real-time updates, full-text search, and a robust serverless backend.

## 🚀 Tech Stack

### Frontend

- **Framework:** [React 19](https://react.dev/)
- **Build Tool:** [Vite](https://vitejs.dev/)
- **Styling:** [Tailwind CSS 4](https://tailwindcss.com/)
- **State Management:** [Zustand](https://zustand-demo.pmnd.rs/)
- **Form Handling:** [Formik](https://formik.org/) + [Yup](https://github.com/jquense/yup)
- **Networking:** [Axios](https://axios-http.com/)
- **Search:** [Algolia React InstantSearch](https://www.algolia.com/doc/guides/building-search-ui/what-is-instantsearch/react/)
- **UI Components:** [Radix UI](https://www.radix-ui.com/) + [Lucide Icons](https://lucide.dev/)

### Backend (Firebase Functions)

- **Framework:** [NestJS 11](https://nestjs.com/)
- **Platform:** [Google Cloud Functions](https://firebase.google.com/docs/functions)
- **Database:** [Firestore](https://firebase.google.com/docs/firestore)
- **Storage:** [Firebase Storage](https://firebase.google.com/docs/storage)
- **Search Engine:** [Algolia](https://www.algolia.com/)
- **Email Service:** [Resend](https://resend.com/) (via SMTP / Nodemailer)
- **Validation:** [Class-validator](https://github.com/typestack/class-validator)

---

## ✨ Features

- **Authentication:** Secure sign-up and sign-in via Firebase Authentication.
- **Email Verification:** Sends a verification email after registration via Resend SMTP.
- **Password Reset:** Sends a password reset link to the user's email via Resend SMTP.
- **Micro-blogging:** Create, Edit, and Delete posts (tweets).
- **Engagement:** Like posts and reply with comments.
- **Search:** Instant full-text search for users and posts powered by Algolia.
- **User Profiles:** Customizable profiles with avatars and cover images stored in Firebase Storage.
- **Real-time Triggers:** Automatic indexing of Firestore data to Algolia via Firebase Cloud Function triggers.
- **Secure API:** Throttling and security headers (Helmet) implemented in the NestJS backend.

---

## 🛠️ Project Structure

```text
.
├── client/                 # React frontend (Vite)
├── functions/              # NestJS backend (Firebase Functions)
├── firestore.rules         # Firestore security rules
├── storage.rules           # Firebase Storage security rules
└── firebase.json           # Firebase configuration
```

---

## ⚙️ Setup & Installation

### Prerequisites

- Node.js (v18+ recommended)
- Firebase CLI (`npm install -g firebase-tools`)
- Algolia Account (for search functionality)
- [Resend](https://resend.com/) Account (for transactional emails)

### 1. Clone the repository

```bash
git clone <repository-url>
cd React-Nest-TS-Firebase-Twitter-clone
```

### 2. Backend Setup (Functions)

```bash
cd functions
npm install
cp .env.example .env
```

### 3. Frontend Setup (Client)

```bash
cd ../client
npm install
cp .env.example .env
```

---

## 🏃 Running Locally

### Start Backend (with Firebase Emulators)

Ensure you are in the root directory:

```bash
firebase emulators:start
```

Or run the NestJS app directly for development:

```bash
cd functions
npm run start:dev
```

### Start Frontend

```bash
cd client
npm run dev
```

---

## ☁️ Deployment

The project is configured for deployment via **GitHub Actions**.

- **Frontend:** Deployed to Firebase Hosting.
- **Backend:** Deployed to Firebase Functions.

Check `.github/workflows/` for CI/CD details.

---
