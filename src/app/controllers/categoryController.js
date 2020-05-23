const {
    pool
  } = require('../../../config/database')
  const {
    logger
  } = require('../../../config/winston')
  
  const jwt = require('jsonwebtoken')
  const secret_config = require('../../../config/secret')
  
  // 카테고리 목록 보여주기
  exports.categoryList = async function (req, res) {
    const token = req.verifiedToken
    const connection = await pool.getConnection(async (conn) => conn)
    try {
      const CategoryListQuery = `SELECT categoryName, idCategory
      FROM Category;`
      const [rows] = await connection.query(CategoryListQuery, [token.id])
  
     
  
      connection.release()
      return res.json({
        isSuccess: true,
        code: 200,
        result: rows,
        message: '카테고리 조회 성공',
      })
    } catch (err) {
      logger.error(`Category List Query error\n: ${JSON.stringify(err)}`)
      connection.release()
      return res.json({
        isSuccess: false,
        code: 314,
        message: '카테고리 조회 실패',
      })
    }
  }
  