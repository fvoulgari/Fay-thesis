import formidable from "formidable";
import _ from 'lodash';
import util from 'util';
import { configShow, getRepos, initializeTemplateProject } from "../../Lib/dao";
// Δηλώνουμε το συγκεκριμένο config για να μπορέσουμε να διαβάσει το api τα αρχεία

export const config = {
    api: {
        bodyParser: false
    }
};

//  Αρχικοποιούμε ένα formidable object για να κάνουμε parse την φόρμα και να διαχειριστούμε τα αρχεία.
export default async function handler(req, res) {

    const form = new formidable.IncomingForm({ keepExtensions: true, multiples: true });
    form.parse(req, async function (err, fields, files) {
        const obj= JSON.parse(fields.formData)
        //Αν υπάρχουν φάκελοι αρχικοποίουμε το repository με αυτούς αλλιώς το αρχικοποιούμε χωρίς  αρχεία.
        if (_.isEmpty(files) === false) {
                await initializeTemplateProject( obj.name, files);
                    res.json({
                        success: true,
                        data: true
                    });

                
            
        }else{
            await initializeTemplateProject(obj.name);
            res.json({
                success: true,
                data: true
            });
        }
    });



}
