'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class LotteryRound extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      LotteryRound.hasMany(models.BuyRequest, {
        foreignKey: 'roundId',
      })
    }


    async setHash(hash) {
      this.hash = hash;
    }

  }
  LotteryRound.init({
    hash: DataTypes.STRING,
    value: DataTypes.STRING,
    totalPrize: DataTypes.STRING,
    startAt: DataTypes.STRING,
    endAt: DataTypes.STRING,
    status: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'LotteryRound',
  });
  return LotteryRound;
};