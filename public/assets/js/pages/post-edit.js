import {
  $,
  on,
  setHelper,
  clearFormHelpers,
  setDisabled,
} from "../core/dom.js";
import { loadUserId, clearAuth } from "../core/storage.js";
import { PostsAPI } from "../api/posts.js";
import { AuthAPI } from "../api/auth.js";

let currentImageDataUrl = null;

function getPostIdFromQuery() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("postId");
  return id ? Number(id) : null;
}

function ensureLogin() {
  const userId = loadUserId();
  if (!userId) {
    alert("로그인 후 이용해주세요.");
    window.location.href = "./login.html";
    return null;
  }
  return userId;
}

function validateForm(titleEl, contentEl, formEl) {
  clearFormHelpers(formEl);

  const title = titleEl.value.trim();
  const content = contentEl.value.trim();

  let valid = true;

  if (!title) {
    setHelper(titleEl, "제목을 입력해주세요.", true);
    valid = false;
  }

  if (!content) {
    setHelper(contentEl, "내용을 입력해주세요.", true);
    valid = false;
  }

  return valid;
}

async function loadMyAvatar() {
  const avatarBtn = $("#avatarBtn");
  if (!avatarBtn) return;

  const userId = loadUserId();
  if (!userId) return;

  try {
    const res = await AuthAPI.getUser(userId);
    const user = res?.data ?? res;
    const profileImage = user?.profileImage;

    if (!profileImage) return;

    avatarBtn.style.backgroundImage = `url(${profileImage})`;
    avatarBtn.style.backgroundSize = "cover";
    avatarBtn.style.backgroundPosition = "center";
    avatarBtn.style.backgroundRepeat = "no-repeat";
    avatarBtn.style.borderRadius = "50%";
    avatarBtn.textContent = "";
  } catch (err) {
    console.error("[POST-EDIT] 내 프로필(아바타) 불러오기 실패:", err);
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
    if (!wrap.contains(e.target)) closeMenu();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeMenu();
  });

  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      if (!confirm("로그아웃 하시겠습니까?")) return;
      clearAuth();
      window.location.href = "./login.html";
    });
  }
}

function setupFileInput(fileInput, fileNameEl) {
  if (!fileInput) return;

  on(fileInput, "change", () => {
    const file = fileInput.files?.[0];
    console.log("[EVT] post image 선택됨", file);

    if (!file) {
      fileNameEl.textContent = "선택된 파일 없음";
      currentImageDataUrl = null;
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result;
      if (typeof result === "string") {
        currentImageDataUrl = result;
        fileNameEl.textContent = file.name || "선택된 이미지";
        console.log(
          "[EVT] post image base64 length:",
          currentImageDataUrl.length
        );
      }
    };
    reader.readAsDataURL(file);
  });
}

async function loadPostDetail(postId, userId) {
  const titleEl = $("#title");
  const contentEl = $("#content");
  const fileNameEl = document.querySelector(".upload .file-name");
  const submitBtn = $(".btn.primary");

  try {
    setDisabled(submitBtn, true);

    console.log("[REQ] 게시글 상세 조회:", postId);
    const detail = await PostsAPI.getDetail(postId, { viewerId: userId });
    console.log("[RES] 게시글 상세:", detail);

    titleEl.value = detail.title ?? "";
    contentEl.value = detail.content ?? "";

    currentImageDataUrl = detail.imageUrl ?? detail.image_url ?? null;

    if (currentImageDataUrl) {
      fileNameEl.textContent = "기존 이미지가 등록되어 있습니다.";
    } else {
      fileNameEl.textContent = "선택된 파일 없음";
    }
  } catch (err) {
    console.error("게시글 상세 불러오기 실패:", err);
    alert(err.message || "게시글 정보를 불러오지 못했습니다.");
    window.location.href = "./board.html";
  } finally {
    setDisabled(submitBtn, false);
  }
}

async function handleSubmit(e) {
  e.preventDefault();

  const formEl = $(".edit-form");
  const titleEl = $("#title");
  const contentEl = $("#content");
  const submitBtn = $(".btn.primary");

  const postId = getPostIdFromQuery();
  if (!postId) {
    alert("잘못된 접근입니다. 게시글 번호가 없습니다.");
    window.location.href = "./board.html";
    return;
  }

  const userId = ensureLogin();
  if (!userId) return;

  if (!validateForm(titleEl, contentEl, formEl)) {
    return;
  }

  const title = titleEl.value.trim();
  const content = contentEl.value.trim();
  const imageUrl = currentImageDataUrl;

  try {
    setDisabled(submitBtn, true);

    console.log("[REQ] 게시글 수정 요청:", {
      postId,
      userId,
      title,
      content,
      imageUrlLength: imageUrl ? imageUrl.length : 0,
    });

    const updated = await PostsAPI.update(postId, {
      userId,
      title,
      content,
      imageUrl,
    });

    console.log("[RES] 게시글 수정 완료:", updated);
    alert("게시글이 수정되었습니다.");

    window.location.href = `./post-detail.html?postId=${postId}`;
  } catch (err) {
    console.error("게시글 수정 실패:", err);
    alert(err.message || "게시글 수정에 실패했습니다.");
  } finally {
    setDisabled(submitBtn, false);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  console.log("[PAGE] post-edit loaded");

  const postId = getPostIdFromQuery();
  if (!postId) {
    alert("잘못된 접근입니다. 게시글 번호가 없습니다.");
    window.location.href = "./board.html";
    return;
  }

  const userId = ensureLogin();
  if (!userId) return;

  loadMyAvatar();
  setupAvatarMenu();

  const fileInput = document.querySelector(".upload input[type=file]");
  const fileNameEl = document.querySelector(".upload .file-name");
  setupFileInput(fileInput, fileNameEl);

  loadPostDetail(postId, userId);

  const formEl = $(".edit-form");
  on(formEl, "submit", handleSubmit);
});
