import { isPublished, loadPapers, readingStatuses } from "./data.js";

const byId = (id) => document.getElementById(id);
const form = byId("filter-form");
const query = byId("query");
const category = byId("category");
const status = byId("status");
const sort = byId("sort");
const collator = new Intl.Collator("zh-Hant", { sensitivity: "base", numeric: true });

const compare = {
  added: (a, b) => b.addedAt.localeCompare(a.addedAt),
  year: (a, b) => b.year - a.year,
  title: (a, b) => collator.compare(a.title, b.title),
};

function element(tag, className, value = "") {
  const node = document.createElement(tag);
  node.className = className;
  node.textContent = value;
  return node;
}

function link(label, href) {
  const anchor = element("a", "", label);
  anchor.href = href;
  return anchor;
}

function createCard(paper) {
  const card = element("article", "paper-card");
  const detail = `./paper.html?id=${encodeURIComponent(paper.id)}`;

  if (isPublished(paper)) {
    const cover = element("div", "slide-stage");
    const image = element("img", "");
    image.alt = `《${paper.title}》簡報封面`;
    image.loading = "lazy";
    image.addEventListener("error", () => {
      cover.replaceChildren(element("p", "", "簡報封面無法載入。"));
    }, { once: true });
    image.src = paper.slides[0];
    cover.append(image);
    card.append(cover);
  }

  const body = element("div", "card-body");
  const badges = element("div", "badges");
  badges.append(
    element("span", "badge", paper.category),
    element("span", "badge status", readingStatuses[paper.status]),
  );
  const title = element("h3", "");
  title.append(link(paper.title, detail));
  const links = element("div", "card-links");
  links.append(link("原始文獻", paper.url));
  if (isPublished(paper)) links.append(link("查看簡報", `${detail}#presentation`));
  body.append(badges, title, element("p", "", `${paper.authors.join("、")} · ${paper.year}`), links);
  card.append(body);
  return card;
}

function renderCollection(name, papers, emptyMessage) {
  byId(`${name}-results`).replaceChildren(...papers.map(createCard));
  const message = byId(`${name}-message`);
  message.textContent = emptyMessage;
  message.hidden = papers.length > 0;
}

function render(papers) {
  const term = query.value.trim().toLocaleLowerCase();
  const visible = papers.filter((paper) => {
    const matchesQuery = [paper.title, ...paper.authors, paper.category, ...paper.keywords]
      .some((value) => value.toLocaleLowerCase().includes(term));
    return matchesQuery && (!category.value || paper.category === category.value) &&
      (!status.value || paper.status === status.value);
  }).sort(compare[sort.value]);
  const reading = visible.filter((paper) => paper.status !== "completed");
  const library = visible.filter(isPublished);
  const filtered = Boolean(term || category.value || status.value);

  renderCollection("reading", reading, filtered ? "沒有符合條件的閱讀清單項目。" :
    "閱讀清單目前是空的。新增想讀或閱讀中的論文後，就會顯示在這裡。");
  renderCollection("library", library, filtered ? "沒有符合條件的已發布簡報。" :
    "目前沒有已發布的簡報。經審核並獲准公開的簡報會收錄在這裡。");
  byId("match-count").textContent = `顯示 ${reading.length + library.length} 篇論文`;
}

async function init() {
  try {
    const papers = await loadPapers();
    const counts = { "want-to-read": 0, reading: 0, completed: 0 };
    for (const paper of papers) counts[paper.status]++;
    for (const [key, count] of Object.entries(counts)) byId(`count-${key}`).textContent = count;

    const displayed = papers.filter((paper) => paper.status !== "completed" || isPublished(paper));
    const categories = [...new Set(displayed.map((paper) => paper.category))].sort(collator.compare);
    for (const name of categories) category.add(new Option(name, name));

    byId("filter-fields").disabled = false;
    byId("reset-filters").disabled = false;
    form.addEventListener("input", () => render(displayed));
    form.addEventListener("submit", (event) => event.preventDefault());
    form.addEventListener("reset", () => requestAnimationFrame(() => render(displayed)));
    render(displayed);
  } catch (error) {
    const message = byId("load-error");
    message.textContent = `無法載入論文清單。${error.message} 請確認已透過 HTTP 預覽並重新整理。`;
    message.hidden = false;
    byId("reading-message").hidden = true;
    byId("library-message").hidden = true;
  }
}

init();
