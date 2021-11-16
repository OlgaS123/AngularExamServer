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
    router.post('/signup/:login&:password', function (req, res, next) {
        db.query(
            'INSERT INTO users (login, password) VALUES (?,?)',
            [req.params.login, req.params.password],
            (error, results) => {
                if (error) {
                    if(error.errno===1062)
                    {
                        results=0;
                        res.status(200).json(results);
                    }
                    else
                    {
                        console.log(error);
                        res.status(500).json({status: 'error'});
                    }
                } else {
                    console.log(results);
                    token=Math.floor(Math.random() * (1000 - 1) + 1);
                    results=token;
                    res.status(200).json(results);
                }
            }
        );
    });

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

  router.get('/characters/:token', function (req, res, next) {
    if(req.params.token && parseInt(req.params.token)===token)
    {
        db.query(
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
    }
    else {
        console.log(token+' '+req.params.token);
        res.status(200).json(-1);
    }

  });

  let charInfoSql="SELECT characters.id, characters.name, characters.rarity, elements.element_name, regions.region_name, " +
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

  let userMatSql="SELECT"+
        "max(case when material_purposes.purpose_name = 'lvl' AND material_types.type_name = 'EXP Book' then user_characters_materials.material_count end) 'lvl__exp_book', " +
        "max(case when material_purposes.purpose_name = 'lvl' AND material_types.type_name = 'Mora' then user_characters_materials.material_count end) 'lvl__mora', " +

        "max(case when material_purposes.purpose_name = 'ascension' AND material_types.type_name = 'Primary Material' AND qualities.quality_name = 'q1' then user_characters_materials.material_count end) 'ascension__primary_material__q1', " +
        "max(case when material_purposes.purpose_name = 'ascension' AND material_types.type_name = 'Primary Material' AND qualities.quality_name = 'q2' then user_characters_materials.material_count end) 'ascension__primary_material__q2', " +
        "max(case when material_purposes.purpose_name = 'ascension' AND material_types.type_name = 'Primary Material' AND qualities.quality_name = 'q3' then user_characters_materials.material_count end) 'ascension__primary_material__q3', " +
        "max(case when material_purposes.purpose_name = 'ascension' AND material_types.type_name = 'Primary Material' AND qualities.quality_name = 'q4' then user_characters_materials.material_count end) 'ascension__primary_material__q4', " +
        "max(case when material_purposes.purpose_name = 'ascension' AND material_types.type_name = 'Secondary Material' AND qualities.quality_name = 'q1' then user_characters_materials.material_count end) 'ascension__secondary_material__q1', " +
        "max(case when material_purposes.purpose_name = 'ascension' AND material_types.type_name = 'Secondary Material' AND qualities.quality_name = 'q2' then user_characters_materials.material_count end) 'ascension__secondary_material__q2', " +
        "max(case when material_purposes.purpose_name = 'ascension' AND material_types.type_name = 'Secondary Material' AND qualities.quality_name = 'q3' then user_characters_materials.material_count end) 'ascension__secondary_material__q3', " +
        "max(case when material_purposes.purpose_name = 'ascension' AND material_types.type_name = 'Elemental Stone' then user_characters_materials.material_count end) 'ascension__elemental_stone', " +
        "max(case when material_purposes.purpose_name = 'ascension' AND material_types.type_name = 'Local Material' then user_characters_materials.material_count end) 'ascension__local_material', " +
        "max(case when material_purposes.purpose_name = 'ascension' AND material_types.type_name = 'Mora' then user_characters_materials.material_count end) 'ascension__mora', " +

        "max(case when material_purposes.purpose_name = 'talents' AND material_types.type_name = 'Talent Book' AND qualities.quality_name = 'q1' then user_characters_materials.material_count end) 'talents__talent_book__q1', " +
        "max(case when material_purposes.purpose_name = 'talents' AND material_types.type_name = 'Talent Book' AND qualities.quality_name = 'q2' then user_characters_materials.material_count end) 'talents__talent_book__q2', " +
        "max(case when material_purposes.purpose_name = 'talents' AND material_types.type_name = 'Talent Book' AND qualities.quality_name = 'q3' then user_characters_materials.material_count end) 'talents__talent_book__q3', " +
        "max(case when material_purposes.purpose_name = 'talents' AND material_types.type_name = 'Secondary Material' AND qualities.quality_name = 'q1' then user_characters_materials.material_count end) 'talents__secondary_material__q1', " +
        "max(case when material_purposes.purpose_name = 'talents' AND material_types.type_name = 'Secondary Material' AND qualities.quality_name = 'q2' then user_characters_materials.material_count end) 'talents__secondary_material__q2', " +
        "max(case when material_purposes.purpose_name = 'talents' AND material_types.type_name = 'Secondary Material' AND qualities.quality_name = 'q3' then user_characters_materials.material_count end) 'talents__secondary_material__q3', " +
        "max(case when material_purposes.purpose_name = 'talents' AND material_types.type_name = 'Talent Material' then user_characters_materials.material_count end) 'talents__talent_material', " +
        "max(case when material_purposes.purpose_name = 'talents' AND material_types.type_name = 'Crown' then user_characters_materials.material_count end) 'talents__crown', " +
        "max(case when material_purposes.purpose_name = 'talents' AND material_types.type_name = 'Mora' then user_characters_materials.material_count end) 'talents__mora' " +

        "FROM characters JOIN (user_characters_materials, material_types, material_purposes, material_qualities, qualities) " +
        "ON (user_characters_materials.character_id = characters.id " +
        "AND user_characters_materials.material_type_id = material_types.id " +
        "AND user_characters_materials.material_purpose_id=material_purposes.id " +
        "AND user_characters_materials.material_quality_id=material_qualities.quality_id AND material_qualities.quality_id=qualities.id) " +
        "WHERE characters.id=19 AND user_characters_materials.user_id=2 "

  router.get('/character/info/:id&:token', function (req, res, next) {
      if(req.params.token && parseInt(req.params.token)===token)
      {
          db.query(
              charInfoSql,
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
      }
      else {
          res.status(200).json(-1);
      }
  });

  router.get('/character/materials/:id&:token', function (req, res, next) {
      if(req.params.token && parseInt(req.params.token)===token)
      {
          db.query(
              userMatSql,
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
      }
      else {
          res.status(200).json(-1);
      }
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


