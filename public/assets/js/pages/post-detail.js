import { $, $$, on, setDisabled } from "../core/dom.js";
import { loadUserId, clearAuth } from "../core/storage.js";
import { PostsAPI } from "../api/posts.js";
import { CommentsAPI } from "../api/comments.js";
import { AuthAPI } from "../api/auth.js";

const state = {
  postId: null,
  me: null,
  post: null,
  comments: [],
  isLiking: false,
  isSubmittingComment: false,
};

function getPostIdFromURL() {
  const params = new URLSearchParams(window.location.search);
  const v = params.get("postId");
  return v ? Number(v) : null;
}

function formatDate(iso) {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    const hh = String(d.getHours()).padStart(2, "0");
    const mi = String(d.getMinutes()).padStart(2, "0");
    const ss = String(d.getSeconds()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd} ${hh}:${mi}:${ss}`;
  } catch (e) {
    console.warn("formatDate error", e, iso);
    return iso;
  }
}

function renderContent(contentEl, text) {
  if (!contentEl) return;
  if (!text) {
    contentEl.innerHTML = "<p>(내용이 없습니다)</p>";
    return;
  }

  const paragraphs = String(text).split(/\n{2,}|\r\n{2,}/);
  contentEl.innerHTML = "";
  paragraphs.forEach((p) => {
    const trimmed = p.trim();
    if (!trimmed) return;
    const el = document.createElement("p");

    const lines = trimmed.split(/\n|\r\n/);
    lines.forEach((line, idx) => {
      if (idx > 0) el.appendChild(document.createElement("br"));
      el.appendChild(document.createTextNode(line));
    });
    contentEl.appendChild(el);
  });
}

const dom = {};

function cacheDOM() {
  dom.titleEl = $(".post-title");
  dom.authorNameEl = $(".meta-line .author .name");
  dom.authorDateEl = $(".meta-line .author .date");
  dom.authorAvatarEl = $(".meta-line .author .author-avatar");
  dom.postActionsEl = $(".meta-line .actions");

  dom.mediaEl = $(".post .media");
  dom.contentEl = $(".post .content");

  const statButtons = $$(".stats .stat");
  dom.likeStatBtn = statButtons[0];
  dom.viewsStatBtn = statButtons[1];
  dom.commentsStatBtn = statButtons[2];

  dom.likeCountEl = dom.likeStatBtn?.querySelector("strong");
  dom.viewsCountEl = dom.viewsStatBtn?.querySelector("strong");
  dom.commentsCountEl = dom.commentsStatBtn?.querySelector("strong");

  dom.commentWriteSection = $(".comment-write");
  dom.commentTextarea = $(".comment-write textarea");
  dom.commentSubmitBtn = $(".comment-write .btn.primary");

  dom.commentsContainer = $(".comments");
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
    console.error("[POST-DETAIL] 내 프로필(아바타) 불러오기 실패:", err);
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

function renderPost() {
  const post = state.post;
  if (!post) return;

  if (dom.titleEl) {
    dom.titleEl.textContent = post.title ?? "(제목 없음)";
  }

  const authorName =
    post.author?.nickname || post.authorName || post.author_name || "익명";
  if (dom.authorNameEl) {
    dom.authorNameEl.textContent = authorName;
  }

  const createdAt = post.createdAt || post.created_at;
  if (dom.authorDateEl) {
    dom.authorDateEl.textContent = formatDate(createdAt);
  }

  const profileImg =
    post.authorProfileImage ||
    post.author_profile_image ||
    post.author?.profileImage ||
    post.author?.profile_image ||
    "./assets/img/profile-sample.png";

  if (dom.authorAvatarEl) {
    dom.authorAvatarEl.src = profileImg;
  }

  dom.mediaEl.innerHTML = "";
  const imgUrl = post.imageUrl || post.image_url;
  if (imgUrl) {
    const img = document.createElement("img");
    img.src = imgUrl;
    img.alt = "게시글 이미지";
    img.classList.add("post-image");
    dom.mediaEl.appendChild(img);
    dom.mediaEl.style.display = "block";
  } else {
    dom.mediaEl.style.display = "none";
  }

  renderContent(dom.contentEl, post.content);

  const likeCount = post.likes ?? 0;
  const viewCount = post.views ?? 0;
  const commentsCount =
    post.commentsCount ?? post.commentCount ?? state.comments.length;

  if (dom.likeCountEl) dom.likeCountEl.textContent = likeCount;
  if (dom.viewsCountEl) dom.viewsCountEl.textContent = viewCount;
  if (dom.commentsCountEl) dom.commentsCountEl.textContent = commentsCount;

  const liked = post.likedByViewer ?? post.likedByMe ?? post.liked ?? false;

  if (liked) {
    dom.likeStatBtn?.classList.add("is-liked");
  } else {
    dom.likeStatBtn?.classList.remove("is-liked");
  }
  state.post.liked = liked;

  const me = state.me;
  const authorId = post.author?.id ?? post.authorId ?? post.author_id;
  const isOwner = me && authorId && Number(me) === Number(authorId);

  if (dom.postActionsEl) {
    dom.postActionsEl.innerHTML = "";
    if (isOwner) {
      const editBtn = document.createElement("button");
      editBtn.className = "chip";
      editBtn.textContent = "수정";

      const deleteBtn = document.createElement("button");
      deleteBtn.className = "chip";
      deleteBtn.textContent = "삭제";

      dom.postActionsEl.appendChild(editBtn);
      dom.postActionsEl.appendChild(deleteBtn);

      on(editBtn, "click", handleEditPost);
      on(deleteBtn, "click", handleDeletePost);
    }
  }
}

function renderComments() {
  const list = state.comments || [];
  const me = state.me;

  if (!dom.commentsContainer) return;

  dom.commentsContainer.innerHTML = "";

  if (list.length === 0) {
    const empty = document.createElement("p");
    empty.className = "comments-empty";
    empty.textContent = "첫 댓글을 남겨주세요!";
    dom.commentsContainer.appendChild(empty);
    return;
  }

  list.forEach((c) => {
    const commentId = c.id ?? c.commentId ?? c.comment_id;

    const content = c.content ?? "";
    const createdAt = c.createdAt || c.created_at;
    const authorName =
      c.author?.nickname || c.authorName || c.author_name || "익명";
    const authorId = c.author?.id ?? c.authorId ?? c.author_id;
    const isMine = me && authorId && Number(me) === Number(authorId);

    const article = document.createElement("article");
    article.className = "comment";
    article.dataset.commentId = commentId;

    const left = document.createElement("div");
    left.className = "c-left";
    const dot = document.createElement("span");
    dot.className = "dot";
    left.appendChild(dot);

    const body = document.createElement("div");
    body.className = "c-body";

    const head = document.createElement("div");
    head.className = "c-head";

    const who = document.createElement("div");
    who.className = "who";

    const nameEl = document.createElement("span");
    nameEl.className = "name";
    nameEl.textContent = authorName;

    const dateEl = document.createElement("time");
    dateEl.className = "date";
    dateEl.textContent = formatDate(createdAt);

    who.appendChild(nameEl);
    who.appendChild(dateEl);

    const actions = document.createElement("div");
    actions.className = "actions";

    if (isMine) {
      const editBtn = document.createElement("button");
      editBtn.className = "chip c-edit";
      editBtn.textContent = "수정";

      const delBtn = document.createElement("button");
      delBtn.className = "chip c-delete";
      delBtn.textContent = "삭제";

      actions.appendChild(editBtn);
      actions.appendChild(delBtn);

      editBtn.addEventListener("click", () => {
        handleEditComment(article, commentId);
      });

      delBtn.addEventListener("click", () => {
        handleDeleteComment(commentId);
      });
    }

    head.appendChild(who);
    head.appendChild(actions);

    const textEl = document.createElement("p");
    textEl.className = "c-text";
    textEl.textContent = content;

    body.appendChild(head);
    body.appendChild(textEl);

    article.appendChild(left);
    article.appendChild(body);

    dom.commentsContainer.appendChild(article);
  });

  if (dom.commentsCountEl) {
    dom.commentsCountEl.textContent = String(list.length);
  }
}

async function handleEditPost() {
  if (!state.postId) return;
  window.location.href = `./post-edit.html?postId=${state.postId}`;
}

async function handleDeletePost() {
  if (!state.postId) return;
  if (!state.me) {
    alert("로그인 후 이용해주세요.");
    return;
  }

  const ok = confirm("정말 이 게시글을 삭제하시겠습니까?");
  if (!ok) return;

  try {
    await PostsAPI.remove(state.postId, { userId: state.me });
    alert("게시글이 삭제되었습니다.");
    window.location.href = "./board.html";
  } catch (e) {
    console.error(e);
    alert(e.message || "게시글 삭제에 실패했습니다.");
  }
}

async function handleToggleLike() {
  if (!state.postId) return;
  if (!state.me) {
    alert("좋아요는 로그인 후 이용 가능합니다.");
    return;
  }
  if (state.isLiking) return;
  state.isLiking = true;
  setDisabled(dom.likeStatBtn, true);

  const post = state.post;
  const liked = !!post.liked;
  try {
    if (liked) {
      await PostsAPI.unlike(state.postId, { userId: state.me });
      post.liked = false;
      post.likes = Math.max(0, (post.likes ?? 1) - 1);
    } else {
      await PostsAPI.like(state.postId, { userId: state.me });
      post.liked = true;
      post.likes = (post.likes ?? 0) + 1;
    }
    renderPost();
  } catch (e) {
    console.error(e);
    alert(e.message || "좋아요 처리 중 오류가 발생했습니다.");
  } finally {
    state.isLiking = false;
    setDisabled(dom.likeStatBtn, false);
  }
}

async function handleSubmitComment() {
  if (!state.postId) return;
  if (!state.me) {
    alert("로그인 후 댓글 작성이 가능합니다.");
    return;
  }
  if (state.isSubmittingComment) return;

  const content = dom.commentTextarea?.value.trim();
  if (!content) {
    alert("댓글 내용을 입력해주세요.");
    dom.commentTextarea?.focus();
    return;
  }

  state.isSubmittingComment = true;
  setDisabled(dom.commentSubmitBtn, true);

  try {
    await CommentsAPI.create(state.postId, {
      userId: state.me,
      content,
    });
    dom.commentTextarea.value = "";
    await loadComments();
  } catch (e) {
    console.error(e);
    alert(e.message || "댓글 등록에 실패했습니다.");
  } finally {
    state.isSubmittingComment = false;
    setDisabled(dom.commentSubmitBtn, false);
  }
}

async function handleDeleteComment(commentId) {
  if (!state.postId) return;
  if (!state.me) {
    alert("로그인 후 이용해주세요.");
    return;
  }

  const ok = confirm("이 댓글을 삭제하시겠습니까?");
  if (!ok) return;

  try {
    await CommentsAPI.remove(state.postId, commentId, { userId: state.me });
    await loadComments();
  } catch (e) {
    console.error(e);
    alert(e.message || "댓글 삭제에 실패했습니다.");
  }
}

function handleEditComment(commentEl, commentId) {
  if (!dom.commentsContainer) return;

  const textEl = commentEl.querySelector(".c-text");
  const actionsEl = commentEl.querySelector(".actions");
  if (!textEl || !actionsEl) return;

  const original = textEl.textContent || "";

  if (commentEl.classList.contains("editing")) return;
  commentEl.classList.add("editing");

  const textarea = document.createElement("textarea");
  textarea.className = "c-edit-input";
  textarea.value = original;
  textEl.replaceWith(textarea);

  actionsEl.innerHTML = "";

  const saveBtn = document.createElement("button");
  saveBtn.className = "chip c-save";
  saveBtn.textContent = "저장";

  const cancelBtn = document.createElement("button");
  cancelBtn.className = "chip c-cancel";
  cancelBtn.textContent = "취소";

  actionsEl.appendChild(saveBtn);
  actionsEl.appendChild(cancelBtn);

  saveBtn.addEventListener("click", async () => {
    const newContent = textarea.value.trim();
    if (!newContent) {
      alert("댓글 내용을 입력해주세요.");
      textarea.focus();
      return;
    }
    try {
      await CommentsAPI.update(state.postId, commentId, {
        userId: state.me,
        content: newContent,
      });
      await loadComments();
    } catch (e) {
      console.error(e);
      alert(e.message || "댓글 수정에 실패했습니다.");
    }
  });

  cancelBtn.addEventListener("click", () => {
    const p = document.createElement("p");
    p.className = "c-text";
    p.textContent = original;
    textarea.replaceWith(p);

    actionsEl.innerHTML = "";
    const editBtn = document.createElement("button");
    editBtn.className = "chip c-edit";
    editBtn.textContent = "수정";
    const delBtn = document.createElement("button");
    delBtn.className = "chip c-delete";
    delBtn.textContent = "삭제";
    actionsEl.appendChild(editBtn);
    actionsEl.appendChild(delBtn);

    editBtn.addEventListener("click", () => {
      handleEditComment(commentEl, commentId);
    });
    delBtn.addEventListener("click", () => {
      handleDeleteComment(commentId);
    });

    commentEl.classList.remove("editing");
  });
}

async function loadPost() {
  try {
    const post = await PostsAPI.getDetail(state.postId, {
      viewerId: state.me,
    });
    state.post = post;
    renderPost();
  } catch (e) {
    console.error(e);
    alert(e.message || "게시글을 불러오는 중 오류가 발생했습니다.");
  }
}

async function loadComments() {
  try {
    const list = await CommentsAPI.getList(state.postId);
    state.comments = Array.isArray(list) ? list : [];
    renderComments();
  } catch (e) {
    console.error(e);
    alert(e.message || "댓글을 불러오는 중 오류가 발생했습니다.");
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  state.postId = getPostIdFromURL();
  state.me = loadUserId();

  if (!state.postId) {
    alert("잘못된 접근입니다. 게시글 ID가 없습니다.");
    history.back();
    return;
  }

  cacheDOM();
  await loadMyAvatar();
  setupAvatarMenu();

  if (dom.likeStatBtn) {
    on(dom.likeStatBtn, "click", handleToggleLike);
  }

  if (dom.commentSubmitBtn) {
    on(dom.commentSubmitBtn, "click", (e) => {
      e.preventDefault();
      handleSubmitComment();
    });
  }

  await loadPost();
  await loadComments();
});
