import { LocalConvenienceStoreOutlined } from "@mui/icons-material";
import formidable from "formidable";
import _ from 'lodash';
import { deleteTeam } from "../../Lib/dao";


export default async function handler(req, res) {
    return new Promise(async (resolve) => {

        try{
                const resp = await deleteTeam(req.body.team,req.body.lab)
                if(resp){
                    res.json({
                        success: true,
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
