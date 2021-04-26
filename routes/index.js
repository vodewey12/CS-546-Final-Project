// route imports

// 
const constructorMethod = (app) => {
    app.use('', routes);

    app.use('*', (req, res) => {
        res.sendStatus(404);
    });
};

module.exports = constructorMethod;