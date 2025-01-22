/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       
*/

const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {

  /*
  * ----[EXAMPLE TEST]----
  * Each test should completely test the response of the API end-point including response status code!
  */
  test('#example Test GET /api/books', function(done){
     chai.request(server)
      .get('/api/books')
      .end(function(err, res){
        assert.equal(res.status, 200);
        assert.isArray(res.body, 'response should be an array');
        assert.property(res.body[0], 'commentcount', 'Books in array should contain commentcount');
        assert.property(res.body[0], 'title', 'Books in array should contain title');
        assert.property(res.body[0], '_id', 'Books in array should contain _id');
        done();
      });
  });
  /*
  * ----[END of EXAMPLE TEST]----
  */

  let id;
suite('Routing tests', function () {

  suite('POST /api/books with title => create book object/expect book object', function () {

    test('Test POST /api/books with title', function (done) {
      chai
        .request(server)
        .keepOpen()
        .post('/api/books')
        .send({ title: "test title" })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.deepInclude(res.body, { title: "test title" });
          assert.property(res.body, "_id");
          id = String(res.body._id); // Save the valid id for further tests
          done();
        });
    });

    test('Test POST /api/books with no title given', function (done) {
      chai
        .request(server)
        .keepOpen()
        .post('/api/books')
        .send({})
        .end((req, res) => {
          console.log(res.body)
          assert.equal(res.status, 200); // Use 200 for bad request
          assert.equal(res.text, 'missing required field title');
          done();
        });
    });

  });

  suite('GET /api/books => array of books', function () {

    test('Test GET /api/books', function (done) {
      chai
        .request(server)
        .keepOpen()
        .get('/api/books')
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.isArray(res.body);
          res.body.forEach(book => {
            assert.isObject(book);
            assert.property(book, "title");
            assert.property(book, "_id");
            assert.property(book, "commentcount");
            assert.isArray(book.comments);
          });
          done();
        });
    });

  });

  suite('GET /api/books/[id] => book object with [id]', function () {

    test('Test GET /api/books/[id] with id not in db', function (done) {
      chai
        .request(server)
        .keepOpen()
        .get('/api/books/679175fc760629e5d96b3fc3') // Invalid ObjectId
        .end((req, res) => {
          assert.equal(res.status, 200); // Use 200 for not found
          assert.equal(res.text, 'no book exists');
          done();
        });
    });

    test('Test GET /api/books/[id] with valid id in db', function (done) {
      chai
        .request(server)
        .keepOpen()
        .get(`/api/books/${id}`)
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.isObject(res.body);
          assert.property(res.body, '_id');
          assert.property(res.body, 'title');
          assert.property(res.body, 'comments');
          done();
        });
    });

  });

  suite('POST /api/books/[id] => add comment/expect book object with id', function () {

    test('Test POST /api/books/[id] with comment', function (done) {
      chai
        .request(server)
        .keepOpen()
        .post(`/api/books/${id}`)
        .send({ comment: "Test Comment" })
        .end((req, res) => {
          assert.equal(res.status, 200);
          assert.property(res.body, 'comments');
          assert.include(res.body.comments, "Test Comment");
          done();
        });
    });

    test('Test POST /api/books/[id] without comment field', function (done) {
      chai
        .request(server)
        .keepOpen()
        .post(`/api/books/${id}`)
        .send({})
        .end((req, res) => {
          assert.equal(res.status, 200); // Use 200 for bad request
          assert.equal(res.text, 'missing required field comment');
          done();
        });
    });

    test('Test POST /api/books/[id] with comment, id not in db', function (done) {
      chai
        .request(server)
        .keepOpen()
        .post(`/api/books/679175fc760629e5d96b3fc3`) // Invalid ObjectId
        .send({comment: "dummy comment" })
        .end((err, res) => {
          assert.equal(res.status, 200); // Use 404 for not found
          assert.equal(res.text, 'no book exists');
          done();
        });
    });

  });

  suite('DELETE /api/books/[id] => delete book object id', function () {

    test('Test DELETE /api/books/[id] with valid id in db', function (done) {
      chai
        .request(server)
        .keepOpen()
        .delete(`/api/books/${id}`)
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.text, 'delete successful');
          done();
        });
    });

    test('Test DELETE /api/books/[id] with id not in db', function (done) {
      chai
        .request(server)
        .keepOpen()
        .delete('/api/books/679175fc760629e5d96b3fc3') // Invalid ObjectId
        .end((err, res) => {
          assert.equal(res.status, 200); // Use 200 for not found
          assert.equal(res.text, 'no book exists');
          done();
        });
    });

  });

});


});