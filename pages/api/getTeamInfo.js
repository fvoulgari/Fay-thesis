import { LocalConvenienceStoreOutlined } from "@mui/icons-material";
import formidable from "formidable";
import _ from 'lodash';
import { getTeamInformation } from "../../Lib/dao";


export default async function handler(req, res) {
    return new Promise(async (resolve) => {

        try{
                const teamInfo = await getTeamInformation(req.body.team,req.body.lab)
                if(teamInfo){
                    res.json({
                        success: true,
                        data: teamInfo
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
