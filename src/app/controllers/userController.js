const { pool } = require('../../../config/database')
const { logger } = require('../../../config/winston')

const jwt = require('jsonwebtoken')
const regexEmail = require('regex-email')
const idReg = /^[A-za-z]/g
const crypto = require('crypto')
const secret_config = require('../../../config/secret')

/**
 update : 2019.11.01
 01.signUp API = 회원가입
 */
exports.signUp = async function(req, res) {
  const { id, password, name, type } = req.body

  if (!id)
    return res.json({
      isSuccess: false,
      code: 301,
      message: '아이디를 입력해주세요.',
    })
  if (id.length > 10)
    return res.json({
      isSuccess: false,
      code: 302,
      message: '아이디는 10자리 미만으로 입력해주세요.',
    })


  if (!password)
    return res.json({
      isSuccess: false,
      code: 304,
      message: '비밀번호를 입력 해주세요.',
    })
  if (password.length < 6 || password.length > 20)
    return res.json({
      isSuccess: false,
      code: 305,
      message: '비밀번호는 6~20자리를 입력해주세요.',
    })

  if (!name)
    return res.json({
      isSuccess: false,
      code: 306,
      message: '이름을 입력 해주세요.',
    })
  if (name.length > 20)
    return res.json({
      isSuccess: false,
      code: 307,
      message: '이름은 최대 20자리를 입력해주세요.',
    })

  try {
    const connection = await pool.getConnection(async (conn) => conn)
    try {
      // 이메일 중복 확인
      const selectEmailQuery = `
                SELECT id, name 
                FROM User
                WHERE id = ?;
                `
      const selectEmailParams = [ id ]
      const [ emailRows ] = await connection.query(selectEmailQuery, selectEmailParams)

      if (emailRows.length > 0) {
        connection.release()
        return res.json({
          isSuccess: false,
          code: 308,
          message: '중복된 아이디입니다.',
        })
      }

    

      await connection.beginTransaction() // START TRANSACTION
      const hashedPassword = await crypto.createHash('sha512').update(password).digest('hex')

      const insertUserInfoQuery = `
                INSERT INTO User(id, password, name, type)
                VALUES (?, ?, ?, ?);
                    `
      const insertUserInfoParams = [ id, hashedPassword, name, type ]
      await connection.query(insertUserInfoQuery, insertUserInfoParams)

      await connection.commit() // COMMIT
      connection.release()
      return res.json({
        isSuccess: true,
        code: 200,
        message: '회원가입 성공',
      })
    } catch (err) {
      await connection.rollback() // ROLLBACK
      connection.release()
      logger.error(`App - SignUp Query error\n: ${err.message}`)
      return res.status(500).send(`Error: ${err.message}`)
    }
  } catch (err) {
    logger.error(`App - SignUp DB Connection error\n: ${err.message}`)
    return res.status(500).send(`Error: ${err.message}`)
  }
}

/**
 update : 2019.11.01
 02.signIn API = 로그인
 **/
exports.signIn = async function(req, res) {
  const { id, password } = req.body

  if (!id)
    return res.json({
      isSuccess: false,
      code: 301,
      message: '아이디를 입력해주세요.',
    })

  if (!password)
    return res.json({
      isSuccess: false,
      code: 304,
      message: '비밀번호를 입력 해주세요.',
    })

  try {
    const connection = await pool.getConnection(async (conn) => conn)
    try {
      const selectUserInfoQuery = `
                SELECT id, password, name, status 
                FROM User 
                WHERE id = ? AND status != 'DELETED';
                `

      let selectUserInfoParams = [ id ]

      const [ userInfoRows ] = await connection.query(selectUserInfoQuery, selectUserInfoParams)

      if (userInfoRows.length < 1) {
        connection.release()
        return res.json({
          isSuccess: false,
          code: 310,
          message: '아이디를 확인해주세요.',
        })
      }

      const hashedPassword = await crypto.createHash('sha512').update(password).digest('hex')
      if (userInfoRows[0].password !== hashedPassword) {
        connection.release()
        return res.json({
          isSuccess: false,
          code: 311,
          message: '비밀번호를 확인해주세요.',
        })
      }

      if (userInfoRows[0].status === 'INACTIVE') {
        connection.release()
        return res.json({
          isSuccess: false,
          code: 312,
          message: '비활성화 된 계정입니다. 고객센터에 문의해주세요.',
        })
      } else if (userInfoRows[0].status === 'DELETED') {
        connection.release()
        return res.json({
          isSuccess: false,
          code: 313,
          message: '탈퇴 된 계정입니다. 고객센터에 문의해주세요.',
        })
      }

      //토큰 생성
      let token = await jwt.sign(
        {
          id: userInfoRows[0].id,
          password: hashedPassword,
          name: userInfoRows[0].name,
        }, // 토큰의 내용(payload)
        secret_config.jwtsecret, // 비밀 키
        {
          expiresIn: '365d',
          subject: 'userInfo',
        } // 유효 시간은 365일
      )

      res.json({
        userInfo: userInfoRows[0],
        jwt: token,
        isSuccess: true,
        code: 200,
        message: '로그인 성공',
      })

      connection.release()
    } catch (err) {
      logger.error(`App - SignIn Query error\n: ${JSON.stringify(err)}`)
      connection.release()
      return false
    }
  } catch (err) {
    logger.error(`App - SignIn DB Connection error\n: ${JSON.stringify(err)}`)
    return false
  }
}

/**
 update : 2019.09.23
 03.check API = token 검증
 **/
exports.check = async function(req, res) {
  res.json({
    isSuccess: true,
    code: 200,
    message: '검증 성공',
    info: req.verifiedToken,
  })
}


// 내 정보보기
exports.userInfo = async function (req, res) {
  const token = req.verifiedToken
  console.log(token)
  try {
    const connection = await pool.getConnection(async (conn) => conn)
    try {
      const selectUserInfoQuery = `
                    SELECT id, name,type
                    FROM User
                    WHERE idUser = ? AND status != 'DELETED';
                    `
      console.log(token.name)
      const selectUserInfoParams = token.idx
      const [userInfoRows] = await connection.query(selectUserInfoQuery, selectUserInfoParams)
      connection.release()
      res.json({
        userInfo: userInfoRows,
        isSuccess: true,
        code: 200,
        message: '정보조회 성공',
      })
    } catch (err) {
      logger.error(`App - userInfo Query error\n: ${JSON.stringify(err)}`)
      console.log(err)
      connection.release()
      return false
    }
  } catch (err) {
    logger.error(`App - userInfo DB Connection error\n: ${JSON.stringify(err)}`)
    return false
  }
}