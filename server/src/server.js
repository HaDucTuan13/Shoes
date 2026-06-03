// const express = require('express');
// const app = express();
// const port = 3000;

// const connectDB = require('./config/connectDB');
// const routes = require('./routes/index.routes');

// const cookieParser = require('cookie-parser');
// const cors = require('cors');
// const path = require('path');
// connectDB();

// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
// app.use(cookieParser());

// app.use(cors({ origin: process.env.URL_CLIENT, credentials: true }));

// app.use(express.static(path.join(__dirname, '../src')));
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// routes(app);

// app.use((err, req, res, next) => {
//     const statusCode = err.statusCode || 500;
//     res.status(statusCode).json({
//         success: false,
//         message: err.message || 'Lỗi server',
//     });
// });

// app.listen(port, () => {
//     console.log(`Example app listening on port ${port}`);
// });

const express = require('express');
const app = express();
const port = 3000;

const connectDB = require('./config/connectDB');
const routes = require('./routes/index.routes');

const { initSocket } = require('./socket');
const { createServer } = require('node:http');
const server = createServer(app);

const cookieParser = require('cookie-parser');
const cors = require('cors');
const path = require('path');
connectDB();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(cors({ origin: process.env.URL_CLIENT, credentials: true }));

app.use(express.static(path.join(__dirname, '../src')));

routes(app);

app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
        success: false,
        message: err.message || 'Lỗi server',
    });
});

initSocket(server);

server.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
