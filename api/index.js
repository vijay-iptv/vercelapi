export default async function handler(req, res) {

    const userToken = '1464687407';
    const subscriberId = 'Tsn40dpLWSdLrEp5Tu6vAotKzgL717UZ';

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

    const data = await response.json();

    res.status(200).json(data);
}
