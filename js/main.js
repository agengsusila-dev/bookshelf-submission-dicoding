const books = [];
const RENDER_EVENT = "render-book";
const SAVED_EVENT = "saved-book";
const STORAGE_KEY = "BOOKSHELF_APPS";

function generateId() {
  return +new Date();
}

function generateBookObject(id, title, author, year, isComplete) {
  return {
    id,
    title,
    author,
    year,
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
  return null;
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
  const task = `${title}`;
  const message = ` added to list.`;
  toastNotification(message, task);
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function removeBook(bookId) {
  const bookTarget = findBookIndex(bookId);
  const bookTargetProperties = findBook(bookId);
  if (bookTarget === -1) return;

  const title = bookTargetProperties.title;
  const task = `${title}`;
  const message = ` successfully removed.`;
  toastNotification(message, task);
  books.splice(bookTarget, 1);
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function addBookToComplete(bookId) {
  const bookTarget = findBook(bookId);

  if (bookTarget == null) return;

  bookTarget.isComplete = true;
  const title = bookTarget.title;
  const task = `${title}`;
  const message = ` added to complete.`;
  toastNotification(message, task);
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function undoBookFromComplete(bookId) {
  const bookTarget = findBook(bookId);

  if (bookTarget == null) return;

  bookTarget.isComplete = false;

  const title = bookTarget.title;
  const task = `${title}`;
  const message = ` added to uncomplete.`;
  toastNotification(message, task);
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function toastNotification(message, task) {
  const toast = document.getElementById("toast");
  const toastMessage = document.getElementById("toast-message");
  const toastMessageName = document.getElementById("toast-message-name");

  toastMessageName.innerText = task;
  toastMessage.innerText = message;
  toast.className = "show";

  setTimeout(function () {
    toast.className = toast.className.replace("show", "");
  }, 3000);
}

// const searchButton = document.getElementById("search-button");

// searchButton.addEventListener("click", function (e) {
//   const searchField = document.getElementById("search-title").value;
//   e.preventDefault();

//   const filteredBooks = books.filter((book) => {
//     book.title.toLowerCase().includes(searchField.toLowerCase());
//   });
//   console.log(filteredBooks);
// });

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

  // searchButton.addEventListener("click", function () {
  //   console.log(titleSearch);
  //   console.log(search);
  // });

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
    actionCell.appendChild(removeButton);
  } else {
    cell4.appendChild(actionCell);
    actionCell.appendChild(undoButton);
    actionCell.appendChild(removeButton);
  }

  return row;
}

// document.addEventListener(RENDER_EVENT, function () {
//   const uncompleteBookList = document.getElementById("uncomplete-book-list");
//   uncompleteBookList.innerHTML = "";

//   const completeBookList = document.getElementById("complete-book-list");
//   completeBookList.innerHTML = "";

//   const searchButton = document.getElementById("search-button");
//   const titleKeyword = document
//     .getElementById("search-title")
//     .value.toLowerCase();

//   if (searchButton.addEventListener("click")) {
//     const filteredBooks = books.filter((book) => {
//       book.title.toLowerCase().includes(titleKeyword);
//     });
//     for (const bookItem of filteredBooks) {
//       const bookElement = renderBook(bookItem);
//       if (bookItem.isComplete) {
//         completeBookList.append(bookElement);
//       } else {
//         uncompleteBookList.append(bookElement);
//       }
//     }
//   } else {
//     for (const bookItem of books) {
//       const bookElement = renderBook(bookItem);
//       if (bookItem.isComplete) {
//         completeBookList.append(bookElement);
//       } else {
//         uncompleteBookList.append(bookElement);
//       }
//     }
//   }
// });

document.addEventListener(RENDER_EVENT, function () {
  const uncompleteBookList = document.getElementById("uncomplete-book-list");
  const completeBookList = document.getElementById("complete-book-list");
  const searchForm = document.getElementById("search-form");
  let isFormSubmitted = false;

  // Fungsi untuk merender buku ke dalam daftar
  function renderBooks(books) {
    // Hapus semua buku yang ada sebelumnya
    uncompleteBookList.innerHTML = "";
    completeBookList.innerHTML = "";

    // Render buku ke dalam daftar sesuai kategori (complete/incomplete)
    for (const bookItem of books) {
      const bookElement = renderBook(bookItem);
      if (bookItem.isComplete) {
        completeBookList.append(bookElement);
      } else {
        uncompleteBookList.append(bookElement);
      }
    }
  }

  // Event listener untuk formulir
  searchForm.addEventListener("submit", function (event) {
    event.preventDefault();
    isFormSubmitted = true;

    const titleKeyword = document
      .getElementById("search-title")
      .value.toLowerCase();

    const filteredBooks = books.filter((book) =>
      book.title.toLowerCase().includes(titleKeyword)
    );

    // Render buku hasil pemfilteran
    renderBooks(filteredBooks);
  });

  // Render buku secara default saat halaman dimuat
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
