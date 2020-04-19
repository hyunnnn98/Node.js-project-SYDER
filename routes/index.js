const express = require('express');

const router = express.Router();

router.get('/', (req, res) => {
    // res.render('index');
});

router.post('/status', (req, res) => {
    try {
        console.log("다른 루트로부터 연결 들어왔음!!")
        return res.json({
            code: 200,
            message: '노드 서버 연결 성공!'
        });
    } catch (err) {
        console.log("서버 측 오류!", err);
        return res.status(500).json({
            code: 500,
            message: '서버 오류입니다.'
        })
    }
})

module.exports = router;