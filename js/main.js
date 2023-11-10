const books = [];
const RENDER_EVENT = "render-book";
const SAVED_EVENT = "saved-book";
const STORAGE_KEY = "BOOKSHELF_APPS";

//Modal Config
const isOpenClass = "modal-is-open";
const openingClass = "modal-is-opening";
const closingClass = "modal-is-closing";
const animationDuration = 400; // ms
let visibleModal = null;

function toggleModal(event) {
  event.preventDefault();
  const modal = document.getElementById(
    event.currentTarget.getAttribute("data-target")
  );
  typeof modal != "undefined" && modal != null && isModalOpen(modal)
    ? closeModal(modal)
    : openModal(modal);
}

// Is modal open
function isModalOpen(modal) {
  return modal.hasAttribute("open") && modal.getAttribute("open") != "false"
    ? true
    : false;
}

// Open modal
function openModal(modal) {
  document.documentElement.classList.add(isOpenClass, openingClass);
  setTimeout(() => {
    visibleModal = modal;
    document.documentElement.classList.remove(openingClass);
  }, animationDuration);
  modal.setAttribute("open", true);
}

// Close modal
function closeModal(modal) {
  visibleModal = null;
  document.documentElement.classList.add(closingClass);
  setTimeout(() => {
    document.documentElement.classList.remove(closingClass, isOpenClass);
    modal.removeAttribute("open");
  }, animationDuration);
}

// Close with a click outside
document.addEventListener("click", (event) => {
  if (visibleModal != null) {
    const modalContent = visibleModal.querySelector("article");
    const isClickInside = modalContent.contains(event.target);
    !isClickInside && closeModal(visibleModal);
  }
});

// Close with Esc key
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && visibleModal != null) {
    closeModal(visibleModal);
  }
});

function generateId() {
  return +new Date();
}

function generateBookObject(id, title, author, year, isComplete) {
  return {
    id: Number(id),
    title,
    author,
    year: Number(year),
    isComplete,
  };
}

function findBookIndex(bookId) {
  for (const index in books) {
    if (books[index].id === bookId) {
      return index;
    }
  }
  return -1;
}

function findBook(bookId) {
  for (const bookItem of books) {
    if (bookItem.id === bookId) {
      return bookItem;
    }
  }
  return console.log("Buku tidak ditemukan!");
}

function updateBook(bookId) {
  const bookTarget = findBook(Number(bookId));
  if (bookTarget == null) return;
  const title = bookTarget.title;

  const updateTitle = document.getElementById("update-title").value;
  const updateAuthor = document.getElementById("update-author").value;
  const updateYear = document.getElementById("update-year").value;
  const isComplete = document.getElementById("update-isComplete").checked;

  bookTarget.title = updateTitle;
  bookTarget.author = updateAuthor;
  bookTarget.year = Number(updateYear);
  bookTarget.isCompleted = isComplete;

  document.dispatchEvent(new Event(RENDER_EVENT));
  const bookTitle = `${title}`;
  const message = ` sucessfully updated.`;
  toastNotification(message, bookTitle);
  saveData();
}

function isStorageExist() {
  if (typeof Storage === "undefined") {
    alert("Browser kamu tidak mendukung Web Storage");
    return false;
  }
  return true;
}

function saveData() {
  if (isStorageExist()) {
    const parsed = JSON.stringify(books);
    localStorage.setItem(STORAGE_KEY, parsed);
    document.dispatchEvent(new Event(SAVED_EVENT));
  }
}

function loadDataFromStorage() {
  const serializedData = localStorage.getItem(STORAGE_KEY);
  let data = JSON.parse(serializedData);

  if (data !== null) {
    for (const book of data) {
      books.push(book);
    }
  }

  document.dispatchEvent(new Event(RENDER_EVENT));
}

