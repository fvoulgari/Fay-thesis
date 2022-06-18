import _ from 'lodash';
import { demoCheckSimilarity,  } from "../../Lib/dao";


export default async function handler(req, res) {
    return new Promise(async (resolve) => {


        try {
            const content = await demoCheckSimilarity()
            if (content) {
            
                res.setHeader('Content-Disposition', 'attachment; filename=Lab-content.html');
                res.setHeader('Content-Type', 'application/octet-stream');
                res.end(content);

                return resolve
            } else {
                res.json({
                    success: false
                });

                return resolve
            }



        } catch (error) {
            console.log(error)
            res.json({
                success: false,
            });
            return resolve
        }

    })

}
