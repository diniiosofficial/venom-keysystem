const pool = require('./db');

module.exports = async (req, res) => {

  try {

    const result =
      await pool.query(

        `SELECT *
         FROM keys
         ORDER BY id DESC`
      );

    return res.json({

      keys:
        result.rows
    });

  } catch (e) {

    return res.json({

      error:
        e.message
    });
  }
};
