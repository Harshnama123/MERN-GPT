import express from "express";
import { config } from "dotenv";
import morgan from "morgan";
import appRouter from "./routes/index.js";
import cookieParser from "cookie-parser";
import cors from "cors";
config();
const app = express();
//middlewares
app.use(cors({
    origin: [
        "http://localhost:5173",
        "https://mern-gpt-1-git-main-harshnama123s-projects.vercel.app",
        "https://mern-gpt.vercel.app",
        "https://mern-gpt-beta.vercel.app"
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
        'Origin',
        'X-Requested-With',
        'Content-Type',
        'Accept',
        'Authorization',
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
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    next();
});
//remove it in production
app.use(morgan("dev"));
app.use("/api/v1", appRouter);
export default app;
//# sourceMappingURL=app.js.map