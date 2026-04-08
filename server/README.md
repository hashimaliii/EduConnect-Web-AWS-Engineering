# EduConnect Pakistan – Backend (Server)

This is the **Node.js + Express** backend for **EduConnect Pakistan**, a university course registration and tutoring platform. It powers the core functionality for students, tutors, and administrators.

---

## 📁 Project Structure

```
server/
├── config/              # Database connection
├── controllers/         # Role-based controllers (admin, student, tutor, auth)
├── middleware/          # Auth and role-check middlewares
├── models/              # MongoDB schemas
├── routes/
│   └── api/             # Separated route files per role
├── utils/               # Utility functions
├── server.js            # Entry point
└── .env                 # Environment variables (not committed)
```

---

## ⚙️ Features

### ✅ Authentication & User Roles
- JWT-based login/signup
- Roles: `student`, `tutor`, `admin`
- Middleware-based role protection

### 👨‍🎓 Student Functionality
- Tutor search with filters (subject, city, rating, availability, price)
- Book/reschedule/cancel tutoring sessions
- Add tutors to wishlist
- Review and rate tutors

### 👨‍🏫 Tutor Functionality
- Complete profile (qualifications, availability, hourly rate, bio)
- View/manage session bookings
- View earnings dashboard
- Submit verification documents

### 🛠️ Admin Functionality
- View/delete users
- View pending tutor verifications, approve/reject
- Dashboard stats: sessions, users, earnings, growth
- Reporting (by city, popular subjects, etc.)

### ✨ Bonus Features
- Availability-based session booking
- Rate change notifications (via backend logic)

---

## 🛠️ Setup Instructions

1. **Clone the repo:**
```bash
git clone https://github.com/yourusername/educonnect-pakistan.git
cd educonnect-pakistan/server
```

2. **Install dependencies:**
```bash
npm install
```

3. **Environment Variables:**
Create a `.env` file in `server/` with:

```
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

4. **Start the server:**
```bash
npm run dev
```

---

## 🔗 API Base URL

```
http://localhost:5000/api/
```

---

## 📬 Contact

Developed by Hashim Ali as part of the Web Engineering course, 6th Semester.
