# MernGPT

A full-stack AI chatbot application built with the MERN stack (MongoDB, Express, React, Node.js) and Gemini API integration.

## Features
- User authentication (signup, login, logout)
- Persistent chat history per user
- Gemini API integration with model fallback
- Modern React frontend with Material UI

---

## Prerequisites
- Node.js (v18 or higher recommended)
- npm or yarn
- MongoDB (local or Atlas)
- Gemini API Key (from Google)

---

## Setup Instructions

### 1. Clone the repository
```sh
git clone <your-repo-url>
cd MernGPT
```

### 2. Backend Setup
```sh
cd Backend
cp .env.example .env # Create your .env file and fill in the values
npm install
```

- Edit `.env` and set your MongoDB URI and Gemini API key:
  - `MONGODB_URI=your_mongodb_uri`
  - `GEMINI_API_KEY=your_gemini_api_key`

#### Start the backend server
```sh
npm run dev
```

### 3. Frontend Setup
```sh
cd ../frontend
npm install
```

#### Start the frontend dev server
```sh
npm run dev
```

---

## Folder Structure
```
MernGPT/
  Backend/    # Express + MongoDB API
  frontend/   # React + Vite frontend
```

---

## API Endpoints (Backend)
- `POST /api/v1/user/signup` - Register new user
- `POST /api/v1/user/login` - Login
- `POST /chat/new` - Send a chat message
- `GET /chat/all-chats` - Get all chats for user
- `DELETE /chat/delete` - Delete all chats

---

## Environment Variables
- **Backend**: `.env` file in `Backend/`
  - `MONGODB_URI`
  - `GEMINI_API_KEY`

---

## Troubleshooting
- Make sure MongoDB is running and accessible
- Ensure your Gemini API key is valid and has access
- For CORS issues, check your backend CORS configuration

---

## License
MIT
