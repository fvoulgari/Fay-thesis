import _ from 'lodash';
import { updateTeamSupervisor } from "../../Lib/dao";


export default async function handler(req, res) {
    return new Promise(async (resolve) => {

        try {
            const resp = await updateTeamSupervisor(  req.body.team, req.body.supervisor, req.body.organization)
            if (resp) {
                res.json({
                    success: true
                });
                return resolve

            } else {
                res.json({
                    success: false
                });
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
