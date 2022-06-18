import _ from 'lodash';
import { deleteTeamRows } from "../../Lib/dao";


export default async function handler(req, res) {
    return new Promise(async (resolve) => {

        try{
                const resp = await deleteTeamRows(req.body.teamRows )
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
