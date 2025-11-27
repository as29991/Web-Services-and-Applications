const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:4200",
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

const authRoutes = require("./src/routes/authRoutes");
const productRoutes = require("./src/routes/productRoutes");
const orderRoutes = require("./src/routes/orderRoutes");
const discountRoutes = require("./src/routes/discountRoutes");
const reportRoutes = require("./src/routes/reportRoutes");
const referenceDataRoutes = require("./src/routes/referenceDataRoutes");
const clientRoutes = require("./src/routes/clientRoutes");
const userRoutes = require("./src/routes/userRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/discounts", discountRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/reference", referenceDataRoutes);
app.use("/api/clients", clientRoutes);
app.use("/api/users", userRoutes);

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Welcome to Web Store API",
    version: "1.0.0",
    endpoints: {
      auth: "/api/auth",
      products: "/api/products",
      orders: "/api/orders",
      discounts: "/api/discounts",
      reports: "/api/reports",
      reference: "/api/reference",
      clients: "/api/clients",
      users: "/api/users",
    },
  });
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Endpoint not found",
    path: req.path,
  });
});

app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`\n Server is running on port ${PORT}`);
  console.log(`  API URL: http://localhost:${PORT}`);
  console.log(`\n API Endpoints:`);
  console.log(`   - Authentication: http://localhost:${PORT}/api/auth`);
  console.log(`   - Products: http://localhost:${PORT}/api/products`);
  console.log(`   - Orders: http://localhost:${PORT}/api/orders`);
  console.log(`   - Discounts: http://localhost:${PORT}/api/discounts`);
  console.log(`   - Reports: http://localhost:${PORT}/api/reports`);
  console.log(`   - Reference Data: http://localhost:${PORT}/api/reference`);
  console.log(`   - Clients: http://localhost:${PORT}/api/clients`);
  console.log(`   - Users: http://localhost:${PORT}/api/users`);
  console.log(`\n Environment: ${process.env.NODE_ENV || "development"}\n`);
});

module.exports = app;
