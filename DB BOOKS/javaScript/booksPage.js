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
    const form = document.getElementById(formId)
    form.style.display = "flex"
    form.style.flexDirection = "column"
    form.style.alignItems = "center"
}

function hideForm(formId) {
    const form = document.getElementById(formId)
    form.style.display = "none"
}

function hideTable() {
    booksContainer.style.display = 'none';
    document.getElementById("get-button").style.display = 'block';
}

function showHistory() {
    currentPage = 1;
    totalResponseArray = [];
    booksContainer.style.display = 'block';
    axios.get(urlHistory)
        .then(response => {
            totalResponseArray = resposeToMappedArray(response.data, false);
            console.log(totalResponseArray);
            buildHistory(totalResponseArray[currentPage - 1], totalResponseArray.length);

        })
        .catch(error => console.log(error));
}


function resposeToMappedArray(apiResponse, fromSearch) {
    const totalPages = Math.ceil(apiResponse.length / 10);
    for (let i = 0; i < totalPages; i++) {
        const newPageArray = [];
        const startIndex = i * 10;
        const endIndex = Math.min(startIndex + 10, apiResponse.length);
        for (let j = startIndex; j < endIndex; j++) {
            newPageArray.push(apiResponse[j]);
        }
        totalResponseArray.push(newPageArray);
    }
    return totalResponseArray;
}

let totalResponseArray = [];
function fetchAndBuildTable() {
    currentPage = 1;
    totalResponseArray = [];
    // booksContainer.style.display = 'block';
    axios.get(urlBooks)
        .then(response => {
            totalResponseArray = resposeToMappedArray(response.data, false);
            console.log(totalResponseArray);
            buildTable(totalResponseArray[currentPage - 1], totalResponseArray.length);
        })
        .catch(error => console.log(error));
}
function nextHandler(type) {
    if (type == 'history') {
        if (currentPage < totalResponseArray.length) {
            currentPage++;
            buildHistory(totalResponseArray[currentPage - 1], totalResponseArray.length);
        }
    }
    else if (currentPage < totalResponseArray.length) {
        currentPage++;
        buildTable(totalResponseArray[currentPage - 1], totalResponseArray.length);
    }
}

function previousHandler(type) {
    if (type === 'history') {
        if (currentPage > 1) {
            currentPage--;
            buildHistory(totalResponseArray[currentPage - 1], totalResponseArray.length);
        }
    }
    else if (currentPage > 1) {
        currentPage--;
        buildTable(totalResponseArray[currentPage - 1], totalResponseArray.length);
    }
}
function buildTable(data, totalPages) {
    booksContainer.style.display = 'block';
    document.getElementById("get-button").style.display = 'none';
    booksContainer.innerHTML = "";

    const buttonContainer = document.createElement("div");
    buttonContainer.classList.add("button-container");

    const hideButton = document.createElement("button");
    hideButton.classList.add("hide-button");
    hideButton.textContent = "Hide List";
    hideButton.addEventListener('click', hideTable);
    buttonContainer.appendChild(hideButton);

    const pagingButtons = document.createElement("div");
    pagingButtons.setAttribute("id", "paging-handell");
    pagingButtons.innerHTML = `<div>page ${currentPage} out of ${totalPages}</div><button onclick="previousHandler()"><</button><button onclick="nextHandler()">></button><div>`;
    buttonContainer.appendChild(pagingButtons);

    booksContainer.appendChild(buttonContainer);

    const listOfBooksDiv = document.createElement("div");
    listOfBooksDiv.classList.add("book-list");
    // Replace data.forEach with a for loop
    for (let i = 0; i < data.length; i++) {
        const book = data[i];
        const currentBook = document.createElement("div");
        currentBook.classList.add("each-book-in-list");

        const image = document.createElement("img");
        image.src = book.image;
        image.style.maxHeight = "100px";

        const currentBookContentDiv = document.createElement("div");
        currentBookContentDiv.classList.add('each-book-content-wrapper');
        currentBookContentDiv.innerHTML = `<p>Book Name : ${book.name}</p> <p>Authors : ${book.authors}</p>`;

        currentBook.appendChild(image);
        currentBook.appendChild(currentBookContentDiv);

        listOfBooksDiv.appendChild(currentBook);
        currentBook.addEventListener('click', () => displayBookInfo(book)); // Add click event listener
    }
    booksContainer.appendChild(listOfBooksDiv);
}

function buildHistory(data, totalPages) {
    document.getElementById("get-button").style.display = 'none';
    booksContainer.innerHTML = "";

    const buttonContainer = document.createElement("div");
    buttonContainer.classList.add("button-container");

    const hideButton = document.createElement("button");
    hideButton.classList.add("hide-button");
    hideButton.textContent = "Hide List";
    hideButton.addEventListener('click', hideTable);
    buttonContainer.appendChild(hideButton);

    const pagingButtons = document.createElement("div");
    pagingButtons.setAttribute("id", "paging-handell");
    pagingButtons.innerHTML = `<div>page ${currentPage} out of ${totalPages}</div><button onclick="previousHandler('history')"><</button><button onclick="nextHandler('history')">></button><div>`;
    buttonContainer.appendChild(pagingButtons);

    booksContainer.appendChild(buttonContainer);

    const listOfBooksDiv = document.createElement("div");
    listOfBooksDiv.classList.add("book-list");
    // Replace data.forEach with a for loop
    for (let i = 0; i < data.length; i++) {
        const action = data[i];
        const currentBook = document.createElement("div");
        currentBook.classList.add("each-book-in-list");

        const currentActionDiv = document.createElement("div");
        currentActionDiv.classList.add('each-book-content-wrapper');
        currentActionDiv.innerHTML = `<p>Action operation : ${action.operation}</p> <p>Action time : ${action.time}</p> <p>Action book ID : ${action.bookId}</p>`;


        currentBook.appendChild(currentActionDiv);
        listOfBooksDiv.appendChild(currentBook);
    }

    booksContainer.appendChild(listOfBooksDiv);
}

