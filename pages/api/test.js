import { configShow } from "../../Lib/dao";

const KEY = process.env.JWT_KEY;

export default async function handler(req, res) {
	let client;

    await configShow();
    
    res.json({
        success: true,
        token: 'Bearer ',
        user: {user: 'hello'}
    });
	

}
