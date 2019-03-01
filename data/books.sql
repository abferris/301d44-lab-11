DROP TABLE IF EXISTS books;

CREATE TABLE IF NOT EXISTS books (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255),
  author VARCHAR(255),
  image_url VARCHAR (255),
  description TEXT,
  isbn VARCHAR(255),
  bookshelf VARCHAR(30)
);

INSERT INTO books (title, author, image_url, description, isbn, bookshelf) VALUES ('Test 1', 'Author 1', 'https://i.imgur.com/J5LVHEL.jpg', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.', '123456789123', 'Test Shelf');

INSERT INTO books (title, author, image_url, description, isbn, bookshelf) VALUES ('Test 2', 'Author 2', 'https://i.imgur.com/J5LVHEL.jpg', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.', '123456789123', 'Test Shelf');

