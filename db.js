const {Sequelize} = require('sequelize')
require('dotenv').config()

module.exports = new Sequelize(
    'telegram-bot',
    'postgres',
    'postgres',
    {
        host: 'localhost',
        port: '5432',
        dialect: 'postgres'
    }
)