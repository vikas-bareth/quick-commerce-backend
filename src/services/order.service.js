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
  })
    .populate({
      path: "customer",
      select: "firstName lastName email phone photoUrl role",
    })
    .populate({
      path: "deliveryPartner",
      select: "firstName lastName email phone photoUrl role",
      match: { _id: { $exists: true } },
    })
    .lean();

  if (!order) {
    throw new Error("ORDER_NOT_FOUND");
  }

  const formatName = (user) => {
    if (!user) return null;
    return `${user.firstName} ${user.lastName || ""}`.trim();
  };

  return {
    success: true,
    order: {
      ...order,
      customer: {
        ...order.customer,
        name: formatName(order.customer),
        photoUrl: order.customer.photoUrl,
      },
      deliveryPartner: order.deliveryPartner
        ? {
            ...order.deliveryPartner,
            name: formatName(order.deliveryPartner),
            photoUrl: order.deliveryPartner.photoUrl,
          }
        : null,
    },
  };
};

exports.getProcessingOrders = async () => {
  const orders = await Order.find({
    status: { $in: ["ACCEPTED", "OUT_FOR_DELIVERY"] },
  });
  return orders;
};

exports.cancelOrder = async (orderId) => {
  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    throw new Error("INVALID_ORDER_ID");
  }
  const order = await Order.findByIdAndUpdate(
    orderId,
    {
      status: "CANCELED",
    },
    { new: true, runValidators: true }
  );

  if (!order) {
    throw new Error(ERRORS.ORDER_NOT_FOUND);
  }

  return order;
};
