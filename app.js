const express = require('express');
const logger = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const chalk = require('chalk');

const registerRouter = require('./routes/register');
const loginRouter = require('./routes/login');
const postRouter = require('./routes/post');
const userRouter = require('./routes/user');
const commentRouter = require('./routes/comment');
const messageRouter = require('./routes/message');

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ limit: "50mb", extended: false }));
app.use(cors());
app.use(helmet());

app.use('/api/register', registerRouter);
app.use('/api/login', loginRouter);
app.use('/api/post', postRouter);
app.use('/api/user', userRouter);
app.use('/api/comment', commentRouter);
app.use('/api/message', messageRouter);

app.use((req, res, next) => {
    const error = new Error('Route not found');
    error.status = 404;
    next(error);
});

app.use((err, req, res, next) => {
    res.status(err.status || 500).json({ msg: err.message || 'Error occured' });
});


const server = app.listen(process.env.PORT, () => {
    console.log(chalk.yellow('Server running on localhost:5000'));
});

require('./util/socket').init(server);