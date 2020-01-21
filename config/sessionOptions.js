/**
 * Config for session storage
 */
const session = require('express-session')
const MemcachedStore = require('connect-memcached')(session)

const sessionOptions = {
  key: 'tsid',
  secret: require('../secrets/sessionSecret'),
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    maxAge: 24*60*60*1000
  },
  store: new MemcachedStore({
    hosts: ['127.0.0.1:11211'],
    secret: require('../secrets/storeSecret'),
  })
}

module.exports = sessionOptions
