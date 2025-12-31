# Aura - Luxury E-commerce Platform

Aura is a high-end, luxury-branded e-commerce platform designed with a focus on premium aesthetics, smooth animations, and a seamless user experience.

## ✨ Features

- **Premium UI/UX**: Custom-designed interface with glassmorphism, smooth transitions, and high-end typography.
- **Responsive Design**: Fully optimized for mobile, tablet, and desktop views.
- **Admin Dashboard**: Comprehensive management system for products, orders, and user roles (Admin & Co-admin).
- **Dark Mode Support**: Seamless switching between light and dark themes.
- **Advanced Animations**: Powered by Framer Motion, GSAP, and Three.js.
- **Order Notifications**: Automated email alerts for new orders.

## 🛠️ Tech Stack

### Frontend
- **Framework**: [React](https://reactjs.org/) + [Vite](https://vitejs.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Animations**: Framer Motion, GSAP, Three.js
- **Form/Schema Validation**: Zod

### Backend
- **Runtime**: [Node.js](https://nodejs.org/)
- **Framework**: [Express.js](https://expressjs.com/)
- **Database**: [MongoDB](https://www.mongodb.com/) (Mongoose ODM)
- **Authentication**: JWT & BcryptJS
- **Media Management**: [Cloudinary](https://cloudinary.com/)
- **Email Service**: [Nodemailer](https://nodemailer.com/)

---

## 🚀 Getting Started

Follow these steps to set up and run the project locally.

### Prerequisites

- [Node.js](https://nodejs.org/) (v16+ recommended)
- [MongoDB](https://www.mongodb.com/try/download/community) installed and running locally, or a MongoDB Atlas connection string.

### 1. Clone the repository
```bash
git clone <repository-url>
cd Aura
```

### 2. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd project-backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `project-backend` folder and add your configuration:
   ```env
   PORT=3000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   # Email Config (optional)
   EMAIL_USER=your_email
   EMAIL_PASS=your_app_password
   ```
4. Start the backend:
   ```bash
   npm run dev
   ```

### 3. Frontend Setup
1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd project-frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the frontend:
   ```bash
   npm run dev
   ```

The application should now be running!
- Frontend: `http://localhost:5173` (default Vite port)
- Backend: `http://localhost:3000`

---

## 📸 Scripts

- `npm run dev`: Starts the development server (available in both frontend and backend).
- `npm start`: Starts the production server (backend).
- `npm run build`: Builds the frontend for production.
