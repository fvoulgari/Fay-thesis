import { exec } from 'child_process'


export async function configShow() {
	let client;
	let rows = [];
    exec("repobee config show ", (error, stdout, stderr) => {
        if (error) {
            console.log(`error: ${error.message}`);
            return;
        }
        if (stderr) {
            console.log(`stderr: ${stderr}`);
            return;
        }
        console.log(`stdout: ${stdout}`);
    });

    console.log('here')

    
	return null;
}



export async function getTemplates() {
	let client;
	let rows = [];
    exec("repobee config show ", (error, stdout, stderr) => {
        if (error) {
            console.log(`error: ${error.message}`);
            return;

        }
        if (stderr) {
            console.log(`stderr: ${stderr}`);
            return;
        }
        console.log(`stdout: ${stdout}`);
        
    });

    console.log('here')

    
	return null;
}
