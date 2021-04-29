// route imports
const commentRoutes = require('./comments');

// 
const constructorMethod = (app) => {
    app.use('', routes);
    
    app.use('/comments', commentRoutes);
    app.use('*', (req, res) => {
        res.sendStatus(404);
    });
};

module.exports = constructorMethod;