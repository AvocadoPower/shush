/**
 * Server index file to define servable routes
 * route-specific functions inside of lib/requestHelper.js
 */
require('dotenv').config();
const express = require('express');
const session = require('express-session');
// const request = require('request');
const bodyParser = require('body-parser');
const util = require('./lib/requestHelper');
const services = require('./src/services/requestHelper');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const { User } = require('./db/config');
const twilio = require('twilio')(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);

const fileUpload = require('express-fileupload');


const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(`${__dirname}/dist`));

// set morgan to log info about our requests for development
app.use(morgan('dev'));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(cookieParser());

app.use(fileUpload());

// handle /user route
app.get('/user', util.getUsers);
app.post('/user', util.addUser);

app.use(session({
  key: 'user_sid',
  secret: 'somerandonstuffs',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 600000,
  },
}));

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

// handle /sound route
app.get('/sound', util.getUserSounds);
app.post('/sound', util.addSound);
app.delete('/sound', util.deleteSound);

// handle /trigger route
app.get('/trigger', util.getUserTriggers);
app.post('/trigger', util.addTrigger);
app.put('/trigger', util.updateTrigger);
app.delete('/trigger', util.deleteTrigger);

// handle /sms route:
app.post('/sms', (req, res) => {
  // successfully send twilio message:
  twilio.messages.create(
    {
      to: `+1${req.body.data.phone}`,
      from: process.env.TWILIO_PHONE,
      body: `You asked us to let you know: ${req.body.data.message}
      -your friends at Shush`,
    },
    (err, message) => {
      console.log(message.sid);
    }
  );
  res.header(200).send(`text sent! ${req.body}`);
});

// route for handling 404 requests(unavailable routes)
app.use((req, res, next) => {
  res.status(404).send('Sorry can\'t find that!');
});

app.listen(PORT, () => {
  console.log(`listening on port ${PORT}`);
});
