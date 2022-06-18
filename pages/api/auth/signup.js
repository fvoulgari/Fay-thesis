import * as jose from 'jose'
import * as bcrypt from 'bcrypt'
import { createSecretKey } from 'crypto';
import pool from '../../../Lib/dbconfig'
import { serialize } from 'cookie';


export default async function signup(req, res) {
    return new Promise(async (resolve) => {
        let client;

        try {
            if (req.method === 'POST') {

                let rows = [];
                client = await pool.connect();
                const hashpass = await bcrypt.hash(req.body.password, 10) //Κάνουμε hash τον κωδικό που όρισε ο χρήστης

                let result = await client.query(
                    `
                INSERT INTO  users(first_name,last_name,email,pwd,githubname) VALUES($1,$2,$3,$4,$5)
                returning *
          `,
                    [req.body.name, req.body.lastname, req.body.email, hashpass, req.body.github,]
                );

                //const isMatch = await bcrypt.compare(password, user.kwdikos) 

                rows = result.rows;
                if (rows.length > 0) {
                    const secretKey = await createSecretKey(Buffer.from(process.env.JWT_KEY));
                    const jwt = await new jose.EncryptJWT({ email: rows[0].email })
                        .setProtectedHeader({ alg: 'dir', enc: 'A128CBC-HS256' })
                        .setExpirationTime('2h')
                        .encrypt(secretKey);
                    res.setHeader('Set-Cookie', serialize('supervisor', jwt, { path: '/' }))

                    res.json({
                        success: true,
                    });

                    return resolve
                } else {
                    res.status(406);
                    res.json({ success: false });
                    return resolve

                }
            }
        } catch (error) {
            console.log(error);
            res.status(500);
            res.json({ success: false });
            return resolve


        } finally {
            if (client) client.release()
        }



    })
}



