const Handlebars = require("handlebars");

function renderTemplate(templateString, data) {
  const template = Handlebars.compile(templateString);
  return template(data);
}

module.exports = { renderTemplate };
