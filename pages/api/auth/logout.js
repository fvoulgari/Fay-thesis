import { serialize } from 'cookie';


export default async function login(req, res) {
    return new Promise(async (resolve) => {
        try {
            res.setHeader('Set-Cookie',
                serialize('supervisor', '', {
                    maxAge: -1,
                    path: '/',
                })
            );
            res.json({
                success: true,
            });

            return resolve


        } catch (error) {
            console.log(error);
            res.json({ success: false });
            return resolve

        }

    })
}


