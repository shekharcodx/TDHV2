const mongoose = require("mongoose");
const Booking = require("../../models/booking.model");
const RentalListing = require("../../models/rentalListing.model");
const { BOOKING_STATUS, PAYMENT_STATUS } = require("../../config/constants");
const messages = require("../../messages/messages");
const { calculateAmount } = require("../../utils/calculateAmount");

exports.createBooking = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { listingId, startDate, endDate } = req.body;
    const { id: customerId } = req.user;
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (end < start) {
      return res
        .status(400)
        .json({ success: false, message: "endDate must be after startDate" });
    }

    const car = await RentalListing.findById(listingId);
    if (!car || !car.isActive) {
      return res
        .status(400)
        .json({ success: false, ...messages.CAR_NOT_FOUND });
    }

    const overlapping = await Booking.findOne({
      listing: listingId,
      status: {
        $in: [BOOKING_STATUS.PENDING, BOOKING_STATUS.CONFIRMED],
      },
      startDate: { $lte: end },
      endDate: { $gte: start },
    }).session(session);

    if (overlapping) {
      return res.status(400).json({
        success: false,
        ...messages.CAR_ALREADY_BOOKED,
      });
    }

    const expireAt = new Date();
    expireAt.setMinutes(
      expireAt.getMinutes() + Number(process.env.UNPAID_EXPIRY_MINUTES)
    );

    const amount = calculateAmount(start, end, {
      perMonth: car.rentPerMonth,
      perWeek: car.rentPerWeek,
      perDay: car.rentPerDay,
    });

    const booking = await Booking.create(
      [
        {
          customer: customerId,
          vendor: car.vendor,
          listing: listingId,
          startDate: start,
          endDate: end,
          totalAmount: amount,
          paymentStatus: PAYMENT_STATUS.PENDING,
          bookingStatus: BOOKING_STATUS.PENDING,
          expireAt,
        },
      ],
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      success: true,
      ...messages.BOOKING_CREATED,
      booking: booking[0],
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, ...messages.INTERNAL_SERVER_ERROR });
  }
};
