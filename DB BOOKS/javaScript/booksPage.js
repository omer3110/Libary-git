// Global URL's
const urlBooks = "http://localhost:8001/books";
const urlHistory = "http://localhost:8001/history";
const urlFavorites = "http://localhost:8001/favorites";

const booksContainer = document.getElementById("books-container");
let elemMessage = document.querySelector('.message');
let currentPage = 1;
const selectElement = document.getElementById("typeOfCreation");
let elemSuccessMessage = document.querySelector(".success-message");
let fellFreeMessage = document.getElementById('feel-free');

let totalResponseArray = [];

document.querySelector('#new-book-form-container').addEventListener('submit', function (event) {
    event.preventDefault();
    newBook();
});

document.querySelector('#searchBarForm').addEventListener('submit', function (event) {
    event.preventDefault();
    searchBook();
});

function showLoader() {
    const loader = document.querySelector('.loader');
    loader.style.display = 'block';
}

function hideLoader() {
    const loader = document.querySelector('.loader');
    loader.style.display = 'none';
}

function showForm(formId) { // this function shows the form of create book when triggered
    const form = document.getElementById(formId)
    form.style.display = "flex"
    form.style.flexDirection = "column"
    form.style.alignItems = "center"
}

function hideForm(formId) {
    const form = document.getElementById(formId)
    form.style.display = "none"
}

