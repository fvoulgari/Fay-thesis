import { deleteExercise } from "../../Lib/dao";


export default async function handler(req, res) {
    return new Promise(async (resolve) => {

        try{
                const resp = await deleteExercise(req.body.organization  , req.body.exercise )
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
