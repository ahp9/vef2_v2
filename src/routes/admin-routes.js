import express from 'express';
import { validationResult } from 'express-validator';
import { catchErrors } from '../lib/catch-errors.js';
import {
  createEvent, deleteRow, listEvent,
  listEventByName,
  listEvents, total, updateEvent
} from '../lib/db.js';
import { ensureLoggedIn } from '../lib/login.js';
import { PAGE_SIZE, pagingInfo } from '../lib/page.js';
import { slugify } from '../lib/slugify.js';
import {
  registrationValidationMiddleware,
  sanitizationMiddleware,
  xssSanitizationMiddleware
} from '../lib/validation.js';

export const adminRouter = express.Router();

async function index(req, res) {
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

  res.render('admin', {
    events,
    errors: [],
    data: {},
    user,
    title: 'Viðburðir',
    paging,
    admin: user.admin });
}


function isValidUrl(urlString) {
  try {

    if (urlString === null){
      return true;
    }
    const url = new URL(urlString);
    if(url){
      return true;
    }
    return false;
  } catch(e){
    return false;
  }
}

async function validationCheck(req, res, next) {
  const { name, description, location, url } = req.body;

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

  const {user} = req

  const data = {
    name,
    description,
    location,
    url,
  };

  const validation = validationResult(req);

  const customValidations = [];

  const eventNameExists = await listEventByName(name);

  if (eventNameExists !== null) {
    customValidations.push({
      param: 'name',
      msg: 'Viðburður með þessu nafni er til',
    });
  }

  if(!isValidUrl(url) && url !== ''){
    customValidations.push({
      param: 'url',
      msg: 'Ekki lögleg vefsíða',
    });
  }

  if (!validation.isEmpty() || customValidations.length > 0) {
    return res.render('admin', {
      events,
      user,
      title: 'Viðburðir — umsjón',
      data,
      paging,
      errors: validation.errors.concat(customValidations),
      admin: true,
    });
  }

  return next();
}

async function validationCheckUpdate(req, res, next) {
  const { name, description, location, url } = req.body;
  const { slug } = req.params;
  const { user: { username } = {} } = req;

  const event = await listEvent(slug);

  const data = {
    name,
    description,
    location,
    url,
  };

  const validation = validationResult(req);

  const customValidations = [];

  const eventNameExists = await listEventByName(name);

  if (eventNameExists !== null && eventNameExists.id !== event.id) {
    customValidations.push({
      param: 'name',
      msg: 'Viðburður með þessu nafni er til',
    });
  }

  if(!isValidUrl(url) && url !== ''){
    customValidations.push({
      param: 'url',
      msg: 'Ekki lögleg vefsíða',
    });
  }

  if (!validation.isEmpty() || customValidations.length > 0) {
    return res.render('admin-event', {
      username,
      event,
      title: 'Viðburðir — umsjón',
      data,
      errors: validation.errors.concat(customValidations),
      admin: true,
    });
  }

  return next();
}

async function registerRoute(req, res) {

  const { name, description, location, url } = req.body;
  const slug = slugify(name);

  const created = await createEvent({ name, slug, description, location, url });

  if (created) {
    return res.redirect('/admin');
  }

  return res.render('error');
}

async function updateRoute(req, res) {
  const { name, description, location, url } = req.body;
  const { slug } = req.params;

  const event = await listEvent(slug);

  const newSlug = slugify(name);

  const updated = await updateEvent(event.id, {
    name,
    slug: newSlug,
    description,
    location,
    url,
  });

  if (updated) {
    return res.redirect('/admin');
  }

  return res.render('error');
}

async function eventRoute(req, res, next) {
  const { slug } = req.params;
  const { user: { username } = {} } = req;

  const event = await listEvent(slug);

  if (!event) {
    return next();
  }

  return res.render('admin-event', {
    username,
    title: `${event.name} — Viðburðir — umsjón`,
    event,
    errors: [],
    data: { name: event.name, description: event.description, location: event.location,
      url: event.url },
  });
}

adminRouter.get('/', ensureLoggedIn, catchErrors(index));
adminRouter.post(
  '/',
  ensureLoggedIn,
  registrationValidationMiddleware('description'),
  xssSanitizationMiddleware('description'),
  catchErrors(validationCheck),
  sanitizationMiddleware('description'),
  catchErrors(registerRoute)
);

// Verður að vera seinast svo það taki ekki yfir önnur route
adminRouter.get('/:slug', ensureLoggedIn, catchErrors(eventRoute));
adminRouter.post(
  '/:slug',
  ensureLoggedIn,
  registrationValidationMiddleware('description'),
  xssSanitizationMiddleware('description'),
  catchErrors(validationCheckUpdate),
  sanitizationMiddleware('description'),
  catchErrors(updateRoute)
);

async function deleteRoute(req, res) {
  const { id } = req.params;

  const deleted = deleteRow(id);

  if (deleted) { // Tæknilega böggur hér...
    return res.redirect('/admin');
  }

  return res.render('error', { title: 'Gat ekki eytt færslu' });
}
adminRouter.post('/delete/:id', ensureLoggedIn, catchErrors(deleteRoute));

