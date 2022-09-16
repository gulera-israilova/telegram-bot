const sequelize = require('./db')
const {DataTypes} = require('sequelize')

const User = sequelize.define('user',{
    id:{type:DataTypes.INTEGER, primaryKey:true,unique:true,autoIncrement:true},
    chatId:{type:DataTypes.STRING,unique:true},
    first_name:{type:DataTypes.STRING},
    last_name:{type:DataTypes.STRING},
    username:{type:DataTypes.STRING},
})
module.exports = User;
