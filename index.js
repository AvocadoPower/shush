/**
 * Server index file to define servable routes
 * route-specific functions inside of lib/requestHelper.js
 */
require('dotenv').config();
const express = require('express');
const session = require('express-session');
const request = require('request');
const bodyParser = require('body-parser');
const util = require('./lib/requestHelper');
const app = express();
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const { User } = require('./db/config');
const twilio = require("twilio")(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);
const PORT = process.env.PORT || 3000;

app.use(express.static(`${__dirname}/dist`));

// set morgan to log info about our requests for development
app.use(morgan('dev'));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(cookieParser());

// handle /user route
app.get('/user', util.getUsers);
app.post('/user', util.addUser);

app.use(
  session({
    key: 'user_sid',
    secret: 'somerandonstuffs',
    resave: false,
    saveUninitialized: false,
    cookie: {
      expires: 600000
    }
  })
);

app.use((req, res, next) => {
  if (req.cookies.user_sid && !req.session.user) {
    res.clearCookie('user_sid');
  }
  next();
});


// route for user signup
app.post('/signup', util.addUser);


// route for user Login
app.post('/login', util.authenticateUser);


// route for user logout
app.get('/logout', (req, res) => {
  if (req.session.user && req.cookies.user_sid) {
    res.clearCookie('user_sid');
    res.send(200, 'successful logout!');
  } else {
    res.send(401, 'user not logged in!');
  }
});

// handle /trigger route
app.get('/trigger', util.getUserTriggers);
app.post('/trigger', util.addTrigger);
app.put('/trigger', util.updateTrigger);
app.delete('/trigger', util.deleteTrigger);

// handle /sms route:
app.post('/sms', (req, res) => {
  twilio.messages.create(
    {
      // change to actual phone number
      to: process.env.MY_PHONE,
      from: process.env.TWILIO_PHONE,
      // change to be actual text message (from )
      body: 'This is from our test message!',
    },
    (err, message) => {
      console.log(message.sid);
    }
  )
  res.header(200).send('text sent!');
});

// route for handling 404 requests(unavailable routes)
app.use(function (req, res, next) {
  res.status(404).send('Sorry can\'t find that!');
});

app.listen(PORT, () => {
  console.log(`listening on port ${PORT}`);
});
