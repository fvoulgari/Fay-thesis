import * as  util from 'util';
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
    const { error , stdout , stderr } = await  util.promisify(exec)("gh repo list teaching-assistant-uop --json name,isTemplate");
        if (error) {
            console.log(`error: ${error.message}`);
            return;

        }
        if (stderr) {
            console.log(`stderr: ${stderr}`);
            return;
        }
        const templates = JSON.parse(stdout);

    return templates;

    
}




export async function initializeTemplateProject(name) {
	let client;
	let rows = [];
    const { error , stdout , stderr } = await  util.promisify(exec)(`gh repo create teaching-assistant-uop/${name} --private `);
        if (error) {
            console.log(`error: ${error.message}`);
            return;

        }
        if (stderr) {
            console.log(`stderr: ${stderr}`);
            return;
        }

        const { errorEdit , stdoutEdit , stderrEdit } = await  util.promisify(exec)(`gh repo edit teaching-assistant-uop/${name} --template `);
        if (errorEdit) {
            console.log(`error: ${errorEdit.message}`);
            return;

        }
        if (stderrEdit) {
            console.log(`stderr: ${stderrEdit}`);
            return;
        }

    return null;

    
}

