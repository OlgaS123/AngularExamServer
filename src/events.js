const express = require('express');
const {json} = require("express");
const named = require('yesql').mysql

function createRouter(db) {
  const router = express.Router();

    let token='';
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
                    token=Math.floor(Math.random() * (1000 - 1) + 1)+'_'+results.insertId;
                    results = token;
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
                    if(results.length===1)
                    {
                        if(req.params.password===results[0].password){
                            token=Math.floor(Math.random() * (1000 - 1) + 1)+'_'+results[0].id;
                            results[0]= token;
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

    //не работает =(
    let charsInfoSql=
        "SELECT chars.id, chars.name, chars.rarity, chars.element_name, chars.region_name, mats.lvl__exp_book, mats.lvl__mora, mats.ascension__primary_material__q1, mats.ascension__primary_material__q2, mats.ascension__primary_material__q3, "+
        "mats.ascension__primary_material__q4, mats.ascension__secondary_material__q1, mats.ascension__secondary_material__q2, mats.ascension__secondary_material__q3, mats.ascension__elemental_stone, mats.ascension__local_material, mats.ascension__mora, "+
        "mats.talents__talent_book__q1, mats.talents__talent_book__q2, mats.talents__talent_book__q3, mats.talents__secondary_material__q1, mats.talents__secondary_material__q2, mats.talents__secondary_material__q3, mats.talents__talent_material, mats.talents__crown, mats.talents__mora "+
        "FROM("+
        "SELECT characters.id AS id, characters.name AS name, characters.rarity AS rarity, elements.element_name AS element_name, regions.region_name AS region_name  FROM characters JOIN (regions, elements) ON (characters.region_id = regions.id AND characters.element_id = elements.id) ORDER BY characters.name) AS chars "+
        "LEFT JOIN("+
        "SELECT characters.id AS m_ch_id, "+
        "max(case when material_purposes.purpose_name = 'lvl' AND material_types.type_name = 'EXP Book' then user_characters_materials.material_count end) 'lvl__exp_book', "+
        "max(case when material_purposes.purpose_name = 'lvl' AND material_types.type_name = 'Mora' then user_characters_materials.material_count end) 'lvl__mora', "+

        "max(case when material_purposes.purpose_name = 'ascension' AND material_types.type_name = 'Primary Material' AND qualities.quality_name = 'q1' then user_characters_materials.material_count end) 'ascension__primary_material__q1', "+
        "max(case when material_purposes.purpose_name = 'ascension' AND material_types.type_name = 'Primary Material' AND qualities.quality_name = 'q2' then user_characters_materials.material_count end) 'ascension__primary_material__q2', "+
        "max(case when material_purposes.purpose_name = 'ascension' AND material_types.type_name = 'Primary Material' AND qualities.quality_name = 'q3' then user_characters_materials.material_count end) 'ascension__primary_material__q3', "+
        "max(case when material_purposes.purpose_name = 'ascension' AND material_types.type_name = 'Primary Material' AND qualities.quality_name = 'q4' then user_characters_materials.material_count end) 'ascension__primary_material__q4', "+
        "max(case when material_purposes.purpose_name = 'ascension' AND material_types.type_name = 'Secondary Material' AND qualities.quality_name = 'q1' then user_characters_materials.material_count end) 'ascension__secondary_material__q1', "+
        "max(case when material_purposes.purpose_name = 'ascension' AND material_types.type_name = 'Secondary Material' AND qualities.quality_name = 'q2' then user_characters_materials.material_count end) 'ascension__secondary_material__q2', "+
        "max(case when material_purposes.purpose_name = 'ascension' AND material_types.type_name = 'Secondary Material' AND qualities.quality_name = 'q3' then user_characters_materials.material_count end) 'ascension__secondary_material__q3', "+
        "max(case when material_purposes.purpose_name = 'ascension' AND material_types.type_name = 'Elemental Stone' then user_characters_materials.material_count end) 'ascension__elemental_stone', "+
        "max(case when material_purposes.purpose_name = 'ascension' AND material_types.type_name = 'Local Material' then user_characters_materials.material_count end) 'ascension__local_material', "+
        "max(case when material_purposes.purpose_name = 'ascension' AND material_types.type_name = 'Mora' then user_characters_materials.material_count end) 'ascension__mora', "+

        "max(case when material_purposes.purpose_name = 'talents' AND material_types.type_name = 'Talent Book' AND qualities.quality_name = 'q1' then user_characters_materials.material_count end) 'talents__talent_book__q1', "+
        "max(case when material_purposes.purpose_name = 'talents' AND material_types.type_name = 'Talent Book' AND qualities.quality_name = 'q2' then user_characters_materials.material_count end) 'talents__talent_book__q2', "+
        "max(case when material_purposes.purpose_name = 'talents' AND material_types.type_name = 'Talent Book' AND qualities.quality_name = 'q3' then user_characters_materials.material_count end) 'talents__talent_book__q3', "+
        "max(case when material_purposes.purpose_name = 'talents' AND material_types.type_name = 'Secondary Material' AND qualities.quality_name = 'q1' then user_characters_materials.material_count end) 'talents__secondary_material__q1', "+
        "max(case when material_purposes.purpose_name = 'talents' AND material_types.type_name = 'Secondary Material' AND qualities.quality_name = 'q2' then user_characters_materials.material_count end) 'talents__secondary_material__q2', "+
        "max(case when material_purposes.purpose_name = 'talents' AND material_types.type_name = 'Secondary Material' AND qualities.quality_name = 'q3' then user_characters_materials.material_count end) 'talents__secondary_material__q3', "+
        "max(case when material_purposes.purpose_name = 'talents' AND material_types.type_name = 'Talent Material' then user_characters_materials.material_count end) 'talents__talent_material', "+
        "max(case when material_purposes.purpose_name = 'talents' AND material_types.type_name = 'Crown' then user_characters_materials.material_count end) 'talents__crown', "+
        "max(case when material_purposes.purpose_name = 'talents' AND material_types.type_name = 'Mora' then user_characters_materials.material_count end) 'talents__mora' "+

        "FROM characters JOIN (user_characters_materials, material_types, material_purposes, material_qualities, qualities) "+
        "ON (user_characters_materials.character_id = characters.id "+
        "AND user_characters_materials.material_type_id = material_types.id "+
        "AND user_characters_materials.material_purpose_id=material_purposes.id "+
        "AND user_characters_materials.material_quality_id=material_qualities.quality_id AND material_qualities.quality_id=qualities.id) "+
        "WHERE user_characters_materials.user_id=? "+
        "GROUP BY characters.id) AS mats "+
        "ON chars.id=mats.m_ch_id "+
        "ORDER BY chars.name ";

  router.get('/characters/:token', function (req, res, next) {
    if(req.params.token && req.params.token===token)
    {
        db.query(
            charsInfoSql,[token.split('_')[1]],
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

  let userMatSql="SELECT * FROM "+
      "(SELECT characters.id, characters.name, characters.rarity, elements.element_name, regions.region_name, " +
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
      "WHERE characters.id=?) AS chars, "+
      "(SELECT "+
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
      "WHERE characters.id=? AND user_characters_materials.user_id=?) AS mats";

  router.get('/character/info/:id&:token', function (req, res, next) {
      if(req.params.token && req.params.token===token)
      {
          db.query(
              userMatSql,
              [req.params.id, req.params.id, token.split('_')[1]],
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

    let updateSql="DELETE FROM user_characters_materials WHERE user_characters_materials.user_id = :uid AND user_characters_materials.character_id = :ch_id; "+
        "INSERT INTO user_characters_materials (`user_id`, `character_id`, `material_type_id`, `material_purpose_id`, `material_quality_id`, `material_count`) VALUES "+
        "(:uid, :ch_id, 9, 1, 1, :lvl__exp_book), "+
        "(:uid, :ch_id, 8, 1, 1, :lvl__mora), "+
        "(:uid, :ch_id, 1, 2, 1, :ascension__primary_material__q1), "+
        "(:uid, :ch_id, 1, 2, 2, :ascension__primary_material__q2), "+
        "(:uid, :ch_id, 1, 2, 3, :ascension__primary_material__q3), "+
        "(:uid, :ch_id, 1, 2, 4, :ascension__primary_material__q4), "+
        "(:uid, :ch_id, 4, 2, 1, :ascension__secondary_material__q1), "+
        "(:uid, :ch_id, 4, 2, 2, :ascension__secondary_material__q2), "+
        "(:uid, :ch_id, 4, 2, 3, :ascension__secondary_material__q3), "+
        "(:uid, :ch_id, 2, 2, 1, :ascension__elemental_stone), "+
        "(:uid, :ch_id, 3, 2, 1, :ascension__local_material), "+
        "(:uid, :ch_id, 8, 2, 1, :ascension__mora), "+
        "(:uid, :ch_id, 5, 3, 1, :talents__talent_book__q1), "+
        "(:uid, :ch_id, 5, 3, 2, :talents__talent_book__q2), "+
        "(:uid, :ch_id, 5, 3, 3, :talents__talent_book__q3), "+
        "(:uid, :ch_id, 4, 3, 1, :talents__secondary_material__q1), "+
        "(:uid, :ch_id, 4, 3, 2, :talents__secondary_material__q2), "+
        "(:uid, :ch_id, 4, 3, 3, :talents__secondary_material__q3), "+
        "(:uid, :ch_id, 6, 3, 1, :talents__talent_material), "+
        "(:uid, :ch_id, 7, 3, 1, :talents__crown), "+
        "(:uid, :ch_id, 8, 3, 1, :talents__mora);"

  router.put('/character/:id&:token', function (req, res, next) {
    if(req.params.token && req.params.token===token)
    {
        console.log(req.body.ascension__elemental_stone);
        db.query(named(updateSql)({
                uid: token.split('_')[1],
                ch_id: req.params.id,
                ascension__elemental_stone: req.body.ascension__elemental_stone,
                ascension__local_material: req.body.ascension__local_material,
                ascension__mora: req.body.ascension__mora,
                ascension__primary_material__q1: req.body.ascension__primary_material__q1,
                ascension__primary_material__q2: req.body.ascension__primary_material__q2,
                ascension__primary_material__q3: req.body.ascension__primary_material__q3,
                ascension__primary_material__q4: req.body.ascension__primary_material__q4,
                ascension__secondary_material__q1: req.body.ascension__secondary_material__q1,
                ascension__secondary_material__q2: req.body.ascension__secondary_material__q2,
                ascension__secondary_material__q3: req.body.ascension__secondary_material__q3,
                lvl__exp_book: req.body.lvl__exp_book,
                lvl__mora: req.body.lvl__mora,
                talents__crown: req.body.talents__crown,
                talents__mora: req.body.talents__mora,
                talents__secondary_material__q1: req.body.talents__secondary_material__q1,
                talents__secondary_material__q2: req.body.talents__secondary_material__q2,
                talents__secondary_material__q3: req.body.talents__secondary_material__q3,
                talents__talent_book__q1: req.body.talents__talent_book__q1,
                talents__talent_book__q2: req.body.talents__talent_book__q2,
                talents__talent_book__q3: req.body.talents__talent_book__q3,
                talents__talent_material: req.body.talents__talent_material
            }),
            (error, results) => {
                if (error) {
                    console.log(error);
                    res.status(500).json({status: 'error'});
                } else {
                    console.log(results);
                    res.status(200).json({status: 'ok'});
                }
            }
        );
    }
    else {
      res.status(200).json(-1);
    }
  });

  return router;
}

module.exports = createRouter;


