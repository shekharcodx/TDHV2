const EmailTemplate = require("../../models/emailTemplates.model");
const messages = require("../../messages/messages");
const adminMessages = require("../../messages/admin");

exports.getEmailTempates = async (req, res) => {
  try {
    const emailTemplates = await EmailTemplate.find()
      .sort({ createdAt: -1 })
      .select("name subject body description isActive");
    res.status(200).json({ success: true, data: emailTemplates });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, ...messages.INTERNAL_SERVER_ERROR });
  }
};

exports.editEmailTemplate = async (req, res) => {
  const { name, subject, body, description, isActive } = req.body;
  const { templateId } = req.params;
  try {
    const emailTemplate = await EmailTemplate.findByIdAndUpdate(
      templateId,
      {
        name,
        subject,
        body,
        description,
        isActive,
      },
      { new: true }
    );
    res.status(200).json({
      success: true,
      ...adminMessages.EMAIL_TEMPLATE_UPDATED,
      data: emailTemplate,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, ...messages.INTERNAL_SERVER_ERROR });
  }
};
