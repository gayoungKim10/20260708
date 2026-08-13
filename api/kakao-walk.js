const KAKAO_WALK_URL = "https://dapi.kakao.com/v2/routing/walk";

function isCoordinate(point) {
  return point
    && Number.isFinite(point.lat)
    && Number.isFinite(point.lng)
    && point.lat >= -90
    && point.lat <= 90
    && point.lng >= -180
    && point.lng <= 180;
}

module.exports = async function handler(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return response.status(405).json({ message: "POST 요청만 지원합니다." });
  }

  const restApiKey = process.env.kakao_restapikey || process.env.KAKAO_REST_API_KEY;
  if (!restApiKey) {
    return response.status(500).json({ message: "서버에 kakao_restapikey가 설정되지 않았습니다." });
  }

  const points = request.body?.points;
  const routeMode = request.body?.routeMode || "BROAD_FIRST";
  if (!Array.isArray(points) || points.length < 2 || points.length > 7 || !points.every(isCoordinate)) {
    return response.status(400).json({ message: "출발지, 최대 5개 경유지, 도착지 좌표를 확인해 주세요." });
  }
  if (!new Set(["BROAD_FIRST", "SHORTEST", "ACCESSIBLE"]).has(routeMode)) {
    return response.status(400).json({ message: "지원하지 않는 카카오 도보 탐색 옵션입니다." });
  }

  const start = points[0];
  const end = points[points.length - 1];
  const vias = points.slice(1, -1);
  const query = new URLSearchParams({
    start_x: String(start.lng),
    start_y: String(start.lat),
    end_x: String(end.lng),
    end_y: String(end.lat),
    input_coord: "WGS84",
    output_coord: "WGS84",
    route_mode: routeMode
  });
  if (vias.length) {
    query.set("via_x", vias.map((point) => point.lng).join(","));
    query.set("via_y", vias.map((point) => point.lat).join(","));
  }

  try {
    const kakaoResponse = await fetch(`${KAKAO_WALK_URL}?${query}`, {
      headers: { Authorization: `KakaoAK ${restApiKey}` }
    });
    const payload = await kakaoResponse.json().catch(() => ({}));
    if (!kakaoResponse.ok) {
      return response.status(kakaoResponse.status).json({
        message: payload.msg || payload.message || "카카오 도보 경로 요청에 실패했습니다.",
        code: payload.code
      });
    }
    return response.status(200).json(payload);
  } catch (error) {
    console.error("Kakao walk API request failed", error);
    return response.status(502).json({ message: "카카오 도보 경로 서버에 연결하지 못했습니다." });
  }
};
