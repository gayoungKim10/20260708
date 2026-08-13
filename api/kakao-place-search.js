const KAKAO_KEYWORD_URL = "https://dapi.kakao.com/v2/local/search/keyword.json";

module.exports = async function handler(request, response) {
  if (request.method !== "GET") {
    response.setHeader("Allow", "GET");
    return response.status(405).json({ message: "GET 요청만 지원합니다." });
  }

  const restApiKey = process.env.kakao_restapikey || process.env.KAKAO_REST_API_KEY;
  if (!restApiKey) {
    return response.status(500).json({ message: "서버에 kakao_restapikey가 설정되지 않았습니다." });
  }

  const keyword = String(request.query?.query || "").trim();
  if (keyword.length < 2 || keyword.length > 100) {
    return response.status(400).json({ message: "검색어를 2자 이상 입력해 주세요." });
  }

  // x, y, radius, rect를 보내지 않아 전국을 대상으로 카카오 정확도 순서를 그대로 쓴다.
  const query = new URLSearchParams({ query: keyword, page: "1", size: "15", sort: "accuracy" });

  try {
    const kakaoResponse = await fetch(`${KAKAO_KEYWORD_URL}?${query}`, {
      headers: { Authorization: `KakaoAK ${restApiKey}` }
    });
    const payload = await kakaoResponse.json().catch(() => ({}));
    if (!kakaoResponse.ok) {
      return response.status(kakaoResponse.status).json({
        message: payload.msg || payload.message || "카카오 전국 장소검색에 실패했습니다.",
        code: payload.code
      });
    }
    response.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=300");
    return response.status(200).json(payload);
  } catch (error) {
    console.error("Kakao keyword API request failed", error);
    return response.status(502).json({ message: "카카오 장소검색 서버에 연결하지 못했습니다." });
  }
};