function resposeToMappedArray(apiResponse) { // this function gets api data and returns it as an array
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

function fetchAndBuildTable() { // this function makes api request and build the list of books

    booksContainer.innerHTML = `<div class="loader">
                                    <div></div>
                                    <div></div>
                                    <div></div>
                                    <div></div>
                                    <div></div>
                                </div>`;
    showLoader()
    booksContainer.style.display = 'flex'
    booksContainer.style.flexDirection = 'column'
    booksContainer.style.alignItems = 'space-around'
    const elemLoader = document.querySelector('.loader')
    elemLoader.style.alignSelf = 'center'

    currentPage = 1;
    totalResponseArray = [];
    axios.get(urlBooks)
        .then(response => {
            setTimeout(() => {
                totalResponseArray = resposeToMappedArray(response.data);
                buildTable(totalResponseArray[currentPage - 1], totalResponseArray.length);
            }, 1500);
     
        })
        .catch(error => console.log(error))
}

function nextHandler(type) { // next handler of paging
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

function previousHandler(type) { // previos handler of paging
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

function buildTable(data, totalPages) { // this func recives data and print the list of books
    booksContainer.innerHTML = "";

    const buttonContainer = document.createElement("div");
    buttonContainer.classList.add("button-container");

    const pagingButtons = document.createElement("div");
    pagingButtons.setAttribute("id", "paging-handell");
    pagingButtons.innerHTML = `<div>page ${currentPage} out of ${totalPages}</div><div id="pages-arrows"><button onclick="previousHandler()"><</button><button onclick="nextHandler()">></button></div>`;
    buttonContainer.appendChild(pagingButtons);

    booksContainer.appendChild(buttonContainer);

    const listOfBooksDiv = document.createElement("div");
    listOfBooksDiv.classList.add("book-list");
    // for loop that runs on every book of the data
    for (let i = 0; i < data.length; i++) {
        const book = data[i];
        const currentBook = document.createElement("div");
        currentBook.classList.add("each-book-in-list");

        const image = document.createElement("img");
        image.src = book.image;
        image.style.maxHeight = "100px";
        const currentBookContentDiv = document.createElement("div");
        currentBookContentDiv.classList.add('each-book-content-wrapper');
        currentBookContentDiv.innerHTML = `<div class="book-name-and-fav-icon-wrapper"><p><strong>Book Name :</strong> ${book.name}</p></div><p><strong>Authors :</strong> ${book.authors}</p>`;
        let favoriteIcon = document.createElement("span");
        favoriteIcon.innerHTML = '☆';
        favoriteIcon.classList.add('favorite-icon')
        favoriteIcon.addEventListener('click', () => toggleFavorite(favoriteIcon, book.id)); // Add click event listener
        currentBookContentDiv.appendChild(favoriteIcon);

        currentBook.appendChild(image);
        currentBook.appendChild(currentBookContentDiv);
        fetchFavoritesWithBookList(book.id, favoriteIcon)

        listOfBooksDiv.appendChild(currentBook);
        currentBook.addEventListener('click', () => displayBookInfo(book)); // Add click event listener
    }
    booksContainer.appendChild(listOfBooksDiv);
}

function toggleFavorite(element, bookId) { // this func toggle when favorite star is triggered
    if (element.classList.contains("filled")) {
        console.log("Favorite marked");
        removeBookFromFavJson(bookId);
    } else {
        console.log("Favorite unmarked");
        let url = `${urlBooks}/${bookId}`
        axios.get(url)
            .then(response => {
                response = response.data;
                addBookToFavJson(response);
            })
            .catch(error => console.error('Error:', error));
    }
    element.classList.toggle("filled");
}

function addBookToFavJson(bookData) { // add the favorite book to history
    axios.post(urlFavorites, bookData)
        .then(response => {
            showMessage("Book added successfully!", true);
            addToHistory("Add to favorites", response.data.id, response.data.name, new Date);
        })
        .catch(error => showMessage("Failed to added!", false));
}

function removeBookFromFavJson(bookId) { // remove the favorite book from history
    let url = `${urlFavorites}/${bookId}`;
    axios.delete(url)
        .then(response => {
            addToHistory("Removed from favorites", response.data.id, response.data.name, new Date);
        })
        .catch(error => showMessage(`Failed to remove book ${bookId}!`, false));
}

function showFavorites() { // this func print the favorite book list to page
    currentPage = 1;
    totalResponseArray = [];
    booksContainer.style.display = 'block';

    axios.get(urlFavorites)
        .then(response => {
            response = response.data;
            if (response.length == 0) {
                const listOfBooksDiv = document.querySelector(".book-list")
                const pagingButtons = document.getElementById("paging-handell");
                pagingButtons.innerHTML = `<div>No favorites books chosen</div>`;
                listOfBooksDiv.style.display = 'none';
            }
            else {
                let favResponse = resposeToMappedArray(response);
                buildTable(favResponse[currentPage - 1], favResponse.length)
            }
        })
        .catch(error => console.error('Error:', error));
}
async function fetchFavoritesWithBookList(bookId, elem) { // this func render the favorite books so they be marked when page refreshing
    try {
        const response = await axios.get(urlFavorites);
        const favArr = response.data;
        const isFavorite = favArr.some(favBook => favBook.id === bookId);
        if (isFavorite) {
            elem.classList.add("filled");
        }
    } catch (error) {
        console.log("Error fetching favorites:", error);
    }
}

function showHistory() { // this func print the history of actions
    currentPage = 1;
    totalResponseArray = [];
    axios.get(urlHistory)
        .then(response => {
            totalResponseArray = resposeToMappedArray(response.data);
            buildHistory(totalResponseArray[currentPage - 1], totalResponseArray.length);
        })
        .catch(error => console.log(error));
}

function buildHistory(data, totalPages) {
    booksContainer.innerHTML = "";

    const buttonContainer = document.createElement("div");
    buttonContainer.classList.add("button-container");

    const pagingButtons = document.createElement("div");
    pagingButtons.setAttribute("id", "paging-handell");
    pagingButtons.innerHTML = `<div>page ${currentPage} out of ${totalPages}</div><div id="pages-arrows"><button onclick="previousHandler('history')"><</button><button onclick="nextHandler('history')">></button></div>`;
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
        currentActionDiv.innerHTML = `<p>Action operation : ${action.operation}</p><p>Book ID : ${action.bookId}</p><p>Book Name : ${action.bookName}</p> <p>Action time : ${action.time}</p> `;


        currentBook.appendChild(currentActionDiv);
        listOfBooksDiv.appendChild(currentBook);
    }
    booksContainer.appendChild(listOfBooksDiv);
}

function addToHistory(operation, bookId, bookName, time) { // add to history
    axios.post(urlHistory, { operation: operation, bookId: bookId, bookName: bookName, time: time })
        .then(response => {
            console.log("History added successfully!");
        })
        .catch(error => console.error('Error adding to history:', error));
}

function displayBookInfo(book) { // display the book info on page when clicked
    console.log(book);
    const modal = document.getElementById("modal");
    const bookInfoDiv = document.getElementById("book-info");
    const url = `${urlBooks}/${book.id}`;

    axios.get(url)
        .then(response => {
            response = response.data
            bookInfoDiv.innerHTML = `
        <h2>${response.name}</h2>
        <div class="img-and-info"><img src="${response.image}" alt="${response.name}" style="max-height:200px;">
            <div class="right-to-img-info"> <p><strong>Author(s):</strong> ${response.authors}</p>
            <p><strong>Number of Pages:</strong> ${response.num_pages}</p>
            <div class="copies-and-buttons"><p class="num-of-copies"><strong>Number of Copies:</strong> ${response.num_copies}</p><div class="increase-and-decrease-buttons"><button onclick="updateBookCopies(${response.id}, 'increase')">+</button> <button onclick="updateBookCopies(${response.id}, 'decrease')">-</button></div></div>
            <p><strong>Categories:</strong> ${response.categories}</p> </div>
         </div>
        <p><strong>Short Description:</strong> ${response.short_description}</p>
        <p><strong>ISBN:</strong> ${response.ISBN}</p>
        <button class="delete-book-button" onclick="deleteBook(${response.id})">Delete book</button>
    `;
            modal.style.display = "block";
        })
        .catch(error => console.error('Error:', error));


    const closeModalBtn = document.querySelector('.close-modal-btn');
    closeModalBtn.style.display = "inline"
    closeModalBtn.onclick = function () {
        closeModalBtn.style.display = "none";
        bookInfoDiv.innerHTML = `<p id="feel-free">Feel free to search a book... <i class="fa-regular fa-face-smile"></i></p>`;
        modal.style.display = "flex"
    };
}

function newBook() { // add new book to the list
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
            addToHistory("Creation", response.data.id, response.data.name, new Date)
            setTimeout(() => {
                hideForm('new-book-form-container')
                clearNewBookForm()
            }, 1000)
        })
        .catch(error => showMessage("Failed to added!", false));
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

async function updateBookCopies(id, action) { // update book copies
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
        addToHistory("update copies", id, book.name, new Date);

    } catch (error) {
        showMessage(`Failed to ${action} book ${id} copies!`, false);
        console.error('Error:', error);
    }
}

function deleteBook(id) {
    const modal = document.querySelector('.modal')
    const elemDeleteBookMessage = document.querySelector('.delete-book-message')
    axios.delete(`${urlBooks}/${id}`)
        .then(response => {
            removeBookFromFavJson(id);
            addToHistory("Deletion", new Date, id);
            elemDeleteBookMessage.style.color = 'red';
            elemDeleteBookMessage.textContent = "Deleting Book...";

            setTimeout(() => {
                fetchAndBuildTable();
                elemDeleteBookMessage.textContent = "";
                modal.innerHTML = `<p>Feel free to search a book...<i class="fa-regular fa-face-smile"></i></p>`;
                modal.style.display = 'flex';
            }, 1000);

        })
        .catch(error => showMessage(`Failed to delete book ${id}!`, false));

}

function showMessage(message, isSuccess) {
    elemMessage.textContent = message;
    elemMessage.style.color = isSuccess ? '#45a049' : '#ba1111';
    setTimeout(() => {
        elemMessage.textContent = '';
    }, 3000);
}

async function searchBook() { // this func search a book by name
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
            let final = resposeToMappedArray(resultsFoundArray);
            buildTable(final[currentPage - 1], final.length)
        }
    }
}

fetchAndBuildTable();




