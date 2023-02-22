import express from 'express';
import passport from '../lib/login.js';
import { createUser, findByUsername } from '../lib/users.js';

export const userRouter = express.Router();

export function login(req, res) {
  if (req.isAuthenticated()) {
    return res.redirect('/');
  }

  let message = '';

  // Athugum hvort einhver skilaboð séu til í session, ef svo er birtum þau
  // og hreinsum skilaboð
  if (req.session.messages && req.session.messages.length > 0) {
    message = req.session.messages.join(', ');
    req.session.messages = [];
  }

  return res.render('login', { message, title: 'Innskráning' });
}



userRouter.get('/login', login);
userRouter.post(
  '/login',

  // Þetta notar strat að ofan til að skrá notanda inn
  passport.authenticate('local', {
    failureMessage: 'Notandanafn eða lykilorð vitlaust.',
    failureRedirect: '/admin/login',
  }),

  // Ef við komumst hingað var notandi skráður inn, senda á /admin
  (req, res) => {
    res.redirect('/admin');
  }
);


userRouter.get('/logout', (req, res, next) => {
  req.logout((err) => {
    if (err) { return next(err); }
    return res.redirect('/');
  });
});


userRouter.get('/register', (req,res) => {
  let message = '';

  // Athugum hvort einhver skilaboð séu til í session, ef svo er birtum þau
  // og hreinsum skilaboð
  if (req.session.messages && req.session.messages.length > 0) {
    message = req.session.messages.join(', ');
    req.session.messages = [];
  }
  res.render('register', {message, title : 'Nýskráning'});
});

async function validateUser(username, password) {
  if(typeof username !== 'string' || username.length < 2) {
    return 'Notendanafn verdur ad vera amk 2 stafir';
  }

  const user = await findByUsername(username);

  if(user === null){
    return 'Gat ekk athugað notendanafn'
  }

  if (user) {
    return 'Notendanafn er þegar skráð';
  }

  if (typeof password !== 'string' || password.length < 6) {
    return 'Lykilorð verður að vera amk 6 stafir';
  }

  return null;
}


async function register(req, res, next) {
  const { username, password } = req.body;

  const message = await validateUser(username, password);

  if (message) {
    return res.render('register', {message, title : 'Nýskráning'});
  }

  await createUser(username, password, false);

  // næsta middleware mun sjá um að skrá notanda inn
  // `username` og `password` verða ennþá sett sem rétt í `req`
  return next();
}

userRouter.post(
  '/register',
  register,
  passport.authenticate('local', {
    failureMessage: 'Notandanafn eða lykilorð vitlaust.',
    failureRedirect: '/register',
  }),
  (req, res) => {
    res.redirect('/admin');
  },
);
