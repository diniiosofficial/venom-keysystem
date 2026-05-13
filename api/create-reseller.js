const pool = require('./db');

const bcrypt =
require('bcryptjs');

module.exports =
async (req, res) => {

    try {

        if(req.method !== 'POST'){

            return res.json({

                success:false,

                message:
                'Invalid Method'
            });
        }

        const {

            username,

            password,

            referral_code,

            referred_by

        } = req.body;

        if(

            !username ||

            !password
        ){

            return res.json({

                success:false,

                message:
                'Missing Fields'
            });
        }

        // CHECK EXISTING

        const check =
        await pool.query(

            'SELECT * FROM accounts WHERE username=$1 LIMIT 1',

            [username]
        );

        if(
            check.rows.length > 0
        ){

            return res.json({

                success:false,

                message:
                'Username Already Exists'
            });
        }

        // HASH PASSWORD

        const hashed =
        bcrypt.hashSync(

            password,
            10
        );

        // INSERT

        await pool.query(

            `
            INSERT INTO accounts
            (
                username,
                password,
                role,
                referral_code,
                referred_by
            )

            VALUES
            (
                $1,
                $2,
                'reseller',
                $3,
                $4
            )
            `,

            [

                username,

                hashed,

                referral_code ||

                null,

                referred_by ||

                'LegacyDevX'
            ]
        );

        return res.json({

            success:true,

            message:
            'Reseller Created'
        });

    } catch(e){

        return res.json({

            success:false,

            message:e.message
        });
    }
};
