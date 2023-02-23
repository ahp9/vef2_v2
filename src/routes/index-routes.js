import express from 'express';
import { validationResult } from 'express-validator';
import { catchErrors } from '../lib/catch-errors.js';
import { listEvent, listEvents, listRegistered, register, total } from '../lib/db.js';
import { PAGE_SIZE, pagingInfo } from '../lib/page.js';
import {
  registrationValidationMiddlewareComment,
  sanitizationMiddleware,
  xssSanitizationMiddleware
} from '../lib/validation.js';

export const indexRouter = express.Router();

async function indexRoute(req, res) {
  let { page = 1 } = req.query;
  page = Number(page);
  const offset = (page - 1) * PAGE_SIZE;
  const user = {
    username: '',
    admin: false,
  }
  const { search } = req.query;


  const events = await listEvents(offset, PAGE_SIZE, search);
  const totalEvents = await total(search);
  const paging = await pagingInfo( {
    page, offset, totalEvents, eventsLength: events.length,
  },
  );

  res.render('index', {
    title: 'Viðburðasíðan',
    admin: false,
    user,
    events,
    paging

  });
}

async function eventRoute(req, res, next) {
  const { slug } = req.params;
  const event = await listEvent(slug);
  const {user} = req;
  const message  = '';

  if (!event) {
    return next();
  }

  const registered = await listRegistered(event.id);
  return res.render('event', {
    title: `${event.name} — Viðburðasíðan`,
    event,
    user,
    message,
    registered,
    errors: [],
    data: {},
  });
}

async function eventRegisteredRoute(req, res) {
  const events = await listEvents();

  res.render('registered', {
    title: 'Viðburðasíðan',
    events,
  });
}

async function validationCheck(req, res, next) {
  const { comment } =  'Skradur inn';
  const {user} = req;


  if(!user){
    return res.redirect('register');
  }
  const message = '';
  const name = user.username;
  // TODO tvítekning frá því að ofan
  const { slug } = req.params;
  const event = await listEvent(slug);
  const registered = await listRegistered(event.id);

  const data = {
    name,
    comment,
  };

  const validation = validationResult(req);

  if (!validation.isEmpty()) {
    return res.render('event', {
      title: `${event.name} — Viðburðasíðan`,
      data,
      event,
      user,
      registered,
      message,
      errors: validation.errors,
    });
  }

  return next();
}

async function registerRoute(req, res) {
  const { comment } = req.body;
  const {user} = req;
  const name = user.username;
  const { slug } = req.params;
  const event = await listEvent(slug);

  const registered = await register({
    name,
    comment,
    event: event.id,
  });

  if (registered) {
    return res.redirect(`/${event.slug}`);
  }

  return res.redirect(`/${event.slug}`);
}

indexRouter.get('/', catchErrors(indexRoute));
indexRouter.get('/:slug', catchErrors(eventRoute));
indexRouter.post(
  '/:slug',
  registrationValidationMiddlewareComment('comment'),
  xssSanitizationMiddleware('comment'),
  catchErrors(validationCheck),
  sanitizationMiddleware('comment'),
  catchErrors(registerRoute)
);
indexRouter.get('/:slug/thanks', catchErrors(eventRegisteredRoute));
