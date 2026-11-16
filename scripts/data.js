export const readingStatuses = {
  "want-to-read": "想讀",
  reading: "閱讀中",
  completed: "已完成",
};

const presentationStatuses = ["not-started", "in-progress", "pending-review", "published"];
const slug = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const hasText = (value) => typeof value === "string" && value.trim().length > 0;

function isSourceUrl(value) {
  if (!hasText(value)) return false;
  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol) && !url.username && !url.password;
  } catch {
    return false;
  }
}

function isDate(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(value);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

export function isPublished(paper) {
  return paper.presentationStatus === "published";
}

function isPaper(paper) {
  if (
    !paper || typeof paper.id !== "string" || !slug.test(paper.id) ||
    !hasText(paper.title) || !Array.isArray(paper.authors) ||
    !paper.authors.length || !paper.authors.every(hasText) ||
    !Number.isInteger(paper.year) || paper.year < 1 ||
    !hasText(paper.category) || !Array.isArray(paper.keywords) ||
    !paper.keywords.every((keyword) => typeof keyword === "string") ||
    !isSourceUrl(paper.url) || typeof paper.status !== "string" ||
    !Object.hasOwn(readingStatuses, paper.status) ||
    !presentationStatuses.includes(paper.presentationStatus) ||
    !isDate(paper.addedAt) || typeof paper.summary !== "string" ||
    !Array.isArray(paper.slides)
  ) return false;

  if (!isPublished(paper)) return paper.slides.length === 0;

  const slidePath = new RegExp(`^(?:\\./)?assets/papers/${paper.id}/slides/slide-\\d{2,}\\.webp$`);
  return paper.status === "completed" && hasText(paper.summary) && paper.slides.length > 0 &&
    paper.slides.every((path) => typeof path === "string" && slidePath.test(path));
}

export async function loadPapers() {
  const response = await fetch(new URL("../data/papers.json", import.meta.url));
  if (!response.ok) throw new Error(`論文資料讀取失敗（HTTP ${response.status}）。`);

  let papers;
  try {
    papers = await response.json();
  } catch {
    throw new Error("論文資料無法解析，請檢查 papers.json 的 JSON 格式。");
  }

  if (!Array.isArray(papers) || !papers.every(isPaper)) {
    throw new Error("論文資料欄位或狀態不符合規格，請檢查 papers.json。");
  }
  if (new Set(papers.map((paper) => paper.id)).size !== papers.length) {
    throw new Error("論文 ID 重複，請檢查 papers.json。");
  }
  return papers;
}
