const express = require('express')
const session = require('express-session')
const cors = require('cors')

/** middleware */
const validateRequest = require('./middleware/validateRequest.js');

/** route handlers */
const verifyThenNextQuestion = require('./handlers/verifyThenNextQuestion')
const getQuestions = require('./handlers/getQuestions')
/*****************/

const app = express()
const port = require('./config/port')
const sessionOptions = require('./config/sessionOptions')
const corsOptions = require('./config/corsOptions')
const isProd = require('./config/isProd')

if (isProd) {
  app.set('trust proxy', 1) // for proxying behind nginx in prod
  app.disable('x-powered-by') // disable express header, its an info leak
}

app.use( session( sessionOptions) )
app.use( express.json() )
app.use( cors(corsOptions) )

// routes
app.post('/start', validateRequest.getQuestions, getQuestions)
app.post('/verify', verifyThenNextQuestion)

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({error: true, msg: 'not-found'})
})
// error handler
app.use((err, req, res, _next) => {
  console.log(
    `Error: ${err.message}
Request body:`)
  console.log(req.body)
  res.status(500).json({ error: true, msg: err.message})
})

app.listen(port, () => console.log(`listening on ${port}!...`))
