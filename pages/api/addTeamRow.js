import _ from 'lodash';
import { addTeamRow } from "../../Lib/dao";


export default async function handler(req, res) {
    return new Promise(async (resolve) => {

        try {
            const resp = await addTeamRow(
                req.body.editedTeam,
                req.body.githubInsert,
                req.body.amInsert,
                req.body.firstNameInsert,
                req.body.lastNameInsert,
                req.body.lab)
            if (resp) {
                res.json({
                    success: true,
                    data: resp
                });

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



