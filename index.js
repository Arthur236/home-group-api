require('dotenv').config();

const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const upload = require('express-fileupload');
const session = require('express-session');
const cors = require('cors');
const colors = require('colors');

const { mongoDBUrl } = require('./config/database');

const authRoutes = require('./api/routes/auth');
const contributionRoutes = require('./api/routes/contributions');
const fineRoutes = require('./api/routes/fines');
const userRoutes = require('./api/routes/user');
const uploadRoutes = require('./api/routes/upload');

const app = express();

mongoose.connect(mongoDBUrl, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true })
  .then((db) => {
    console.log('DB connected');
  }).catch((error) => {
    console.log('Could not connect to DB: ', error);
  });

app.use(express.static(path.join(__dirname, 'public')));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));
app.use(upload({
  limits: { fileSize: 5 * 1024 * 1024 }
}));
app.use(session({
  secret: 'a9cf6e25-8560-4ca8-a6eb-623046595cf5',
  resave: true,
  saveUninitialized: true,
}));

const whitelist = ['http://localhost:3000'];
const corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  }
}
app.use(cors());

app.get("/", (req, res, next) => {
  res.json("Hey");
});

app.use('/auth', authRoutes);
app.use('/contributions', contributionRoutes);
app.use('/fines', fineRoutes);
app.use('/users', userRoutes);
app.use('/upload', uploadRoutes);

app.use((req, res) => {
  res.status(404).json({url: req.originalUrl + ' not found'})
});

const port = process.env.PORT || 4000;

app.listen(port, () => {
  console.log(colors.magenta(`\nThe server is running on http:://localhost:${port}`));
});
