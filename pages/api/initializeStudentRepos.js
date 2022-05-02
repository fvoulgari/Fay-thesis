import formidable from "formidable";
import _ from 'lodash';
import util from 'util';
import { InitializeStudentsRepositories} from "../../Lib/dao";

export const config = {
    api: {
        bodyParser: false
    }
};
export default async function handler(req, res) {

    //  await initializeTemplateProject('teaching-assistant-uop', name, files);
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
