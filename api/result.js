import crypto from "crypto";

export default async function handler(req, res) {
  try {
    const id = req.query.id;
    const userToken = "Tsn40dpLWSdLrEp5Tu6vAotKzgL717UZ";
    const subscriberId = "1464687407";

    // 🔐 Use same secret key used in PHP
    const secretKey = "aesEncryptionKey";
    const ua = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36";


    const content_api = `https://tb.tapi.videoready.tv/content-detail/api/partner/cdn/player/details/chotiluli/${id}`;

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

    let mpdurl = decryptUrl(encryptedUrl, secretKey);

    const mpdResponse = await fetch(mpdurl, {
      headers: {
        "User-Agent": ua,
        Referer: "https://watch.tataplay.com/",
        Origin: "https://watch.tataplay.com",
      },
    });

    if (!mpdResponse.ok) {
      return res.status(500).send("Failed to fetch MPD content.");
    }

    let mpdContent = await mpdResponse.text();

    return res.status(200).json(mpdContent);

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
}

/**
 * 🔐 AES-256-CBC Decryption (Matches Common PHP Setup)
 */
function decryptUrl(encryptedUrl, aesKey) {
  try {
    // Remove everything after #
    const cleanEncrypted = encryptedUrl.replace(/#.*$/, "");

    // Base64 decode
    const decoded = Buffer.from(cleanEncrypted, "base64");

    // AES-128-ECB requires 16 byte key
    const key = Buffer.from(aesKey, "utf8");

    if (key.length !== 16) {
      throw new Error("AES-128-ECB requires 16 byte key");
    }

    const decipher = crypto.createDecipheriv(
      "aes-128-ecb",
      key,
      null // ECB does NOT use IV
    );

    decipher.setAutoPadding(true);

    let decrypted = decipher.update(decoded);
    decrypted = Buffer.concat([decrypted, decipher.final()]);

    return decrypted.toString("utf8");

  } catch (error) {
    console.error("Decryption failed:", error);
    throw error;
  }
}



