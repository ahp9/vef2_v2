import express from 'express';
import { listEvents, total } from '../lib/db.js';
import passport from '../lib/login.js';
import { PAGE_SIZE, pagingInfo } from '../lib/page.js';
import { createUser, findByUsername } from '../lib/users.js';

export const userRouter = express.Router();

function login(req, res) {
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

    const { user: { admin } = {} } = req;
    if(admin){
      res.redirect('/admin');
    } else {
      res.redirect('/user');
    }
  }
);

userRouter.get('/user', async (req, res) => {
  const { user } = req;


  let { page = 1 } = req.query;
  page = Number(page);
  const offset = (page - 1) * PAGE_SIZE;

  const { search } = req.query;


  const events = await listEvents(offset, PAGE_SIZE, search);
  const totalEvents = await total(search);
  const paging = await pagingInfo( {
    page, offset, totalEvents, eventsLength: events.length,
  },
  );

  // logout hendir session cookie og session
  res.render('user', {
    events,
    user,
    title: 'Viðburðir',
    paging,
    admin: false })
});




userRouter.get('/logout', (req, res) => {
  // logout hendir session cookie og session
  req.logout();
  res.redirect('/');
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

  const validationMessage = await validateUser(username, password);

  if (validationMessage) {
    return res.send(`
      <p>${validationMessage}</p>
      <a href="/register">Reyna aftur</a>
    `);
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
    res.redirect('/user');
  },
);
