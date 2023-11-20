const express = require('express');
const path = require('path');
const { check, validationResult } = require('express-validator');
const mongoose = require('mongoose');
const fileUpload = require('express-fileupload');
const session = require('express-session');
const cors = require('cors');

let myApp = express();


mongoose.connect('mongodb://0.0.0.0:27017/ciswp', {
   useNewUrlParser: true,
   useUnifiedTopology: true
});

const News = mongoose.model('News', {
   title: String,
   date: String,
   photoName: String,
   autoMessage: String
});

const Pubs = mongoose.model('Pubs', {
   type: String,
   author: String,
   year: String,
   title: String,
   publisher: String,
   vol: String,
   page: String,
   desc: String
});

const Webinars = mongoose.model('Webinars', {
   title: String,
   subject: String,
   date: String,
   videoId: String,
   desc: String
});

const Admin = mongoose.model('Admin', {
   username: String,
   password: String,
});

myApp.use(express.static(__dirname + '/public'));
myApp.set('view engine', 'ejs');
myApp.set('views', path.join(__dirname, 'views'));

myApp.use(express.urlencoded({ extended: false }));
myApp.use(fileUpload());
myApp.use(cors());
myApp.use(express.json());
myApp.use(express.urlencoded({ extended: true }));

myApp.use(
   session({
      secret: 'ciswp1237103498', // should be unique for each application
      resave: false,
      saveUninitialized: true,
   })
);

myApp.get('/', function (req, res) {
   res.redirect('news');
});

myApp.get('/news', async (req, res) => {
   if (req.session.loggedIn) {
      const data = await News.find().sort({ _id: -1 })
      res.render('news', { data })
   } else {
      res.redirect('/login');
   }
});

myApp.get('/pubs', async (req, res) => {
   if (req.session.loggedIn) {
      const data = await Pubs.find().sort({ _id: -1 })
      res.render('pubs', { data })
   } else {
      res.redirect('/login');
   }
});

myApp.get('/webinars', async (req, res) => {
   if (req.session.loggedIn) {
      const data = await Webinars.find().sort({ _id: -1 })
      res.render('webinars', { data })
   } else {
      res.redirect('/login');
   }
});

myApp.get('/addnews', async (req, res) => {

   if (req.session.loggedIn) {
      const data = await News.find()
      res.render('addnews', { data })
   } else {
      res.redirect('/login');
   }
})

myApp.get('/addpubs', async (req, res) => {

   if (req.session.loggedIn) {
      const data = await Pubs.find()
      res.render('addpubs', { data })
   } else {
      res.redirect('/login');
   }
})

myApp.get('/addwebinars', async (req, res) => {

   if (req.session.loggedIn) {
      const data = await Webinars.find()
      res.render('addwebinars', { data })
   } else {
      res.redirect('/login');
   }
})


myApp.get('/login', (req, res) => {
   res.render('login');
});


myApp.get('/logout', (req, res) => {
   req.session.username = '';
   req.session.loggedIn = false;
   res.redirect('/login');
});

myApp.post('/login_process', async (req, res) => {
   // fetch login data
   let username = req.body.username;
   let password = req.body.password;

   // find admin in the database
   const admin = await Admin.findOne({
      username,
      password,
   }).exec();

   if (admin) {
      req.session.username = admin.username;
      req.session.loggedIn = true;
      res.redirect('/news');
   } else {
      let pageData = {
         error: 'Login details not correct',
      };
      res.render('login', pageData);
   }
});

// Admin account setup
myApp.get('/setup', function (req, res) {
   var adminData = {
      username: 'admin',
      password: 'ciswp',
   };
   let newAdmin = new Admin(adminData);
   newAdmin.save();
   res.send('Done');
});

myApp.post('/addnews_process', [
   check('title', 'Please enter Title').notEmpty(),
   check('date', 'Please enter Date').notEmpty(),
   check('autoMessage', 'Please enter Message').notEmpty()
], function (req, res) {

   const errors = validationResult(req);

   if (!errors.isEmpty()) {
      var errorData = errors.array();
      res.render('news', { errors: errorData });
   }
   else {
      let title = req.body.title
      let date = req.body.date
      let autoMessage = req.body.autoMessage

      var pageData = {
         title: title,
         date: date,
         autoMessage: autoMessage
      }

      var newNews = new News(pageData);
      newNews.save();
      res.render('addthank', pageData);
   }
})

