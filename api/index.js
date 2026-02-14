import crypto from "crypto";

export default async function handler(req, res) {
  try {
    const userToken = "Tsn40dpLWSdLrEp5Tu6vAotKzgL717UZ";
    const subscriberId = "1464687407";

    // 🔐 Use same secret key used in PHP
    const secretKey = "aesEncryptionKey";

    const content_api =
      "https://tb.tapi.videoready.tv/content-detail/api/partner/cdn/player/details/chotiluli/647";

    // 1️⃣ Call Content API
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
      return res.status(response.status).json({ error: "External API failed" });
    }

    const responseData = await response.json();

    if (!responseData?.data?.dashWidewinePlayUrl) {
      return res.status(404).json({ error: "Encrypted URL not found." });
    }

    // 2️⃣ Decrypt URL
    const encryptedUrl = responseData.data.dashWidewinePlayUrl;

    let decryptedUrl = decryptUrl(encryptedUrl, secretKey);

    // Replace if needed
    decryptedUrl = decryptedUrl.replace("bpaicatchupta", "bpaita");

    // 3️⃣ Fetch redirect manually
    const headResponse = await fetch(decryptedUrl, {
      method: "GET",
      redirect: "manual",
      headers: {
        "User-Agent": "Mozilla/5.0",
      },
    });

    const location = headResponse.headers.get("location");

    if (!location) {
      return res.status(400).json({ error: "MPD redirect not found" });
    }

    // 4️⃣ Clean MPD URL
    const mpdurl = location.includes("&")
      ? location.substring(0, location.indexOf("&"))
      : location;

    return res.status(200).json({ mpdurl });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
}

/**
 * 🔐 AES-256-CBC Decryption (Matches Common PHP Setup)
 */
function decryptUrl(encryptedText, secretKey) {
  try {
    // Ensure base64 clean
    const encryptedBuffer = Buffer.from(encryptedText.trim(), "base64");

    // If IV is prefixed (most common case)
    const iv = encryptedBuffer.subarray(0, 16);
    const encrypted = encryptedBuffer.subarray(16);

    // Create proper 32-byte key
    const key = crypto
      .createHash("sha256")
      .update(secretKey)
      .digest();

    const decipher = crypto.createDecipheriv(
      "aes-256-cbc",
      key,
      iv
    );

    decipher.setAutoPadding(true);

    let decrypted = decipher.update(encrypted);
    decrypted = Buffer.concat([decrypted, decipher.final()]);

    return decrypted.toString("utf8");

  } catch (err) {
    console.error("Decrypt error:", err);
    throw new Error("Decryption failed");
  }
}



