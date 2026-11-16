import { isPublished, loadPapers, readingStatuses } from "./data.js";

const byId = (id) => document.getElementById(id);

function initPlayer(paper) {
  const stage = byId("slide-stage");
  const message = byId("slide-message");
  const count = byId("slide-count");
  const previous = byId("previous-slide");
  const next = byId("next-slide");
  let current = 0;
  let activeImage;

  function show(index) {
    if (index < 0 || index >= paper.slides.length) return;
    current = index;
    count.textContent = `${current + 1} / ${paper.slides.length}`;
    previous.disabled = current === 0;
    next.disabled = current === paper.slides.length - 1;

    activeImage?.remove();
    const image = document.createElement("img");
    activeImage = image;
    image.hidden = true;
    image.alt = `《${paper.title}》第 ${current + 1} 張投影片`;
    message.textContent = "正在載入投影片…";
    message.hidden = false;

    image.addEventListener("load", () => {
      if (image !== activeImage) return;
      image.hidden = false;
      message.hidden = true;
    }, { once: true });
    image.addEventListener("error", () => {
      if (image !== activeImage) return;
      message.textContent = `第 ${index + 1} 張投影片無法載入。`;
    }, { once: true });

    stage.append(image);
    image.src = paper.slides[current];
  }

  previous.addEventListener("click", () => {
    show(current - 1);
    if (previous.disabled) next.focus();
  });
  next.addEventListener("click", () => {
    show(current + 1);
    if (next.disabled) previous.focus();
  });
  show(0);
}

async function init() {
  const message = byId("detail-message");
  const id = new URLSearchParams(location.search).get("id");
  if (!id) {
    message.textContent = "缺少論文 ID，請返回首頁選擇論文。";
    return;
  }

  try {
    const papers = await loadPapers();
    const paper = papers.find((item) => item.id === id);
    if (!paper) {
      message.textContent = "找不到這篇論文，請返回首頁確認連結。";
      return;
    }

    document.title = `${paper.title} | My Paper Reading List`;
    byId("detail-title").textContent = paper.title;
    byId("paper-authors").textContent = paper.authors.join("、");
    byId("paper-year").textContent = paper.year;
    byId("paper-category").textContent = paper.category;
    byId("paper-status").textContent = readingStatuses[paper.status];
    byId("paper-source").href = paper.url;

    byId("paper-content").hidden = false;
    message.hidden = true;
    if (isPublished(paper)) {
      byId("paper-summary").textContent = paper.summary;
      byId("published-content").hidden = false;
      initPlayer(paper);
      if (location.hash === "#presentation") byId("presentation").scrollIntoView();
    } else {
      byId("unpublished-note").hidden = false;
    }
  } catch (error) {
    message.textContent = `無法載入論文詳情。${error.message} 請確認已透過 HTTP 預覽並重新整理。`;
  }
}

init();
