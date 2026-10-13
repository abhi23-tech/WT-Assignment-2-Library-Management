
let books = [];
let editIndex = -1;

const form = document.getElementById("bookForm");
const titleInput = document.getElementById("title");
const authorInput = document.getElementById("author");
const isbnInput = document.getElementById("isbn");
const yearInput = document.getElementById("year");
const error = document.getElementById("error");
const bookList = document.getElementById("bookList");
const searchInput = document.getElementById("search");
const jsonData = document.getElementById("jsonData");

function showMessage(message, type) {
    error.textContent = message;
    error.className = "message " + type;
}

function resetForm() {
    form.reset();
    editIndex = -1;

    document.getElementById("formTitle").textContent = "Add a Book";
    document.getElementById("saveBtn").textContent = "+ Add Book to Collection";
    document.getElementById("cancelBtn").hidden = true;
}

form.addEventListener("submit", function(event) {
    event.preventDefault();

    let title = titleInput.value.trim();
    let author = authorInput.value.trim();
    let isbn = isbnInput.value.replace(/[\s-]/g, "");
    let year = yearInput.value.trim();

    if (!title || !author || !isbn || !year) {
        showMessage("Please fill in all fields.", "error");
        return;
    }

    if (!/^[a-zA-Z0-9 ]+$/.test(title)) {
        showMessage("Book title should contain letters, numbers and spaces only.", "error");
        return;
    }

    if (!/^[a-zA-Z .'-]+$/.test(author)) {
        showMessage("Please enter a valid author name.", "error");
        return;
    }

    if (!/^(?:\d{10}|\d{13})$/.test(isbn)) {
        showMessage("ISBN must contain exactly 10 or 13 digits.", "error");
        return;
    }

    let publicationYear = Number(year);
    let currentYear = new Date().getFullYear();

    if (!Number.isInteger(publicationYear) ||
        publicationYear < 1000 ||
        publicationYear > currentYear) {
        showMessage("Please enter a valid publication year.", "error");
        return;
    }

    let duplicate = books.some(function(book, index) {
        return book.isbn === isbn && index !== editIndex;
    });

    if (duplicate) {
        showMessage("A book with this ISBN already exists.", "error");
        return;
    }

    let book = {
        title: title,
        author: author,
        isbn: isbn,
        year: publicationYear
    };

    if (editIndex === -1) {
        books.push(book);
        showMessage("Book added successfully.", "success");
    } else {
        books[editIndex] = book;
        showMessage("Book details updated successfully.", "success");
    }

    resetForm();
    displayBooks();
});

function displayBooks() {
    bookList.innerHTML = "";

    let keyword = searchInput.value.trim().toLowerCase();

    let filteredBooks = books.filter(function(book) {
        return book.title.toLowerCase().includes(keyword) ||
            book.author.toLowerCase().includes(keyword) ||
            book.isbn.includes(keyword) ||
            String(book.year).includes(keyword);
    });

    document.getElementById("totalBooks").textContent = books.length;

    let authors = new Set(books.map(function(book) {
        return book.author.toLowerCase();
    }));

    document.getElementById("totalAuthors").textContent = authors.size;

    let latestYear = books.length > 0
        ? Math.max(...books.map(function(book) {
            return book.year;
        }))
        : "—";

    document.getElementById("latestYear").textContent = latestYear;

    document.getElementById("recordCount").textContent =
        books.length + (books.length === 1 ? " record" : " records");

    document.getElementById("resultsText").textContent =
        "Showing " + filteredBooks.length + " of " + books.length + " books";

    let emptyState = document.getElementById("emptyState");

    emptyState.hidden = filteredBooks.length > 0;

    if (books.length === 0) {
        emptyState.querySelector("h3").textContent = "No books added yet";
        emptyState.querySelector("p").textContent =
            "Your book records will appear here after you add a book.";
        emptyState.querySelector("a").hidden = false;
    } else if (filteredBooks.length === 0) {
        emptyState.querySelector("h3").textContent = "No matching books found";
        emptyState.querySelector("p").textContent =
            "Try searching with a different title, author or ISBN.";
        emptyState.querySelector("a").hidden = true;
    }

    filteredBooks.forEach(function(book) {
        let index = books.indexOf(book);
        let row = document.createElement("tr");

        let detailsCell = document.createElement("td");

        let title = document.createElement("div");
        title.className = "book-title";
        title.textContent = book.title;

        let author = document.createElement("div");
        author.className = "book-author";
        author.textContent = "by " + book.author;

        detailsCell.appendChild(title);
        detailsCell.appendChild(author);

        let isbnCell = document.createElement("td");
        isbnCell.className = "isbn-text";
        isbnCell.textContent = book.isbn;

        let yearCell = document.createElement("td");
        yearCell.textContent = book.year;

        let actionCell = document.createElement("td");
        let actionButtons = document.createElement("div");
        actionButtons.className = "action-buttons";

        let editButton = document.createElement("button");
        editButton.type = "button";
        editButton.textContent = "Edit";
        editButton.className = "action-button edit-button";

        editButton.addEventListener("click", function() {
            editBook(index);
        });

        let deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.textContent = "Delete";
        deleteButton.className = "action-button delete-button";

        deleteButton.addEventListener("click", function() {
            deleteBook(index);
        });

        actionButtons.appendChild(editButton);
        actionButtons.appendChild(deleteButton);
        actionCell.appendChild(actionButtons);

        row.appendChild(detailsCell);
        row.appendChild(isbnCell);
        row.appendChild(yearCell);
        row.appendChild(actionCell);

        bookList.appendChild(row);
    });

    if (!jsonData.hidden) {
        jsonData.textContent = JSON.stringify(books, null, 4);
    }
}

function editBook(index) {
    let book = books[index];

    titleInput.value = book.title;
    authorInput.value = book.author;
    isbnInput.value = book.isbn;
    yearInput.value = book.year;

    editIndex = index;

    document.getElementById("formTitle").textContent = "Edit Book Details";
    document.getElementById("saveBtn").textContent = "Save Changes";
    document.getElementById("cancelBtn").hidden = false;

    showMessage("Make your changes and click Save Changes.", "success");

    document.getElementById("add-book").scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}

function deleteBook(index) {
    if (confirm("Are you sure you want to delete this book?")) {
        books.splice(index, 1);

        resetForm();
        showMessage("Book deleted successfully.", "success");
        displayBooks();
    }
}

document.getElementById("cancelBtn").addEventListener("click", function() {
    resetForm();
    showMessage("", "");
});

searchInput.addEventListener("input", displayBooks);

document.getElementById("showJson").addEventListener("click", function() {
    if (jsonData.hidden) {
        jsonData.textContent = JSON.stringify(books, null, 4);
        jsonData.hidden = false;
        this.textContent = "Hide JSON Data";
    } else {
        jsonData.hidden = true;
        this.textContent = "{ } Show JSON Data";
    }
});

displayBooks();
