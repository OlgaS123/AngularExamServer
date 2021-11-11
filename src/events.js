const express = require('express');

function createRouter(db) {
  const router = express.Router();

  // router.post('/event', (req, res, next) => {
  //   // const owner = req.user.email;
  //   db.query(
  //     'INSERT INTO events (owner, name, description, date) VALUES (?,?,?,?)',
  //     [owner, req.body.name, req.body.description, new Date(req.body.date)],
  //     (error) => {
  //       if (error) {
  //         console.error(error);
  //         res.status(500).json({status: 'error'});
  //       } else {
  //         res.status(200).json({status: 'ok'});
  //       }
  //     }
  //   );
  // });

  router.get('/event', function (req, res, next) {
    db.query(
      // 'SELECT id, name, element_id, region_id, rarity FROM characters ORDER BY rarity',
      'SELECT characters.id, characters.name, characters.rarity, elements.element_name, regions.region_name FROM characters JOIN (regions, elements) ON (characters.region_id = regions.id AND characters.element_id = elements.id) ORDER BY characters.name',
      (error, results) => {
        if (error) {
          console.log(error);
          res.status(500).json({status: 'error'});
        } else {
            console.log(results);
          res.status(200).json(results);
        }
      }
    );
  });

  // router.put('/event/:id', function (req, res, next) {
  //   // const owner = req.user.email;
  //   db.query(
  //     'UPDATE events SET name=?, description=?, date=? WHERE id=? AND owner=?',
  //     [req.body.name, req.body.description, new Date(req.body.date), req.params.id, owner],
  //     (error) => {
  //       if (error) {
  //         res.status(500).json({status: 'error'});
  //       } else {
  //         res.status(200).json({status: 'ok'});
  //       }
  //     }
  //   );
  // });

  // router.delete('/event/:id', function (req, res, next) {
  //   // const owner = req.user.email;
  //   db.query(
  //     'DELETE FROM events WHERE id=? AND owner=?',
  //     [req.params.id, owner],
  //     (error) => {
  //       if (error) {
  //         res.status(500).json({status: 'error'});
  //       } else {
  //         res.status(200).json({status: 'ok'});
  //       }
  //     }
  //   );
  // });

  return router;
}

module.exports = createRouter;


