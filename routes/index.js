const express = require('express');

const router = express.Router();

router.get('/', (req, res) => {
    // res.render('index');
});

router.post('/status', (req, res) => {
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