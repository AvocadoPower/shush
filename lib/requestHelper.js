/**
 * Request helper file to handle specific requests and stay modular.
 * Create methods to handle routes here.
 */
const db = require('../db/dbHelper');
const { User } = require('../db/config');

// export helper methods
module.exports = {
  // get all users
  getUsers: function (req, res) {
    db.getUsers((err, users) => {
      if (err) {
        console.error('error getting users from database', err);
      } else {
        res.send(users);
      }
    });
  },
  // create a new user
  addUser: function (req, res) {
    const user = req.body;
    db.addUser(user, (err, newUser) => {
      if (err) {
        res.status(401).send(err);
      } else {
        req.session.user = newUser.dataValues;
        res.status(201).send("signup successful!");
      }
    });
  },
  // create a new trigger attached to current user
  addTrigger: function (req, res) {
    if (req.session.user && req.cookies.user_sid) {
      const user = req.session.user;
      const trigger = req.body;
      db.addTrigger(user, trigger, (err, newTrigger) => {
        if (err) {
          res.send(err);
        } else {
          res.send(newTrigger);
        }
      });
    } else {
      res.send(401, 'unauthorized request');
    }
  },
  // validate user credentials
  authenticateUser: (req, res) => {
    const username = req.body.name;
    const password = req.body.password;

    User.findOne({ where: { name: username } }).then(function (user) {
      if (!user) {
        res.send(404, 'invalid username');
      } else if (!user.validPassword(password)) {
        res.send(401, 'invalid password');
      } else {
        req.session.user = user.dataValues;
        res.send(200, 'user logged in');
      }
    });
  },

  // get triggers of currently signed in user
  getUserTriggers: function (req, res) {
    if (req.session.user && req.cookies.user_sid) {
      const user = req.session.user;
      db.getUserTriggers(user, (err, triggers) => {
        if (err) {
          res.send(err);
        } else {
          res.send(triggers);
        }
      });
    } else {
      res.send(401, 'unauthorized request');
    }
  },
  // update a trigger
  updateTrigger: function (req, res) {
    if (req.session.user && req.cookies.user_sid) {
      const trigger = req.body;
      db.updateTrigger(trigger, (err, updatedTrig) => {
        if (err) {
          res.send(err);
        } else {
          res.send(updatedTrig);
        }
      });
    } else {
      res.send(401, 'unauthorized request');
    }
  },
  // delete a trigger
  deleteTrigger: function (req, res) {
    if (req.session.user && req.cookies.user_sid) {
      const trigger = req.body;
      db.deleteTrigger(trigger, (err) => {
        if (err) {
          res.send(err);
        } else {
          res.send('deleted trigger');
        }
      });
    } else {
      res.send(401, 'unauthorized request');
    }
  }
};
