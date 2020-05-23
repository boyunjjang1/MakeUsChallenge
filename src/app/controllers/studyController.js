const {
    pool
  } = require('../../../config/database')
  const {
    logger
  } = require('../../../config/winston')
  
  const jwt = require('jsonwebtoken')
  const secret_config = require('../../../config/secret')
  

  // 강의 업로드
  exports.studyUpload = async function(req,res){

    const json = req.body

    try {
        const connection = await pool.getConnection(async conn => conn);
        try {

            const StudyUploadQuery = `
            INSERT INTO StudyList(studyName,studyOwner,studyUrl) VALUES (?,?,?);
            `
            const [rows] = await connection.query(StudyUploadQuery, [json.studyName, json.studyOwner, json.studyUrl])
            
            
            connection.release();
            return res.json({
                isSuccess: true,
                code: 200,
            
                message: '강의 업로드 성공',
            });
        } catch (err) {
            logger.error(`StudyUpload Query error\n: ${JSON.stringify(err)}`);
            connection.release();
            return false;
        }
    } catch (err) {
        connection.release();
        logger.error(`StudyUpload DB Connection error\n: ${JSON.stringify(err)}`);
        return false;
    }
  }

  // 특정 강의 보기 

  exports.studyInfo = async function(req,res){
    const studyID = req.params.studyId;
    const token = req.verifiedToken
    const connection = await pool.getConnection(async (conn) => conn)
    try {
        const StudyLookUpQuery = `SELECT idStudyList, studyName, studyOwner, studyUrl
        FROM StudyList WHERE idStudyList=?;`
        const [rows] = await connection.query(StudyLookUpQuery, [req.params.studyId])
        connection.release()
        return res.json({
        isSuccess: true,
        code: 200,
        result: rows,
        message: '강의 보기 성공',
        })
    } catch (err) {
        logger.error(`Board Look Up Query error\n: ${JSON.stringify(err)}`)
        connection.release()
        return res.json({
        isSuccess: false,
        code: 320,
        message: '강의 보기 실패',
        })
    }

  }
  

  // 강의 전체 리스트

  exports.studyList = async function(req,res){

    const token = req.verifiedToken
    const connection = await pool.getConnection(async (conn) => conn)
    try {
        const StudyListLookUpQuery = `SELECT idStudyList, studyName, studyOwner
        FROM StudyList;`
        const [rows] = await connection.query(StudyListLookUpQuery)
        connection.release()
        return res.json({
        isSuccess: true,
        code: 200,
        result: rows,
        message: '강의 리스트 보기 성공',
        })
    } catch (err) {
        logger.error(`Study List Look Up Query error\n: ${JSON.stringify(err)}`)
        connection.release()
        return res.json({
        isSuccess: false,
        code: 320,
        message: '강의 리스트 보기 실패',
        })
    }
  }


