'use strict';


// Dependencies
const express = require('express');
const superagent = require('superagent');
const pg = require('pg');
const methodOverride = require('method-override');
require('dotenv').config();

// Setup
const app = express();
const PORT = process.env.PORT || 3000;

// DB Setup
app.use(express.urlencoded({ extended: true }));
const client = new pg.Client(process.env.DATABASE_URL);
client.connect();
client.on('err', err => console.error(err));

// file locations for ejs templates and static files
app.set('view engine', 'ejs');
app.use(express.static('./public'));

// Middleware to handle PUT and DELETE
app.use(methodOverride((request, response) => {
  if (request.body && typeof request.body === 'object' && '_method' in request.body) {
    // look in urlencoded POST bodies and delete it
    let method = request.body._method;
    delete request.body._method;
    return method;
  }
}))

// API Routes
// Show saved library
app.get('/', showBooks);
app.get('/details/:book_id', showDetails);

// Edit details of saved book
app.put('/edit/:book_id', editDetails);

// Delete book from library
app.delete('/delete/:book_id', deleteBook);

//Search for books
app.get('/search', renderSearch);
app.post('/results', newSearch);
app.post('/add', addBook);

// Catch-all
app.get('*', (request, response) => response.status(404).send('This route does not exist'));

// Turn on server
app.listen(PORT, () => console.log(`Listening on port: ${PORT}`));

// HELPER FUNCTIONS
// Constructor for info retrieved from API
function Book(info) {
  this.title = info.title;
  this.author = info.authors;
  this.description = info.description ;
  this.image_url = info.imageLinks ? info.imageLinks.thumbnail: 'https://i.imgur.com/J5LVHEL.jpg';
  this.isbn = info.industryIdentifiers[0].type.includes('ISBN') ? info.industryIdentifiers[0].identifier : 'No ISBN Available'
}

// Display the search page
function renderSearch(request, response) {
  response.render('pages/searches/new-search'); //location for ejs files
  app.use(express.static('./public'));//location for other files like css
}

// Display all saved books
function showBooks(request, response) {
  let SQL = 'SELECT * FROM books;';

  return client.query(SQL)
    .then(results => response.render('pages/index', {results: results.rows}))
    .catch(err => handleError(err, response));
}

// Display details for selected saved book
function showDetails(request, response) {
  let SQL = 'SELECT * FROM books WHERE id=$1;';
  let values = [request.params.book_id];
  return client.query(SQL, values)
    .then((details) => {
      client.query('SELECT DISTINCT bookshelf FROM books;')
        .then((bookshelves) => {
          response.render('pages/books/details', {book: details.rows[0], bookshelves: bookshelves.rows})})
    })
    .catch(err => handleError(err, response));
}

// Edit details of a book in your library from the Details page
function editDetails(request, response) {
  let {title, author, image_url, description, isbn, bookshelf} = request.body;
  let SQL = `UPDATE books SET title=$1, author=$2, image_url=$3, description=$4, isbn=$5, bookshelf=$6 WHERE id=$7;`;
  let values = [title, author, image_url, description, isbn, bookshelf, request.params.book_id];

  client.query(SQL, values)
    .then(response.redirect(`/details/${request.params.book_id}`))
    .catch(err => handleError(err, response));
}

// Delete the current book from your library
function deleteBook(request, response) {
  let SQL = `DELETE FROM books WHERE id=$1;`;
  let values = [request.params.book_id];

  client.query(SQL, values)
    .then(response.redirect('/'))
    .catch(err => handleError(err, response));
}

// Search Google Books API
// No API key required
function newSearch(request, response) {
  let url = 'https://www.googleapis.com/books/v1/volumes?q=';

  console.log(request.body)
  console.log(request.body.search)

  if (request.body.search[1] === 'title') { url += `+intitle:${request.body.search[0]}`; }
  if (request.body.search[1] === 'author') { url += `+inauthor:${request.body.search[0]}`; }
  console.log(url);

  superagent.get(url)
    .then(apiResponse => apiResponse.body.items.map(bookResult => new Book(bookResult.volumeInfo)))
    .then(results => response.render('pages/searches/search-results', { searchesResults: results}))
    .catch(err => handleError(err, response))
}

// Save the selected book to db
function addBook(request, response) {
  console.log('sql request', request.body);
  let {title, author, image_url, description, isbn, bookshelf} = request.body;
  let SQL = `INSERT INTO books(title, author, image_url, description, isbn, bookshelf) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id;`;
  let values = [title, author, image_url, description, isbn, bookshelf];
  let id;

  return client.query(SQL, values)
    .then(result => {
      id = result.rows[0].id;
      console.log('id', id);
      response.redirect(`/details/${id}`);
    })
    .catch(err => handleError(err, response))
}

// Handle Errors
function handleError(error,response) {
  response.render('pages/error', {error: error});
}

