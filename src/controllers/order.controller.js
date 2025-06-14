const orderService = require("../services/order.service");
const ApiError = require("../utils/ApiError");

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

    req.app.get("io").emit("newOrderAvailable", {
      orderId: order._id,
      id: order._id,
      product: order.product,
      quantity: order.quantity,
      status: order.status,
      deliveryAddress: order.deliveryAddress,
      customer: order.customer,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
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

    const order = await orderService.updateOrderStatus(
      orderId,
      req.user._id,
      status
    );

    const io = req.app.get("io");
    io.to(order._id.toString()).emit("orderStatusUpdated", {
      orderId: order._id,
      newStatus: order.status,
      updatedAt: order.updatedAt,
      customer: order.customer,
      deliveryPartner: order.deliveryPartner,
    });

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    switch (error.message) {
      case "INVALID_STATUS":
        next(new ApiError(400, "Invalid order status"));
        break;
      case "INVALID_ORDER_ID":
        next(new ApiError(400, "Invalid order ID format"));
        break;
      case "ORDER_NOT_FOUND":
        next(new ApiError(404, "Order not found or access denied"));
        break;
      default:
        next(error);
    }
  }
};

exports.getOrderHistory = async (req, res) => {
  const orders = await orderService.getOrderHistory(req.user._id);
  res.status(200).json({ success: true, orders });
};

exports.getOrder = async (req, res, next) => {
  try {
    console.log("GET ORDER BY ID IS CALLING");
    const order = await orderService.getOrderById(req.params.id, req.user._id);

    res.status(200).json(order);
  } catch (error) {
    switch (error.message) {
      case "INVALID_ORDER_ID":
        next(new ApiError(400, "Invalid order ID format"));
        break;
      case "ORDER_NOT_FOUND":
        next(new ApiError(404, "Order not found or access denied"));
        break;
      default:
        next(error);
    }
  }
};

exports.getProcessingOrders = async (req, res) => {
  try {
    const orders = await orderService.getProcessingOrders();
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.cancelOrder = async (req, res) => {
  try {
    const order = await orderService.cancelOrder(req.params.id);
    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
