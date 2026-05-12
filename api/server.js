const pool = require('./db');
const crypto = require('crypto');

module.exports = async (req, res) => {

  try {

    // Browser/API test
    if (req.method === 'GET') {
      return res.json({
        status: false,
        reason: 'API Online'
      });
    }

    // -----------------------------
    // READ BODY SAFELY
    // -----------------------------

    let body = req.body || {};

    // JSON string support
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch {}
    }

    // Raw form-urlencoded support
    if (
      req.method === 'POST' &&
      (!req.body || Object.keys(req.body).length === 0)
    ) {

      let raw = '';

      await new Promise((resolve) => {

        req.on('data', chunk => {
          raw += chunk;
        });

        req.on('end', resolve);
      });

      body = Object.fromEntries(
        new URLSearchParams(raw)
      );
    }

    console.log("BODY:", body);

    // -----------------------------
    // SUPPORT MULTIPLE PARAM NAMES
    // -----------------------------

    const key =
      body.key ||
      body.game ||
      body.user_key ||
      body.token ||
      '';

    const hwid =
      body.hwid ||
      body.serial ||
      body.device_id ||
      body.uuid ||
      body.device ||
      '';

    console.log("KEY:", key);
    console.log("HWID:", hwid);

    // -----------------------------
    // VALIDATION
    // -----------------------------

    if (!key || !hwid) {

      return res.json({
        status: false,
        reason: 'Invalid Request'
      });
    }

    // -----------------------------
    // CHECK KEY
    // -----------------------------

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

    // -----------------------------
    // STATUS CHECK
    // -----------------------------

    if (row.status !== 'active') {

      return res.json({
        status: false,
        reason: 'Key Disabled'
      });
    }

    // -----------------------------
    // EXPIRY CHECK
    // -----------------------------

    const expire = new Date(row.expires_at).getTime();

    if (Date.now() > expire) {

      return res.json({
        status: false,
        reason: 'Key Expired'
      });
    }

    // -----------------------------
    // HWID LOCK
    // -----------------------------

    if (!row.hwid) {

      await pool.query(
        'UPDATE keys SET hwid=$1 WHERE license_key=$2',
        [hwid, key]
      );

      console.log("HWID LOCKED");

    } else {

      if (row.hwid !== hwid) {

        return res.json({
          status: false,
          reason: 'HWID Mismatch'
        });
      }
    }

    // -----------------------------
    // SAVE USER LOGIN
    // -----------------------------

    const ip =
      req.headers['x-forwarded-for'] ||
      req.socket?.remoteAddress ||
      'unknown';

    await pool.query(
      'INSERT INTO users (license_key, hwid, ip_address) VALUES ($1, $2, $3)',
      [key, hwid, ip]
    );

    // -----------------------------
    // TOKEN GENERATION
    // -----------------------------

    const token = crypto
      .createHash('md5')
      .update(key + hwid)
      .digest('hex');

    // -----------------------------
    // SUCCESS RESPONSE
    // -----------------------------

    return res.json({
      status: true,
      data: {
        token,
        rng: Math.floor(Date.now() / 1000)
      }
    });

  } catch (e) {

    console.log("SERVER ERROR:", e);

    return res.json({
      status: false,
      reason: e.message
    });
  }
};
