const path = require("path");
const dotenv = require("dotenv");
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

dotenv.config({ path: path.join(__dirname, "config.env") });

const { sequelize } = require("./config/database");
const ApiError = require("./utils/apiError");
const globalError = require("./middlewares/errorMiddleware");

const userRouter = require("./routes/userRoute");
const authRouter = require("./routes/authRoute");
const editProfileRouter = require("./routes/editProfileRoute");
const viewProfileRouter = require("./routes/viewProfileRoute");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin:"*",
  // 'http://localhost:3000',
  // 'https://polyhydroxy-kinkily-kathe.ngrok-free.dev'

  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE','PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'ngrok-skip-browser-warning']
}));
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
  console.log(`mode: ${process.env.NODE_ENV}`);
}

app.use("/api/users", userRouter);
app.use("/api/authentication", authRouter);
app.use("/api/profile", editProfileRouter);
app.use("/api/profile", viewProfileRouter);

app.all("*", (req, res, next) => {
  next(new ApiError(`Can't find this route: ${req.originalUrl}`, 400));
});

app.use(globalError);

const PORT = process.env.PORT || 8000;

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connection established successfully.");

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 Server started at port ${PORT}`);
    });
  } catch (err) {
    console.error("❌ Unable to connect to the database:", err);
    process.exit(1);
  }
};

startServer();

process.on("unhandledRejection", (err) => {
  console.error(`UnhandledRejection Errors: ${err.name} | ${err.message}`);
  process.exit(1);
});
