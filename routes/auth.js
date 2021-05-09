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
        });
        return;
    }
});

router.get("/register" , async (req, res) => {
    res.render('pages/register' , {
        title: 'register',
        partial: 'register_check_script',
    });
})

module.exports = router;