const { default: mongoose } = require("mongoose");
const { BOOKING_STATUS } = require("../../config/constants");
const messages = require("../../messages/messages");
const Booking = require("../../models/booking.model");
const vendor = require("../../messages/vendor");

exports.getAllBookings = async (req, res) => {
  try {
    const options = {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 10,
      sort: { createdAt: -1 },
    };

    const pipeline = [
      {
        $match: {
          vendor: new mongoose.Types.ObjectId(req.user.id),
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "customer",
          foreignField: "_id",
          as: "customer",
          pipeline: [
            { $project: { name: 1, email: 1, isActive: 1 } },
            {
              $lookup: {
                from: "customerdetails",
                let: { customerId: "$_id" },
                pipeline: [
                  {
                    $match: {
                      $expr: { $eq: ["$userId", "$$customerId"] },
                    },
                  },
                  {
                    $project: {
                      contact: 1,
                      emiratesId: 1,
                      licenseNum: 1,
                      origin: 1,
                      documents: 1,
                    },
                  },
                ],
                as: "customerDetails",
              },
            },
            {
              $unwind: {
                path: "$customerDetails",
                preserveNullAndEmptyArrays: true,
              },
            },
          ],
        },
      },
      { $unwind: { path: "$customer", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "rentallistings",
          localField: "listing",
          foreignField: "_id",
          as: "car",
        },
      },
      { $unwind: "$car" },
      {
        $project: createBookingCarProjections(),
      },
    ];

    const bookings = await Booking.aggregatePaginate(
      Booking.aggregate(pipeline),
      options
    );

    res.status(200).json({ success: true, data: bookings });
  } catch (err) {
    console.error("Getting Bookings Err:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

exports.updateBookingStatus = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { bookingStatus } = req.body;
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res
        .status(404)
        .json({ success: false, message: "Booking not found!" });
    }

    let bookingStat = null;
    switch (bookingStatus) {
      case 1:
        bookingStat = BOOKING_STATUS.PENDING;
        break;
      case 2:
        bookingStat = BOOKING_STATUS.CONFIRMED;
        break;
      case 3:
        bookingStat = BOOKING_STATUS.CANCELED;
        break;
      case 4:
        bookingStat = BOOKING_STATUS.EXPIRED;
        break;
    }

    booking.status = bookingStat;
    await booking.save();

    res.status(200).json({ success: true, ...vendor.BOOKING_STATUS_UPDATED });
  } catch (err) {
    console.log("Approve Booking Err", err);
    return res
      .status(500)
      .json({ success: false, ...messages.INTERNAL_SERVER_ERROR });
  }
};

const createBookingCarProjections = () => {
  return {
    customer: 1,
    car: {
      _id: "$car._id",
      carBrand: {
        _id: "$car.carBrand._id",
        name: "$car.carBrand.name",
        logo: "$car.carBrand.logo",
      },
      carModel: "$car.carModel.name",
      carTrim: "$car.carTrim.name",
      modelYear: "$car.modelYear.year",
      images: "$car.images",
      coverImage: "$car.coverImage",
      title: "$car.title",
      description: "$car.description",
      location: "$car.location",
    },
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
  };
};
