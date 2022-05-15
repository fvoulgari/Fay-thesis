import formidable from "formidable";
import _ from 'lodash';
import { createOrganizations } from "../../Lib/dao";


// Δηλώνουμε το συγκεκριμένο config για να μπορέσουμε να διαβάσει το api τα αρχεία
export const config = {
    api: {
        bodyParser: false
    }
};
export default async function handler(req, res) {
    return new Promise(resolve => {
        //  Αρχικοποιούμε ένα formidable object για να κάνουμε parse την φόρμα και να διαχειριστούμε τα αρχεία.
        const form = new formidable.IncomingForm({ keepExtensions: true, multiples: true });
        form.parse(req, async function (err, fields, files) {
            const obj = JSON.parse(fields.formData)
            if (_.isEmpty(files) === false) {
                await createOrganizations(obj.className, obj.users, obj.checked, files);
                res.json({
                    success: true,
                    data: true
                });

                return resolve()


            } else {
                await createOrganizations(obj.className, obj.users, obj.checked);
                res.json({
                    success: true,
                    data: true
                });
                return resolve()
            }

        });

    })
}
