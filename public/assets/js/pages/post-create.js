import { $, clearFormHelpers, setDisabled, on } from "../core/dom.js";
import { loadUserId, clearAuth } from "../core/storage.js";
import { PostsAPI } from "../api/posts.js";
import { UsersAPI } from "../api/users.js";

let imageDataUrl = null;

function getGlobalHelper() {
  return document.querySelector(".helper");
}

function showFormError(msg = "") {
  const helper = getGlobalHelper();
  if (!helper) return;

  if (!msg) {
    helper.style.display = "none";
    helper.classList.remove("error");
    helper.innerHTML = `<span class="star">*</span> `;
    return;
  }

  helper.style.display = "block";
  helper.classList.add("error");
  helper.innerHTML = `<span class="star">*</span> ${msg}`;
}

function validate({ title, content }) {
  showFormError("");

  if (!title) {
    showFormError("제목을 입력해주세요.");
    return false;
  }
  if (title.length > 26) {
    showFormError("제목은 최대 26자까지 가능합니다.");
    return false;
  }

  if (!content) {
    showFormError("내용을 입력해주세요.");
    return false;
  }

  return true;
}

function readImageFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = (e) => reject(e);
    reader.readAsDataURL(file);
  });
}

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
    console.error("[POST-CREATE] 내 프로필(아바타) 불러오기 실패:", err);
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
  const userId = loadUserId();

  if (!userId) {
    alert("로그인 후 이용 가능한 페이지입니다.");
    window.location.href = "./login.html";
    return;
  }

  const form = $(".write-form");
  const titleEl = $("#title");
  const contentEl = $("#content");
  const fileInput = document.querySelector(".upload input[type='file']");
  const fileHint = document.querySelector(".file-hint");
  const submitBtn = $(".btn.primary");

  loadMyAvatar();
  setupAvatarMenu();

  showFormError("");

  if (fileInput) {
    on(fileInput, "change", async () => {
      const file = fileInput.files?.[0];
      console.log("[EVT] post image 선택됨", file);

      if (!file) {
        imageDataUrl = null;
        if (fileHint) {
          fileHint.textContent = "파일을 선택해주세요.";
        }
        return;
      }

      const MAX_SIZE = 2 * 1024 * 1024;
      if (file.size > MAX_SIZE) {
        imageDataUrl = null;
        if (fileHint) {
          fileHint.textContent = "이미지는 2MB 이하여야 합니다.";
        }
        fileInput.value = "";
        return;
      }

      try {
        imageDataUrl = await readImageFile(file);
        console.log("[EVT] post image base64 length:", imageDataUrl?.length);
        if (fileHint) {
          const sizeKb = (file.size / 1024).toFixed(1);
          fileHint.textContent = `${file.name} (${sizeKb} KB)`;
        }
      } catch (e) {
        console.error("이미지 읽기 실패:", e);
        imageDataUrl = null;
        if (fileHint) {
          fileHint.textContent = "이미지를 읽는 중 오류가 발생했습니다.";
        }
      }
    });
  }

  if (form) {
    on(form, "submit", async (e) => {
      e.preventDefault();

      clearFormHelpers(form);
      showFormError("");

      const title = titleEl.value.trim();
      const content = contentEl.value.trim();

      const ok = validate({ title, content });
      if (!ok) return;

      setDisabled(submitBtn, true);

      try {
        const data = await PostsAPI.create({
          userId,
          title,
          content,
          imageUrl: imageDataUrl,
        });

        console.log("[POST-CREATE] created post:", data);

        alert("게시글이 작성되었습니다.");

        window.location.href = "./board.html";
      } catch (err) {
        console.error("게시글 작성 실패:", err);
        showFormError(err?.message || "게시글 작성 중 오류가 발생했습니다.");
      } finally {
        setDisabled(submitBtn, false);
      }
    });
  }
});
