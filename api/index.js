export default async function handler(req, res) {

  $subscriberId = '1464687407';
  $userToken = 'Tsn40dpLWSdLrEp5Tu6vAotKzgL717UZ';
  const response = await fetch("https://tb.tapi.videoready.tv/content-detail/api/partner/cdn/player/details/chotiluli/521", {
    method: "GET",
    headers: {
      "Authorization": "Bearer " + userToken,
      "subscriberId": subscriberId,
      "Content-Type": "application/json"
    }
  });

  const data = await response.json();

  res.status(200).json(data);
}