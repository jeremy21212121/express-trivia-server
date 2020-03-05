const isProd = require('./isProd')

const options = {
  credentials: true,
  origin: isProd ? 'https://justtrivia.fun' : 'http://192.168.0.10:3000'
}

module.exports = options
