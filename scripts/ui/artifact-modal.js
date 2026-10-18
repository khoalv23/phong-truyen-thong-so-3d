const artifacts = new Map();
let artifactSeq = 0;
let activePagedArtifact = null;
let activePageIndex = 0;
let elements = null;
let idleTimer = null;

function scheduleIdleReturn(item) {
  clearTimeout(idleTimer);
  if (!item?.idleMs) return;
  idleTimer = setTimeout(() => closeArtifactModal(), item.idleMs);
}
function isBookArtifact(item) {
  return item?.presentation === "book" && item.pages?.length;
}

export function initArtifactModal(modalElements) {
  elements = modalElements;
}

export function registerArtifact(item) {
  const id = `art-${artifactSeq++}`;
  artifacts.set(id, item);
  return id;
}

export function openArtifact(id) {
  const item = artifacts.get(id);
  if (!item || !elements) return;

  activePagedArtifact = item.pages?.length ? item : null;
  scheduleIdleReturn(item);
  activePageIndex = Math.max(0, Math.min(item.pages?.length - 1 || 0, item.initialPage ?? 0));
  const bookMode = isBookArtifact(item);
  elements.bookReader.hidden = !bookMode;
  elements.imageWrap.hidden = bookMode;
  elements.info.hidden = bookMode;
  elements.modal.querySelector(".modal-panel").classList.toggle("is-book-mode", bookMode);

  if (bookMode) {
    renderBookSpread(item);
    elements.modal.classList.add("is-open");
    return;
  }

  elements.image.src = item.image;
  elements.image.alt = item.title;
  elements.title.textContent = item.title;
  elements.description.textContent = item.description;
  elements.year.textContent = item.group || "Chủ đề 4";
  elements.source.textContent = item.source || "Đoàn TNCS Hồ Chí Minh - Trường ĐHSP Hà Nội";
  elements.pageControls.hidden = !activePagedArtifact;
  if (activePagedArtifact) renderArtifactPage(item);
  elements.image.classList.remove("is-zoomed");
  elements.modal.classList.add("is-open");
}

export function closeArtifactModal() {
  clearTimeout(idleTimer);
  elements?.modal.classList.remove("is-open");
  elements?.modal.querySelector(".modal-panel")?.classList.remove("is-book-mode");
}

export function isArtifactModalOpen() {
  return elements?.modal.classList.contains("is-open") ?? false;
}

export function toggleArtifactImageZoom() {
  elements?.image.classList.toggle("is-zoomed");
}

export function showPreviousArtifactPage() {
  if (!activePagedArtifact || activePageIndex <= 0) return;
  scheduleIdleReturn(activePagedArtifact);
  activePageIndex--;
  if (isBookArtifact(activePagedArtifact)) renderBookSpread(activePagedArtifact, "backward");
  else renderArtifactPage(activePagedArtifact);
}

export function showNextArtifactPage() {
  if (!activePagedArtifact || activePageIndex >= activePagedArtifact.pages.length - 1) return;
  scheduleIdleReturn(activePagedArtifact);
  activePageIndex++;
  if (isBookArtifact(activePagedArtifact)) renderBookSpread(activePagedArtifact, "forward");
  else renderArtifactPage(activePagedArtifact);
}

function renderArtifactPage(item) {
  const page = item.pages?.[activePageIndex];
  if (!page || !elements) return;

  elements.image.src = page.image || item.image;
  elements.image.alt = `${item.title} - Trang ${activePageIndex + 1}`;
  elements.description.textContent = page.description || item.description;
  elements.pageIndicator.textContent = `Trang ${activePageIndex + 1} / ${item.pages.length}`;
  elements.prevPageBtn.disabled = activePageIndex === 0;
  elements.nextPageBtn.disabled = activePageIndex === item.pages.length - 1;
}

function renderBookSpread(item, direction = "") {
  const turningPage = direction === "forward" ? elements.bookRightPage : elements.bookLeftPage;
  const turnSheet = direction ? createBookTurnSheet(turningPage, direction) : null;
  const leftIndex = activePageIndex;
  const rightIndex = activePageIndex + 1;
  renderBookPage("left", item.pages[leftIndex], leftIndex, item);
  renderBookPage("right", item.pages[rightIndex], rightIndex, item);

  const lastIndex = item.pages.length - 1;
  elements.bookPageIndicator.textContent = rightIndex <= lastIndex
    ? `Trang ${leftIndex + 1}-${rightIndex + 1} / ${item.pages.length}`
    : `Trang ${leftIndex + 1} / ${item.pages.length}`;
  elements.bookPrevPageBtn.disabled = leftIndex === 0;
  elements.bookNextPageBtn.disabled = leftIndex >= lastIndex;

  if (turnSheet) elements.bookSpread.append(turnSheet);
}

function createBookTurnSheet(pageElement, direction) {
  const sheet = pageElement.cloneNode(true);
  sheet.removeAttribute("id");
  sheet.className = `book-page book-turn-sheet book-turn-sheet-${direction}`;
  sheet.addEventListener("animationend", () => sheet.remove(), { once: true });
  return sheet;
}

function renderBookPage(side, page, index, item) {
  const pageElement = side === "left" ? elements.bookLeftPage : elements.bookRightPage;
  const image = side === "left" ? elements.bookLeftImage : elements.bookRightImage;
  const kicker = side === "left" ? elements.bookLeftKicker : elements.bookRightKicker;
  const title = side === "left" ? elements.bookLeftTitle : elements.bookRightTitle;
  const description = side === "left" ? elements.bookLeftDescription : elements.bookRightDescription;
  const number = side === "left" ? elements.bookLeftNumber : elements.bookRightNumber;

  pageElement.className = `book-page book-page-${side}`;
  if (!page) {
    pageElement.classList.add("is-blank");
    image.removeAttribute("src");
    image.alt = "";
    kicker.textContent = "";
    title.textContent = "";
    description.textContent = "";
    number.textContent = "";
    return;
  }

  pageElement.classList.add(`book-layout-${page.layout || "image-left"}`);
  image.src = page.image || item.image;
  image.alt = page.title || item.title;
  kicker.textContent = page.kicker || item.group || "Sach truyen thong";
  title.textContent = page.title || item.title;
  description.textContent = page.description || item.description;
  number.textContent = index + 1;
}