function addBook() {
  const title = document.getElementById("title").value;
  const author = document.getElementById("author").value;
  const year = document.getElementById("year").value;
  const isComplete = document.getElementById("isComplete").checked;
  const id = generateId();

  const bookObject = generateBookObject(id, title, author, year, isComplete);

  books.push(bookObject);
  const bookTitle = `${title}`;
  const message = ` added to list.`;
  toastNotification(message, bookTitle);
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function removeBook(bookId) {
  const bookTarget = findBookIndex(bookId);
  const bookTargetProperties = findBook(bookId);
  if (bookTarget === -1) return;

  const title = bookTargetProperties.title;
  const bookTitle = `${title}`;
  const message = ` successfully removed.`;
  toastNotification(message, bookTitle);
  books.splice(bookTarget, 1);
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function addBookToComplete(bookId) {
  const bookTarget = findBook(bookId);

  if (bookTarget == null) return;

  bookTarget.isComplete = true;
  const title = bookTarget.title;
  const bookTitle = `${title}`;
  const message = ` added to complete.`;
  toastNotification(message, bookTitle);
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function undoBookFromComplete(bookId) {
  const bookTarget = findBook(bookId);

  if (bookTarget == null) return;

  bookTarget.isComplete = false;

  const title = bookTarget.title;
  const bookTitle = `${title}`;
  const message = ` added to uncomplete.`;
  toastNotification(message, bookTitle);
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function toastNotification(message, bookTitle) {
  const toast = document.getElementById("toast");
  const toastMessage = document.getElementById("toast-message");
  const toastMessageName = document.getElementById("toast-message-name");

  toastMessageName.innerText = bookTitle;
  toastMessage.innerText = message;
  toast.className = "show";

  setTimeout(function () {
    toast.className = toast.className.replace("show", "");
  }, 3000);
}

function renderBook(bookObject) {
  const { id, title, author, year, isComplete } = bookObject;
  let row = document.createElement("tr");
  let cell1 = row.insertCell(0);
  let cell2 = row.insertCell(1);
  let cell3 = row.insertCell(2);
  let cell4 = row.insertCell(3);

  cell1.textContent = title;
  cell2.textContent = author;
  cell3.textContent = year;

  const removeButton = document.createElement("input");
  removeButton.role = "button";
  removeButton.type = "button";
  removeButton.id = "action-button";
  removeButton.className = "secondary";
  removeButton.value = "Remove";

  removeButton.addEventListener("click", function () {
    removeBook(id);
  });

  const updateButton = document.createElement("input");
  updateButton.role = "button";
  updateButton.type = "button";
  updateButton.id = "action-button";
  updateButton.className = "secondary outline";
  updateButton.setAttribute("data-target", "update-modal");
  updateButton.onclick = toggleModal;
  updateButton.value = "Update";

  updateButton.addEventListener("click", function () {
    const bookItem = findBook(Number(id));
    const updateForm = document.getElementById("update-form");

    const textTitle = document.getElementById("update-title");
    const textAuthor = document.getElementById("update-author");
    const textYear = document.getElementById("update-year");
    const isComplete = document.getElementById("update-isComplete");

    textTitle.value = bookItem.title;
    textAuthor.value = bookItem.author;
    textYear.value = bookItem.year;
    isComplete.checked = bookItem.isComplete;

    updateForm.addEventListener("submit", function (event) {
      event.preventDefault();
      updateBook(id);
      const modal = visibleModal;
      closeModal(modal);
      toggleModal(false);
    });
  });

  const undoButton = document.createElement("input");
  undoButton.role = "button";
  undoButton.type = "button";
  undoButton.id = "action-button";
  undoButton.className = "contrast";
  undoButton.value = "Unfinish";

  undoButton.addEventListener("click", function () {
    undoBookFromComplete(id);
  });

  const checkButton = document.createElement("input");
  checkButton.type = "button";
  checkButton.role = "button";
  checkButton.id = "action-button";
  checkButton.className = "contrast";
  checkButton.value = "Finish";

  checkButton.addEventListener("click", function () {
    addBookToComplete(id);
  });

  const actionCell = document.createElement("div");
  actionCell.id = "action-cell";

  if (isComplete == false) {
    cell4.appendChild(actionCell);
    actionCell.appendChild(checkButton);
    actionCell.appendChild(updateButton);
    actionCell.appendChild(removeButton);
  } else {
    cell4.appendChild(actionCell);
    actionCell.appendChild(undoButton);
    actionCell.appendChild(updateButton);
    actionCell.appendChild(removeButton);
  }

  return row;
}

document.addEventListener(RENDER_EVENT, function () {
  const uncompleteBookList = document.getElementById("uncomplete-book-list");
  const completeBookList = document.getElementById("complete-book-list");
  const searchForm = document.getElementById("search-form");
  let isFormSubmitted = false;

  function renderBooks(books) {
    uncompleteBookList.innerHTML = "";
    completeBookList.innerHTML = "";

    for (const bookItem of books) {
      const bookElement = renderBook(bookItem);
      if (bookItem.isComplete) {
        completeBookList.append(bookElement);
      } else {
        uncompleteBookList.append(bookElement);
      }
    }
  }

  searchForm.addEventListener("submit", function (event) {
    event.preventDefault();
    isFormSubmitted = true;

    const titleKeyword = document
      .getElementById("search-title")
      .value.toLowerCase();

    const filteredBooks = books.filter((book) =>
      book.title.toLowerCase().includes(titleKeyword)
    );

    renderBooks(filteredBooks);
  });

  renderBooks(books);
});

document.addEventListener("DOMContentLoaded", function () {
  const submitForm = document.getElementById("form");

  if (isStorageExist()) {
    loadDataFromStorage();
  }

  submitForm.addEventListener("submit", function (e) {
    e.preventDefault();
    addBook();
  });
});
