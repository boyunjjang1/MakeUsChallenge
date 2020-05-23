const {pool} = require('../../../config/database');
const {logger} = require('../../../config/winston');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegInstaller = require('@ffmpeg-installer/ffmpeg');

exports.default = async function (req, res) {
    try {
        const connection = await pool.getConnection(async conn => conn);
        try {
            const [rows] = await connection.query(
                `
                SELECT id, email, nickname, createdAt, updatedAt 
                FROM UserInfo
                `
            );
            connection.release();
            return res.json(rows);
        } catch (err) {
            logger.error(`example non transaction Query error\n: ${JSON.stringify(err)}`);
            connection.release();
            return false;
        }
    } catch (err) {
        logger.error(`example non transaction DB Connection error\n: ${JSON.stringify(err)}`);
        return false;
    }
};

exports.test = async function(req,res){

    console.log(req.body);
    const Url = req.body.videoUrl
    ffmpeg.setFfmpegPath(ffmpegInstaller.path);
    
    ffmpeg(Url, { timeout: 432000 }).addOptions([
        '-profile:v baseline',
        '-level 3.0',
        '-start_number 0',
        '-hls_time 10',
        '-hls_list_size 0',
        '-f hls'
    ]).output('../../videos/output.m3u8').on('end', () => {
        console.log('end');
    }).run();

    return res.json({
        result: "test success"
    })
}