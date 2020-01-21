const express = require('express')
const session = require('express-session')
const cors = require('cors')

/** route handlers */
const verifyThenNextQuestion = require('./handlers/verifyThenNextQuestion')
const getQuestions = require('./handlers/getQuestions')
/*****************/

const app = express()
const port = 8765
const sessionOptions = require('./config/sessionOptions')

if (app.get('env') === 'production') {
  app.set('trust proxy', 1) // for proxying behind nginx in prod
  sessionOptions.cookie.secure = true // https only cookies in prod
}

app.use(session(sessionOptions))
app.use(express.json())
app.use(cors())

// routes
app.post('/start', getQuestions)
app.post('/verify', verifyThenNextQuestion)

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({error: true, msg: 'notfound'})
})

app.listen(port, () => console.log(`listening on ${port}!...`))
