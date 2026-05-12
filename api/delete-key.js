const pool = require('./db');

module.exports = async (req, res) => {

  try {

    const { key } = req.body;

    if (!key) {

      return res.json({

        success: false,

        message: 'No Key Provided'
      });
    }

    // DELETE USERS FIRST

    await pool.query(

      'DELETE FROM users WHERE license_key=$1',

      [key]
    );

    // DELETE KEY

    await pool.query(

      'DELETE FROM keys WHERE license_key=$1',

      [key]
    );

    return res.json({

      success: true
    });

  } catch (e) {

    return res.json({

      success: false,

      message: e.message
    });
  }
};
