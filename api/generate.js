const pool = require('./db');

function randomKey(length = 16) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';

  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return 'VENOM-' + result;
}

module.exports = async (req, res) => {

  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Method Not Allowed'
    });
  }

  try {

    const { duration } = req.body;

    let expireDate = new Date();

    switch (duration) {
      case '1h':
        expireDate.setHours(expireDate.getHours() + 1);
        break;

      case '5h':
        expireDate.setHours(expireDate.getHours() + 5);
        break;

      case '1d':
        expireDate.setDate(expireDate.getDate() + 1);
        break;

      case '3d':
        expireDate.setDate(expireDate.getDate() + 3);
        break;

      case '7d':
        expireDate.setDate(expireDate.getDate() + 7);
        break;

      case '15d':
        expireDate.setDate(expireDate.getDate() + 15);
        break;

      case '30d':
        expireDate.setDate(expireDate.getDate() + 30);
        break;

      case '60d':
        expireDate.setDate(expireDate.getDate() + 60);
        break;

      default:
        return res.json({
          success: false,
          message: 'Invalid Duration'
        });
    }

    const key = randomKey();

    await pool.query(
      'INSERT INTO keys (license_key, expires_at) VALUES ($1, $2)',
      [key, expireDate]
    );

    return res.json({
      success: true,
      key,
      expires: expireDate
    });

  } catch (e) {

    return res.json({
      success: false,
      message: e.message
    });
  }
};
