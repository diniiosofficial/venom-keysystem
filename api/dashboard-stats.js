const pool = require('./db');

module.exports = async (req, res) => {

  try {

    // TOTAL KEYS

    const totalKeys =
      await pool.query(
        'SELECT COUNT(*) FROM keys'
      );

    // ACTIVE KEYS

    const activeKeys =
      await pool.query(
        "SELECT COUNT(*) FROM keys WHERE status='active'"
      );

    // EXPIRED KEYS

    const expiredKeys =
      await pool.query(
        "SELECT COUNT(*) FROM keys WHERE expires_at < NOW()"
      );

    // TOTAL USERS

    const totalUsers =
      await pool.query(
        'SELECT COUNT(*) FROM users'
      );

    return res.json({

      total_keys:
        parseInt(
          totalKeys.rows[0].count
        ),

      active_keys:
        parseInt(
          activeKeys.rows[0].count
        ),

      expired_keys:
        parseInt(
          expiredKeys.rows[0].count
        ),

      total_users:
        parseInt(
          totalUsers.rows[0].count
        )
    });

  } catch (e) {

    return res.json({

      error:
        e.message
    });
  }
};
