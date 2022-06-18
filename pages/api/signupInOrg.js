import _ from 'lodash';
import { signupInOrganization } from "../../Lib/dao";


export default async function handler(req, res) {
    return new Promise(async (resolve) => {

        try {
            
            const result = await signupInOrganization(req.body.name, req.body.email,req.body.githubname, req.body.secret);
            if (result) {
                res.json({
                    success: true,
                });
                return resolve

            } else {
                res.json({ success: false })
                return resolve
            }

        } catch (error) {
            console.log(error);
            res.json({ success: false })
            return resolve

        }
        //  Αρχικοποιούμε ένα formidable object για να κάνουμε parse την φόρμα και να διαχειριστούμε τα αρχεία.

    
})
}
