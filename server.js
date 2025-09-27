// server.js
'use strict';
require('dotenv').config();

const express = require('express');
const myDB = require('./connection');
const fccTesting = require('./freeCodeCamp/fcctesting.js');

const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const { ObjectId } = require('mongodb');

const app = express();

/* CORS para el tester de freeCodeCamp */
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

fccTesting(app);

/* Pug */
app.set('view engine', 'pug');
app.set('views', __dirname + '/views/pug');

/* Static + body parsers */
app.use('/public', express.static(process.cwd() + '/public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* session + passport (usa valores del boilerplate FCC) */
app.use(session({
  secret: process.env.SESSION_SECRET || 'mysecret',
  resave: true,
  saveUninitialized: true,
  cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 },
}));
app.use(passport.initialize());
app.use(passport.session());

/* Conexión DB + estrategia + rutas + (de)serialización */
myDB(async (client) => {
  const myDataBase = client.db('database').collection('users');

  /* Estrategia Local para ESTE paso (sin bcrypt) */
  passport.use(new LocalStrategy(async (username, password, done) => {
    try {
      const user = await myDataBase.findOne({ username });
      if (!user) return done(null, false);
      if (user.password !== password) return done(null, false);
      return done(null, user);
    } catch (e) {
      return done(e);
    }
  }));

  /* Serialization */
  passport.serializeUser((user, done) => done(null, user._id));
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await myDataBase.findOne({ _id: new ObjectId(id) });
      done(null, user);
    } catch (err) {
      done(err);
    }
  });

  /* Middleware protegido */
  function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated && req.isAuthenticated()) return next();
    return res.redirect('/');
  }

  /* Home: muestra formularios de login y registro */
  app.get('/', (req, res) => {
    res.render('index', {
      title: 'Connected to Database',
      message: 'Please login',
      showLogin: true,
      showRegistration: true,
    });
  });

  /* Login */
  app.post('/login',
    passport.authenticate('local', { failureRedirect: '/' }),
    (req, res) => res.redirect('/profile')
  );

  /* Registro: registrar -> autenticar -> redirigir */
  app.post('/register',
    async (req, res, next) => {
      try {
        const { username, password } = req.body;

        const exists = await myDataBase.findOne({ username });
        if (exists) return res.redirect('/');

        await myDataBase.insertOne({ username, password });
        return next(); // pasa a autenticar
      } catch (err) {
        return next(err);
      }
    },
    passport.authenticate('local', { failureRedirect: '/' }),
    (req, res) => res.redirect('/profile')
  );

  /* Perfil protegido */
  app.get('/profile', ensureAuthenticated, (req, res) => {
    res.render('profile', { username: req.user.username });
  });

  /* Logout robusto (Passport 0.6+) */
  const logoutHandler = (req, res, next) => {
    req.logout(err => {
      if (err) return next(err);
      if (req.session) {
        req.session.destroy(() => {
          res.clearCookie('connect.sid');
          return res.redirect('/');
        });
      } else {
        return res.redirect('/');
      }
    });
  };
  app.get('/logout', logoutHandler);
  app.post('/logout', logoutHandler);

  /* 404 */
  app.use((req, res) => res.status(404).type('text').send('Not Found'));

  /* Handler de errores para evitar requests colgados */
  app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).type('text').send('Internal Server Error');
  });
}).catch((e) => {
  app.get('/', (req, res) => {
    res.render('index', {
      title: String(e),
      message: 'Unable to connect to database',
      showLogin: true,
      showRegistration: true,
    });
  });
  app.use((req, res) => res.status(404).type('text').send('Not Found'));
  app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).type('text').send('Internal Server Error');
  });
});

/* Start */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Listening on port ' + PORT));
