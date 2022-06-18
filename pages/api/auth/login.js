import * as jose from 'jose'
import * as  bcrypt from 'bcrypt';

import { serialize } from 'cookie';
import { createSecretKey } from 'crypto';
import pool from '../../../Lib/dbconfig'

export default async function login(req, res) {
    return new Promise(async (resolve) => {

    if (req.method === 'POST') {
   
        const {email, password} = req.body;
        let client;
        let rows = [];
        try {
        client = await pool.connect();
       
            let result = await client.query(
                `
          select * from users where email=$1 
          `,
                [email]
            );

            rows = result.rows;
            if (rows.length > 0) {
                const isMatch = await bcrypt.compare(password,  rows[0].pwd) 
                if(isMatch){
                const secretKey = await createSecretKey(Buffer.from(process.env.JWT_KEY));
                const jwt = await new jose.EncryptJWT({ email: rows[0].email })
                    .setProtectedHeader({ alg: 'dir', enc: 'A128CBC-HS256' })
                    .setExpirationTime('2h')
                    .encrypt(secretKey);
                res.setHeader('Set-Cookie', serialize('supervisor',jwt,{ path: '/' }))

                res.json({
                    success: true,
                });

                return resolve
            }else{
                res.json({ success: false });
                return  resolve
            }
            } else {
                res.status(406);
                res.json({ success: false });
                return  resolve

            }
        } catch (error) {
            console.log(error);
            res.status(500);
            res.json({ success: false });
            return  resolve

        } finally {
            if (client) {
                client.release();
            }
        }

    }

})
}
