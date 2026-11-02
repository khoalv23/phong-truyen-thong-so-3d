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
  elements.image.addEventListener("load", syncArtifactLayout);
  window.addEventListener("resize", syncArtifactLayout);
}

function syncArtifactLayout() {
  if (!elements || !elements.modal.classList.contains("is-open")) return;
  requestAnimationFrame(() => {
    const panel = elements.modal.querySelector(".modal-panel");
    const body = elements.modal.querySelector(".modal-body");
    const copy = elements.modal.querySelector(".modal-copy");
    if (!panel || !body || !copy || elements.imageWrap.hidden) return;

    if (window.matchMedia("(max-width: 850px)").matches) {
      panel.style.removeProperty("width");
      body.style.removeProperty("width");
      elements.image.style.removeProperty("--image-width");
      copy.style.removeProperty("height");
      copy.style.removeProperty("--copy-width");
      panel.style.removeProperty("--artifact-left");
      return;
    }

    const aspect = elements.image.naturalWidth && elements.image.naturalHeight
      ? elements.image.naturalWidth / elements.image.naturalHeight
      : 1.4;
    const heightLimit = Math.min(window.innerHeight * .58, 620);
    const projectedImageWidth = Math.min(elements.image.naturalWidth || 720, heightLimit * aspect);
    const availableWidth = Math.min(window.innerWidth - 64, 1100);
    const dynamicCopyWidth = Math.max(250, Math.min(350, projectedImageWidth * .36, availableWidth * .33));
    const imageWidth = Math.max(180, Math.min(projectedImageWidth, availableWidth - dynamicCopyWidth - 7));
    const groupWidth = imageWidth + dynamicCopyWidth + 7;

    elements.image.style.setProperty("--image-width", Math.round(imageWidth) + "px");
    copy.style.setProperty("--copy-width", Math.round(dynamicCopyWidth) + "px");
    body.style.width = Math.round(groupWidth) + "px";
    panel.style.width = Math.round(groupWidth + 24) + "px";

    requestAnimationFrame(() => {
      const imageRect = elements.imageWrap.getBoundingClientRect();
      const panelRect = panel.getBoundingClientRect();
      copy.style.height = Math.round(imageRect.height) + "px";
      panel.style.setProperty("--artifact-left", Math.max(0, imageRect.left - panelRect.left) + "px");
    });
  });
}

export function registerArtifact(item) {
  const id = `art-${artifactSeq++}`;
  artifacts.set(id, item);
  return id;
}

function renderArtifactTitle(value) {
  const title = value || "";
  elements.title.textContent = title;
  const length = Array.from(title).length;
  elements.title.classList.toggle("is-long", length > 90 && length <= 145);
  elements.title.classList.toggle("is-extra-long", length > 145);
}

export function openArtifact(id) {
  const item = artifacts.get(id);
  if (!item || !elements) return;

  activePagedArtifact = item.pages?.length ? item : null;
  scheduleIdleReturn(item);
  activePageIndex = Math.max(0, Math.min(item.pages?.length - 1 || 0, item.initialPage ?? 0));
  const bookMode = isBookArtifact(item);
  const panel = elements.modal.querySelector(".modal-panel");
  elements.bookReader.hidden = !bookMode;
  elements.imageWrap.hidden = bookMode;
  elements.info.hidden = bookMode;
  panel.classList.toggle("is-book-mode", bookMode);

  if (bookMode) {
    panel.style.removeProperty("width");
    renderBookSpread(item);
    elements.modal.classList.add("is-open");
    return;
  }

  elements.image.src = item.image;
  elements.image.alt = item.title;
  renderArtifactTitle(item.title);
  elements.description.textContent = item.description;
  elements.pageControls.hidden = !activePagedArtifact;
  if (activePagedArtifact) renderArtifactPage(item);
  elements.image.classList.remove("is-zoomed");
  elements.modal.classList.add("is-open");
  syncArtifactLayout();
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
  elements.image.alt = page.title || item.title;
  renderArtifactTitle(page.title || item.title);
  elements.description.textContent = page.description || item.description;
  elements.pageIndicator.textContent = `Ảnh ${activePageIndex + 1} / ${item.pages.length}`;
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
