const express = require("express");
const router = express.Router();
const orderController = require("../controllers/order.controller");
const userAuth = require("../middlewares/auth");
const roleCheck = require("../middlewares/roleCheck");
const { validateOrder } = require("../middlewares/validateOrder");

// Customer Routes
router.post(
  "/",
  userAuth,
  roleCheck("CUSTOMER"),
  validateOrder,
  orderController.createOrder
);

router.get(
  "/customer",
  userAuth,
  roleCheck("CUSTOMER"),
  orderController.getCustomerOrders
);

// Delivery Partner Routes
router.get(
  "/pending",
  userAuth,
  roleCheck("DELIVERY"),
  orderController.getPendingOrders
);

router.put(
  "/:id/status",
  userAuth,
  roleCheck("DELIVERY"),
  orderController.updateOrderStatus
);

router.get("/history", userAuth, orderController.getOrderHistory);

module.exports = router;
