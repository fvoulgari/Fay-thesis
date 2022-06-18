import formidable from "formidable";
import _ from 'lodash';
import { initializeTemplateProject } from "../../Lib/dao";
// Δηλώνουμε το συγκεκριμένο config για να μπορέσουμε να διαβάσει το api τα αρχεία

export const config = {
    api: {
        bodyParser: false
    }
};

//  Αρχικοποιούμε ένα formidable object για να κάνουμε parse την φόρμα και να διαχειριστούμε τα αρχεία.
export default async function handler(req, res) {
    return new Promise(async (resolve) => {
        try {


            const form = new formidable.IncomingForm({ keepExtensions: true, multiples: true });
            form.parse(req, async function (err, fields, files) {
                const obj = JSON.parse(fields.formData)
                //Αν υπάρχουν φάκελοι αρχικοποίουμε το repository με αυτούς αλλιώς το αρχικοποιούμε χωρίς  αρχεία.
               const resp =  await initializeTemplateProject(obj.name, obj.classname, obj.team, obj.supervisor,obj.endDate, files);
               console.log(resp)
                if(resp){
                    res.json({
                    success: true,
                    data: resp
                });
                return resolve
            }else{
                res.json({
                    success: false,
                });
                return resolve
            }



            });
        } catch (error) {
            console.log(error)
            res.json({ success: false })
        }
    })

}
