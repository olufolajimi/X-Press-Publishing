const bodyParser = require('body-parser')
const cors = require('cors')
const errorHandler = require('errorhandler')
const morgan = require('morgan')
const express = require('express')
const apiRouter = require('./api/api')

const app = express()

const PORT = process.env.PORT || 8000

app.use(cors())
app.use(bodyParser.json())
app.use(errorHandler())
app.use(morgan('dev'))

app.use('/api', apiRouter)

app.listen(PORT, () => {
    console.log(`Server now listening on Port ${PORT}`)
})

module.exports = app;