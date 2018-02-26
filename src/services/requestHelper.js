require('dotenv').config();
const axios = require('axios');
// const bcrypt = require('bcrypt');
const sha1 = require('js-sha1');

const CLOUDINARY_KEY = process.env.CLOUDINARY_API_KEY;
const CLOUDINARY_SECRET = process.env.CLOUDINARY_API_SECRET;


module.exports = {
  userSignup: function(user, callback) {
    axios.post('/signup', user)
      .then((response) => {
        callback(response);
      })
      .catch((err) => {
        console.log('error signing up', err);
      });
  },
  userLogin: function(user, callback) {
    axios.post('/login', user)
      .then((response) => {
        callback(response);
      })
      .catch((err) => {
        console.log('error logging in', err);
      });
  },
  userLogout: function(callback) {
    axios.get('/logout')
      .then((response) => {
        callback(response);
      })
      .catch((err) => {
        console.log('error logging out', err);
      });
  },
  // addSound: function (sound, callback) {
  //   axios.post('/sound', trigger)
  //     .then((response) => {
  //       callback(response);
  //     })
  //     .catch((err) => {
  //       console.log('error adding sound', err);
  //     });
  // },
  getSounds: function (callback) {
    axios.get('/sound')
      .then((response) => {
        callback(response);
      })
      .catch((err) => {
        console.log('error fetching sounds', err);
      });
  },
  deleteSound: function (sound, callback) {
    axios.delete('/sound', { data: { id: sound.id } })
      .then((response) => {
        callback(response);
      })
      .catch((err) => {
        console.log('error deleting sound', err);
      });
  },
  addTrigger: function(trigger, callback) {
    axios.post('/trigger', trigger)
      .then((response) => {
        callback(response);
      })
      .catch((err) => {
        console.log('error adding trigger', err);
      });
  },
  getTriggers: function(callback) {
    axios.get('/trigger')
      .then((response) => {
        callback(response);
      })
      .catch((err) => {
        console.log('error fetching triggers',err);
      });
  },
  updateTrigger: function(trigger, callback) {
    axios.put('/trigger', trigger)
      .then((response) => {
        callback(response);
      })
      .catch((err) => {
        console.log('error updating trigger', err);
      });
  },
  deleteTrigger: function (trigger, callback) {
    axios.delete('/trigger', { data: { id: trigger.id } })
      .then((response) => {
        callback(response);
      })
      .catch((err) => {
        console.log('error deleting trigger', err);
      });
  },
  sendSMS: function (message, phone) {
    axios.post('/sms', {
      data: {
        message: message,
        phone: phone,
      }
    });
  },
  uploadSound: function (sound, callback){
    console.log(sound);
    const timestamp = Math.round(new Date().getTime() / 1000);
    const signature = `pubic_id=sample_sound&timestamp=${timestamp}${CLOUDINARY_SECRET}`;
    const code = sha1(signature);

    axios.post(`https://api.cloudinary.com/v1_1/avocadopower/video/upload?file=${sound}&timestamp=${timestamp}&api_key=${CLOUDINARY_KEY}&signature=${code}`)
    .then((response) => {
     callback(response);
    }).catch(error => {
      console.error(error);
    });
  },
  getCurrentTime: function () {
    let currentDate = new Date();
    // get current hours from date
    let currentHours = currentDate.getHours();
    let hoursString = currentHours.toString();
    currentHours = hoursString.length === 2 ? hoursString : `0${hoursString}`;
    // get curent minutes from date 
    let currentMinutes = currentDate.getMinutes();
    let minutesString = currentMinutes.toString();
    currentMinutes = minutesString.length === 2 ? minutesString : `0${minutesString}`;
    // get curent seconds from date 
    let currentSeconds = currentDate.getSeconds();
    let secondsString = currentSeconds.toString();
    currentSeconds = secondsString.length === 2 ? secondsString : `0${secondsString}`;
    // concat hours mins and secs to get current time
    let currentTime = `${currentHours}:${currentMinutes}:${currentSeconds}`;
    return currentTime;
  },
}