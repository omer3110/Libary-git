const axios = require('axios');
const fs = require('fs');

// Function to fetch book data from Google Books API
async function fetchBooks(query, apiKey, lang = 'en', maxResults = 40) {
    try {
        const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&key=${apiKey}&langRestrict=${lang}&maxResults=${maxResults}`;
        const response = await axios.get(url);
        return response.data.items || [];
    } catch (error) {
        console.error('Error fetching books data:', error);
        return [];
    }
}

// Replace 'YOUR_API_KEY' with your actual Google Books API key
const apiKey = 'AIzaSyA4MbElo3pGouFM64WRi5dvxX0StFRG_BA';

// Queries to fetch diverse books
const queries = [
    "fiction",
    "nonfiction",
    "mystery",
    "science fiction",
    "fantasy",
    "biography",
    "history",
    "romance",
    "horror",
    "self-help",
    "business",
    "travel"
    // Add more genres here if needed
];

let books = [];
let bookId = 1;
const maxBooks = 1000; // Maximum number of books to fetch

async function fetchBooksData() {
    let totalBooks = 0;
    for (const query of queries) {
        const items = await fetchBooks(query, apiKey);
        for (const item of items) {
            const volumeInfo = item.volumeInfo || {};
            books.push({
                id: bookId,
                name: volumeInfo.title || 'No Title',
                authors: volumeInfo.authors || ['Unknown'],
                num_pages: volumeInfo.pageCount || 0,
                short_description: volumeInfo.description || 'No Description',
                image: (volumeInfo.imageLinks && volumeInfo.imageLinks.thumbnail) || 'https://example.com/no-image.jpg',
                num_copies: 5, // Default number of copies
                categories: volumeInfo.categories || ['Uncategorized'],
                ISBN: volumeInfo.industryIdentifiers ? volumeInfo.industryIdentifiers.find(id => id.type === 'ISBN_10' || id.type === 'ISBN_13')?.identifier : 'N/A'
            });
            bookId++;
            totalBooks++;
            if (totalBooks >= maxBooks) break;
        }
        if (totalBooks >= maxBooks) break;
    }
}

// Fetch books data and write to db.json
fetchBooksData()
    .then(() => {
        const db = {
            books
        };
        fs.writeFileSync('db.json', JSON.stringify(db, null, 4));
        console.log(`db.json file with ${books.length} books has been created.`);
    });
