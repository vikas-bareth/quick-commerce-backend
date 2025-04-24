const orderService = require("../services/order.service");
const ApiError = require("../utils/ApiError");
const mongoose = require("mongoose");

exports.createOrder = async (req, res, next) => {
  try {
    const { product, quantity, deliveryAddress } = req.body;

    if (!product || !quantity || !deliveryAddress) {
      throw new ApiError(
        400,
        "Product, quantity, and delivery address are required"
      );
    }

    const order = await orderService.createOrder(req.user._id, {
      product,
      quantity,
      deliveryAddress,
    });

    res.status(201).json(order);
  } catch (error) {
    if (error.message === "MISSING_REQUIRED_FIELDS") {
      return next(
        new ApiError(400, "Product, quantity and address are required")
      );
    }
    next(error);
  }
};

exports.getCustomerOrders = async (req, res, next) => {
  try {
    const orders = await orderService.getCustomerOrders(req.user._id);

    res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    next(error);
  }
};

// Get Pending Orders (Delivery Partner)
exports.getPendingOrders = async (req, res, next) => {
  try {
    const orders = await orderService.getPendingOrders();

    res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    next(error);
  }
};

// Update Order Status
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const orderId = req.params.id;

    if (!status) {
      throw new ApiError(400, "Status is required");
    }

    if (!orderId) {
      throw new ApiError(400, "Order ID is required");
    }

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      throw new ApiError(400, "Invalid Order ID format");
    }

    const order = await orderService.updateOrderStatus(
      orderId,
      req.user._id,
      status
    );

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    next(error);
  }
};