myApp.post('/addpubs_process', [
   check('title', 'Please enter Title').notEmpty(),
], function (req, res) {

   const errors = validationResult(req);

   if (!errors.isEmpty()) {
      var errorData = errors.array();
      res.render('admin', { errors: errorData });
   }
   else {
      let type = req.body.type
      let author = req.body.author
      let year = req.body.year
      let title = req.body.title
      let publisher = req.body.publisher
      let vol = req.body.vol
      let page = req.body.page
      let desc = req.body.desc

      var pageData = {
         type: type,
         author: author,
         year: year,
         title: title,
         publisher: publisher,
         vol: vol,
         page: page,
         desc: desc
      }

      var newPubs = new Pubs(pageData);
      newPubs.save();
      res.render('addthank', pageData);
   }
})

myApp.post('/addwebinars_process', [
   check('title', 'Please enter Title').notEmpty(),
   check('videoId', 'Please enter VideoId').notEmpty(),
], function (req, res) {

   const errors = validationResult(req);

   if (!errors.isEmpty()) {
      var errorData = errors.array();
      res.render('admin', { errors: errorData });
   }
   else {
      let title = req.body.title
      let subject = req.body.subject
      let date = req.body.date
      let videoId = req.body.videoId
      let desc = req.body.desc

      var pageData = {
         title: title,
         subject: subject,
         date: date,
         videoId: videoId,
         desc: desc
      }

      var newWebinars = new Webinars(pageData);
      newWebinars.save();
      res.render('addthank', pageData);
   }
})

/* edit in admin */
myApp.get('/news_edit/:id', async (req, res) => {
   const news = await News.findOne({
      _id: req.params.id
   }).exec();

   res.render('news_edit', { news });
});

myApp.get('/pub_edit/:id', async (req, res) => {
   const pubs = await Pubs.findOne({
      _id: req.params.id
   }).exec();

   res.render('pub_edit', { pubs });
});

myApp.get('/webinar_edit/:id', async (req, res) => {
   const webinars = await Webinars.findOne({
      _id: req.params.id
   }).exec();

   res.render('webinar_edit', { webinars });
});

/* delete in admin */
myApp.get('/news_delete/:id', async (req, res) => {
   let id = req.params.id;
   await News.findByIdAndRemove({ _id: id }).exec();

   res.render('news_delete');
});

myApp.get('/pub_delete/:id', async (req, res) => {
   let id = req.params.id;
   await Pubs.findByIdAndRemove({ _id: id }).exec();

   res.render('pub_delete');
});

myApp.get('/webinar_delete/:id', async (req, res) => {
   let id = req.params.id;
   await Webinars.findByIdAndRemove({ _id: id }).exec();

   res.render('webinar_delete');
});

myApp.post('/news_edit_process', async (req, res) => {

   let id = req.body.id;
   let title = req.body.title;
   let date = req.body.date;
   let autoMessage = req.body.autoMessage;

   await News.findByIdAndUpdate(
      { _id: id },
      {
         title: title,
         date: date,
         autoMessage: autoMessage
      }
   ).exec();

   res.redirect('/news');

});

myApp.post('/pub_edit_process', async (req, res) => {

   let id = req.body.id;
   let type = req.body.type
   let author = req.body.author
   let year = req.body.year
   let title = req.body.title
   let publisher = req.body.publisher
   let vol = req.body.vol
   let page = req.body.page
   let desc = req.body.desc


   await Pubs.findByIdAndUpdate(
      { _id: id },
      {
         type: type,
         author: author,
         year: year,
         title: title,
         publisher: publisher,
         vol: vol,
         page: page,
         desc: desc
      }
   ).exec();

   res.redirect('/pubs');

});

myApp.post('/webinar_edit_process', async (req, res) => {

   let id = req.body.id;
   let title = req.body.title
   let subject = req.body.subject
   let date = req.body.date
   let videoId = req.body.videoId
   let desc = req.body.desc

   await Webinars.findByIdAndUpdate(
      { _id: id },
      {
         title: title,
         subject: subject,
         date: date,
         videoId: videoId,
         desc: desc
      }
   ).exec();

   res.redirect('/webinars');

});

//Backend Process

myApp.get('/getNews', async (req, res) => {
   const data = await News.find().sort({ _id: -1 });
   res.json(data);
});

myApp.get('/getNewsTop', async (req, res) => {
   const data = await News.find().sort({ _id: -1 }).limit(2);
   res.json(data);
});

myApp.get('/getPubs', async (req, res) => {
   const data = await Pubs.find().sort({ _id: -1 });
   res.json(data);
});

myApp.get('/getPubsTop', async (req, res) => {
   const data = await Pubs.find().sort({ _id: -1 }).limit(3);
   res.json(data);
});

myApp.get('/getWebinars', async (req, res) => {
   const data = await Webinars.find().sort({ _id: -1 });
   res.json(data);
});

myApp.get('/getWebinarsTop', async (req, res) => {
   const data = await Webinars.find().sort({ _id: -1 }).limit(2);
   res.json(data);
});

//listen at a port
myApp.listen(8090);
console.log('Open http://localhost:8090 in your browser');
