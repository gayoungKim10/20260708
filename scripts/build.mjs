import { cp, mkdir, readFile, writeFile } from "node:fs/promises";

const javascriptKey = process.env.KAKAO_JAVASCRIPT_KEY?.trim();
if (!javascriptKey || javascriptKey === "[SENSITIVE]") {
  throw new Error("KAKAO_JAVASCRIPT_KEY 환경 변수에 실제 카카오 JavaScript 키를 설정해 주세요.");
}

const source = await readFile("index.html", "utf8");
if (!source.includes("__KAKAO_JAVASCRIPT_KEY__")) {
  throw new Error("index.html에서 카카오 JavaScript 키 자리표시자를 찾지 못했습니다.");
}

await mkdir("dist", { recursive: true });
await writeFile(
  "dist/index.html",
  source.replaceAll("__KAKAO_JAVASCRIPT_KEY__", encodeURIComponent(javascriptKey)),
  "utf8"
);

for (const asset of ["favicon.ico", "robots.txt"]) {
  await cp(asset, `dist/${asset}`).catch((error) => {
    if (error.code !== "ENOENT") throw error;
  });
}
