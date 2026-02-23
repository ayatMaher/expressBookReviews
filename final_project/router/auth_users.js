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
    const username = req.body.username;
    const password = req.body.password;

    if (!username || !password) {
        return res.status(404).json({ message: "Error logging in" });
    }

    if (authenticatedUser(username, password)) {
        let accessToken = jwt.sign({
            data: password
        }, 'access', { expiresIn: 60 * 60 });

        req.session.authorization = {
            accessToken, username
        }

        // التعديل المطلوب: الرسالة يجب أن تكون "Login successful!" حرفياً
        return res.status(200).json({ message: "Login successful!" });
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
        
        // التعديل المطلوب: إرسال رسالة النجاح مع المراجعات بتنسيق JSON
        return res.status(200).json({
            message: "Review added/updated successfully",
            reviews: book.reviews
        });
      } else {
        return res.status(404).json({message: "Book not found"});
      }
    }
    return res.status(403).json({message: "User not logged in"});
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;

  if (req.session.authorization) {
    let username = req.session.authorization['username'];
    let book = books[isbn];

    if (book) {
      if (book.reviews[username]) {
        // حذف مراجعة المستخدم الحالي
        delete book.reviews[username];

        // التعديل المطلوب: الرسالة يجب أن تكون JSON ومطابقة تماماً للمرجع
        return res.status(200).json({ 
            message: `Review for ISBN ${isbn} deleted` 
        });
      } else {
        return res.status(404).json({ message: "No review found for this user" });
      }
    } else {
      return res.status(404).json({ message: "Book not found" });
    }
  }
  return res.status(403).json({ message: "User not logged in" });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
