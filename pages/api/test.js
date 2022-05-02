import formidable from "formidable";
import _ from 'lodash';
import util from 'util';
import { configShow, getTemplates, initializeTemplateProject } from "../../Lib/dao";

export const config = {
    api: {
        bodyParser: false
    }
};
export default async function handler(req, res) {
    let client;
    console.log('starting')
    //  await initializeTemplateProject('teaching-assistant-uop', name, files);
    const form = new formidable.IncomingForm({ keepExtensions: true, multiples: true });
    form.parse(req, async function (err, fields, files) {
        const obj= JSON.parse(fields.formData)

        if (_.isEmpty(files) === false) {
                await initializeTemplateProject( obj.name, files);
                    res.json({
                        success: true,
                        data: true
                    });

                
            
        }else{
            await initializeTemplateProject('teaching-assistant-uop', obj.name);
            res.json({
                success: true,
                data: true
            });
        }
    });



}
