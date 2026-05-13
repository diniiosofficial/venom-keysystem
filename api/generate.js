const pool = require('./db');

// ---------------------------------
// RANDOM KEY
// ---------------------------------

function randomKey(length = 16) {

  const chars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

  let result = '';

  for (let i = 0; i < length; i++) {

    result += chars.charAt(
      Math.floor(
        Math.random() * chars.length
      )
    );
  }

  return 'LEGACY-' + result;
}

module.exports = async (req, res) => {

  // ---------------------------------
  // METHOD CHECK
  // ---------------------------------

  if (req.method !== 'POST') {

    return res.status(405).json({

      success: false,

      message: 'Method Not Allowed'
    });
  }

  try {

    // ---------------------------------
    // BODY
    // ---------------------------------

    const {

      duration,

      customKey,

      maxDevices

    } = req.body;

    // ---------------------------------
    // EXPIRY
    // ---------------------------------

    let expireDate =
      new Date();

    switch (duration) {

      case '1h':

        expireDate.setHours(
          expireDate.getHours() + 1
        );

        break;

      case '5h':

        expireDate.setHours(
          expireDate.getHours() + 5
        );

        break;

      case '1d':

        expireDate.setDate(
          expireDate.getDate() + 1
        );

        break;

      case '3d':

        expireDate.setDate(
          expireDate.getDate() + 3
        );

        break;

      case '7d':

        expireDate.setDate(
          expireDate.getDate() + 7
        );

        break;

      case '15d':

        expireDate.setDate(
          expireDate.getDate() + 15
        );

        break;

      case '30d':

        expireDate.setDate(
          expireDate.getDate() + 30
        );

        break;

      case '60d':

        expireDate.setDate(
          expireDate.getDate() + 60
        );

        break;

      default:

        return res.json({

          success: false,

          message: 'Invalid Duration'
        });
    }

    // ---------------------------------
    // CUSTOM / RANDOM KEY
    // ---------------------------------

    let key =
      customKey &&
      customKey.trim() !== ''
      ? customKey.trim()
      : randomKey();

    // ---------------------------------
    // DUPLICATE CHECK
    // ---------------------------------

    const exists =
      await pool.query(

        'SELECT * FROM keys WHERE license_key=$1 LIMIT 1',

        [key]
      );

    if (exists.rows.length > 0) {

      return res.json({

        success: false,

        message: 'Key Already Exists'
      });
    }

    // ---------------------------------
    // SAVE
    // ---------------------------------

    await pool.query(

      `INSERT INTO keys
      (
        license_key,
        expires_at,
        status,
        max_devices,
        hwids
      )

      VALUES
      (
        $1,
        $2,
        'active',
        $3,
        '[]'
      )`,

      [

        key,

        expireDate,

        parseInt(
          maxDevices || 1
        )
      ]
    );

    // ---------------------------------
    // RESPONSE
    // ---------------------------------

    return res.json({

      success: true,

      key,

      expires: expireDate,

      max_devices:
        parseInt(
          maxDevices || 1
        )
    });

  } catch (e) {

    return res.json({

      success: false,

      message: e.message
    });
  }
};
