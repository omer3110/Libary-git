
const urlBooks = "http://localhost:8001/books";
const tableContainer = document.getElementById("table-container");
let elemMessage = document.querySelector('.message');
let currentPage = 1;

function showForm(formId) {
    const forms = document.querySelectorAll('.form-container');
    forms.forEach(form => {
        if (form.id === formId) {
            form.classList.add('visible');
        } else {
            form.classList.remove('visible');
        }
    });
}

function hideTable() {
    tableContainer.style.display = 'none';
    document.getElementById("get-button").style.display = 'block';
}

function fetchAndBuildTable() {
    tableContainer.style.display = 'block';
    axios.get(`${urlBooks}?_page=${currentPage}`)
        .then(response => {
            const data = response.data.data;
            buildTable(data);
        })
        .catch(error => console.log(error));
}
function buildTable(data) {
    document.getElementById("get-button").style.display = 'none';
    tableContainer.innerHTML = "";

    const buttonContainer = document.createElement("div");
    buttonContainer.classList.add("button-container");

    const hideButton = document.createElement("button");
    hideButton.classList.add("hide-button");
    hideButton.textContent = "Hide Table";
    hideButton.addEventListener('click', hideTable);
    buttonContainer.appendChild(hideButton);

    const pagingButtons = document.createElement("div");
    pagingButtons.setAttribute("id", "paging-handell");
    pagingButtons.innerHTML = `<button onclick="previousHandler()"><</button><button onclick="nextHandler()">></button>`;
    buttonContainer.appendChild(pagingButtons);

    tableContainer.appendChild(buttonContainer);

    const table = document.createElement("table");
    table.setAttribute("border", "1");

    const headers = ["ID", "Book Name", "Authors", "Number of Pages", "Short Description", "Image", "Number of Copies", "Categories", "ISBN"];
    const headerRow = document.createElement("tr");
    headers.forEach(headerText => {
        const th = document.createElement("th");
        th.textContent = headerText;
        headerRow.appendChild(th);
    });
    table.appendChild(headerRow);

    data.forEach(book => {
        const row = document.createElement("tr");
        row.appendChild(createCell(book.id));
        row.appendChild(createCell(book.name));
        row.appendChild(createCell(book.authors.join(', '))); // Join authors array into a string
        row.appendChild(createCell(book.num_pages));
        row.appendChild(createCell(book.short_description));
        row.appendChild(createCell(book.image));
        row.appendChild(createCell(book.num_copies));
        row.appendChild(createCell(book.categories.join(', '))); // Join categories array into a string
        row.appendChild(createCell(book.ISBN));
        table.appendChild(row);
    });

    tableContainer.appendChild(table);
}

function createCell(text) {
    const cell = document.createElement("td");
    cell.textContent = text;
    return cell;
}

document.querySelector('#new-book-form').addEventListener('submit', function (event) {
    event.preventDefault();
    newBook();
});
document.querySelector('#update-book-form').addEventListener('submit', function (event) {
    event.preventDefault();
    updateBook();
});
document.querySelector('#delete-book-by-id').addEventListener('submit', function (event) {
    event.preventDefault();
    deleteBook();
});

function newBook() {
    const bookName = document.querySelector('#newBookName').value;
    const author = document.querySelector('#newAuthor').value;
    const numPages = document.querySelector('#newNumPages').value;

    axios.post(urlBooks, { name: bookName, author: author, numPages: numPages })
        .then(response => {
            showMessage("Book added successfully!", true);
            clearNewBookForm();
            fetchAndBuildTable();
        })
        .catch(error => showMessage("Failed to add book!", false));
}

function updateBook() {
    const bookId = document.querySelector('#updateID').value;
    const bookName = document.querySelector('#updateBookName').value;
    const author = document.querySelector('#updateAuthor').value;
    const numPages = document.querySelector('#updateNumPages').value;

    const payload = {};
    if (bookName) payload.name = bookName;
    if (author) payload.author = author;
    if (numPages) payload.numPages = numPages;

    if (Object.keys(payload).length === 0) {
        showMessage("No fields to update!", false);
        return;
    }

    axios.put(`${urlBooks}/${bookId}`, payload)
        .then(response => {
            showMessage("Book updated successfully!", true);
            clearUpdateBookForm();
            fetchAndBuildTable();
        })
        .catch(error => showMessage("Failed to update book!", false));
}

function deleteBook() {
    const bookId = document.querySelector('#deleteID').value;
    axios.delete(`${urlBooks}/${bookId}`)
        .then(response => {
            showMessage(`Book ${bookId} deleted successfully!`, true);
            document.querySelector('#deleteID').value = '';
            fetchAndBuildTable();
        })
        .catch(error => showMessage(`Failed to delete book ${bookId}!`, false));
}

function nextHandler() {
    currentPage++;
    fetchAndBuildTable();
}

function previousHandler() {
    if (currentPage > 1) {
        currentPage--;
        fetchAndBuildTable();
    }
}

function showMessage(message, isSuccess) {
    elemMessage.textContent = message;
    elemMessage.style.color = isSuccess ? '#45a049' : '#ba1111';
    setTimeout(() => {
        elemMessage.textContent = '';
    }, 3000);
}

function clearNewBookForm() {
    document.querySelector('#newBookName').value = '';
    document.querySelector('#newAuthor').value = '';
    document.querySelector('#newNumPages').value = '';
}

function clearUpdateBookForm() {
    document.querySelector('#updateID').value = '';
    document.querySelector('#updateBookName').value = '';
    document.querySelector('#updateAuthor').value = '';
    document.querySelector('#updateNumPages').value = '';
}