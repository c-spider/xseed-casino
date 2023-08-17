'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class BuyRequest extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      BuyRequest.belongsTo(models.LotteryRound, { 
        foreignKey: 'roundId'
      })
    }
  }
  BuyRequest.init({
    wallet: DataTypes.STRING,
    roundId: DataTypes.INTEGER,
    value: DataTypes.STRING,
    score: DataTypes.INTEGER,
    reward: DataTypes.STRING,
    paymentCoin: DataTypes.STRING,
    isWithdrawn: DataTypes.BOOLEAN,
    status: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'BuyRequest',
  });
  return BuyRequest;
};