function displayBookInfo(book) {
    const modal = document.getElementById("modal");
    const bookInfoDiv = document.getElementById("book-info");
    bookInfoDiv.innerHTML = `
        <h2>${book.name}</h2>
        <div class="img-and-info"><img src="${book.image}" alt="${book.name}" style="max-height: 600px;">
            <div> <p><strong>Author(s):</strong> ${book.authors}</p>
            <p><strong>Number of Pages:</strong> ${book.num_pages}</p>
            <div><p class="num-of-copies"><strong>Number of Copies:</strong> ${book.num_copies}</p> <button onclick="updateBookCopies(${book.id}, 'increase')">+</button> <button onclick="updateBookCopies(${book.id}, 'decrease')">-</button></div>
            <p><strong>Categories:</strong> ${book.categories}</p> </div>
         </div>
        <p><strong>Short Description:</strong> ${book.short_description}</p>
        <p><strong>ISBN:</strong> ${book.ISBN}</p>
        <button onclick="deleteBook(${book.id})">Delete book</button>

    `;
    modal.style.display = "block";

    const closeModalBtn = document.querySelector('.close-modal-btn');
    closeModalBtn.style.display = "inline"
    closeModalBtn.onclick = function () {
        modal.style.display = "none";
    };
}

document.querySelector('#new-book-form-container').addEventListener('submit', function (event) {
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

    axios.post(urlBooks, {
        name: bookName, authors: authors, num_pages: numPages, short_description: description,
        image: image, num_copies: numOfCopies, categories: categories
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
        showMessage(`Failed to ${action} book ${id} copies!`, false);
        console.error('Error:', error);
    }

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
        .catch(error => console.log("Coul not add history element"));
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
    currentPage = 1;
    totalResponseArray = [];
    const elemSearchValue = document.querySelector("#searchBar").value.trim().toLowerCase();
    let booksResultsCounter = 0;
    const resultsFoundArray = [];

    try {
        const response = await axios.get(urlBooks);
        const allBooks = response.data;
        // Filter the books based on the search value
        for (const book of allBooks) {
            // Convert book name to lowercase for case-insensitive search
            const bookName = book.name.toLowerCase();
            if (bookName.includes(elemSearchValue)) {
                resultsFoundArray.push(book);
                booksResultsCounter++;
            }
        }
    } catch (error) {
        console.error('Error fetching books data:', error);
    }
    const pagingButtons = document.getElementById("paging-handell");
    if (booksResultsCounter == 0) {
        pagingButtons.innerHTML = `<div>No results found</div>`;
        //booksContainer.style.display = 'none';
    }
    else {
        console.log('Final results:', resultsFoundArray);
        let final = resposeToMappedArray(resultsFoundArray, true);
        console.log(final);
        console.log(final.length);

        buildTable(final[currentPage - 1], final.length)
    }

}


// async function searchBook() {
//     const elemSearchValue = document.querySelector("#searchBar").value.trim().toLowerCase();
//     let booksResultsCounter = 0;
//     let pageForSearch = 1;
//     const resultsFoundArray = [];

//     while (booksResultsCounter < 10) {
//         try {
//             const response = await axios.get(`${urlBooks}?_page=${pageForSearch}&_limit=40`);
//             console.log(`Fetching page: ${pageForSearch}`, response);

//             const pageData = response.data;
//             console.log(pageData.length);
//             if (!Array.isArray(pageData) || pageData.length === 0) {
//                 console.log("No more pages to fetch.");
//                 break; // Exit the loop if no more pages to fetch
//             }
//             for (const book of pageData) {
//                 if (book.name.toLowerCase().includes(elemSearchValue)) {
//                     // Check if the book is already in the resultsFoundArray
//                     if (!resultsFoundArray.some(b => b.id === book.id)) {
//                         const bookData = await printResult(book.id);
//                         if (bookData) {
//                             resultsFoundArray.push(bookData);
//                             booksResultsCounter++;
//                             console.log(`Books found: ${booksResultsCounter}`, resultsFoundArray);
//                             if (booksResultsCounter >= 10) {
//                                 break;
//                             }
//                         }
//                     }
//                 }
//             }
//             pageForSearch++;
//         } catch (error) {
//             console.error('Error fetching books data:', error);
//             break;
//         }
//     }

//     console.log('Final results:', resultsFoundArray);
// }

// async function printResult(id) {
//     try {
//         const response = await axios.get(`${urlBooks}/${id}`);
//         return response.data;
//     } catch (error) {
//         console.error(`Error fetching book with ID ${id}:`, error);
//         return null;
//     }
// }


