const express = require('./config/express');
const {logger} = require('./config/winston');
const { pool } = require('./config/database');
const http = require('http');
const sio = require('socket.io');
const fs = require('fs');
const hls = require('hls-server');
const { v4: uuidv4 } = require('uuid');

const port = 3000;
// express().listen(port);

const server = http.createServer(express()).listen(port);
io = sio(server)


const room = io.of('/room')

room.on('connection', (socket)=>{
    console.log('room 네임스페이스 접속');

    let roomUUID;
    socket.on('createRoom',(data) => {
        // roomUUID = uuidv4();

        roomUUID = data;
        // try{

        //     const connection = await pool.getConnection(async(conn)=> conn)
        //     const insertRoomQuery = `INSERT INTO ChatRoom (roomName, chatRoomID)
        //     VALUES (?,?);`
        //     const insertRoomParams = [data,roomUUID];
        //     await connection.query(insertRoomQuery, insertRoomParams);
        //     await connection.commit()
        //     connection.release();

        // }catch{
        //     await connection.rollback()
        //     connection.release();
        //     logger.error(` - chatRoom Query error\n: ${err.message}`)
        //     return res.status(500).send(`Error: ${err.message}`)
        // }

        console.log('createRoom')
        console.log(roomUUID)
        socket.join(roomUUID);
        
    });

    socket.on('joinRoom',(data)=>{
        let roomName = data;
        let msg = {msg: '상대방이 입장하셨습니다'}
        console.log(roomName, "joinRoomTest")
        socket.join(roomName);
        socket.in(roomName).emit('RoomLog',msg);
    })

    socket.on('sendMsgFromClient', (msg) => {
        console.log("helo?")
        socket.to(roomUUID).emit('sendMsgFromServer', msg);
    })
})


// new hls(server, {
//     provider: {
//         exists: (req, cb) => { // 모든 요청에 대해 실행됩니다. 응답하기 전 파일의 존재 유무를 확인합니다.
//             const ext = req.url.split('.').pop();

//             if (ext !== 'm3u8' && ext !== 'ts') {
//                 // cb의 두 번째 인자에 true를 넘기는건 파일이 존재한다는 의미입니다.
//                 // .m3u8, .ts 이외의 파일 형식은 hls server가 아닌 express router가 관리하므로 true로 처리합니다.
//                 return cb(null, true);
//             }

//             fs.access(__dirname + req.url, fs.constants.F_OK, function (err) {
//                 if (err) {
//                     console.log('File not exist');
//                     // 파일이 존재하지 않으므로 false를 넘겨줍니다.
//                     return cb(null, false);
//                 }
//                 cb(null, true);
//             });
//         },
//         getManifestStream: (req, cb) => { // .m3u8 파일의 요청에 대해 실행됩니다.
//             const stream = fs.createReadStream(__dirname + req.url);
//             cb(null, stream);
//         },
//         getSegmentStream: (req, cb) => { // .ts 파일의 요청에 대해 실행됩니다.
//             const stream = fs.createReadStream(__dirname + req.url);
//             cb(null, stream);
//         }
//     }
// });


logger.info(`${process.env.NODE_ENV} - API Server Start At Port ${port}`);