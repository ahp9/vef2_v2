# Event site
This project shows an event site that uses a Postgres database and javascript/HTML front-end. You can see the events without having to log in, but if you log in you can register for those events.
There is a user already available for you to use, that is the admin. Admin can add an event and also delete them. 
The log informations for the admin is as follows: 
- username: admin
- passwords: 1234

This site is in Icelandic because the site was made as a project in Web Programming 2, at the University of Iceland.

```bash
createdb vef2-2022-v2
# put up .env & .env.test with connection to the database
npm install
npm run test
npm run setup
npm start # eða `npm run dev`
```
