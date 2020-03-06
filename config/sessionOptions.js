/**
 * Config for session storage
 */
const session = require('express-session')
const MemcachedStore = require('connect-memcached')(session)
// const isProd = require('./isProd')

const sessionOptions = {
  key: 'tsid',
  secret: require('../secrets/sessionSecret'),
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    maxAge: 14*24*60*60*1000,
    credentials: true,
    sameSite: 'strict',
    // commented out to try and figure out why cookies broke in prod
    // secure: isProd
  },
  store: new MemcachedStore({
    // default port for memcached. it is the same in prod and dev.
    hosts: ['127.0.0.1:11211'],
    secret: require('../secrets/storeSecret'),
  })
}

module.exports = sessionOptions
