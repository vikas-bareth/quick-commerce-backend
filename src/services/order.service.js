const Order = require("../models/order");

exports.ERRORS = {
  INVALID_STATUS: "INVALID_STATUS",
  ORDER_NOT_FOUND: "ORDER_NOT_FOUND",
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
  const validStatuses = ["Accepted", "Out for Delivery", "Delivered"];

  if (!validStatuses.includes(newStatus)) {
    throw new Error(ERRORS.INVALID_STATUS); // Generic error
  }

  const order = await Order.findByIdAndUpdate(
    orderId,
    {
      status: newStatus,
      deliveryPartner: deliveryPartnerId,
    },
    { new: true }
  );

  if (!order) {
    throw new Error(ERRORS.ORDER_NOT_FOUND); // Generic error
  }

  return order;
};
