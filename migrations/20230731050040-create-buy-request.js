'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('BuyRequests', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      wallet: {
        type: Sequelize.STRING
      },
      roundId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'LotteryRounds',
          key: 'id',
        }
      },
      value: {
        type: Sequelize.STRING
      },
      score: {
        type: Sequelize.INTEGER
      },
      reward: {
        type: Sequelize.STRING
      },
      paymentCoin: {
        type: Sequelize.STRING
      },
      isWithdrawn: {
        type: Sequelize.BOOLEAN
      },
      status: {
        type: Sequelize.INTEGER
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('BuyRequests');
  }
};