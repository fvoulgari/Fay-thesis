import _ from 'lodash';
import { createOrganizations } from "../../Lib/dao";


// Δηλώνουμε το συγκεκριμένο config για να μπορέσουμε να διαβάσει το api τα αρχεία

export default async function handler(req, res) {
    return new Promise(async (resolve) => {
        try {
            await createOrganizations(req.body.organization,req.body.organizationName[0].name,req.body.supervisor, req.body.coSupervisors, req.body.year,req.body.secret);
            res.json({
                success: true,
            });

            return resolve()


        } catch (error) {
            console.log(error)
            res.json({
                success: false,
            });
            return resolve()
        }

    });

}
