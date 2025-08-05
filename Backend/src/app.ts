import express from "express";
import { config } from "dotenv";
import morgan from "morgan";
import appRouter from "./routes/index.js";
import cookieParser from "cookie-parser";
import cors from "cors";
config();
const app = express();

//middlewares
// CORS configuration
const allowedOrigins = [
  "http://localhost:5173",
  "https://mern-gpt-1-git-main-harshnama123s-projects.vercel.app",
  "https://mern-gpt.vercel.app",
  "https://mern-gpt-beta.vercel.app"
];

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'Cookie',
    'Set-Cookie'
  ],
  exposedHeaders: ['Set-Cookie'],
  maxAge: 86400, // 24 hours
}));

// Handle preflight requests
app.options('*', cors());

app.use(express.json());
app.use(cookieParser(process.env.COOKIE_SECRET));

// Additional headers for security and CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );
  next();
});

// Logging middleware - only in development
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan("dev"));
}

// API routes
app.use("/api/v1", appRouter);

export default app;