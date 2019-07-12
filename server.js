const express = require('express')
const session = require('express-session')
const MemcachedStore = require('connect-memcached')(session)

/** route handlers */
const verifyThenNextQuestion = require('./handlers/verifyThenNextQuestion')
const getQuestions = require('./handlers/getQuestions')
/*****************/

const app = express()
const port = 8765
const sessionOptions = {
  key: 'tsid',
  secret: require('./secrets/sessionSecret'),
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    maxAge: 24*60*60*1000
  },
  store: new MemcachedStore({
    hosts: ['127.0.0.1:11211'],
    secret: require('./secrets/storeSecret'),
  }),
}
if (app.get('env') === 'production') {
  app.set('trust proxy', 1) // for proxying behind nginx in prod
  sessionOptions.cookie.secure = true // https only cookies in prod
}
app.use(session(sessionOptions))
app.use(express.json())

// routes
app.post('/start', getQuestions)
app.post('/verify', verifyThenNextQuestion)

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({error: true, msg: 'notfound'})
})

app.listen(port, () => console.log(`listening on ${port}!...`))