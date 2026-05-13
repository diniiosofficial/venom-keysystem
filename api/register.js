const pool = require('./db');

const bcrypt =
require('bcryptjs');

module.exports =
async (req, res) => {

    try{

        if(req.method !== 'POST'){

            return res.json({

                success:false,

                message:'Invalid Method'
            });
        }

        const {

            username,

            password,

            referral

        } = req.body;

        // VALIDATION

        if(
            !username ||
            !password
        ){

            return res.json({

                success:false,

                message:'Missing Fields'
            });
        }

        // CHECK EXISTING USER

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

                message:'Username Already Exists'
            });
        }

        // CHECK REFERRAL

        let referredBy =
        null;

        if(referral){

            const referralCheck =
            await pool.query(

                'SELECT * FROM accounts WHERE referral_code=$1 LIMIT 1',

                [referral]
            );

            if(
                referralCheck.rows.length <= 0
            ){

                return res.json({

                    success:false,

                    message:'Invalid Referral Code'
                });
            }

            referredBy =
            referralCheck.rows[0]
            .username;
        }

        // HASH PASSWORD

        const hashed =
        await bcrypt.hash(

            password,

            10
        );

        // CREATE OWN REFERRAL CODE

        const ownReferral =

            username
            .toUpperCase()

            +

            Math.floor(

                1000 +

                Math.random()
                * 9000
            );

        // INSERT ACCOUNT

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

                ownReferral,

                referredBy
            ]
        );

        return res.json({

            success:true,

            message:
            'Account Created'
        });

    }catch(e){

        return res.json({

            success:false,

            message:e.message
        });
    }
};
