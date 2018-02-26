require('dotenv').config();
const axios = require('axios');
const moment = require('moment');
// const bcrypt = require('bcrypt');


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
  addSound: function (sound, callback) {
    axios.post('/sound', sound)
      .then((response) => {
        callback(response);
      })
      .catch((err) => {
        console.log('error adding sound', err);
      });
  },
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
    let currentTime = moment().format('HH:mm:ss');
    return currentTime;
  },
}