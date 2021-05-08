const express = require("express");
const router = express.Router();

router.get("/" , async (req, res) => {
    if (req.session.user) { // user is authenticated
        //res.redirect('/home');
        res.status(200).json({ message: 'User is authenticated.' }); // should be redirected to home/dashboard once built
        return ;
    }else {
        res.render('pages/login' , {
            title: 'login',
            partial: 'login_check_script',
            error: false });
        return;
    }
});

module.exports = router;