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

    console.log(responseData)
    if (!responseData?.data?.dashWidewinePlayUrl) {
      return res.status(404).json({ error: "Encrypted URL not found." });
    }

    // 2️⃣ Decrypt URL
    const encryptedUrl = responseData.data.dashWidewinePlayUrl;
     console.log(encryptedUrl)
    let decryptedUrl = decryptUrl(encryptedUrl, secretKey);
    console.log(decryptedUrl)

    // Replace if needed
    decryptedUrl = decryptedUrl.replace("bpaicatchupta", "bpaita");
       /*  console.log(decryptedUrl)
    // 3️⃣ Fetch redirect manually
    const headResponse = await fetch(decryptedUrl, {
      method: "GET",
      redirect: "manual",
      headers: {
        "User-Agent": "Mozilla/5.0",
      },
    });
    console.log(headResponse)

    const location = headResponse.headers.get("location");

    if (!location) {
      return res.status(400).json({ error: "MPD redirect not found" });
    } */

    // 4️⃣ Clean MPD URL
    const mpdurl = decryptedUrl;

    return res.status(200).json({ mpdurl });

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



