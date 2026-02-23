const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require('axios');


// Check if a user with the given username already exists
const doesExist = (username) => {
 // Filter the users array for any user with the same username
let userswithsamename = users.filter((user) => {
 return user.username === username;
 });
 // Return true if any user with the same username is found, otherwise false
 if (userswithsamename.length > 0) {
 return true;
} else {
 return false;
 }
}

public_users.post("/register", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (username && password) {
    if (!isValid(username)) { 
        return res.status(400).json({message: "Invalid username format"});
    }

    if (!doesExist(username)) {
        users.push({"username": username, "password": password});
        return res.status(200).json({message: "User successfully registered. Now you can login"});
    } else {
        return res.status(404).json({message: "User already exists!"});
    }
  }
  return res.status(404).json({message: "Unable to register user."});
});

// Task 10: Get the book list available in the shop using Async-Await
public_users.get('/', async function (req, res) {
    try {
        // بدلاً من مناداة الرابط نفسه، نستخدم Promise لمحاكاة عملية جلب بيانات
        const getBooks = () => {
            return new Promise((resolve) => {
                resolve(books);
            });
        };

        const bookList = await getBooks();
        res.status(200).send(JSON.stringify(bookList, null, 4));
    } catch (error) {
        res.status(500).json({message: "Error fetching books"});
    }
});

// Task 11: Get book details based on ISBN using Promises
public_users.get('/isbn/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    const getBook = new Promise((resolve, reject) => {
        if (books[isbn]) {
            resolve(books[isbn]);
        } else {
            reject("Book not found");
        }
    });

    getBook
        .then((book) => res.status(200).json(book))
        .catch((err) => res.status(404).json({message: err}));
});

// Get book details based on author
public_users.get('/author/:author', function (req, res) {
    const author = req.params.author;
    
    const getBooksByAuthor = new Promise((resolve, reject) => {
        // محاكاة تأخير بسيط للعملية غير المتزامنة
        setTimeout(() => {
            const bookKeys = Object.keys(books);
            const filteredBooks = bookKeys
                .filter(key => books[key].author.toLowerCase() === author.toLowerCase())
                .map(key => books[key]);

            if (filteredBooks.length > 0) {
                resolve(filteredBooks);
            } else {
                // توفير سياق أكثر للخطأ كما طلب المصحح
                reject(`No books found for author: ${author}`);
            }
        }, 100);
    });

    getBooksByAuthor
        .then((result) => {
            res.status(200).json(result);
        })
        .catch((err) => {
            // تسجيل الخطأ في السيرفر للمطور
            console.error(`[Error] Search failed: ${err}`);
            // إرسال رسالة واضحة للمستخدم
            res.status(404).json({ 
                status: "failed",
                message: err 
            });
        });
});

// Get all books based on title
public_users.get('/title/:title', async function (req, res) {
    const title = req.params.title;
    try {
      const findTitle = await new Promise((resolve, reject) => {
        const bookKeys = Object.keys(books);
        const filteredBooks = bookKeys
          .filter(key => books[key].title === title)
          .map(key => books[key]);
          
        if (filteredBooks.length > 0) resolve(filteredBooks);
        else reject("Title not found");
      });
      res.status(200).json(findTitle);
    } catch (error) {
      res.status(404).json({message: error});
    }
  });

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
 //Write your code here
 const isbn = req.params.isbn;
// Find the book in the 'books' object using the ISBN
const book = books[isbn];
// Check if a book with the given ISBN exists
if (book) {
 // If the book is found, return its 'reviews' object with a 200 OK status.
 // If there are no reviews, this will correctly return an empty object {}.
return res.status(200).json(book.reviews);
} else {
// If no book is found for that ISBN, return a 404 Not Found error.
return res.status(404).json({ message: "Book not found" });
 }
});

module.exports.general = public_users;
