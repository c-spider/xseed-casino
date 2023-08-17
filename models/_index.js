'use strict';

const fs = require("fs")
const path = require("path")
const { Sequelize, Model } = require("sequelize");
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const configs = require("../config/config.json");
let config = configs[env];
config = {...config, logging: false};

/* Custom handler for reading current working directory */
const models = process.cwd() + '/models/' || __dirname;

let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {

  sequelize = new Sequelize(
    config.database,
    config.username,
    config.password,
    config,
  );
}

const db = {};

const roundModel = require("./lotteryround.js");
db.LotteryRound = roundModel(sequelize, Sequelize.DataTypes);

const buyModel = require("./buyrequest.js");
db.BuyRequest = buyModel(sequelize, Sequelize.DataTypes);

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;