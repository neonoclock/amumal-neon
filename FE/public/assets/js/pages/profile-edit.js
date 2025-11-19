import { $, setHelper, clearFormHelpers, setDisabled } from "../core/dom.js";
import { loadUserId, loadAuth, saveAuth, clearAuth } from "../core/storage.js";
import { UsersAPI } from "../api/users.js";

let currentProfileImage = null;

async function loadProfile() {
  const userId = loadUserId();
  if (!userId) {
    alert("로그인이 필요합니다. 로그인 페이지로 이동합니다.");
    window.location.href = "./login.html";
    return;
  }

  const emailEl = $(".field .readonly");
  const nickInput = $("#nick");
  const avatarImg = $(".avatar-uploader img");
  const headerAvatarBtn = $("#avatarBtn");

  try {
    const user = await UsersAPI.getUser(userId);
    console.log("[PROFILE] loaded user:", user);

    if (emailEl && user.email) {
      emailEl.textContent = user.email;
    }

    if (nickInput) {
      nickInput.value = user.nickname || "";
    }

    if (user.profileImage) {
      if (avatarImg) {
        avatarImg.src = user.profileImage;
      }
      currentProfileImage = user.profileImage;

      if (headerAvatarBtn) {
        headerAvatarBtn.style.setProperty(
          "--avatar-url",
          `url(${user.profileImage})`
        );
        headerAvatarBtn.classList.add("has-avatar");
        headerAvatarBtn.textContent = "";
      }
    } else {
      currentProfileImage = null;
    }
  } catch (e) {
    console.error(e);
    alert("회원 정보를 불러오지 못했습니다.");
  }
}

function validateForm() {
  const nickInput = $("#nick");
  const nickname = nickInput.value.trim();

  clearFormHelpers(document);

  if (!nickname) {
    setHelper(nickInput, "닉네임을 입력하세요.", true);
    nickInput.focus();
    return false;
  }

  return true;
}

async function updateProfileCore() {
  const userId = loadUserId();
  if (!userId) {
    alert("로그인이 필요합니다.");
    window.location.href = "./login.html";
    return false;
  }

  if (!validateForm()) return false;

  const nickInput = $("#nick");
  const nickname = nickInput.value.trim();
  const submitBtn = $(".btn.primary.block");

  try {
    if (submitBtn) setDisabled(submitBtn, true);

    const result = await UsersAPI.updateProfile(userId, {
      nickname,
      profileImage: currentProfileImage,
    });

    console.log("[PROFILE] update result:", result);

    const auth = loadAuth();
    if (auth) {
      saveAuth({
        ...auth,
        nickname,
        profileImage: currentProfileImage,
      });
    }

    return true;
  } catch (e) {
    console.error(e);
    alert(e.message || "프로필 수정에 실패했습니다.");
    return false;
  } finally {
    if (submitBtn) setDisabled(submitBtn, false);
  }
}

async function handleUpdateProfile(e) {
  e.preventDefault();
  const ok = await updateProfileCore();
  if (ok) {
    alert("프로필이 수정되었습니다.");
  }
}

async function handleComplete(e) {
  e.preventDefault();
  const ok = await updateProfileCore();
  if (!ok) return;
  alert("프로필이 수정되었습니다.");
  window.location.href = "./board.html";
}

function setupAvatarUploader() {
  const fileInput = document.querySelector(".avatar-uploader input[type=file]");
  const avatarImg = document.querySelector(".avatar-uploader img");
  const headerAvatarBtn = $("#avatarBtn");

  if (!fileInput || !avatarImg) return;

  fileInput.addEventListener("change", () => {
    const file = fileInput.files?.[0];
    console.log("[PROFILE] avatar selected:", file);

    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const base64 = ev.target?.result;
      if (typeof base64 === "string") {
        avatarImg.src = base64;
        currentProfileImage = base64;

        if (headerAvatarBtn) {
          headerAvatarBtn.style.setProperty("--avatar-url", `url(${base64})`);
          headerAvatarBtn.classList.add("has-avatar");
          headerAvatarBtn.textContent = "";
        }
      }
    };
    reader.readAsDataURL(file);
  });
}

function setupAccountButtons() {
  const logoutBtn = document.querySelector(".menu-logout");
  const deleteBtn = document.querySelector(".link.danger");
  const updateBtn = $(".btn.primary.block");
  const completeBtn = $(".btn.primary.pill");

  const userId = loadUserId();

  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      if (!confirm("로그아웃 하시겠습니까?")) return;
      clearAuth();
      window.location.href = "./login.html";
    });
  }

  if (deleteBtn && userId) {
    deleteBtn.addEventListener("click", async () => {
      const ok = confirm(
        "정말 회원 탈퇴하시겠습니까? 이 작업은 되돌릴 수 없습니다."
      );
      if (!ok) return;

      try {
        setDisabled(deleteBtn, true);
        await UsersAPI.deleteUser(userId);
        alert("회원 탈퇴가 완료되었습니다.");
        clearAuth();
        window.location.href = "./index.html";
      } catch (e) {
        console.error(e);
        alert(e.message || "회원 탈퇴에 실패했습니다.");
      } finally {
        setDisabled(deleteBtn, false);
      }
    });
  }

  if (updateBtn) {
    updateBtn.addEventListener("click", handleUpdateProfile);
  }

  if (completeBtn) {
    completeBtn.addEventListener("click", handleComplete);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  console.log("[PROFILE] profile-edit page init");

  const avatarHelper = document.querySelector(".section.profile .helper");
  if (avatarHelper) {
    avatarHelper.textContent = "";
    avatarHelper.classList.add("hidden");
  }

  setupAvatarUploader();
  setupAccountButtons();
  loadProfile();
});
