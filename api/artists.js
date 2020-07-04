const express = require('express')
const artistRouter = express.Router()
const sqlite3 = require('sqlite3')
const db = new sqlite3.Database(process.env.TEST_DATABASE || '../database.sqlite')

artistRouter.use('/:artistId', (req, res, next) => {
    db.get("SELECT * FROM Artist WHERE id = $id", 
    { $id: req.params.artistId }, 
    (err, row) => {
        if(err) {
            next(err)
        } else {
            if(row) {
                req.artist = row;
                next();
            } else {
                res.status(404).send()
            }
        }
    })
})

artistRouter.get('/', (req, res, next) => {
    db.all("SELECT * FROM Artist WHERE is_currently_employed = 1", (error, rows) => {
        if(error) {
            next(err)
        } else {
            res.status(200).send({artists: rows})
        }
    })
})

artistRouter.get('/:artistId', (req, res, next) => {
    res.status(200).send({artist: req.artist})
})

artistRouter.post('/', (req, res, next) => {
    if(req.body.artist.name && req.body.artist.dateOfBirth && req.body.artist.biography) {
        if(!req.body.artist.isCurrentlyEmployed) {
            req.body.artist.isCurrentlyEmployed = 1
        }
        db.run("INSERT INTO Artist (name, date_of_birth, biography, is_currently_employed)" +
         " VALUES ($name, $dob, $bio, $employed)", 
         {
            $name: req.body.artist.name,
            $dob: req.body.artist.dateOfBirth,
            $bio: req.body.artist.biography,
            $employed: req.body.artist.isCurrentlyEmployed
         }, 
         function(error) {
             if(error) {
                 next(error)
             } else {
                 db.get("SELECT * FROM Artist WHERE id = $id", { $id: this.lastID }, (err, row) => {
                     res.status(201).send({artist: row})
                 })
             }
         })
    } else {
        res.status(400).send();
    }
})

artistRouter.put('/:artistId', (req, res, next) => {
    if(!req.body.artist.name || !req.body.artist.dateOfBirth || !req.body.artist.biography) {
        res.status(400).send()
    } else {
        db.run("UPDATE Artist SET name = $name, date_of_birth = $dob, biography = $bio, is_currently_employed = $employed WHERE id = $id ", 
        {
            $name: req.body.artist.name,
            $dob: req.body.artist.dateOfBirth,
            $bio: req.body.artist.biography,
            $employed: req.body.artist.isCurrentlyEmployed,
            $id: req.params.artistId
        }, function(err) {
            if(err) {
                next(err)
            } else {
                db.get("SELECT * FROM Artist WHERE id = $id", { $id: req.params.artistId }, (err, row) => {
                    res.status(200).send({artist: row})
                })
            }
        })
    }
})

artistRouter.delete('/:artistId', (req, res, next) => {
    db.run("UPDATE Artist SET is_currently_employed = 0 WHERE id = $id",
     { $id: req.params.artistId }, 
     (err) => {
        if(err) {
            next(err)
        } else {
            db.get("SELECT * FROM Artist WHERE id = $id", { $id: req.params.artistId }, (err, row) => {
                res.status(200).send({artist: row})
            })
        }
    })
})

module.exports = artistRouter;