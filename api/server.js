const pool = require('./db');
const crypto = require('crypto');

module.exports = async (req, res) => {

  try {

    // ---------------------------------
    // API TEST
    // ---------------------------------

    if (req.method === 'GET') {

      return res.json({
        status: false,
        reason: 'API Online'
      });
    }

    // ---------------------------------
    // READ BODY SAFELY
    // ---------------------------------

    let body = req.body || {};

    // JSON STRING SUPPORT
    if (typeof body === 'string') {

      try {
        body = JSON.parse(body);
      } catch {}
    }

    // RAW FORM SUPPORT
    if (
      req.method === 'POST' &&
      (
        !req.body ||
        Object.keys(req.body).length === 0
      )
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

    // ---------------------------------
    // READ KEY / HWID
    // ---------------------------------

    const key = (
      body.key ||
      body.game ||
      body.user_key ||
      body.token ||
      body.license ||
      ''
    )
    .toString()
    .trim();

    const hwid = (
      body.hwid ||
      body.serial ||
      body.device_id ||
      body.uuid ||
      body.device ||
      body.android_id ||
      ''
    )
    .toString()
    .trim();

    console.log("KEY:", key);
    console.log("KEY LENGTH:", key.length);

    console.log("HWID:", hwid);
    console.log("HWID LENGTH:", hwid.length);

    // ---------------------------------
    // VALIDATION
    // ---------------------------------

    if (!key || !hwid) {

      console.log("INVALID REQUEST");

      return res.json({
        status: false,
        reason: 'Invalid Request'
      });
    }

    // ---------------------------------
    // DATABASE CHECK
    // ---------------------------------

    const result = await pool.query(
      'SELECT * FROM keys WHERE TRIM(license_key)=$1 LIMIT 1',
      [key]
    );

    console.log("DB RESULT:", result.rows);

    if (result.rows.length <= 0) {

      console.log("INVALID KEY");

      return res.json({
        status: false,
        reason: 'Invalid Key'
      });
    }

    const row = result.rows[0];

    // ---------------------------------
    // STATUS CHECK
    // ---------------------------------

    if (row.status !== 'active') {

      console.log("KEY DISABLED");

      return res.json({
        status: false,
        reason: 'Key Disabled'
      });
    }

    // ---------------------------------
    // EXPIRY CHECK
    // ---------------------------------

    const expire = new Date(row.expires_at).getTime();

    console.log("EXPIRE:", expire);
    console.log("NOW:", Date.now());

    if (Date.now() > expire) {

      console.log("KEY EXPIRED");

      return res.json({
        status: false,
        reason: 'Key Expired'
      });
    }

    // ---------------------------------
    // HWID CHECK
    // ---------------------------------

    const savedHwid = (row.hwid || '')
      .toString()
      .trim();

    if (!savedHwid) {

      await pool.query(
        'UPDATE keys SET hwid=$1 WHERE license_key=$2',
        [hwid, key]
      );

      console.log("HWID LOCKED");

    } else {

      console.log("SAVED HWID:", savedHwid);

      if (savedHwid !== hwid) {

        console.log("HWID MISMATCH");

        return res.json({
          status: false,
          reason: 'HWID Mismatch'
        });
      }
    }

    // ---------------------------------
    // SAVE LOGIN
    // ---------------------------------

    const ip =
      req.headers['x-forwarded-for'] ||
      req.socket?.remoteAddress ||
      'unknown';

    await pool.query(
      'INSERT INTO users (license_key, hwid, ip_address) VALUES ($1, $2, $3)',
      [key, hwid, ip]
    );

    console.log("USER SAVED");

    // ---------------------------------
    // TOKEN
    // ---------------------------------

    const token = crypto
      .createHash('md5')
      .update(key + hwid)
      .digest('hex');

    console.log("LOGIN SUCCESS");

    // ---------------------------------
    // SUCCESS RESPONSE
    // ---------------------------------

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
