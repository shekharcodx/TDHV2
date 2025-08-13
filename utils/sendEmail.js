const { sendMail } = require("../utils/mailer");
const { renderTemplate } = require("../utils/renderTemplate");
const EmailTemplate = require("../models/emailTemplates.model");

async function sendEmailFromTemplate(templateName, to, variables) {
  const template = await EmailTemplate.findOne({
    name: templateName,
    isActive: true,
  });

  if (!template) {
    throw new Error(`Email template "${templateName}" not found`);
  }

  const html = renderTemplate(template.body, variables);

  await sendMail({
    to,
    subject: template.subject,
    html,
  });
}

module.exports = {
  sendEmailFromTemplate,
};
