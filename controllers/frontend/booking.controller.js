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
const frontend = require("../../messages/frontend");
const User = require("../../models/user.model");
const VendorDetails = require("../../models/vendor.model");
const { sendEmailFromTemplate } = require("../../utils/sendEmail");

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
      "carBrand location rentPerDay rentPerWeek rentPerMonth depositRequired securityDeposit deliveryCharges isActive"
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

    const { grandTotal, total, baseRate } = calculateRent(
      car,
      unit,
      priceType,
      deliveryRequired
    );

    res.status(200).json({
      success: true,
      data: {
        baseRate,
        total,
        units: unit,
        priceType,
        depositRequired: car.depositRequired,
        securityDeposit: car.securityDeposit,
        deliveryCharges: car.deliveryCharges,
        grandTotal,
        aboveGraceHour: aboveGrace,
        deliveryRequired,
        car,
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
      address,
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

    const car = await RentalListing.findById(carId)
      .select(
        "carBrand location title vendor rentPerDay rentPerWeek rentPerMonth depositRequired securityDeposit deliveryCharges isActive"
      )
      .session(session);
    if (!car || !car.isActive) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(400)
        .json({ success: false, ...messages.CAR_NOT_FOUND });
    }

    const { unit } = calculateRentalUnits(pickup, dropoff, priceType);

    const { grandTotal, securityDeposit, totalWithoutSecurity } = calculateRent(
      car,
      unit,
      priceType,
      deliveryRequired
    );

    const booking = await Booking.create(
      [
        {
          bookingId: generateBookingId(),
          dropoffAddress: address,
          customer: customerId,
          vendor: car.vendor,
          listing: carId,
          pickupDate: pickup,
          dropoffDate: dropoff,
          totalWithoutSecurity,
          securityDeposit,
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

    const user = await User.findById(req.user.id);
    const vendor = await User.findById(car.vendor);
    let vendorDetails = null;
    if (vendor) {
      vendorDetails = await VendorDetails.findOne({ user: vendor._id });
    }

    if (user) {
      try {
        await sendEmailFromTemplate(
          "booking_created_payment_pending",
          user.email,
          {
            name: user.name,
            carName: car.title,
            pickupDate,
            dropoffDate,
            pickupLocation: car.location,
            dropoffLocation: address,
            priceType,
            totalAmount: grandTotal,
          }
        );
        //send email to vendor
        await sendEmailFromTemplate(
          "vendor_booking_confirmation_request",
          vendor.email,
          {
            vendorName: vendorDetails?.businessName,
            customerName: user.name,
            carName: car.title,
            pickupDate,
            dropoffDate,
            pickupLocation: car.location,
            dropoffLocation: address,
            priceType,
            totalAmount: grandTotal,
            dashboardLink: "#",
          }
        );
      } catch (err) {
        console.log("Sending email error", err);
      }
    }

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
    const options = {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 10,
      sort: { createdAt: -1 },
    };
    const pipeline = [
      {
        $match: {
          customer: new mongoose.Types.ObjectId(req.user.id),
        },
      },
      {
        $lookup: {
          from: "rentallistings",
          localField: "listing",
          foreignField: "_id",
          as: "car",
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
              $project: createBookingCarProjections(),
            },
          ],
        },
      },
      {
        $unwind: {
          path: "$car",
          preserveNullAndEmptyArrays: false,
        },
      },
      {
        $project: {
          bookingId: 1,
          pickupDate: 1,
          dropoffDate: 1,
          deliveryRequired: 1,
          priceType: 1,
          totalAmount: 1,
          dropoffAddress: 1,
          payment: 1,
          status: 1,
          isActive: 1,
          createdAt: 1,
          car: 1,
        },
      },
    ];

    const bookings = await Booking.aggregatePaginate(
      Booking.aggregate(pipeline),
      options
    );

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
  let baseRate = 0;
  switch (priceType) {
    case "daily":
      total = car.rentPerDay * unit;
      baseRate = car.rentPerDay;
      break;
    case "weekly":
      total = car.rentPerWeek * unit;
      baseRate = car.rentPerWeek;
      break;
    case "monthly":
      total = car.rentPerMonth * unit;
      baseRate = car.rentPerMonth;
      break;
  }

  let grandTotal = total;
  let totalWithoutSecurity = total;
  if (car.depositRequired) grandTotal += car.securityDeposit;
  if (deliveryRequired) {
    grandTotal += car.deliveryCharges;
    totalWithoutSecurity += car.deliveryCharges;
  }

  return {
    grandTotal,
    total,
    baseRate,
    totalWithoutSecurity,
    securityDeposit: car.securityDeposit,
  };
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

const createBookingCarProjections = () => {
  return {
    carBrand: {
      _id: "$carBrand._id",
      name: "$carBrand.name",
      logo: "$carBrand.logo",
    },
    carModel: "$carModel.name",
    carTrim: "$carTrim.name",
    modelYear: "$modelYear.year",
    images: "$images",
    coverImage: "$coverImage",
    title: "$title",
    description: "$description",
    location: "$location",
  };
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
