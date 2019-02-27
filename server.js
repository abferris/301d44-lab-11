'use strict';

// Dependencies
const express = require('express');
const superagent = require('superagent');
const pg = require('pg');
require('dotenv').config();

// Setup
const app = express();
const PORT = process.env.PORT || 3000;

//  Middleware
app.use(express.urlencoded({ extended: true }));
const client = new pg.Client(process.env.DATABASE_URL);
client.connect();
client.on('err', err => console.error(err));

// file locations for ejs templates and static files
app.set('view engine', 'ejs');
app.use(express.static('./public'));

// API Routes
//search form
app.get('/', showBooks);

app.get('/searches', newSearch)


// Creates a new search to the Google Books API
app.post('/results', createSearch);

// Catch-all
app.get('*', (request, response) => response.status(404).send('This route does not exist'));

app.listen(PORT, () => console.log(`Listening on port: ${PORT}`));

// HELPER FUNCTIONS
// Only show part of this to get students started
function Book(info) {
  this.title = info.title;
  this.author = info.authors;
  this.description = info.description ;
  this.image = info.imageLinks ? info.imageLinks.thumbnail: 'https://i.imgur.com/J5LVHEL.jpg';
}

// Note that .ejs file extension is not required
function newSearch(request, response) {
  response.render('pages/searches/new'); //location for ejs files
  app.use(express.static('./public'));//location for other files like css
}

//HELPER FUNCTION

function showBooks(request, response) {
  let SQL = 'SELECT * FROM books;';

  return client.query(SQL)
    .then(results => response.render('pages/index', {results: results.rows}))
    .catch(err => handleError(err, response));
}


// No API key required
// Console.log request.body and request.body.search
function createSearch(request, response) {
  // const SQL= `SELECT * FROM books WHERE id=$1;`;
  let url = 'https://www.googleapis.com/books/v1/volumes?q=';

  console.log(request.body)
  console.log(request.body.search)

  if (request.body.search[1] === 'title') { url += `+intitle:${request.body.search[0]}`; }
  if (request.body.search[1] === 'author') { url += `+inauthor:${request.body.search[0]}`; }
  console.log(url);

  superagent.get(url)
    .then(apiResponse => apiResponse.body.items.map(bookResult => new Book(bookResult.volumeInfo)))
    .then(results => response.render('pages/searches/show', { searchesResults: results}))
    .catch(err => handleError(err, response))
}

function handleError(error,response) {
response.render('pages/error', {error: error});
} 
