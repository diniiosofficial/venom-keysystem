const pool = require('./db');
const crypto = require('crypto');

module.exports = async (req, res) => {

  try {

    // ---------------------------------
    // VENOM LANDING PAGE
    // ---------------------------------

    if (req.method === 'GET') {

      return res.send(`

<!DOCTYPE html>
<html>
<head>

<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">

<title>VENOM API</title>

<style>

*{
    margin:0;
    padding:0;
    box-sizing:border-box;
}

body{

    background:#050505;

    color:white;

    font-family:Arial;

    height:100vh;

    overflow:hidden;

    display:flex;

    justify-content:center;

    align-items:center;

    position:relative;
}

.glow{

    position:absolute;

    width:500px;

    height:500px;

    background:#0099ff;

    filter:blur(180px);

    opacity:0.2;

    border-radius:50%;

    animation:move 6s infinite alternate ease-in-out;
}

@keyframes move{

    from{
        transform:translate(-100px,-50px);
    }

    to{
        transform:translate(100px,50px);
    }
}

.card{

    position:relative;

    z-index:2;

    width:90%;

    max-width:700px;

    background:rgba(20,20,20,0.92);

    border:1px solid rgba(255,255,255,0.08);

    border-radius:24px;

    padding:50px;

    text-align:center;

    backdrop-filter:blur(10px);

    box-shadow:
    0 0 40px rgba(0,153,255,0.15);
}

.logo{

    font-size:48px;

    font-weight:bold;

    letter-spacing:4px;

    margin-bottom:10px;

    background:linear-gradient(
        90deg,
        #00aaff,
        #ffffff
    );

    -webkit-background-clip:text;

    -webkit-text-fill-color:transparent;
}

.subtitle{

    color:#9f9f9f;

    font-size:16px;

    margin-bottom:35px;

    line-height:1.6;
}

.status{

    display:inline-flex;

    align-items:center;

    gap:10px;

    background:#0f1d13;

    color:#00ff88;

    padding:14px 22px;

    border-radius:12px;

    font-weight:bold;

    margin-bottom:30px;
}

.dot{

    width:10px;

    height:10px;

    background:#00ff88;

    border-radius:50%;

    box-shadow:0 0 12px #00ff88;
}

.info-box{

    background:#101010;

    border:1px solid #1d1d1d;

    border-radius:16px;

    padding:20px;

    margin-top:20px;

    text-align:left;
}

.info-title{

    font-size:15px;

    color:#00aaff;

    margin-bottom:15px;

    font-weight:bold;
}

.info-item{

    color:#d0d0d0;

    margin-bottom:10px;

    font-size:14px;
}

.credit{

    margin-top:35px;

    font-size:14px;

    color:#7a7a7a;
}

.credit span{

    color:#00aaff;

    font-weight:bold;
}

.footer{

    margin-top:20px;

    font-size:12px;

    color:#555;
}

</style>

</head>

<body>

<div class="glow"></div>

<div class="card">

    <div class="logo">
        VENOM API
    </div>

    <div class="subtitle">
        Secure Authentication Server <br>
        Real-Time License Management System
    </div>

    <div class="status">

        <div class="dot"></div>

        SERVER ONLINE

    </div>

    <div class="info-box">

        <div class="info-title">
            SYSTEM STATUS
        </div>

        <div class="info-item">
            • Authentication Service Running
        </div>

        <div class="info-item">
            • Database Connected Successfully
        </div>

        <div class="info-item">
            • License Validation Active
        </div>

        <div class="info-item">
            • Device Lock System Enabled
        </div>

    </div>

    <div class="credit">
        Developed By <span>@LegacyDevX</span>
    </div>

    <div class="footer">
        VENOM SECURITY © 2026
    </div>

</div>

</body>
</html>

      `);
    }

    // ---------------------------------
    // READ BODY SAFELY
    // ---------------------------------

    let body = req.body || {};

    if (typeof body === 'string') {

      try {

        body = JSON.parse(body);

      } catch {}
    }

    // ---------------------------------
    // RAW FORM SUPPORT
    // ---------------------------------

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
