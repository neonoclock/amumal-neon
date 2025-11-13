// public/assets/js/core/http.js

// 같은 서버(도메인)에서 API를 호출하니까 굳이 base URL은 비워둔다.
// 만약 BE가 다른 포트/도메인이라면 "http://localhost:8080" 이런 식으로 채우면 됨.
const BASE_URL = "";

/**
 * 내부 공통 request 함수
 * - fetch 호출
 * - JSON 파싱
 * - ApiResponse<T> 형태 해석
 * - 에러 공통 처리
 */
async function request(path, options = {}) {
  const res = await fetch(BASE_URL + path, {
    // 기본 헤더
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  let raw;
  try {
    raw = await res.json();
  } catch (e) {
    // 응답 바디가 비어있거나 JSON이 아닌 경우도 있을 수 있음
    raw = null;
  }

  // ✅ HTTP 상태코드 먼저 체크
  if (!res.ok) {
    // GlobalExceptionHandler + ApiResponse.fail(...)을 쓴다고 가정
    const msg =
      raw?.message ||
      raw?.error ||
      raw?.errors?.[0]?.defaultMessage || // Bean Validation 에러 등
      "요청에 실패했습니다.";

    throw new Error(msg);
  }

  // ✅ 정상 응답인데, ApiResponse<T> 래퍼를 사용하는 경우
  // 보통 구조: { success: true, data: ..., message: ... }
  if (raw && typeof raw === "object") {
    // success 필드가 명시적으로 false면 예외로 처리
    if ("success" in raw && raw.success === false) {
      const msg =
        raw.message ||
        raw.error ||
        raw.errors?.[0]?.defaultMessage ||
        "요청에 실패했습니다.";
      throw new Error(msg);
    }

    // data 필드가 있으면 그걸 바로 반환
    if ("data" in raw) {
      return raw.data;
    }
  }

  // ApiResponse 래퍼가 아니거나 data가 없는 단순 응답이면 raw 그대로 반환
  return raw;
}

/**
 * GET 요청
 * 사용 예: GET("/api/v1/posts?page=0&limit=10")
 */
export function GET(path) {
  return request(path, { method: "GET" });
}

/**
 * POST 요청
 * body는 JS 객체로 넘기면 내부에서 JSON.stringify 해줌
 */
export function POST(path, body) {
  return request(path, {
    method: "POST",
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
}

/**
 * PATCH 요청
 */
export function PATCH(path, body) {
  return request(path, {
    method: "PATCH",
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
}

/**
 * DELETE 요청
 */
export function DELETE(path) {
  return request(path, { method: "DELETE" });
}

/**
 * 쿼리 스트링 유틸 (선택적으로 사용 가능)
 * 사용 예:
 *  const qs = toQueryString({ page: 0, limit: 10, sort: "DATE" });
 *  GET(`/api/v1/posts?${qs}`);
 */
export function toQueryString(params = {}) {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    searchParams.append(key, String(value));
  });

  return searchParams.toString();
}
