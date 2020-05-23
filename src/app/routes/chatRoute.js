module.exports = function (app) {
    const chat = require('../controllers/chatController');
    const jwtMiddleware = require('../../../config/jwtMiddleware');

    app.get('/chatList',chat.chatList);// 채팅방목록
    app.route('/chat').post(chat.chatRoomInit); // 방 생성

};