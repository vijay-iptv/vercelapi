import crypto from "crypto";
export default async function handler(req, res) {
  try {
    const userToken = "Tsn40dpLWSdLrEp5Tu6vAotKzgL717UZ";
    const subscriberId = "1464687407";
    const aesKey = "YOUR_AES_KEY_HERE"; // same key used in PHP

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

    // 2️⃣ Validate dashPlayreadyPlayUrl
    if (!responseData?.data?.dashPlayreadyPlayUrl) {
      return res.status(404).json({ error: "dashPlayreadyPlayUrl not found." });
    }

    // 3️⃣ Decrypt dashWidewinePlayUrl
    const encryptedUrl = responseData.data.dashWidewinePlayUrl;
    let decryptedUrl = decryptUrl(encryptedUrl, aesKey);

    decryptedUrl = decryptedUrl.replace("bpaicatchupta", "bpaita");


    // 5️⃣ Fetch headers WITHOUT following redirect
    const headResponse = await fetch(decryptedUrl, {
      method: "GET",
      redirect: "manual",
      headers: {
        "User-Agent": "Mozilla/5.0",
      },
    });

    const location = headResponse.headers.get("location");

    // 6️⃣ Clean MPD URL
    const mpdurl = location.includes("&")
      ? location.substring(0, location.indexOf("&"))
      : location;

    return res.status(200).json({ mpdurl });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

function decryptUrl(encryptedText, key) {
  const decipher = crypto.createDecipheriv(
    "aes-128-cbc", // change if different in PHP
    Buffer.from(key, "utf8"),
    Buffer.alloc(16, 0) // adjust IV if needed
  );

  let decrypted = decipher.update(encryptedText, "base64", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
}
