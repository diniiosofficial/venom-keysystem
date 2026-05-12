const pool = require('./db');
const crypto = require('crypto');

module.exports = async (req, res) => {

  try {

    // Allow browser testing
    if (req.method === 'GET') {
      return res.json({
        status: false,
        reason: 'API Online'
      });
    }

    const { key, hwid } = req.body || {};

    if (!key || !hwid) {
      return res.json({
        status: false,
        reason: 'Invalid Request'
      });
    }

    const result = await pool.query(
      'SELECT * FROM keys WHERE license_key=$1 LIMIT 1',
      [key]
    );

    if (result.rows.length <= 0) {
      return res.json({
        status: false,
        reason: 'Invalid Key'
      });
    }

    const row = result.rows[0];

    if (row.status !== 'active') {
      return res.json({
        status: false,
        reason: 'Key Disabled'
      });
    }

    const expire = new Date(row.expires_at).getTime();

    if (Date.now() > expire) {
      return res.json({
        status: false,
        reason: 'Key Expired'
      });
    }

    if (!row.hwid) {

      await pool.query(
        'UPDATE keys SET hwid=$1 WHERE license_key=$2',
        [hwid, key]
      );

    } else {

      if (row.hwid !== hwid) {
        return res.json({
          status: false,
          reason: 'HWID Mismatch'
        });
      }
    }

    const ip = req.headers['x-forwarded-for'] || 'unknown';

    await pool.query(
      'INSERT INTO users (license_key, hwid, ip_address) VALUES ($1, $2, $3)',
      [key, hwid, ip]
    );

    const token = crypto
      .createHash('md5')
      .update(key + hwid)
      .digest('hex');

    return res.json({
      status: true,
      data: {
        token,
        rng: Math.floor(Date.now() / 1000)
      }
    });

  } catch (e) {

    return res.json({
      status: false,
      reason: e.message
    });
  }
};