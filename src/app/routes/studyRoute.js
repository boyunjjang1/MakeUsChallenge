module.exports = function(app){
    const study = require('../controllers/studyController');
    const jwtMiddleware = require('../../../config/jwtMiddleware');




    app.get('/study/list',study.studyList); // 전체 강의리스트
    app.get('/study/:studyId',study.studyInfo); // 특정 강의 보기
    // app.get('/user/study',study.mystudy); // 내강의 



    // app.route('/study').post(jwtMiddleware,study.studyInput); // 강의 신청
    

    app.route('/upLoad/study').post(study.studyUpload) // 강의 업로드

    // app.route('/user/study/:studyId').patch(study.studyModify); // 내강의 수정
    // app.route('/user/study/:studyId').delete(study.studyDelete); // 강의 삭제
};
