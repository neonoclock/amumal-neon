export const $ = (selector, root = document) => root.querySelector(selector);
export const $$ = (selector, root = document) =>
  Array.from(root.querySelectorAll(selector));

export function getField(target) {
  const el = typeof target === "string" ? $(target) : target;
  if (!el) return null;

  if (el.classList?.contains("field") || el.classList?.contains("form-field")) {
    return el;
  }

  return el.closest(".field, .form-field");
}

export function setHelper(target, text = "", isError = false) {
  const fieldEl = getField(target);
  if (!fieldEl) return;

  const helper = fieldEl.querySelector(".helper");
  if (!helper) return;

  helper.textContent = text;

  helper.classList.toggle("error", !!isError);

  if (text && text.trim().length > 0) {
    helper.style.display = "block";
  } else {
    helper.style.display = "none";
  }
}

export function clearFormHelpers(root) {
  const el = typeof root === "string" ? $(root) : root;
  if (!el) return;

  const helpers = el.querySelectorAll(".helper");
  helpers.forEach((helper) => {
    helper.textContent = "";
    helper.classList.remove("error");
    helper.style.display = "none";
  });
}

export function setDisabled(target, disabled = true) {
  const el = typeof target === "string" ? $(target) : target;
  if (!el) return;

  el.disabled = !!disabled;
  el.classList.toggle("is-loading", !!disabled);
}

export function on(target, event, handler, root = document) {
  const el = typeof target === "string" ? $(target, root) : target;
  if (!el) return;
  el.addEventListener(event, handler);
}
