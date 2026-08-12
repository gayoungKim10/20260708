export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const {
    start_x,
    start_y,
    end_x,
    end_y,
    via_x,
    via_y,
    route_mode = "SHORTEST"
  } = req.query;

  if (!start_x || !start_y || !end_x || !end_y) {
    return res.status(400).json({
      error: "start_x, start_y, end_x, end_y are required"
    });
  }

  const params = new URLSearchParams({
    start_x,
    start_y,
    end_x,
    end_y,
    input_coord: "WGS84",
    output_coord: "WGS84",
    route_mode
  });

  if (via_x && via_y) {
    params.set("via_x", via_x);
    params.set("via_y", via_y);
  }

  try {
    const response = await fetch(
      `https://dapi.kakao.com/v2/routing/walk?${params.toString()}`,
      {
        headers: {
          Authorization: `KakaoAK ${process.env.kakao_restapikey}`
        }
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({
      error: "Failed to fetch Kakao walking route"
    });
  }
}
