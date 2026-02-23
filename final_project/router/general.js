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
    // التحقق مما إذا كان المستخدم موجوداً مسبقاً
    if (doesExist(username)) {
      return res.status(409).json({message: "User already exists!"});
    } else {
      users.push({"username": username, "password": password});
      return res.status(200).json({message: "User successfully registered. Now you can login"});
    }
  } 
  return res.status(400).json({message: "Unable to register user. Provide username and password."});
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
        .then((book) => res.status(200).json({
            status: "Success",
            code: 200,
            message: "Endpoint verified successfully",
            data: book
        }))
        .catch((err) => {
            res.status(404).json({
                status: "Error",
                code: 404,
                message: err
            });
        });
});

// Get book details based on author
public_users.get('/author/:author', function (req, res) {
    const author = req.params.author;
    
    const getBooksByAuthor = new Promise((resolve, reject) => {
        setTimeout(() => {
            const bookKeys = Object.keys(books);
            const filteredBooks = bookKeys
                .filter(key => books[key].author.toLowerCase() === author.toLowerCase())
                .map(key => books[key]);

            if (filteredBooks.length > 0) {
                resolve(filteredBooks);
            } else {
                reject(`No books found for author: ${author}`);
            }
        }, 100);
    });

    getBooksByAuthor
        .then((result) => {
            // التعديل: إرسال JSON يحتوي على كود الحالة وبيان النجاح
            res.status(200).json({
                status: "Success",
                code: 200,
                message: "Author endpoint verified successfully",
                data: result
            });
        })
        .catch((err) => {
            console.error(`[Error] Search failed: ${err}`);
            // التعديل: إرسال JSON يحتوي على كود الخطأ 404 للفشل
            res.status(404).json({ 
                status: "Error",
                code: 404,
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
                .filter(key => books[key].title.toLowerCase() === title.toLowerCase())
                .map(key => books[key]);
            
            if (filteredBooks.length > 0) {
                resolve(filteredBooks);
            } else {
                reject(`Book with title '${title}' not found`);
            }
        });

        // حالة النجاح: إرسال JSON منظم مع كود 200
        res.status(200).json({
            status: "Success",
            code: 200,
            message: "Title endpoint verified successfully",
            data: findTitle
        });
    } catch (error) {
        // حالة الفشل (الاختبار السلبي): إرسال كود 404
        res.status(404).json({
            status: "Error",
            code: 404,
            message: error
        });
    }
});

//  Get book review
public_users.get('/review/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    const book = books[isbn];

    if (book) {
        // التحقق مما إذا كان كائن المراجعات فارغاً
        if (Object.keys(book.reviews).length === 0) {
            return res.status(200).json({ 
                message: `No reviews found for the book with ISBN ${isbn}`,
                reviews: {} 
            });
        }
        // إذا وجدت مراجعات، يتم إرسالها
        return res.status(200).json(book.reviews);
    } else {
        return res.status(404).json({ message: "Book not found" });
    }
});

module.exports.general = public_users;
