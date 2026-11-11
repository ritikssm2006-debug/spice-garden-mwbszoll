const express = require("express");
const crypto = require("crypto");
const { requireAuth, requireAdmin, optionalAuth } = require("../middleware/auth");

/**
 * POST /api/upload { image: "data:image/jpeg;base64,..." } -> { url }
 * With CLOUDINARY_URL set (cloudinary://KEY:SECRET@CLOUD), images go to
 * Cloudinary and a normal https link is returned. Without it, the (already
 * resized) image is stored inside the database record itself.
 */
const router = express.Router();
const IMAGE = /^data:image\/(png|jpe?g|webp|gif);base64,[A-Za-z0-9+/=]+$/;

async function toCloudinary(dataUrl) {
  const m = String(process.env.CLOUDINARY_URL).match(/^cloudinary:\/\/([^:]+):([^@]+)@(.+)$/);
  if (!m) throw new Error("CLOUDINARY_URL should look like cloudinary://API_KEY:API_SECRET@CLOUD_NAME");
  const [, apiKey, secret, cloud] = m;
  const timestamp = Math.floor(Date.now() / 1000);
  const folder = "spice-garden";
  const signature = crypto.createHash("sha1").update(`folder=${folder}&timestamp=${timestamp}${secret}`).digest("hex");
  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloud}/image/upload`, {
    method: "POST",
    body: new URLSearchParams({ file: dataUrl, api_key: apiKey, timestamp: String(timestamp), folder, signature }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || "Cloudinary upload failed");
  return data.secure_url;
}

router.post("/", requireAdmin, async (req, res, next) => {
  try {
    const image = String(req.body.image || "");
    if (!IMAGE.test(image)) return res.status(400).json({ message: "Please choose a PNG, JPG, WEBP or GIF image" });
    if (image.length > 2500000) return res.status(400).json({ message: "That image is too large (max about 1.8 MB)" });
    if (!process.env.CLOUDINARY_URL) return res.json({ url: image, stored: "database" });
    res.json({ url: await toCloudinary(image), stored: "cloudinary" });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
