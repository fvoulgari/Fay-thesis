import { LocalConvenienceStoreOutlined } from "@mui/icons-material";
import formidable from "formidable";
import _ from 'lodash';
import { initializeTemplateProject,getReposFiles, getContents } from "../../Lib/dao";


export default async function handler(req, res) {
    return new Promise(async (resolve) => {

        try{
                const files = await getContents(req.body.lesson  , req.body.templateRepo )
                if(!(_(files).isEmpty())){
                    res.json({
                        success: true,
                        data: files
                    });

                    return resolve
                }else{
                    res.json({
                        success: false
                    });

                    return resolve
                }
                   

            
        }catch(error){
           console.log(error)
            res.json({
                success: false,
            });
            return resolve
        }

    })

}
