import formidable from "formidable";
import _ from 'lodash';
import { InitializeStudentsRepositories} from "../../Lib/dao";


// Δηλώνουμε το συγκεκριμένο config για να μπορέσουμε να διαβάσει το api τα αρχεία
export const config = {
    api: {
        bodyParser: false
    }
};
export default async function handler(req, res) {

    //  Αρχικοποιούμε ένα formidable object για να κάνουμε parse την φόρμα και να διαχειριστούμε τα αρχεία.
    const form = new formidable.IncomingForm({ keepExtensions: true, multiples: true });
    form.parse(req, async function (err, fields, files) {
        const obj = JSON.parse(fields.formData)

        await InitializeStudentsRepositories(obj.name, files);
        res.json({
            success: true,
            data: true
        });
    });


}
