const messages = require("../messages/messages");
const fs = require("fs");

const path = require("path");

function checkApi(req, res, next) {
  const apisContent = fs.readFileSync(
    path.join(__dirname, "../config/allApi.json")
  );
  const jsonApis = JSON.parse(apisContent);
  let url = req.url;
  console.log("apiMiddleware:", url);
  url = url.replace("/api/", "");
  url = url.split("/")[0];
  url = url.split("?")[0];
  if (jsonApis.includes(url)) {
    console.log("API found:", url);

    next();
  } else {
    res.statusCode = 404;
    return res.send({ success: false, ...messages.API_NOT_FOUND });
  }
}

module.exports = checkApi;
