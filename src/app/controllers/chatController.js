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

    try {
      const connection = await pool.getConnection(async (conn) => conn)
      
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
    
    try {
        const connection = await pool.getConnection(async (conn) => conn)
            // 채팅방 중복확인
            const selectChatRoomQuery = `SELECT roomName FROM chatRoom WHERE roomName=?;`
  
            const [chatRows] = await connection.query(selectChatRoomQuery,[json.roomName]);

            if(chatRows.length > 0){
                connection.release()
                return res.json({
                    isSuccess: false,
                    code: 246,
                    message: '중복된 방 이름 입니다.',
                })
            }

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