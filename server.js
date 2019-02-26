'use strict';

// Dependencies
const express = require('express');
const superagent = require('superagent');

require('dotenv').config();

// Setup
const app = express();
const PORT = process.env.PORT || 3000;

//  Middleware
app.use(express.urlencoded({ extended: true }));

// file locations for ejs templates and static files
app.set('view engine', 'ejs');
app.use(express.static('./public'));

// API Routes
//search form
app.get('/', newSearch);

// Creates a new search to the Google Books API
app.post('/searches', createSearch);

// Catch-all
app.get('*', (request, response) => response.status(404).send('This route does not exist'));

app.listen(PORT, () => console.log(`Listening on port: ${PORT}`));

// HELPER FUNCTIONS
// Only show part of this to get students started
function Book(info) {
  this.title = info.title || 'No Title Avaialble';
  this.author = info.authors || 'No Author Available';
  this.description = info.description || 'No Description Available';
  this.image = info.imageLinks.thumbnail || info.imageLinks.smallThumbnail || 'https://i.imgur.com/J5LVHEL.jpg';
}

// Note that .ejs file extension is not required
function newSearch(request, response) {
  response.render('pages/index'); //location for ejs files
  app.use(express.static('./public'));//location for other files like css
}

// No API key required
// Console.log request.body and request.body.search
function createSearch(request, response) {
  let url = 'https://www.googleapis.com/books/v1/volumes?q=';

  console.log(request.body)
  console.log(request.body.search)

  if (request.body.search[1] === 'title') { url += `+intitle:"${request.body.search[0]}"`; }
  if (request.body.search[1] === 'author') { url += `+inauthor:"${request.body.search[0]}"`; }

  console.log(url);

  superagent.get(url)
    .then(apiResponse => apiResponse.body.items.map(bookResult => new Book(bookResult.volumeInfo)))
    .then(results => response.render('pages/searches/show', { searchesResults: results }));

  // how will we handle errors?
}
