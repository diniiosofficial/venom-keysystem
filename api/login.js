const pool = require('./db');

const bcrypt =
require('bcryptjs');

const jwt =
require('jsonwebtoken');

const JWT_SECRET =
'LEGACY_CORE_SECRET';

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
            password
        } = req.body;

        if(
            !username ||
            !password
        ){

            return res.json({

                success:false,

                message:
                'Missing Credentials'
            });
        }

        const result =
        await pool.query(

            'SELECT * FROM accounts WHERE username=$1 LIMIT 1',

            [username]
        );

        if(
            result.rows.length <= 0
        ){

            return res.json({

                success:false,

                message:
                'Invalid Username'
            });
        }

        const user =
        result.rows[0];

        const valid =
        bcrypt.compareSync(

            password,
            user.password
        );

        if(!valid){

            return res.json({

                success:false,

                message:
                'Invalid Password'
            });
        }

        const token =
        jwt.sign({

            id:user.id,

            username:
            user.username,

            role:user.role

        },

        JWT_SECRET,

        {
            expiresIn:'7d'
        });

        return res.json({

            success:true,

            token,

            role:user.role
        });

    } catch(e){

        return res.json({

            success:false,

            message:e.message
        });
    }
};
