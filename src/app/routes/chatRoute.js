module.exports = function (app) {
    const chat = require('../controllers/chatController');
    const jwtMiddleware = require('../../../config/jwtMiddleware');

    app.get('/chatList',jwtMiddleware, chat.chatList);// 채팅방목록
    app.route('/chat').post(jwtMiddleware,chat.chatRoomInit); // 방 생성

};