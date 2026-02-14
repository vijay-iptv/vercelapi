export default async function handler(req, res) {
  try {

    const userToken = 'Tsn40dpLWSdLrEp5Tu6vAotKzgL717UZ';
    const subscriberId = '1464687407';

    const content_api = "https://tb.tapi.videoready.tv/content-detail/api/partner/cdn/player/details/chotiluli/647";
      const response = await fetch(content_api, {
        method: "GET",
        headers: {
          "Authorization": "Bearer " + userToken,
          "subscriberId": subscriberId,
          "Content-Type": "application/json",
          "Accept": "application/json"
        }
    });

    if (!response.ok) {
      return res.status(response.status).json({ error: "External API failed" });
    }

    const data = await response.json();

    return res.status(200).json(data);

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}