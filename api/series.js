const express = require('express')
const seriesRouter = express.Router({mergeParams: true})
const sqlite3 = require('sqlite3')
const db = new sqlite3.Database(process.env.TEST_DATABASE || '../database.sqlite')
const issuesRouter = require('./issues')

seriesRouter.use('/:seriesId/issues', issuesRouter)

seriesRouter.param('seriesId', (req, res, next, seriesId) => {
    const sql = 'SELECT * FROM Series WHERE Series.id = $seriesId';
    const values = {$seriesId: seriesId};
    db.get(sql, values, (error, series) => {
      if (error) {
        next(error);
      } else if (series) {
        req.series = series;
        next();
      } else {
        res.sendStatus(404);
      }
    });
  });

seriesRouter.get('/', (req, res, next) => {
    db.all("SELECT * FROM Series", (err, rows) => {
        if(err) {
            next(err)
        } else {
            res.status(200).send({series: rows})
        }
    })
})

seriesRouter.get('/:seriesId', (req, res, next) => {
    res.status(200).send({series: req.series})
})

seriesRouter.post('/', (req, res, next) => {
    if(!req.body.series.name || !req.body.series.description) {
        res.status(400).send()
    } else {
        db.run("INSERT INTO Series (name, description) VALUES ($name, $description)",
        {
            $name: req.body.series.name,
            $description: req.body.series.description
        }, 
        function(error) {
            db.get("SELECT * FROM Series WHERE id = $id", { $id: this.lastID }, (err, row) => {
                res.status(201).send({series: row})
            })
        })
    }
})

seriesRouter.put('/:seriesId', (req, res, next) => {
    if(!req.body.series.name || !req.body.series.description) {
        res.status(400).send()
    } else {
        db.run("UPDATE Series SET name = $name, description = $description WHERE id = $id", 
        {
            $name: req.body.series.name,
            $description: req.body.series.description,
            $id: req.params.seriesId
        }, 
        function(err) {
            if(err) {
                next(err)
            } else {
                db.get("SELECT * FROM Series WHERE id = $id", 
                { $id: req.params.seriesId }, 
                (err, row) => {
                    if(err) {
                        next(err)
                    } else {
                        res.status(200).send({series: row})
                    }
                })
            }
        })
    }
})

seriesRouter.delete('/:seriesId', (req, res, next) => {
    db.get("SELECT * FROM Issue WHERE series_id = $series_id", 
    {$series_id: req.params.seriesId}, 
    (err, row) => {
        if(err) {
            next(err)
        } else if (row) {
            res.status(400).send()
        } else {
            db.run("DELETE FROM Series WHERE id = $series_id", 
            {$series_id: req.params.seriesId}, 
            (err) => {
                if(err) {
                    next(err)
                } else {
                    res.status(204).send()
                }
            })
        }
    })
})


module.exports = seriesRouter;