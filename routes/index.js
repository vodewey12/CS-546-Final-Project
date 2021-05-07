// route imports
const commentRoutes = require('./comments');
const profileRoutes = require('./profile');

// 
const constructorMethod = (app) => {

    app.use('/comments', commentRoutes);
    app.use('/profile', profileRoutes);  // need this router to show user profile
    app.use('/', profileRoutes);
    app.use('*', (req, res) => {
        res.sendStatus(404);
    });
};

module.exports = constructorMethod;