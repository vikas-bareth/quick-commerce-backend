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

router.get("/history", userAuth, orderController.getOrderHistory);

router.get(
  "/customer",
  userAuth,
  roleCheck("CUSTOMER"),
  orderController.getCustomerOrders
);

router.get(
  "/pending",
  userAuth,
  roleCheck("DELIVERY"),
  orderController.getPendingOrders
);

router.get(
  "/in-progress",
  userAuth,
  roleCheck("DELIVERY"),
  orderController.getProcessingOrders
);

router.get("/:id", userAuth, roleCheck("CUSTOMER"), orderController.getOrder);

router.post("/cancel/:id", userAuth, orderController.cancelOrder);

router.put(
  "/:id/status",
  userAuth,
  roleCheck("DELIVERY"),
  orderController.updateOrderStatus
);

module.exports = router;
