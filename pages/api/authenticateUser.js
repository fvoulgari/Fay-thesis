import * as jose from 'jose'
import { serialize } from 'cookie';
import { createSecretKey } from 'crypto';
import pool from '../../Lib/dbconfig'

// Δηλώνουμε το συγκεκριμένο config για να μπορέσουμε να διαβάσει το api τα αρχεία
export default async function handler(req, res) {
    return new Promise(async (resolve) => {
        let client;
    try {
        if (req.method === "GET") {
            // console.log('it was a post method');
            // console.log(req);
           
            let rows = [];
            client = await pool.connect();
            const jwt = req.cookies.supervisor
            if (jwt) {
                const secretKey = await createSecretKey(
                    Buffer.from(process.env.JWT_KEY)
                );
                // const secretKey = await generateSecret('HS256');
                const { payload } = await jose.jwtDecrypt(jwt, secretKey);
                if (payload.email) {
                    let result = await client.query(
                        `
                  select * from users  where email=$1
                  `,
                        [payload.email]
                    );
                    // eslint-disable-next-line no-unused-vars
                    rows = result.rows;

                    if (rows.length > 0) {
                        res.status(200);
                        res.json({ sucess: true, supervisor: rows[0] });
                        return resolve
                    } else {
                        res.status(500);
                        res.json({ sucess: false });
                        return resolve
                    }
                }else{
                    res.json({
                        sucess: false
                    })
                    return resolve
                }
            }{
                res.status(500);
                res.json({ sucess: false });
            }
        }
        else {
            res.json({ sucess: false });
        }
    } catch (err) {
        console.log(err);
        res.status(500);
        res.json({ sucess: false });
    }finally{
        if(client)client.release()
    }
    })

}