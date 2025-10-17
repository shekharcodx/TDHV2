const sharp = require("sharp");

async function optimizeImage(
  file,
  options = {
    width: 1280,
    height: 960,
    quality: 100,
    format: "webp",
    fit: "cover", // crop to maintain aspect ratio
    position: "center", // crop from the center (default)
  }
) {
  return await sharp(file.buffer)
    .resize(options.width, options.height, {
      fit: options.fit,
      position: options.position,
    })
    .toFormat(options.format, { quality: options.quality })
    .toBuffer();
}

module.exports = { optimizeImage };
