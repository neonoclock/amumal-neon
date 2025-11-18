import { $, setHelper, clearFormHelpers, setDisabled } from "../core/dom.js";
import { PATCH } from "../core/http.js";
import { loadUserId, clearAuth } from "../core/storage.js";
import { UsersAPI } from "../api/users.js";

async function loadMyAvatar() {
  const avatarBtn = $("#avatarBtn");
  if (!avatarBtn) return;

  const userId = loadUserId();
  if (!userId) {
    return;
  }

  try {
    const user = await UsersAPI.getUser(userId);
    const profileImage = user?.profileImage;

    if (!profileImage) return;

    avatarBtn.style.backgroundImage = `url(${profileImage})`;
    avatarBtn.style.backgroundSize = "cover";
    avatarBtn.style.backgroundPosition = "center";
    avatarBtn.style.backgroundRepeat = "no-repeat";
    avatarBtn.style.borderRadius = "50%";
    avatarBtn.textContent = "";
  } catch (err) {
    console.error("[PASSWORD] 내 프로필(아바타) 불러오기 실패:", err);
  }
}

function setupAvatarMenu() {
  const wrap = $("#avatarWrap");
  const btn = $("#avatarBtn");
  const menu = $("#avatarMenu");
  const logoutBtn = $(".menu-logout");

  if (!wrap || !btn || !menu) return;

  function closeMenu() {
    wrap.classList.remove("open");
    btn.setAttribute("aria-expanded", "false");
  }

  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    const userId = loadUserId();

    if (!userId) {
      window.location.href = "./login.html";
      return;
    }

    const isOpen = wrap.classList.toggle("open");
    btn.setAttribute("aria-expanded", String(isOpen));
  });

  document.addEventListener("click", (e) => {
    if (!wrap.contains(e.target)) {
      closeMenu();
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeMenu();
    }
  });

  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      if (!confirm("로그아웃 하시겠습니까?")) return;
      clearAuth();
      window.location.href = "./login.html";
    });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const form = $(".form");

  const currentPwEl = $("#currentPw");
  const pwEl = $("#pw");
  const pw2El = $("#pw2");
  const submitBtn = $(".btn.primary");

  const userId = loadUserId();
  if (!userId) {
    alert("로그인이 필요합니다.");
    location.href = "./login.html";
    return;
  }

  loadMyAvatar();
  setupAvatarMenu();

  function validate() {
    clearFormHelpers(form);
    let ok = true;

    const currentPw = currentPwEl.value.trim();
    const pw = pwEl.value.trim();
    const pw2 = pw2El.value.trim();

    if (!currentPw) {
      setHelper(currentPwEl, "현재 비밀번호를 입력해주세요.", true);
      ok = false;
    }

    if (!pw) {
      setHelper(pwEl, "새 비밀번호를 입력해주세요.", true);
      ok = false;
    }

    if (!pw2) {
      setHelper(pw2El, "비밀번호 확인을 입력해주세요.", true);
      ok = false;
    }

    if (pw && pw2 && pw !== pw2) {
      setHelper(pw2El, "비밀번호가 일치하지 않습니다.", true);
      ok = false;
    }

    if (pw && pw.length < 8) {
      setHelper(pwEl, "비밀번호는 8자 이상이어야 합니다.", true);
      ok = false;
    }

    return ok;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!validate()) return;

    // ✅ 서버에서 기대하는 DTO 필드에 맞게 값 매핑
    const oldPassword = currentPwEl.value.trim(); // 현재 비밀번호
    const newPassword = pwEl.value.trim(); // 새 비밀번호
    const newPasswordCheck = pw2El.value.trim(); // 새 비밀번호 확인

    setDisabled(submitBtn, true);

    try {
      await PATCH(`/api/v1/users/${userId}/password`, {
        oldPassword,
        newPassword,
        newPasswordCheck,
      });

      alert("비밀번호가 성공적으로 변경되었습니다.");
      location.href = "./profile-edit.html";
    } catch (err) {
      console.error("비밀번호 변경 실패:", err);
      alert(err.message || "비밀번호 변경 실패");
    } finally {
      setDisabled(submitBtn, false);
    }
  });
});
