/*
*
*
*       Complete the API routing below
*       
*       
*/

'use strict';
require('dotenv').config();

const { type } = require('express/lib/response');
const mongoose = require('mongoose');
mongoose.connect(process.env.URI, {useNewUrlParser: true});

const {Schema} = mongoose;

const bookTracker = new Schema({
  title: {type: String, required: true},
  commentcount: {type:Number, default: 0},
  comments:{type:[String]}
})

const Book = mongoose.model('Book', bookTracker);
const db = mongoose.connection;


module.exports = function (app) {

  app.route('/api/books')
    .get(function (req, res){
      //response will be array of book objects
      //json res format: [{"_id": bookid, "title": book_title, "commentcount": num_of_comments },...

      Book.find().then(data=>{
        res.status(200).json(data);
      });

    })
    
    .post(function (req, res){
      let title = req.body.title;
      //response will contain new book object including atleast _id and title

      if(!title){return res.status(200).send('missing required field title')};

      const entry = new Book({
        title: title
      });

      entry.save().then(data=>{
        res.status(200).json({
          _id: data._id,
          title: data.title,
        });
      });

    
    })
    
    .delete(function(req, res){
      db.collection('books').drop().then(result =>{
        if(result) return res.status(200).send('complete delete successful');
        if(!result) return res.status(200).send('failed');
      })
    });



  app.route('/api/books/:id')
    .get(function (req, res){
      let bookid = req.params.id;
      //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}

      Book.findOne({_id: bookid}).then(data=>{
        if(!data){return res.status(200).send('no book exists')};
        if(data){return res.status(200).json(data)};

      }).catch(err=>{
        res.status(200).send('no book exists');
        console.error(err);
      });
    
    
    })

    .post(function(req, res) {
      let bookid = req.params.id;
      let comment = req.body.comment;
    
      // Case 1: Missing comment
      if (!comment) {
        return res.status(200).send('missing required field comment');
      }
    
      // Case 2: Find the book and add a comment
      Book.findByIdAndUpdate(
        bookid,
        { $push: { comments: comment }, $inc: { commentcount: 1 } },
        { new: true } // Return the updated book object
      ).exec()
        .then(book => {
          if (!book) {
            // Case 3: No book exists with the given ID
            return res.status(200).send('no book exists');
          }
    
          // Case 4: Book found and updated, return in expected format
          return res.status(200).json({
            _id: book._id,
            title: book.title,
            comments: book.comments
          });
        })
        .catch(err => {
          // Catch-all error handler
          console.error(err); // Log the error for debugging purposes
          return res.status(200).send('no book exists');
        });
    })
    
    
    .delete(function(req, res){
      let bookid = req.params.id;
      Book.findByIdAndDelete(bookid).exec().then(data=>{
        if(!data) return res.status(200).send('no book exists');
        if(data) return res.status(200).send('delete successful');
      }).catch(err =>{
        console.error(err);
        return res.status(200).send('no book exists');
      })
    });
  
};
