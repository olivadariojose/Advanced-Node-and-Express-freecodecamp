
// // server.js
// 'use strict';
// require('dotenv').config();
// const express = require('express');
// const myDB = require('./connection');
// const fccTesting = require('./freeCodeCamp/fcctesting.js');

// const app = express();

// // CORS abierto para el tester de freeCodeCamp
// app.use((req, res, next) => {
//   res.header('Access-Control-Allow-Origin', '*');
//   res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
//   next();
// });

// fccTesting(app); // For FCC testing purposes

// app.set('view engine', 'pug');
// app.set('views', './views/pug');

// app.use('/public', express.static(process.cwd() + '/public'));
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// app.get('/', (req, res) => {
//   res.render('index'); // renderiza views/pug/index.pug
// });

// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => {
//   console.log('Listening on port ' + PORT);
// });


// server.js
'use strict';
require('dotenv').config();
const express = require('express');
const myDB = require('./connection');
const fccTesting = require('./freeCodeCamp/fcctesting.js');

const app = express();

// CORS para el tester de freeCodeCamp
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

fccTesting(app);

app.set('view engine', 'pug');
app.set('views', './views/pug');

app.use('/public', express.static(process.cwd() + '/public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.render('index', {
    title: 'Hello',
    message: 'Please log in',
    showLogin: true,
    showRegistration: true,
    showSocialAuth: true
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('Listening on port ' + PORT);
});
