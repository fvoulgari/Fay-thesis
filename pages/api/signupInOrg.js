import _ from 'lodash';
import { signupInOrganization} from "../../Lib/dao";


// Δηλώνουμε το συγκεκριμένο config για να μπορέσουμε να διαβάσει το api τα αρχεία
export default async function handler(req, res) {

    //  Αρχικοποιούμε ένα formidable object για να κάνουμε parse την φόρμα και να διαχειριστούμε τα αρχεία.
        await signupInOrganization(req.body.name, req.body.email );
        res.json({
            success: true,
            data: true
        });
}
