const express = require('express');
const router = express.Router();
const dayjs = require('dayjs');
const currentDate = dayjs().format('YYYY-MM-DD HH:mm:ss');
router.get('/health', (req, res) => {
    return res.status(200).json({
        success: true,
        error: false,
        message: `health working testing in ${process.env.NODE_ENV || 'dev'} : ${currentDate}`,
    });
});

module.exports = router;