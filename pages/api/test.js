import { configShow,getTemplates,initializeTemplateProject } from "../../Lib/dao";

const KEY = process.env.JWT_KEY;

export default async function handler(req, res) {
	let client;
    const {name} = req.body
    await configShow();
    const template= await getTemplates();
    await initializeTemplateProject(name);
    console.log(template)
    
    res.json({
        success: true,
        data: template
    });
	

}
