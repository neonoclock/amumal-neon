// public/assets/js/core/storage.js

// 로컬스토리지에 저장할 key 이름
const AUTH_KEY = "amumal_auth";

/**
 * 로그인/회원가입 후 사용자 정보를 저장
 * authObject 예시:
 *   { id: 3, nickname: "혜원", profileImage: null }
 *
 * 회원가입 직후에는 { id: 3 } 만 저장됨
 */
export function saveAuth(authObject) {
  if (!authObject || typeof authObject !== "object") {
    console.error("saveAuth: invalid authObject", authObject);
    return;
  }
  localStorage.setItem(AUTH_KEY, JSON.stringify(authObject));
}

/**
 * 저장된 사용자 정보를 불러오기
 * 없으면 null 반환
 */
export function loadAuth() {
  const raw = localStorage.getItem(AUTH_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch (e) {
    console.error("loadAuth: JSON parse error", e);
    return null;
  }
}

/**
 * 저장된 사용자 정보를 삭제 (로그아웃 시 사용)
 */
export function clearAuth() {
  localStorage.removeItem(AUTH_KEY);
}

/**
 * 현재 로그인 유저의 ID만 편하게 가져오는 유틸
 * 예: loadUserId() → 3
 */
export function loadUserId() {
  const auth = loadAuth();
  return auth?.id ?? null;
}
