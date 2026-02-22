const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
//write code to check is the username is valid
return username && username.length > 0;
}

const authenticatedUser = (username,password)=>{ //returns boolean
//write code to check if username and password match the one we have in records.
 // Filter the users array for any user with the same username and password
 let validusers = users.filter((user) => {
    return (user.username === username && user.password === password);
});
// Return true if any valid user is found, otherwise false
if (validusers.length > 0) {
    return true;
} else {
    return false;
}
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  //Write your code here
  const username = req.body.username;
    const password = req.body.password;

    // Check if username or password is missing
    if (!username || !password) {
        return res.status(404).json({ message: "Error logging in" });
    }

    // Authenticate user
    if (authenticatedUser(username, password)) {
        // Generate JWT access token
        let accessToken = jwt.sign({
            data: password
        }, 'access', { expiresIn: 60*60 });

        // Store access token and username in session
        req.session.authorization = {
            accessToken, username
        }
        return res.status(200).send("User successfully logged in");
    } else {
        return res.status(208).json({ message: "Invalid Login. Check username and password" });
    }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    let review = req.query.review;
    
    // التأكد من وجود الجلسة
    if (req.session.authorization) {
      let username = req.session.authorization['username'];
      let book = books[isbn];
      
      if (book) {
        // إضافة أو تحديث المراجعة
        book.reviews[username] = review;
        return res.status(200).send(`The review for the book with ISBN ${isbn} has been added/updated.`);
      } else {
        return res.status(404).json({message: "Book not found"});
      }
    }
    return res.status(403).json({message: "User not logged in"});
  });

regd_users.delete("/auth/review/:isbn",(req,res)=>{
    const isbn = req.params.isbn;
  
  // 1. التأكد من وجود الجلسة واسم المستخدم
  if (req.session.authorization) {
    let username = req.session.authorization['username'];
    let book = books[isbn];

    if (book) {
      // 2. التحقق من وجود مراجعة لهذا المستخدم لهذا الكتاب
      if (book.reviews[username]) {
        // 3. حذف مراجعة المستخدم الحالي فقط
        delete book.reviews[username];
        return res.status(200).send(`Reviews for the ISBN ${isbn} posted by the user ${username} deleted.`);
      } else {
        return res.status(404).json({ message: "No review found for this user on this book" });
      }
    } else {
      return res.status(404).json({ message: "Book not found" });
    }
  }
  
  // 4. في حال عدم وجود جلسة فعالة
  return res.status(403).json({ message: "User not logged in" });
});
module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
