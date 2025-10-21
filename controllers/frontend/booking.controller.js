const mongoose = require("mongoose");
const Booking = require("../../models/booking.model");
const RentalListing = require("../../models/rentalListing.model");
const {
  BOOKING_STATUS,
  PAYMENT_STATUS,
  vendorLookup,
  featuresLookup,
  createCarProjection,
} = require("../../config/constants");
const messages = require("../../messages/messages");
const { calculateAmount } = require("../../utils/calculateAmount");
const frontend = require("../../messages/frontend");

exports.calculateBooking = async (req, res) => {
  try {
    const {
      deliveryRequired,
      pickupDate,
      pickupTime,
      dropoffDate,
      dropoffTime,
      priceType,
      carId,
    } = req.body;

    const pickupDateTime = new Date(`${pickupDate}T${pickupTime}:00`);
    const dropoffDateTime = new Date(`${dropoffDate}T${dropoffTime}:00`);

    const pickup = pickupDateTime.toISOString();
    const dropoff = dropoffDateTime.toISOString();

    if (dropoff <= pickup) {
      return res
        .status(400)
        .json({ success: false, ...frontend.DROPOFF_MUST_BE_AFTER_PICKUP });
    }

    const car = await RentalListing.findById(carId).select(
      "rentPerDay rentPerWeek rentPerMonth depositRequired securityDeposit deliveryCharges isActive"
    );
    if (!car || !car.isActive) {
      return res
        .status(404)
        .json({ success: false, ...messages.CAR_NOT_FOUND });
    }

    const { unit, aboveGrace } = calculateRentalUnits(
      pickup,
      dropoff,
      priceType
    );

    const { grandTotal, total } = calculateRent(
      car,
      unit,
      priceType,
      deliveryRequired
    );

    res.status(200).json({
      success: true,
      data: {
        total,
        units: unit,
        priceType,
        depositRequired: car.depositRequired,
        securityDeposit: car.securityDeposit,
        deliveryCharges: car.deliveryCharges,
        grandTotal,
        aboveGraceHour: aboveGrace,
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
    const {
      deliveryRequired,
      pickupDate,
      pickupTime,
      dropoffDate,
      dropoffTime,
      priceType,
      carId,
    } = req.body;
    const { id: customerId } = req.user;

    const pickupDateTime = new Date(`${pickupDate}T${pickupTime}:00`);
    const dropoffDateTime = new Date(`${dropoffDate}T${dropoffTime}:00`);

    const pickup = pickupDateTime.toISOString();
    const dropoff = dropoffDateTime.toISOString();

    if (dropoff <= pickup) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(400)
        .json({ success: false, ...frontend.DROPOFF_MUST_BE_AFTER_PICKUP });
    }

    const car = await RentalListing.findById(carId).select(
      "vendor rentPerDay rentPerWeek rentPerMonth depositRequired securityDeposit deliveryCharges isActive"
    );
    if (!car || !car.isActive) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(400)
        .json({ success: false, ...messages.CAR_NOT_FOUND });
    }

    const { unit } = calculateRentalUnits(pickup, dropoff, priceType);

    const { grandTotal } = calculateRent(
      car,
      unit,
      priceType,
      deliveryRequired
    );

    const booking = await Booking.create(
      [
        {
          bookingId: generateBookingId(),
          customer: customerId,
          vendor: car.vendor,
          listing: carId,
          pickupDate: pickup,
          dropoffDate: dropoff,
          totalAmount: grandTotal,
          paymentStatus: PAYMENT_STATUS.PENDING,
          bookingStatus: BOOKING_STATUS.PENDING,
          priceType,
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
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ success: false, ...messages.INTERNAL_SERVER_ERROR });
  }
};

exports.getBookings = async (req, res) => {
  try {
    const pipeline = [
      {
        $lookup: {
          from: "rentallistings",
          localField: "listing",
          foreignField: "_id",
          as: "listing",
          pipeline: [
            {
              $lookup: vendorLookup(),
            },
            {
              $unwind: {
                path: "$vendor",
                preserveNullAndEmptyArrays: false,
              },
            },
            {
              $lookup: featuresLookup("technicalfeatures"),
            },
            {
              $lookup: featuresLookup("otherfeatures"),
            },
            {
              $project: createCarProjection(),
            },
          ],
        },
      },
      {
        $unwind: {
          path: "$listing",
          preserveNullAndEmptyArrays: false,
        },
      },
      {
        $project: {
          vendor: 0,
          customer: 0,
        },
      },
    ];

    const bookings = await Booking.aggregate(pipeline);

    res.status(200).json({ success: true, bookings });
  } catch (err) {
    console.log("Get bookings error", err);
    return res
      .status(500)
      .json({ success: false, ...messages.INTERNAL_SERVER_ERROR });
  }
};

const calculateRent = (car, unit, priceType, deliveryRequired) => {
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
  if (deliveryRequired) grandTotal += car.deliveryCharges;

  return { grandTotal, total };
};

const calculateRentalUnits = (pickup, dropoff, priceType) => {
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
};

const generateBookingId = () => {
  const random = Math.floor(1000 + Math.random() * 9000); // 4 digits
  return `BK-${Date.now()}-${random}`;
};

// exports.createBooking = async (req, res) => {
//   const session = await mongoose.startSession();
//   session.startTransaction();
//   try {
//     const { listingId, startDate, endDate } = req.body;
//     const { id: customerId } = req.user;
//     const start = new Date(startDate);
//     const end = new Date(endDate);

//     if (end < start) {
//       return res
//         .status(400)
//         .json({ success: false, message: "endDate must be after startDate" });
//     }

//     const car = await RentalListing.findById(listingId);
//     if (!car || !car.isActive) {
//       return res
//         .status(400)
//         .json({ success: false, ...messages.CAR_NOT_FOUND });
//     }

//     const overlapping = await Booking.findOne({
//       listing: listingId,
//       status: {
//         $in: [BOOKING_STATUS.PENDING, BOOKING_STATUS.CONFIRMED],
//       },
//       startDate: { $lte: end },
//       endDate: { $gte: start },
//     }).session(session);

//     if (overlapping) {
//       return res.status(400).json({
//         success: false,
//         ...messages.CAR_ALREADY_BOOKED,
//       });
//     }

//     const expireAt = new Date();
//     expireAt.setMinutes(
//       expireAt.getMinutes() + Number(process.env.UNPAID_EXPIRY_MINUTES)
//     );

//     const amount = calculateAmount(start, end, {
//       perMonth: car.rentPerMonth,
//       perWeek: car.rentPerWeek,
//       perDay: car.rentPerDay,
//     });

//     const booking = await Booking.create(
//       [
//         {
//           customer: customerId,
//           vendor: car.vendor,
//           listing: listingId,
//           startDate: start,
//           endDate: end,
//           totalAmount: amount,
//           paymentStatus: PAYMENT_STATUS.PENDING,
//           bookingStatus: BOOKING_STATUS.PENDING,
//           expireAt,
//         },
//       ],
//       { session }
//     );

//     await session.commitTransaction();
//     session.endSession();

//     res.status(200).json({
//       success: true,
//       ...messages.BOOKING_CREATED,
//       booking: booking[0],
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ success: false, ...messages.INTERNAL_SERVER_ERROR });
//   }
// };
