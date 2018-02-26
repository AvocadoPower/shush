/**
 * Database configuration file
 * Set up schemas and table associations here.
 * To connect to cloud database, use the db password below with the cloud_sql_proxy running
 */

const Sequelize = require('sequelize');
const bcrypt = require('bcrypt');
// db password: NC8Jo8GGBp6CodbP
// start proxy: ./cloud_sql_proxy -instances="indigovalley-shush:us-central1:iv-shush"=tcp:3306

let pw = '';
if (process.env.PROD) {
  console.log('set pw');
  pw = 'NC8Jo8GGBp6CodbP';
}
const sequelize = new Sequelize('shush', 'root', process.env.DBPASS, {
  host: '127.0.0.1',
  dialect: 'mysql',
});


// define user
const User = sequelize.define('user', {
  name: Sequelize.STRING,
  password: Sequelize.STRING,
});

User.generateHash = function (password) {
  return bcrypt.hash(password, bcrypt.genSaltSync(8));
};

User.prototype.validPassword = function (password) {
  return bcrypt.compare(password, this.password);
};

// define moment
const Moment = sequelize.define('moment', {
  dbChange: Sequelize.FLOAT,
  timestamp: Sequelize.DATE,
});

Moment.belongsTo(User, { foreignKey: 'id_user' });
User.hasMany(Moment, { foreignKey: 'id_user' });

// define trigger
const Trigger = sequelize.define('trigger', {
  gate: Sequelize.FLOAT,
  message: Sequelize.STRING,
  phone_number: Sequelize.STRING,
  clip: Sequelize.STRING,
  listen_stop: Sequelize.TIME,
  listen_start: Sequelize.TIME,
});

User.hasMany(Trigger, { foreignKey: 'id_user' });
Trigger.belongsTo(User, { foreignKey: 'id_user' });

// define sound
const Sound = sequelize.define('sound', {
  name: Sequelize.STRING,
  url: Sequelize.STRING,
});

Sound.belongsTo(User, { foreignKey: 'id_user' });
// Sound.belongsTo(Trigger, { foreignKey: 'id_user' });
// Trigger.hasOne(Sound, { foreignKey: 'id_user' });
User.hasMany(Sound, { foreignKey: 'id_user' });

// define event
const Event = sequelize.define('event', {
  timestamp: Sequelize.DATE,
});

Trigger.hasMany(Event, { foreignKey: 'id_trigger' });
Event.belongsTo(Trigger, { foreignKey: 'id_trigger' });

User.sync();
Moment.sync();
Trigger.sync();
Sound.sync();
Event.sync();

module.exports = {
  User,
  Moment,
  Trigger,
  Event,
  Sound,
};
