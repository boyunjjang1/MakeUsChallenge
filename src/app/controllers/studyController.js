module.exports = function(app){
    const study = require('../controllers/studyController');
    const jwtMiddleware = require('../../../config/jwtMiddleware');


    app.get('/study',jwtMiddleware,study.studyList); // 전체 강의 조회
    app.get('/user/study',jwtMiddleware,study.mystudy); // 내강의 
    app.route('/study').post(study.studyInput); // 강의 추가
    app.route('/user/study/:studyId').patch(study.studyModify); // 내강의 수정
    app.route('/user/study/:studyId').delete(study.studyDelete); // 강의 삭제
};
