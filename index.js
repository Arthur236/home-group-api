require('dotenv').config();

const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const upload = require('express-fileupload');
const session = require('express-session');

const { mongoDBUrl } = require('./config/database');

const authRoutes = require('./api/routes/authRoutes');

const app = express();

mongoose.connect(mongoDBUrl, { useNewUrlParser: true, useUnifiedTopology: true })
  .then((db) => {
    console.log('DB connected');
  }).catch((error) => {
    console.log('Could not connect to DB: ', error);
  });

app.use(express.static(path.join(__dirname, 'public')));

app.use(upload());
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));
app.use(bodyParser.json({ limit: '10mb', extended: true }));
app.use(methodOverride('_method'));
app.use(session({
  secret: 'youwillneverguess',
  resave: true,
  saveUninitialized: true,
}));

app.get("/", (req, res, next) => {
  res.json("Hey");
});

app.use('/auth', authRoutes);

app.use((req, res) => {
  res.status(404).send({url: req.originalUrl + ' not found'})
});

const port = process.env.PORT || 4000;

app.listen(port, () => {
  console.log('\x1b[35m%s\x1b[0m', `\nThe server is running on http::/localhost:${port}`);
});
