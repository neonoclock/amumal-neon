import {
  $,
  setHelper,
  clearFormHelpers,
  setDisabled,
  on,
} from "../core/dom.js";
import { saveAuth } from "../core/storage.js";
import { AuthAPI } from "../api/auth.js";

function isValidEmail(v) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

function validate({ email, pw, pw2, nick, avatarSelected }) {
  let valid = true;

  if (!email) {
    setHelper("#email", "이메일을 입력해주세요.", true);
    valid = false;
  } else if (!isValidEmail(email)) {
    setHelper("#email", "이메일 형식이 올바르지 않습니다.", true);
    valid = false;
  }

  if (!pw) {
    setHelper("#pw", "비밀번호를 입력해주세요.", true);
    valid = false;
  } else if (pw.length < 8) {
    setHelper("#pw", "비밀번호는 최소 8자 이상이어야 합니다.", true);
    valid = false;
  }

  if (!pw2) {
    setHelper("#pw2", "비밀번호를 한 번 더 입력해주세요.", true);
    valid = false;
  } else if (pw && pw2 && pw !== pw2) {
    setHelper("#pw2", "비밀번호가 서로 일치하지 않습니다.", true);
    valid = false;
  }

  if (!nick) {
    setHelper("#nick", "닉네임을 입력해주세요.", true);
    valid = false;
  } else if (nick.length > 30) {
    setHelper("#nick", "닉네임은 최대 30자까지 가능합니다.", true);
    valid = false;
  }

  return valid;
}

function handleServerError(message, { emailEl, pwEl, pw2El, nickEl }) {
  switch (message) {
    case "invalid email format":
      setHelper(emailEl, "이메일 형식이 올바르지 않습니다.", true);
      break;
    case "email is required":
      setHelper(emailEl, "이메일을 입력해주세요.", true);
      break;
    case "password is required":
      setHelper(pwEl, "비밀번호를 입력해주세요.", true);
      break;
    case "password_check is required":
      setHelper(pw2El, "비밀번호 확인을 입력해주세요.", true);
      break;
    case "nickname is required":
      setHelper(nickEl, "닉네임을 입력해주세요.", true);
      break;
    case "password_mismatch":
      setHelper(pw2El, "비밀번호가 서로 일치하지 않습니다.", true);
      break;
    default:
      alert(message || "회원가입 중 오류가 발생했습니다.");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const form = $(".form");
  const emailEl = $("#email");
  const pwEl = $("#pw");
  const pw2El = $("#pw2");
  const nickEl = $("#nick");
  const avatarIn = $("#avatar");
  const avatarField = avatarIn.closest(".field");
  const loginLink = $(".link-btn");
  const submitBtn = $(".btn.primary");

  let avatarDataUrl = null;

  on(avatarIn, "change", () => {
    const file = avatarIn.files?.[0];
    console.log("[EVT] 아바타 선택됨", file);

    if (!file) {
      avatarDataUrl = null;
      setHelper(avatarField, "", false);
      return;
    }

    const MAX_SIZE = 2 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      avatarDataUrl = null;
      setHelper(avatarField, "이미지 크기는 2MB 이하여야 합니다.", true);
      avatarIn.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      avatarDataUrl = e.target.result; // data:image/png;base64,.... 형태
      setHelper(avatarField, `선택된 파일: ${file.name}`, false);
      console.log("[EVT] avatar base64 length:", avatarDataUrl?.length);
    };
    reader.onerror = () => {
      avatarDataUrl = null;
      setHelper(avatarField, "이미지를 읽는 중 오류가 발생했습니다.", true);
    };

    reader.readAsDataURL(file);
  });

  on(loginLink, "click", () => {
    window.location.href = "./login.html";
  });

  on(form, "submit", async (e) => {
    e.preventDefault();

    clearFormHelpers(form);

    const email = emailEl.value.trim();
    const pw = pwEl.value;
    const pw2 = pw2El.value;
    const nick = nickEl.value.trim();
    const avatarSelected = !!avatarDataUrl;

    const isValid = validate({ email, pw, pw2, nick, avatarSelected });
    if (!isValid) return;

    setDisabled(submitBtn, true);

    try {
      const data = await AuthAPI.signup({
        email,
        password: pw,
        passwordCheck: pw2,
        nickname: nick,
        profileImage: avatarDataUrl,
      });

      const userId = data?.id;
      if (userId) {
        saveAuth({ id: userId });
      }

      alert("회원가입이 완료되었습니다. 로그인 페이지로 이동합니다.");
      window.location.href = "./login.html";
    } catch (err) {
      console.error("signup error:", err);
      handleServerError(err.message, { emailEl, pwEl, pw2El, nickEl });
    } finally {
      setDisabled(submitBtn, false);
    }
  });
});
