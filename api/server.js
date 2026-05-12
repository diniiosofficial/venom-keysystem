const pool = require('./db');
const crypto = require('crypto');

module.exports = async (req, res) => {

  try {

    // ---------------------------------
    // API ONLINE CHECK
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
    // GET KEY / HWID
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
    console.log("HWID:", hwid);

    // ---------------------------------
    // VALIDATION
    // ---------------------------------

    if (!key || !hwid) {

      return res.json({

        status: false,

        reason: 'Invalid Request'
      });
    }

    // ---------------------------------
    // DATABASE CHECK
    // ---------------------------------

    const result =
      await pool.query(

        'SELECT * FROM keys WHERE TRIM(license_key)=$1 LIMIT 1',

        [key]
      );

    if (result.rows.length <= 0) {

      return res.json({

        status: false,

        reason: 'Invalid Key'
      });
    }

    const row =
      result.rows[0];

    // ---------------------------------
    // STATUS CHECK
    // ---------------------------------

    if (
      row.status &&
      row.status.toLowerCase() !== 'active'
    ) {

      return res.json({

        status: false,

        reason: 'Key Disabled'
      });
    }

    // ---------------------------------
    // EXPIRY CHECK
    // ---------------------------------

    const expire =
      new Date(
        row.expires_at
      ).getTime();

    if (
      Date.now() > expire
    ) {

      return res.json({

        status: false,

        reason: 'Key Expired'
      });
    }

    // ---------------------------------
    // MULTI DEVICE SYSTEM
    // ---------------------------------

    let hwids =
      row.hwids || [];

    // STRING -> JSON

    if (
      typeof hwids === 'string'
    ) {

      try {

        hwids =
          JSON.parse(hwids);

      } catch {

        hwids = [];
      }
    }

    // SAFETY

    if (
      !Array.isArray(hwids)
    ) {

      hwids = [];
    }

    const maxDevices =
      parseInt(
        row.max_devices || 1
      );

    console.log(
      "MAX DEVICES:",
      maxDevices
    );

    console.log(
      "CURRENT DEVICES:",
      hwids.length
    );

    // ---------------------------------
    // DEVICE EXISTS
    // ---------------------------------

    if (
      hwids.includes(hwid)
    ) {

      console.log(
        "KNOWN DEVICE"
      );

    } else {

      // ---------------------------------
      // DEVICE LIMIT
      // ---------------------------------

      if (
        hwids.length >= maxDevices
      ) {

        return res.json({

          status: false,

          reason:
            'Device Limit Reached'
        });
      }

      // ---------------------------------
      // ADD DEVICE
      // ---------------------------------

      hwids.push(hwid);

      await pool.query(

        'UPDATE keys SET hwids=$1 WHERE license_key=$2',

        [
          JSON.stringify(hwids),
          key
        ]
      );

      console.log(
        "NEW DEVICE ADDED"
      );
    }

    // ---------------------------------
    // SAVE USER LOGIN
    // ---------------------------------

    const ip =
      req.headers['x-forwarded-for'] ||
      req.socket?.remoteAddress ||
      'unknown';

    try {

      await pool.query(

        'INSERT INTO users (license_key, hwid, ip_address) VALUES ($1, $2, $3)',

        [
          key,
          hwid,
          ip
        ]
      );

      console.log(
        "USER SAVED"
      );

    } catch (e) {

      console.log(
        "USER SAVE ERROR:",
        e.message
      );
    }

    // ---------------------------------
    // TOKEN
    // ---------------------------------

    const token =
      crypto
      .createHash('md5')
      .update(key + hwid)
      .digest('hex');

    // ---------------------------------
    // FORMAT EXP DATE
    // ---------------------------------

    let expString = '';

    try {

      expString =
        new Date(row.expires_at)
        .toLocaleString(
          'en-IN',
          {
            timeZone:
              'Asia/Kolkata'
          }
        );

    } catch {

      expString =
        String(
          row.expires_at
        );
    }

    console.log(
      "LOGIN SUCCESS"
    );

    // ---------------------------------
    // SUCCESS RESPONSE
    // ---------------------------------

    return res.json({

      status: true,

      data: {

        token,

        rng:
          Math.floor(
            Date.now() / 1000
          ),

        EXP:
          expString,

        expiry:
          expString,

        key:
          key,

        devices_used:
          hwids.length,

        max_devices:
          maxDevices
      }
    });

  } catch (e) {

    console.log(
      "SERVER ERROR:",
      e
    );

    return res.json({

      status: false,

      reason:
        e.message ||
        'Unknown Error'
    });
  }
};
