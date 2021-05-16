const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
    if (req.session.user) {
        // user is authenticated
        //res.redirect('/home');
        // res.status(200).json({ message: 'User is authenticated.' }); // should be redirected to home/dashboard once built
        res.render('dashboard/home', {
            title: 'Home',
            partial: 'dashboard_js_script',
            sessionUserId: req.session.user.userId
        }); // if user already log in, when they go to login page, they should redirect profile page instead of seeing login form
        return;
    } else {
        res.render('auth/login', {
            title: 'login',
            partial: 'login_check_script'
        });
        return;
    }
});

router.get('/register', async (req, res) => {
    res.render('auth/register', {
        title: 'register',
        partial: 'register_check_script'
    });
});

module.exports = router;
