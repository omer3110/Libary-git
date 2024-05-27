// Project 

const urlBooks = "http://localhost:8001/books";
const urlHistory = "http://localhost:8001/history";
const booksContainer = document.getElementById("books-container");
let elemMessage = document.querySelector('.message');
let currentPage = 1;

const selectElement = document.getElementById("typeOfCreation");

selectElement.addEventListener("change", function () {
    const creationByIsbnForm = document.querySelector(".new-book-form-by-ISBN");
    const creationManuallyForm = document.querySelector(".new-book-form");
    const selectedValue = selectElement.value;
    if (selectedValue === "manually-api") {
        creationByIsbnForm.style.display = "none";
        creationManuallyForm.style.display = "block";
        creationManuallyForm.classList.add("new-book-form");
    } else if (selectedValue === "google-api") {
        creationByIsbnForm.style.display = "block";
        creationManuallyForm.style.display = "none";
    }
});

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
    booksContainer.style.display = 'none';
    document.getElementById("get-button").style.display = 'block';
}

function fetchAndBuildTable() {
    booksContainer.style.display = 'block';
    axios.get(`${urlBooks}?_page=${currentPage}`)
        .then(response => {
            const data = response.data.data;
            console.log(response.data);
            buildTable(data);
        })
        .catch(error => console.log(error));
}

function buildTable(data) {
    document.getElementById("get-button").style.display = 'none';
    booksContainer.innerHTML = "";

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

    booksContainer.appendChild(buttonContainer);

    const listOfBooksDiv = document.createElement("div");
    listOfBooksDiv.classList.add("book-list");


    data.forEach(book => {
        console.log(book);
        const currentBook = document.createElement("div");
        currentBook.classList.add("each-book-in-list");
        const image = document.createElement("img");
        image.src = book.image;
        image.style.maxHeight = "100px";
        const currentBookContentDiv = document.createElement("div")
        currentBookContentDiv.classList.add('each-book-content-wrapper')
        currentBookContentDiv.innerHTML = `<p>Book Name : ${book.name}</p> <p>Authors : ${book.authors}</p>`
        currentBook.appendChild(image);
        currentBook.appendChild(currentBookContentDiv)


        listOfBooksDiv.appendChild(currentBook)
        currentBook.addEventListener('click', () => displayBookInfo(book)); // Add click event listener
    });
    booksContainer.appendChild(listOfBooksDiv);
}

function displayBookInfo(book) {
    const modal = document.getElementById("modal");
    const bookInfoDiv = document.getElementById("book-info");

    bookInfoDiv.innerHTML = `
        <button onclick="deleteBook(${book.id})">Delete book</button>
        <h2>${book.name}</h2>
        <p><strong>Author(s):</strong> ${book.authors}</p>
        <p><strong>Number of Pages:</strong> ${book.num_pages}</p>
        <p><strong>Short Description:</strong> ${book.short_description}</p>
        <img src="${book.image}" alt="${book.name}" style="max-height: 100px;">
        <div><p class="num-of-copies"><strong>Number of Copies:</strong> ${book.num_copies}</p> <button onclick="updateBookCopies(${book.id}, 'increase')">+</button> <button onclick="updateBookCopies(${book.id}, 'decrease')">-</button></div>
        <p><strong>Categories:</strong> ${book.categories}</p>
        <p><strong>ISBN:</strong> ${book.ISBN}</p>
    `;
    // Display the modal
    modal.style.display = "block";

    // Close the modal when clicking on the close button
    const closeModalBtn = document.querySelector('.close-modal-btn');
    closeModalBtn.style.display = "inline"
    closeModalBtn.onclick = function () {
        modal.style.display = "none";
    };
}

document.querySelector('#new-book-form').addEventListener('submit', function (event) {
    event.preventDefault();
    newBook();
});

function newBook() {
    const bookName = document.querySelector('#BookName').value;
    const authors = document.querySelector('#Authors').value;
    const numPages = document.querySelector('#NumPages').value;
    const description = document.querySelector('#description').value;
    const image = document.querySelector('#img').value;
    const numOfCopies = document.querySelector('#numOfCopies').value;
    const categories = document.querySelector('#categories').value;
    
    axios.post(urlBooks, { name: bookName, authors: authors, num_pages: numPages, short_description : description,
        image : image, num_copies : numOfCopies, categories : categories 
      })
        .then(response => {
            showMessage("Book added successfully!", true);
            console.log(response.data.id);
            addToHistory("create", new Date, response.data.id)
            clearNewBookForm();
        })
        .catch(error => showMessage("Failed to added!", false)); 
}
function clearNewBookForm() {
    document.querySelector('#BookName').value = '';
    document.querySelector('#newAuthor').value = '';
    document.querySelector('#newNumPages').value = '';

}

async function updateBookCopies(id, action) {
    try {
        const response = await axios.get(`${urlBooks}/${id}`);
        const book = response.data;
        const numOfCopies = book.num_copies;
        if (!book) {
            showMessage(`Book with ID ${id} not found!`, false);
            return;
        }
        if (action === 'decrease') {
            if (book.num_copies <= 0) {
                showMessage(`Book ${id} is out of stock!`, false);
                return;
            }
        }
        const currentAmountOfCopies = action === 'increase' ? numOfCopies + 1 : numOfCopies - 1;
        await axios.patch(`${urlBooks}/${id}`, { num_copies: currentAmountOfCopies });
        showMessage(`Book ${id} copies ${action}d successfully!`, true);
        const elemNumOfCopies = document.querySelector('.num-of-copies')
        elemNumOfCopies.innerHTML = `<strong>Number of Copies:</strong> ${currentAmountOfCopies}` // @@@@@@@@@@@@
        addToHistory("update", new Date, id)

    } catch (error) {
        showMessage(`Failed to ${action} book ${bookId} copies!`, false);
        console.error('Error:', error);
    }

}

function clearUpdateBookForm() {
    document.querySelector('#updateID').value = '';
    document.querySelector('#increase').checked = false;
    document.querySelector('#decrease').checked = false;
}

function deleteBook(id) {
    axios.delete(`${urlBooks}/${id}`)
        .then(response => {
            showMessage(`Book ${id} deleted successfully!`, true);
            addToHistory("delete", new Date, id)
        })
        .catch(error => showMessage(`Failed to delete book ${id}!`, false));
    
}

function addToHistory(operation, time, bookId) {
    axios.post(urlHistory, { operation: operation, time: time, bookId: bookId })
        .then(response => {
            console.log("History added successfully!");
            clearNewBookForm();
        })
        .catch(error => console.log("Coul not add history element"));
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

document.querySelector('#searchBarForm').addEventListener('submit', function (event) {
    event.preventDefault();
    searchBook();
});
async function searchBook() {
    const elemSearchValue = document.querySelector("#searchBar").value.trim(); // Get search value and remove leading/trailing whitespace
    let booksResultsCounter = 0;
    let pageForSearch = 1;

    while (booksResultsCounter < 10) {
        try {
            const response = await axios.get(`${urlBooks}?_page=${pageForSearch}`);
            const pageData = response.data.data;

            for (const book of pageData) {
                if (book.name.toLowerCase().includes(elemSearchValue.toLowerCase())) {
                    printResult(book.id);
                    booksResultsCounter++;
                    if (booksResultsCounter >= 10) {
                        break;
                    }
                }
            }
            pageForSearch++;
        } catch (error) {
            console.error(error);
            break;
        }
    }
    console.log(booksResultsCounter);
}

function printResult(id) {
    axios.get(`${urlBooks}/${id}`)
        .then(response => {
            console.log(response.data);
        })
        .catch(error => console.log(error));
}