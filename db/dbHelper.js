/**
 * Database helper file
 * Create methods to interact with database here.
 */

const {
  User,
  Moment,
  Trigger,
  Event,
} = require('./config');

module.exports = {
  // get all users
  getUsers(callback) {
    User.findAll()
      .then((users) => {
        callback(null, users);
      })
      .catch((err) => {
        callback(err);
      });
  },
  // create new user
  addUser(user, callback) {
    User.generateHash(user.password)
      .then((hash) => {
        user.password = hash;
        User.create(user, { fields: ['name', 'password'] })
          .then((user) => {
            callback(null, user);
          })
          .catch((err) => {
            callback(err);
          });
      })
      .catch((err) => {
        console.error(err);
      });
  },
  // create new sound tied to user
  addSound(user, sound, callback) {
    User.findById(user.id)
      .then((user) => {
        sound.id_user = user.id;
        return Sound.create(sound);
      })
      .then((newSound) => {
        callback(null, newSound);
      })
      .catch((err) => {
        callback(err);
      });
  },

  // get sounds of given user
  getUserSounds(user, callback) {
    User.findById(user.id)
      .then(user => user.getSounds())
      .then((sounds) => {
        callback(null, sounds);
      })
      .catch((err) => {
        callback(err);
      });
  },
  // delete given sound
  deleteSound(sound, callback) {
    Sound.findById(sound.id)
      .then(found => found.destroy().save())
      .then(() => {
        callback(null);
      })
      .catch((err) => {
        callback(err);
      });
  },
  // create new trigger tied to user
  addTrigger(user, trigger, callback) {
    User.findById(user.id)
      .then((user) => {
        trigger.id_user = user.id;
        return Trigger.create(trigger, { fields: ['gate', 'message', 'phone_number', 'clip', 'id_user', 'listen_start', 'listen_stop'] });
      })
      .then((newTrigger) => {
        callback(null, newTrigger);
      })
      .catch((err) => {
        callback(err);
      });
  },

  // get triggers of given user
  getUserTriggers(user, callback) {
    User.findById(user.id)
      .then(user => user.getTriggers())
      .then((triggers) => {
        callback(null, triggers);
      })
      .catch((err) => {
        callback(err);
      });
  },
  // update given trigger
  updateTrigger(trigger, callback) {
    Trigger.findById(trigger.id)
      .then(found => found.update(trigger, { fields: ['gate', 'message', 'phone_number', 'clip', 'listen_start', 'listen_stop'] }).save())
      .then((updatedTrigger) => {
        callback(null, updatedTrigger);
      })
      .catch((err) => {
        callback(err);
      });
  },
  // delete given trigger
  deleteTrigger(trigger, callback) {
    Trigger.findById(trigger.id)
      .then(found => found.destroy().save())
      .then(() => {
        callback(null);
      })
      .catch((err) => {
        callback(err);
      });
  },
};
