const {
    pool
  } = require('../../../config/database')
  const {
    logger
  } = require('../../../config/winston')
  
  const jwt = require('jsonwebtoken')
  const secret_config = require('../../../config/secret')
  
  // 채팅방 목록 보여주기
  exports.chatList = async function (req, res) {
    const token = req.verifiedToken
    const connection = await pool.getConnection(async (conn) => conn)
    try {
      const ChatRoomListQuery = `SELECT idchatRoom, roomName, categoryName, roomOwner
      FROM chatRoom;`
      const [rows] = await connection.query(ChatRoomListQuery)
  
      connection.release()
      return res.json({
        isSuccess: true,
        code: 200,
        result: rows,
        message: '채팅방 조회 성공',
      })
    } catch (err) {
      logger.error(`ChatRoom List Query error\n: ${JSON.stringify(err)}`)
      connection.release()
      return res.json({
        isSuccess: false,
        code: 314,
        message: '채팅방 조회 실패',
      })
    }
  }
  

  exports.chatRoomInit = async function(req,res){
    const token = req.verifiedToken

    const json = req.body;

    const connection = await pool.getConnection(async (conn) => conn)
    try {
      const chatRoomInitQuery = `INSERT INTO chatRoom(roomName, categoryName, roomOwner)
      VALUES (?,?,?);`
    
      const [rows] = await connection.query(chatRoomInitQuery, [json.roomName, json.categoryName, json.roomOwner]);
  
  
      connection.release()
      return res.json({
        isSuccess: true,
        code: 200,
        message: '방 생성 성공',
      })
    } catch (err) {
      logger.error(`Room Init Query error\n: ${JSON.stringify(err)}`)
      connection.release()
      return res.json({
        isSuccess: false,
        code: 314,
        message: '방 생성 실패',
      })
    }

  }