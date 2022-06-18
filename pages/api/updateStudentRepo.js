import formidable from "formidable";
import _ from 'lodash';
import { updateExercise } from "../../Lib/dao";


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
            //Αν υπάρχει csv στην φόρμα καλούμε την createOrganizations με παράμετρο το csv αλλιώς την καλούμε χωρίς το csv
            const resp= await updateExercise( obj.lesson, obj.name,  files);

            if(resp.length>0){
                res.json({
                    success: true,
                    data: resp
                });
            }else{
                res.json({
                    success: false
                })
            }
            

            return resolve()


        })


    });

}
