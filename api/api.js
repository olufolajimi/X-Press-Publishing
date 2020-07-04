const express = require('express')
const apiRouter = express.Router({mergeParams: true})
const artistRouter = require('./artists')
const seriesRouter = require('./series')

apiRouter.use('/artists', artistRouter)
apiRouter.use('/series', seriesRouter)


module.exports = apiRouter;