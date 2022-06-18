import _ from 'lodash';
import { saveGrade } from "../../Lib/dao";


export default async function handler(req, res) {
    return new Promise(async (resolve) => {

        try{
                const resp = await saveGrade(req.body.exercise,req.body.teamMember,req.body.grade,req.body.comment)
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
