const express = require('express');
const {json} = require("express");

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

    let token=0;
    router.post('/login/:login&:password', function (req, res, next) {
        db.query(
            'SELECT id, login, password FROM users WHERE login=?',
            [req.params.login],
            (error, results) => {
                if (error) {
                    console.log(error);
                    res.status(500).json({status: 'error'});
                } else {
                    //console.log(results);
                    if(results.length)
                    {
                        if(req.params.password===results[0].password){
                            token=Math.floor(Math.random() * (1000 - 1) + 1);
                            results[0]=token;
                        }
                        else {
                            results[0]=0;
                        }
                    }
                    res.status(200).json(results);
                }
            }
        );
    });

  router.get('/characters', function (req, res, next) {
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

  let sql="SELECT characters.id, characters.name, characters.rarity, elements.element_name, regions.region_name, " +
      "max(case when material_types.type_name = 'Primary Material' then materials.material_name end) 'primary_material', " +
      "max(case when material_types.type_name = 'Elemental Stone' then materials.material_name end) 'elemental_stone', " +
      "max(case when material_types.type_name = 'Local Material' then materials.material_name end) 'local_material', " +
      "max(case when material_types.type_name = 'Secondary Material' then materials.material_name end) 'secondary_material', " +
      "max(case when material_types.type_name = 'Talent Book' then materials.material_name end) 'talent_book', " +
      "max(case when material_types.type_name = 'Talent Material' then materials.material_name end) 'talent_material', " +
      "max(case when material_types.type_name = 'Crown' then materials.material_name end) 'crown', " +
      "max(case when material_types.type_name = 'Mora' then materials.material_name end) 'mora', " +
      "max(case when material_types.type_name = 'EXP Book' then materials.material_name end) 'exp_book' " +
      "FROM characters JOIN (regions, elements, character_materials, materials, material_types) ON (characters.region_id = regions.id AND characters.element_id = elements.id " +
      "AND characters.id = character_materials.character_id AND character_materials.material_id = materials.id AND materials.type_id = material_types.id)" +
      "WHERE characters.id=?"

  router.get('/character/:id', function (req, res, next) {
        db.query(
            sql,
            [req.params.id],
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
      //console.log(req.params.id);
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


