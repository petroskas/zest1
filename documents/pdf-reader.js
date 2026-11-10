const documents = {
  policy: {
    title: 'Zimbabwe National Disability Policy (June 2021)',
    pageCount: 89,
    imageDirectory: 'page-images/policy'
  },
  act: {
    title: 'Zimbabwe Persons with Disabilities Act, No. 3 of 2025',
    pageCount: 36,
    imageDirectory: 'page-images/act'
  }
};

const title = document.querySelector('#documentTitle');
const status = document.querySelector('#readerStatus');
const image = document.querySelector('#pageImage');
const shell = document.querySelector('#pageShell');
const pageSelect = document.querySelector('#pageSelect');
const previous = document.querySelector('#previousPage');
const next = document.querySelector('#nextPage');
const zoomOut = document.querySelector('#zoomOut');
const zoomIn = document.querySelector('#zoomIn');
const selectedDocument = new URLSearchParams(location.search).get('doc');
const documentInfo = documents[selectedDocument];
let pageNumber = 1;
let zoom = 1;

function setStatus(message, isError = false) {
  status.textContent = message;
  status.dataset.error = String(isError);
}

function updateControls() {
  pageSelect.value = String(pageNumber);
  pageSelect.disabled = false;
  previous.disabled = pageNumber <= 1;
  next.disabled = pageNumber >= documentInfo.pageCount;
  zoomOut.disabled = zoom <= 0.7;
  zoomIn.disabled = zoom >= 2.5;
}

function showPage(number) {
  pageNumber = Math.max(1, Math.min(documentInfo.pageCount, number));
  updateControls();
  image.hidden = true;
  image.style.width = `${Math.max(240, shell.clientWidth - 28) * zoom}px`;
  image.src = new URL(
    `${documentInfo.imageDirectory}/page-${String(pageNumber).padStart(3, '0')}.jpg`,
    document.baseURI
  ).href;
  image.alt = `${documentInfo.title}, page ${pageNumber} of ${documentInfo.pageCount}`;
  setStatus(`Loading page ${pageNumber} of ${documentInfo.pageCount}…`);
  shell.scrollTop = 0;
  shell.scrollLeft = 0;
}

function populatePages() {
  const options = document.createDocumentFragment();
  for (let number = 1; number <= documentInfo.pageCount; number++) {
    const option = document.createElement('option');
    option.value = String(number);
    option.textContent = `${number} of ${documentInfo.pageCount}`;
    options.append(option);
  }
  pageSelect.replaceChildren(options);
}

async function openDocument() {
  if (!documentInfo) {
    title.textContent = 'Document unavailable';
    setStatus('Choose the Policy or Act from the ZEST reading room to open a document.', true);
    return;
  }

  title.textContent = documentInfo.title;
  document.title = `${documentInfo.title} | ZEST Reading Room`;
  populatePages();
  updateControls();
  showPage(1);
}

previous.addEventListener('click', () => showPage(pageNumber - 1));
next.addEventListener('click', () => showPage(pageNumber + 1));
pageSelect.addEventListener('change', () => showPage(Number(pageSelect.value)));
zoomOut.addEventListener('click', () => {
  zoom = Math.max(0.7, Math.round((zoom - 0.15) * 100) / 100);
  showPage(pageNumber);
});
zoomIn.addEventListener('click', () => {
  zoom = Math.min(2.5, Math.round((zoom + 0.15) * 100) / 100);
  showPage(pageNumber);
});
image.addEventListener('load', () => {
  image.hidden = false;
  setStatus(`Page ${pageNumber} of ${documentInfo.pageCount}`);
});
image.addEventListener('error', () => {
  image.hidden = true;
  setStatus('This page image could not be loaded. Check your connection and try again.', true);
});

openDocument();
