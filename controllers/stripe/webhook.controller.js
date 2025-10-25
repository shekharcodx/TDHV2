const { stripe } = require("../../config/stripe.js");
const User = require("../../models/user.model.js");
const VendorDetail = require("../../models/vendor.model.js");

exports.stripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error("Webhook signature verification failed.", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case "account.updated": {
        const account = event.data.object;

        // find user with this Stripe account ID
        const vendorDetails = await VendorDetail.findOne({
          stripeAccountId: account.id,
        });
        if (!vendorDetails) break;

        const vendor = await User.findById(vendorDetails.userId);

        // update fields
        await vendorDetails.updateOne(
          { stripeAccountId: account.id },
          {
            stripeDetailsSubmitted: account.details_submitted,
            payoutsEnabled: account.payouts_enabled,
            chargesEnabled: account.charges_enabled,
            stripeOnboardingCompleted:
              account.details_submitted &&
              account.charges_enabled &&
              account.payouts_enabled,
          }
        );

        console.log("User Stripe info updated:", vendor.email);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.status(200).json({ success: true, received: true });
  } catch (error) {
    console.error("Webhook processing error:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};
