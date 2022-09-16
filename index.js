const TelegramApi = require ('node-telegram-bot-api');
const { URL } = require('url');
const https = require('https');
const sequelize = require('./db');
const UserModel = require('./model');


const token = '5274235203:AAH8mbrWt-9DV9A2AQKTsZA7WgoHT_ZzCTw'
const bot = new TelegramApi(token,{polling:true})

const buttons = {
    reply_markup: JSON.stringify({
        inline_keyboard:[
            [{text:'Погода в Канаде',callback_data:'Погода в Канаде'}],
            [{text:'Хочу почитать',callback_data:'Хочу почитать'}],
            [{text:'Сделать рассылку',callback_data:'Сделать рассылку'}],
        ]
})
}
const buttonsChoice = {
    reply_markup: JSON.stringify({
        inline_keyboard:[
            [{text:'Уверен',callback_data:'Уверен'},{text:'Отмена',callback_data:'Отмена'}]
        ]
})
}
const start = async () => {
    try{
        await sequelize.authenticate()
        await sequelize.sync()

    } catch(e){
        console.log('Проблемы с подключением к бд');
    }
    bot.setMyCommands([
        { command:"/start",description:"Начальное приветствие"}])

        try{
            bot.on('message',async msg => {
                const text = msg.text;
                const chatId = msg.chat.id;
                const first_name = msg.chat.first_name;
                const last_name = msg.chat.last_name;
                const username = msg.chat.username;

                if(text === '/start'){
                    const user = await UserModel.findOne({chatId})
                    if(!user){
                        await UserModel.create({chatId,first_name,last_name,username})
                        usersArray.push(chatId)
                    }
                   return bot.sendMessage(chatId,'Здравствуйте. Нажмите на любую интересующую Вас кнопку',buttons);
                }
            })

        }catch(e){
            console.log('Произошла ошибка');
        }
  
     bot.on('callback_query',async msg => {
        const data = msg.data;
        const chatId = msg.message.chat.id;
    
    
        if(data === "Погода в Канаде"){
            
            let url = "https://api.openweathermap.org/data/2.5/weather?q=Toronto&appid=c2046dc4114809975c32bc4c228395e7";
            
            https.get(url,(res) => {
                let body = "";
            
                res.on("data", (chunk) => {
                    body += chunk;
                });
            
                res.on("end", () => {
                    try {
                        let json = JSON.parse(body);
                        const weather = Math.floor(json.main.temp-273.15);
                        bot.sendMessage(chatId,`Погода в Канаде ${weather} градусов Цельсия`)  
                    } catch (error) {
                        console.error(error.message);
                    };
                });
            
            }).on("error", (error) => {
                console.error(error.message);
            });    
        }

        if(data === "Хочу почитать"){
    
            await bot.sendPhoto(chatId,
                "https://pythonist.ru/wp-content/uploads/2020/03/photo_2021-02-03_10-47-04-350x2000-1.jpg",
        {
                caption:'Идеальный карманный справочник для быстрого ознакомления с особенностями работы разработчиков на Python. Вы найдете море краткой информации о типах и операторах в Python, именах специальных методов, встроенных функциях, исключениях и других часто используемых стандартных модулях.'
        })
    
            const url = new URL('https://drive.google.com/file/d/1Xs_YjOLgigsuKl17mOnR_488MdEKloCD/view');
            const urlpath = url.pathname.split(/\//);
            const id = urlpath[urlpath.length - 2];
            return bot.sendDocument(chatId,`https://docs.google.com/uc?export=download&id=${id}`);
        
        }
        if (data === "Сделать рассылку"){
            await bot.sendMessage(chatId,'Здравствуйте. Нажмите на любую интересующую Вас кнопку',buttonsChoice)
            bot.on('callback_query',async msg => {

                const answer = msg.data;
                const chatId = msg.message.chat.id;

                switch (answer) {
                    case'Уверен':
                             bot.sendMessage(chatId,'Введите сообщение, которое хотите отправить всем пользователям.')
                    
                               bot.on('message',async msg => {
                                const text = msg.text;
                                const messageId = msg.message_id
                                const users = await UserModel.findAll()
                                for (let user of users){
                                    await bot.sendMessage(user.dataValues.chatId,text)
                                }
                                return bot.sendMessage(chatId,"Рассылка произошла успешно",{reply_to_message_id:messageId});   
                            })
                         break;

                         case 'Отмена':
                            return bot.sendMessage(chatId,'Здравствуйте. Нажмите на любую интересующую Вас кнопку',buttons);
                        }
            })
        }

    })

}
start()
