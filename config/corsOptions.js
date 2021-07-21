const isProd = require('./isProd')

const options = {
  credentials: true,
  origin: isProd ? 'https://justtrivia.fun' : 'https://home.jeremypoole.ca'
}

module.exports = options
