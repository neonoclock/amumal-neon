import { $ } from "../core/dom.js";
import { loadUserId, clearAuth } from "../core/storage.js";
import { UsersAPI } from "../api/users.js";

export async function loadMyAvatar(logPrefix = "") {
  const avatarBtn = $("#avatarBtn");
  if (!avatarBtn) return;

  const userId = loadUserId();
  if (!userId) return;

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
    const prefix = logPrefix ? ` ${logPrefix}` : "";
    console.error(`[AVATAR${prefix}] 내 프로필(아바타) 불러오기 실패:`, err);
  }
}

export function setupAvatarMenu() {
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
