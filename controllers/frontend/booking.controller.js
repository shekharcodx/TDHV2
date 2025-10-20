const mongoose = require("mongoose");
const Booking = require("../../models/booking.model");
const RentalListing = require("../../models/rentalListing.model");
const { BOOKING_STATUS, PAYMENT_STATUS } = require("../../config/constants");
const messages = require("../../messages/messages");
const { calculateAmount } = require("../../utils/calculateAmount");

exports.calculateBooking = async (req, res) => {
  try {
    const { pickup, dropoff, priceType, carId } = req.body;
    const car = await RentalListing.findById(carId).select(
      "rentPerDay rentPerWeek rentPerMonth depositRequired securityDeposit"
    );
    if (!car) {
      return res
        .status(404)
        .json({ success: false, ...messages.CAR_NOT_FOUND });
    }

    const { unit, aboveGrace } = calculateRentalUnits(
      pickup,
      dropoff,
      priceType
    );

    const { grandTotal, total } = calculateRent(car, unit, priceType);

    res.status(200).json({
      success: true,
      data: {
        total,
        depositRequired: car.depositRequired,
        securityDeposit: car.securityDeposit,
        grandTotal,
        aboveGrace,
      },
    });
  } catch (err) {
    console.log("Calculate Booking Error", err);
    return res
      .status(500)
      .json({ success: false, ...messages.INTERNAL_SERVER_ERROR });
  }
};

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

function calculateRent(car, unit, priceType) {
  let total = 0;
  switch (priceType) {
    case "daily":
      total = car.rentPerDay * unit;
      break;
    case "weekly":
      total = car.rentPerWeek * unit;
      break;
    case "monthly":
      total = car.rentPerMonth * unit;
      break;
  }

  let grandTotal = total;
  if (car.depositRequired) grandTotal += car.securityDeposit;

  return { grandTotal, total };
}

function calculateRentalUnits(pickup, dropoff, priceType) {
  const start = new Date(pickup);
  const end = new Date(dropoff);

  console.log("startend", { start, end });

  if (end <= start) {
    console.error("Dropoff must be after pickup");
    throw new Error("Dropoff must be after pickup");
  }

  const totalHours = (end - start) / (1000 * 60 * 60);

  let baseHours;
  switch (priceType) {
    case "daily":
      baseHours = 24;
      break;
    case "weekly":
      baseHours = 24 * 7;
      break;
    case "monthly":
      baseHours = 24 * 30; // 30 days fixed month
      break;
    default:
      throw new Error("Invalid price type");
  }

  // Calculate base units (without rounding)
  const rawUnits = totalHours / baseHours;
  const wholeUnits = Math.floor(rawUnits);

  const baseTimeForWholeUnits = wholeUnits * baseHours;
  const remainingHours = totalHours - baseTimeForWholeUnits;
  // Apply single grace hour regardless of duration
  if (remainingHours > 1) {
    return { aboveGrace: true, unit: wholeUnits + 1 };
  }

  return { unit: wholeUnits > 0 ? wholeUnits : 1, aboveGrace: false };
}
