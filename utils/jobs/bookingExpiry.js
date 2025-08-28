const cron = require("node-cron");
const Booking = require("../../models/booking.model");
const { BOOKING_STATUS } = require("../../config/constants");

exports.startBookingExpiryJob = () => {
  cron.schedule("* * * * *", async () => {
    // runs every minute
    const now = new Date();
    try {
      const expired = await Booking.updateMany(
        {
          status: BOOKING_STATUS.PENDING,
          expireAt: { $lte: now },
        },
        { $set: { status: BOOKING_STATUS.EXPIRED, isActive: false } }
      );
      if (expired.modifiedCount > 0) {
        console.log(`Expired ${expired.modifiedCount} bookings`);
      }
    } catch (err) {
      console.error("Booking expiry job failed:", err);
    }
  });
};
