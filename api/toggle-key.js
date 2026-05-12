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

    // GET CURRENT STATUS

    const result =
      await pool.query(

        'SELECT status FROM keys WHERE license_key=$1 LIMIT 1',

        [key]
      );

    if (result.rows.length <= 0) {

      return res.json({

        success: false,

        message: 'Key Not Found'
      });
    }

    const current =
      result.rows[0].status;

    const newStatus =
      current === 'active'
      ? 'disabled'
      : 'active';

    // UPDATE

    await pool.query(

      'UPDATE keys SET status=$1 WHERE license_key=$2',

      [
        newStatus,
        key
      ]
    );

    return res.json({

      success: true,

      status: newStatus
    });

  } catch (e) {

    return res.json({

      success: false,

      message: e.message
    });
  }
};
