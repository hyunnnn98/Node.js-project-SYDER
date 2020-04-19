const express = require('express');
const axios = require('axios');
const router = express.Router();

router.get('/', (req, res) => {
    // res.render('index');
});

router.post('/status', async (req, res) => {
    try {
        console.log("다른 루트로부터 연결 들어왔음!!", req.body.message)
        await axios.get('http://bokvengers.iptime.org/api/node')
            .then(res => {
                console.log("데이터 받았어!");
            })
            .catch(err => {
                console.log(err);
            })

        return res.json({
            code: 200,
            message: '노드 서버 연결 성공 => ' + req.body.message
        });
    } catch (err) {
        console.log("서버 측 오류!", err);
        return res.status(500).json({
            code: 500,
            message: '서버 오류입니다.'
        })
    };


})

module.exports = router;