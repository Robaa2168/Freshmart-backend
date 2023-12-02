require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const socket = require("socket.io");

const { connectDB } = require("../config/db");
const productRoutes = require("../routes/productRoutes");
const customerRoutes = require("../routes/customerRoutes");
const adminRoutes = require("../routes/adminRoutes");
const orderRoutes = require("../routes/orderRoutes");
const customerOrderRoutes = require("../routes/customerOrderRoutes");
const categoryRoutes = require("../routes/categoryRoutes");
const couponRoutes = require("../routes/couponRoutes");
const attributeRoutes = require("../routes/attributeRoutes");
const settingRoutes = require("../routes/settingRoutes");
const currencyRoutes = require("../routes/currencyRoutes");
const languageRoutes = require("../routes/languageRoutes");
const { isAuth, isAdmin } = require("../config/auth");
const {
  getGlobalSetting,
  getStoreCustomizationSetting,
} = require("../lib/notification/setting");

connectDB();
const app = express();

// We are using this for the express-rate-limit middleware
app.set("trust proxy", 1);

app.use(express.json({ limit: "4mb" }));
app.use(helmet());
app.use(cors());

//root route/first point of serving app
app.get("/", (req, res) => {
  res.send("App works properly!");
});

//routes for store front
app.use("/api/products/", productRoutes);
app.use("/api/category/", categoryRoutes);
app.use("/api/coupon/", couponRoutes);
app.use("/api/customer/", customerRoutes);
app.use("/api/order/", isAuth, customerOrderRoutes);
app.use("/api/attributes/", attributeRoutes);
app.use("/api/setting/", settingRoutes);
app.use("/api/currency/", isAuth, currencyRoutes);
app.use("/api/language/", languageRoutes);
app.use("/api/admin/", adminRoutes);
app.use("/api/orders/", orderRoutes);


// Usinging express's default error handling middleware
app.use((err, req, res, next) => {
  if (res.headersSent) return next(err);
  res.status(400).json({ message: err.message });
});


const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () =>
  console.log(`server running on port ${PORT}`)
);

//setting up socket
const io = socket(server, {
  cors: {
    origin: "*",
    methods: ["PUT", "GET", "POST", "DELETE", "PATCH", "OPTIONS"],
    credentials: false,
    transports: ["websocket", "polling"],
  },
});

io.on("connection", (socket) => {
  console.log(`Socket ${socket.id} connected!`);

  socket.on("notification", async (data) => {

    let updatedData = data;

    if (data?.option === "storeCustomizationSetting") {
      const storeCustomizationSetting = await getStoreCustomizationSetting(
        data
      );
      updatedData = {
        ...data,
        storeCustomizationSetting: storeCustomizationSetting,
      };
    }
    if (data?.option === "globalSetting") {
      const globalSetting = await getGlobalSetting(data);
      updatedData = {
        ...data,
        globalSetting: globalSetting,
      };
    }
    io.emit("notification", updatedData);
  });

  socket.on("disconnect", () => {
    console.log(`Socket ${socket.id} disconnected!`);
  });
});
