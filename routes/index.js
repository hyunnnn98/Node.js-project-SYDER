const express = require('express');
const router = express.Router();

// mongoSchema
const PathInfo = require('../schemas/car_path');

// 새로운 path 등록
router.post('/set', (req, res) => {
    try {

        const update_Info = new PathInfo({
            path_id: req.body.path_id,
            start_point: req.body.start_point,
            end_point: req.body.end_point,
            travel_time: req.body.travel_time,
            travel_distance: req.body.travel_distance,
             path_info: req.body.path_info,
        });
        update_Info.save()
            .catch(err => {
                console.log('DB저장 실패!!', err)
            })

        return res.json({
            code: 200,
            message: '새로운 path 등록이 완료되었습니다.'
        });
    } catch (err) {
        return res.status(500).json({
            code: 500,
            message: '[서버 오류] path 등록에 실패했습니다.'
        })
    }
})

// 모든 path 보내기
router.post('/', async (req, res) => {
    try {
        const location_data = await PathInfo.find();
        console.log("From Laravel REQUEST!!", req.body.message)
        return res.json({
            code: 200,
            message: '노드 서버 연결 성공 => ',
            data: location_data,
        });
    } catch (err) {
        return res.status(500).json({
            code: 500,
            message: '서버 오류입니다.'
        })
    }
})

// path 수정
router.post('/patch', (req, res) => {
    try {
        console.log("From Laravel REQUEST!!", req.body.message)
        return res.json({
            code: 200,
            message: '노드 서버 연결 성공 => ' + req.body.message
        });
    } catch (err) {
        return res.status(500).json({
            code: 500,
            message: '서버 오류입니다.'
        })
    }
})

// path 삭제
router.get('/delete', (req, res) => {
    try {
        console.log("From Laravel REQUEST!!", req.body.message)
        return res.json({
            code: 200,
            message: '노드 서버 연결 성공 => ' + req.body.message
        });
    } catch (err) {
        return res.status(500).json({
            code: 500,
            message: '서버 오류입니다.'
        })
    }
})

module.exports = router;