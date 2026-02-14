import crypto from "crypto";

export default async function handler(req, res) {
  try {
    const userToken = process.env.USER_TOKEN || "Tsn40dpLWSdLrEp5Tu6vAotKzgL717UZ";
    const subscriberId = process.env.SUBSCRIBER_ID || "1464687407";
    const aesKey = process.env.AES_KEY || "1234567890123456"; // 16 byte key required

    const content_api =
      "https://tb.tapi.videoready.tv/content-detail/api/partner/cdn/player/details/chotiluli/647";

    // 🔹 1. Fetch Content API
    const response = await fetch(content_api, {
      method: "GET",
      headers: {
        Authorization: "Bearer " + userToken,
        subscriberId: subscriberId,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      return res.status(response.status).json({
        error: "External API failed",
      });
    }

    const responseData = await response.json();

    if (!responseData?.data?.dashWidewinePlayUrl) {
      return res.status(404).json({
        error: "dashWidewinePlayUrl not found",
      });
    }

    // 🔹 2. Decrypt URL
    const encryptedUrl = responseData.data.dashWidewinePlayUrl;

    const decryptedUrl = decryptUrl(encryptedUrl, aesKey);

    if (!decryptedUrl) {
      return res.status(500).json({ error: "Decryption failed" });
    }

    const finalUrl = decryptedUrl.replace("bpaicatchupta", "bpaita");

    // 🔹 3. Get Redirect Location (manual)
    const headResponse = await fetch(finalUrl, {
      method: "GET",
      redirect: "manual",
      headers: {
        "User-Agent": "Mozilla/5.0",
      },
    });

    const location = headResponse.headers.get("location");

    const mpdurl = location
      ? location.split("&")[0]
      : finalUrl;

    return res.status(200).json({ mpdurl });

  } catch (error) {
    return res.status(500).json({
      error: error.message,
    });
  }
}

// 🔐 AES-128-CBC Decrypt Function
function decryptUrl(encryptedText, key) {
  try {
    const keyBuffer = Buffer.from(key, "utf8");

    if (keyBuffer.length !== 16) {
      throw new Error("AES-128 key must be 16 bytes");
    }

    const iv = Buffer.alloc(16, 0); // change if your PHP uses custom IV

    const encryptedBuffer = Buffer.from(encryptedText, "base64");

    const decipher = crypto.createDecipheriv(
      "aes-128-cbc",
      keyBuffer,
      iv
    );

    decipher.setAutoPadding(true);

    let decrypted = decipher.update(encryptedBuffer);
    decrypted = Buffer.concat([decrypted, decipher.final()]);

    return decrypted.toString("utf8");

  } catch (err) {
    console.error("Decrypt error:", err.message);
    return null;
  }
}
