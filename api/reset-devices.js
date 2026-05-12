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

    // RESET DEVICES

    await pool.query(

      'UPDATE keys SET hwids=$1 WHERE license_key=$2',

      [
        '[]',
        key
      ]
    );

    return res.json({

      success: true,

      message:
        'Devices Reset Successfully'
    });

  } catch (e) {

    return res.json({

      success: false,

      message: e.message
    });
  }
};
