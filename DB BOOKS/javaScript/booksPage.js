// Project 

const urlBooks = "http://localhost:8001/books";
const urlHistory = "http://localhost:8001/history";
const urlFavorites = "http://localhost:8001/favorites";

const booksContainer = document.getElementById("books-container");
let elemMessage = document.querySelector('.message');
let currentPage = 1;
let favoriteBooksArray = JSON.parse(localStorage.getItem("favorite-books")) || [];


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
    const totalPages = Math.ceil(apiResponse.length / 5);
    for (let i = 0; i < totalPages; i++) {
        const newPageArray = [];
        const startIndex = i * 5;
        const endIndex = Math.min(startIndex + 5, apiResponse.length);
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
        currentBookContentDiv.innerHTML = `<div class="book-name-and-fav-icon-wrapper"><p>Book Name : ${book.name}</p><span class="favorite-icon" onclick="toggleFavorite(this,${book.id})">☆</span> </div><p>Authors : ${book.authors}</p>`;
        let elemNew = document.querySelector('.favorite-icon')
        console.log(elemNew);
        currentBook.appendChild(image);
        currentBook.appendChild(currentBookContentDiv);

        listOfBooksDiv.appendChild(currentBook);
        currentBook.addEventListener('click', () => displayBookInfo(book)); // Add click event listener
    }
    booksContainer.appendChild(listOfBooksDiv);
}
function toggleFavorite(element, bookId) {
    if (element.classList.contains("filled")) {

        console.log("Favorite marked");
        // Do something when the star is filled (marked as favorite)
    } else {
        console.log("Favorite unmarked");
        console.log(bookId);
        let url = `${urlBooks}/${bookId}`
        axios.get(url)
            .then(response => {
                response = response.data;
                favoriteBooksArray.push(response);
                addBookToFavJson(response);
                localStorage.setItem("favorite-books", JSON.stringify(favoriteBooksArray));
                console.log(response);
            })
            .catch(error => console.error('Error:', error));
        // Do something when the star is unfilled (unmarked as favorite)
    }
    element.classList.toggle("filled");

}
function addBookToFavJson(bookData) {
    console.log(bookData);
    axios.post(urlFavorites, bookData)
        .then(response => {
            showMessage("Book added successfully!", true);
            console.log(response.data.id);
            addToHistory("Add to favorites", new Date, response.data.id)
        })
        .catch(error => showMessage("Failed to added!", false));
}
function removeBookFromFavJson(bookId) {
    let url = `${urlFavorites}/${bookId}`;
    axios.delete(url)
        .then(response => {
            addToHistory("Removed from favorites", new Date, bookId)
        })
        .catch(error => showMessage(`Failed to remove book ${bookId}!`, false));
}
function showFavorites() {

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
    const url = `${urlBooks}/${book.id}`;
    axios.get(url)
        .then(response => {
            response = response.data;
            bookInfoDiv.innerHTML = `
        <h2>${book.name}</h2>
        <div class="img-and-info"><img src="${response.image}" alt="${response.name}" style="max-height: 600px;">
            <div> <p><strong>Author(s):</strong> ${response.authors}</p>
            <p><strong>Number of Pages:</strong> ${response.num_pages}</p>
            <div><p class="num-of-copies"><strong>Number of Copies:</strong> ${response.num_copies}</p> <button onclick="updateBookCopies(${response.id}, 'increase')">+</button> <button onclick="updateBookCopies(${response.id}, 'decrease')">-</button></div>
            <p><strong>Categories:</strong> ${response.categories}</p> </div>
         </div>
        <p><strong>Short Description:</strong> ${response.short_description}</p>
        <p><strong>ISBN:</strong> ${response.ISBN}</p>
        <button onclick="deleteBook(${response.id})">Delete book</button>
    `;
            modal.style.display = "block";
        })
        .catch(error => console.error('Error:', error));

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
        .catch(error => showMessage("Failed to create new book!", false));
}
function clearNewBookForm() {
    document.querySelector('#BookName').value = '';
    document.querySelector('#Authors').value = '';
    document.querySelector('#NumPages').value = '';
    document.querySelector('#description').value = '';
    document.querySelector('#img').value = '';
    document.querySelector('#numOfCopies').value = '';
    document.querySelector('#categories').value = '';
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
        const elemNumOfCopies = document.querySelector('.num-of-copies');
        elemNumOfCopies.innerHTML = `<strong>Number of Copies:</strong> ${currentAmountOfCopies}`;
        addToHistory("update", new Date, id);

    } catch (error) {
        showMessage(`Failed to ${action} book ${id} copies!`, false);
        console.error('Error:', error);
    }

}

function deleteBook(id) {
    axios.delete(`${urlBooks}/${id}`)
        .then(response => {
            console.log("Book deleted")
            showMessage(`Book ${id} deleted successfully!`, true);
            addToHistory("delete", new Date, id)
        })
        .catch(error => showMessage(`Failed to delete book ${id}!`, false));

}

function addToHistory(operation, time, bookId) {
    axios.post(urlHistory, { operation: operation, time: time, bookId: bookId })
        .then(response => {
            console.log("History added successfully!");
        })
        .catch(error => console.error('Error adding to history:', error));
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
    const elemSearchValue = document.querySelector("#searchBar").value.trim().toLowerCase();
    if (elemSearchValue !== "") {


        let booksResultsCounter = 0;
        const resultsFoundArray = [];
        currentPage = 1;
        totalResponseArray = [];
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
        const listOfBooksDiv = document.querySelector(".book-list")
        if (booksResultsCounter == 0) {
            pagingButtons.innerHTML = `<div>No results found</div>`;
            listOfBooksDiv.style.display = 'none';
        }
        else {
            console.log('Final results:', resultsFoundArray);
            let final = resposeToMappedArray(resultsFoundArray, true);
            console.log(final);
            console.log(final.length);

            buildTable(final[currentPage - 1], final.length)
        }
    }

}
fetchAndBuildTable();

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


