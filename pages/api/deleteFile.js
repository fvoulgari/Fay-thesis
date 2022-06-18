import { LocalConvenienceStoreOutlined } from "@mui/icons-material";
import formidable from "formidable";
import _ from 'lodash';
import { deleteFile } from "../../Lib/dao";


export default async function handler(req, res) {
    return new Promise(async (resolve) => {

        try{
                await deleteFile(req.body.lesson  , req.body.templateRepo , req.body.file )
                    res.json({
                        success: true
                    });

                    return resolve

            
        }catch(error){
           console.log(error)
            res.json({
                success: false,
            });
            return resolve
        }

    })

}
