import {
  $,
  on,
  setHelper,
  clearFormHelpers,
  setDisabled,
} from "../core/dom.js";
import { loadUserId } from "../core/storage.js";
import { PostsAPI } from "../api/posts.js";
import { loadMyAvatar, setupAvatarMenu } from "../common/ui.js";

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

function setupFileInput(fileInput, fileNameEl) {
  if (!fileInput) return;

  on(fileInput, "change", () => {
    const file = fileInput.files?.[0];
    console.log("[EVT] post image 선택됨", file);

    if (!file) {
      currentImageDataUrl = null;
      if (fileNameEl) {
        fileNameEl.textContent = "선택된 파일 없음";
      }
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result;
      if (typeof result === "string") {
        currentImageDataUrl = result;
        if (fileNameEl) {
          fileNameEl.textContent = file.name || "선택된 이미지";
        }
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

  if (!titleEl || !contentEl) {
    console.warn("[POST-EDIT] title 또는 content 요소를 찾지 못했습니다.");
    return;
  }

  try {
    if (submitBtn) setDisabled(submitBtn, true);

    console.log("[REQ] 게시글 상세 조회:", postId);
    const detail = await PostsAPI.getDetail(postId, { viewerId: userId });
    console.log("[RES] 게시글 상세:", detail);

    titleEl.value = detail.title ?? "";
    contentEl.value = detail.content ?? "";

    currentImageDataUrl = detail.imageUrl ?? detail.image_url ?? null;

    if (fileNameEl) {
      if (currentImageDataUrl) {
        fileNameEl.textContent = "기존 이미지가 등록되어 있습니다.";
      } else {
        fileNameEl.textContent = "선택된 파일 없음";
      }
    }
  } catch (err) {
    console.error("게시글 상세 불러오기 실패:", err);
    alert(err.message || "게시글 정보를 불러오지 못했습니다.");
    window.location.href = "./board.html";
  } finally {
    if (submitBtn) setDisabled(submitBtn, false);
  }
}

async function handleSubmit(e) {
  e.preventDefault();

  const formEl = $(".edit-form");
  const titleEl = $("#title");
  const contentEl = $("#content");
  const submitBtn = $(".btn.primary");

  if (!formEl || !titleEl || !contentEl) {
    console.warn("[POST-EDIT] form/title/content 요소를 찾지 못했습니다.");
    return;
  }

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
    if (submitBtn) setDisabled(submitBtn, true);

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
    if (submitBtn) setDisabled(submitBtn, false);
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

  loadMyAvatar("[POST-EDIT]");
  setupAvatarMenu();

  const fileInput = document.querySelector(".upload input[type=file]");
  const fileNameEl = document.querySelector(".upload .file-name");
  setupFileInput(fileInput, fileNameEl);

  loadPostDetail(postId, userId);

  const formEl = $(".edit-form");
  if (formEl) {
    on(formEl, "submit", handleSubmit);
  }
});
