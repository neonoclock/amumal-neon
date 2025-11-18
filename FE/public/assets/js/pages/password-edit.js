import { $, setHelper, clearFormHelpers, setDisabled } from "../core/dom.js";
import { PATCH } from "../core/http.js";
import { loadUserId } from "../core/storage.js";
import { loadMyAvatar, setupAvatarMenu } from "../common/ui.js";

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

  loadMyAvatar("[PASSWORD]");
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

    const oldPassword = currentPwEl.value.trim();
    const newPassword = pwEl.value.trim();
    const newPasswordCheck = pw2El.value.trim();

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
