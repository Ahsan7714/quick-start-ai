const express = require("express");
const cors = require("cors");
const { connectDB } = require("./database/database");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");
const morgan = require("morgan");
const compression = require('compression');
const app = express();
const ErrorHandler = require("./middleware/error");


const PORT = process.env.PORT || 3100;
// require("dotenv").config();

require("dotenv").config({ path: "./config/.env" });

// Middleware to ensure DB is connected before processing requests
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    next(err);
  }
});

const allowedOrigins = [
  'https://quick-start-ai-client.vercel.app'
];
if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL);
}

app.use(cors({
  origin: (origin, callback) => {
    if (
      !origin ||
      origin.startsWith('http://localhost') ||
      allowedOrigins.includes(origin) ||
      origin.endsWith('.vercel.app')
    ) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));



app.use(morgan("dev"));
app.use(compression());
app.use(express.json({ limit: "150mb" }));
app.use(express.urlencoded({ limit: "150mb", extended: true }));
app.use(cookieParser());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests from this IP, please try again after 15 minutes.",
});

app.use(limiter);

const userRoutes = require("./routes/userRoutes");
const chatbotRoutes = require("./routes/chatbotRoute");
const sessionRoutes = require("./routes/sessionRoute");
const messageRoutes = require("./routes/messageRoute");

app.use("/api/v1/user", userRoutes);
app.use("/api/v1/chatbot", chatbotRoutes);
app.use("/api/v1/session", sessionRoutes);
app.use("/api/v1/message", messageRoutes);

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", message: "Server is healthy!" });
});

app.get("/", (req, res) => {
  res.send("Hello World!");
});

// Not found route
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: "Page not found",
  });
});


app.use(ErrorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
