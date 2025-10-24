const { stripe } = require("../../config/stripe.js");
const Vendor = require("../../models/user.model.js");
const VendorDetails = require("../../models/vendor.model.js");
const { sendEmailFromTemplate } = require("../../utils/sendEmail");
const messages = require("../../messages/messages.js");

exports.createOnboardingLink = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id);
    if (!vendor) {
      return res
        .status(404)
        .json({ success: false, ...messages.AUTH_USER_NOT_FOUND });
    }

    const vendorDetails = await VendorDetails.findOne({ userId: vendor._id });
    if (!vendorDetails) {
      return res
        .status(404)
        .json({ success: false, ...messages.AUTH_USER_NOT_FOUND });
    }

    if (!vendorDetails.stripeAccountId) {
      const account = await stripe.accounts.create({
        type: "standard",
        email: vendor.email,
      });
      vendorDetails.stripeAccountId = account.id;
      await vendorDetails.save();
    }

    const accountLink = await stripe.accountLinks.create({
      account: vendorDetails.stripeAccountId,
      refresh_url: `${process.env.FRONTEND_URL}/onboarding/refresh`,
      return_url: `${process.env.FRONTEND_URL}/onboarding/success`,
      type: "account_onboarding",
    });

    const [, , , , , accountId, code] = accountLink.url.split("/");
    const redirectLink = `${process.env.APP_LINK}/redirect/stripe-onboard/${accountId}/${code}`;

    await sendEmailFromTemplate("vendor_onboarding", vendor.email, {
      name: vendor.name,
      onboardingLink: redirectLink,
    });

    res.status(200).json({
      success: true,
      message: "Onboarding link sent to vendor",
      url: redirectLink,
    });
  } catch (err) {
    console.error("Stripe error:", {
      message: err.message,
      type: err.type,
      code: err.code,
      param: err.param,
      raw: err.raw,
    });
    return res
      .status(500)
      .json({ success: false, ...messages.INTERNAL_SERVER_ERROR });
  }
};

exports.redirectToOnboarding = async (req, res) => {
  try {
    const { accountId, code } = req.params;
    const stripeUrl = `https://connect.stripe.com/setup/s/${accountId}/${code}`;
    res.redirect(stripeUrl);
  } catch (err) {
    console.log("Rediredting Error", err);
    return res
      .status(500)
      .json({ success: false, ...messages.INTERNAL_SERVER_ERROR });
  }
};
