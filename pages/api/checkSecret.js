import _ from 'lodash';
import { checkSecret} from "../../Lib/dao";


// Δηλώνουμε το συγκεκριμένο config για να μπορέσουμε να διαβάσει το api τα αρχεία
export default async function handler(req, res) {
try{
    await checkSecret(req.body.secret, req.body.team );
    res.json({
        success: true,
    });
}catch(error){
    console.log(error)
    res.json({success: false})
}
       
}
