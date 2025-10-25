const messages = require("../../messages/messages");
const Booking = require("../../models/booking.model");
const VendorDetail = require("../../models/vendor.model");
const jwt = require("jsonwebtoken");
const stripe = require("../../config/stripe");

exports.rentalPayment = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { token } = req.query;

    let verified;
    try {
      verified = jwt.verify(token, process.env.BOOKING_JWT_SECRET);
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: "Link expired or invalid. Please request a new link.",
      });
    }

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res
        .status(404)
        .json({ success: false, message: "Booking not found" });
    }

    if (booking.rentalPaid) {
      return res
        .status(400)
        .json({ success: false, message: "Rental booking is already paid" });
    }

    const vendorDetails = await VendorDetail.findOne({
      userId: booking.vendor,
    });

    if (!vendorDetails) {
      return res
        .status(404)
        .json({ success: false, message: "Vendor data not found" });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "aed",
            unit_amount: Math.round(booking.totalWithoutSecurity * 100),
            product_data: { name: "Car Rental Fee" },
          },
          quantity: 1,
        },
      ],
      payment_intent_data: {
        application_fee_amount: Math.round(
          Number(process.env.PLATFORM_FEE) * 100
        ),
        transfer_data: {
          destination: vendorDetails.stripeAccountId,
        },
      },
      success_url: `${process.env.WEB_FRONTEND_URL}/payment-success?rental=true&booking=${bookingId}`,
      cancel_url: `${process.env.WEB_FRONTEND_URL}/payment-cancelled`,
    });

    res.redirect(303, session.url);
  } catch (err) {
    console.log("Error generating rentaPayment session", err);
    return res
      .status(500)
      .json({ success: false, ...messages.INTERNAL_SERVER_ERROR });
  }
};

exports.depositPayment = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { token } = req.query;

    // --- Verify token ---
    let verified;
    try {
      verified = jwt.verify(token, process.env.BOOKING_JWT_SECRET);
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: "Link expired or invalid. Please request a new link.",
      });
    }

    if (verified.bookingId !== bookingId) {
      return res
        .status(403)
        .json({ success: false, message: "Invalid token." });
    }

    // --- Fetch booking ---
    const booking = await Booking.findById(bookingId);
    if (!booking)
      return res
        .status(404)
        .json({ success: false, message: "Booking not found." });

    if (booking.depositPaid)
      return res
        .status(400)
        .json({ success: false, message: "Security deposit already paid." });

    // --- Vendor ---
    const vendorDetails = await VendorDetail.findOne({
      userId: booking.vendor,
    });
    if (!vendorDetails)
      return res
        .status(404)
        .json({ success: false, message: "Vendor not found." });

    // --- Stripe session ---
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "aed",
            unit_amount: Math.round(booking.securityDeposit * 100),
            product_data: { name: "Security Deposit" },
          },
          quantity: 1,
        },
      ],
      payment_intent_data: {
        // No platform fee deduction here
        transfer_data: {
          destination: vendorDetails.stripeAccountId,
        },
      },
      success_url: `${process.env.WEB_FRONTEND_URL}/payment-success?deposit=true&booking=${bookingId}`,
      cancel_url: `${process.env.WEB_FRONTEND_URL}/payment-cancelled`,
    });

    return res.redirect(303, session.url);
  } catch (err) {
    console.error("Error generating depositPayment session", err);
    return res
      .status(500)
      .json({ success: false, ...messages.INTERNAL_SERVER_ERROR });
  }
};
