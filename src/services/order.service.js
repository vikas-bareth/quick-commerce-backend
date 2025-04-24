const Order = require("../models/order");
const mongoose = require("mongoose");

exports.ERRORS = {
  INVALID_STATUS: "INVALID_STATUS",
  ORDER_NOT_FOUND: "ORDER_NOT_FOUND",
  INVALID_ORDER_ID: "INVALID_ORDER_ID",
};

exports.createOrder = async (customerId, orderData) => {
  const { product, quantity, deliveryAddress } = orderData;

  if (!product || !quantity || !deliveryAddress) {
    throw new Error("MISSING_REQUIRED_FIELDS");
  }
  return await Order.create({
    customer: customerId,
    product,
    quantity,
    deliveryAddress,
    status: "PENDING",
  });
};

exports.getCustomerOrders = async (customerId) => {
  return await Order.find({ customer: customerId });
};

exports.getPendingOrders = async () => {
  return await Order.find({ status: "PENDING" });
};

exports.updateOrderStatus = async (orderId, deliveryPartnerId, newStatus) => {
  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    throw new Error(this.ERRORS.INVALID_ORDER_ID);
  }
  const validStatuses = ["ACCEPTED", "OUT_FOR_DELIVERY", "DELIVERED"];

  if (!validStatuses.includes(newStatus)) {
    throw new Error(this.ERRORS.INVALID_STATUS);
  }

  const order = await Order.findByIdAndUpdate(
    orderId,
    {
      status: newStatus,
      deliveryPartner: deliveryPartnerId,
    },
    { new: true, runValidators: true }
  );

  if (!order) {
    throw new Error(ERRORS.ORDER_NOT_FOUND);
  }

  return order;
};

exports.getOrderHistory = async (userId) => {
  return await Order.find({
    $or: [{ customer: userId }, { deliveryPartner: userId }],
  }).sort({ createdAt: -1 });
};

exports.getOrderById = async (orderId, userId) => {
  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    throw new Error("INVALID_ORDER_ID");
  }

  const order = await Order.findOne({
    _id: orderId,
    customer: userId,
  });

  if (!order) {
    throw new Error("ORDER_NOT_FOUND");
  }

  return order;
};
