import * as  util from 'util';
import _ from 'lodash';
import fs from "fs";
import { parse } from 'csv-parse';
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
    const { error, stdout, stderr } = await util.promisify(exec)("gh repo list teaching-assistant-uop --json name,isTemplate");
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


export async function InitializeStudentsRepositories(repo, file) {
    await util.promisify(fs.rename)(file.file.filepath, '/tmp' + '/' + file.file.originalFilename);

    const content = await util.promisify(fs.readFile)("/tmp/" + file.file.originalFilename);
    const records = await util.promisify(parse)(content);
    const { error, stdout, stderr } = await util.promisify(exec)(`rm -rf  /root/.repobee/env/src/repobee_testhelpers/resources/students.txt`);
    if (error) {
        console.log(`error: ${error.message}`);
        return;

    }
    if (stderr) {
        console.log(`stderr: ${stderr}`);
        return;
    }
    for (let temp of records.slice(1, records.length)) {

        await util.promisify(fs.appendFile)('/root/.repobee/env/src/repobee_testhelpers/resources/students.txt', temp[3] + '\n')
    }


    

    const { errorRep, stdoutRep, stderrRep } = await util.promisify(exec)(` repobee repos setup --assignments  ${repo} --sf /root/.repobee/env/src/repobee_testhelpers/resources/students.txt `);
    if (errorRep) {
        console.log(`error: ${errorRep.message}`);
        return;

    }
    if (stderrRep) {
        console.log(`stderr: ${stderrRep}`);
        return;
    }


    const { errorRM, stdoutRM, stderrRM } = await util.promisify(exec)(`rm -rf  /tmp/` + file.file.originalFilename);
    if (errorRM) {
        console.log(`error: ${errorRM.message}`);
        return;

    }
    if (stderrRM) {
        console.log(`stderr: ${stderrRM}`);
        return;
    }

    return null;


}



export async function initializeTemplateProject(repo, files) {
    const { errorMk, stdoutMk, stderrMk } = await util.promisify(exec)(`mkdir /tmp/newrepo `);
    if (errorMk) {
        console.log(`error: ${errorMk.message}`);
        return;

    }
    if (stderrMk) {
        console.log(`stderr: ${stderrMk}`);
        return;
    }

    if (files) {
        if (files.file) {
            if (Array.isArray(files.file)) {
                for (let file of files.file) {
                    await util.promisify(fs.rename)(file.filepath, '/tmp/newrepo' + '/' + file.originalFilename);
                }
            }
            else {
                console.log(files)
                console.log('here is path')
                await util.promisify(fs.rename)(files.file.filepath, '/tmp/newrepo' + '/' + files.file.originalFilename);
            }
        }
        if (files.testFile) {
            const { errorMkGit, stdoutMkGit, stderrMkGit } = await util.promisify(exec)(`mkdir -p /tmp/newrepo/.github/workflows `);
            if (errorMkGit) {
                console.log(`error: ${errorMkGit.message}`);
                return;

            }
            if (stderrMkGit) {
                console.log(`stderr: ${stderrMkGit}`);
                return;
            }

            if (Array.isArray(files.testFile)) {
                for (let file of files.testFile) {
                    await util.promisify(fs.rename)(file.filepath, '/tmp/newrepo/.github/workflows' + '/' + file.originalFilename);
                }
            }
            else {
                await util.promisify(fs.rename)(files.testFile.filepath, '/tmp/newrepo/.github/workflows' + '/' + files.testFile.originalFilename);
            }
        }

    }



    const { error, stdout, stderr } = await util.promisify(exec)(`gh repo create teaching-assistant-uop/${repo} --private `);
    if (error) {
        console.log(`error: ${error.message}`);
        return;

    }
    if (stderr) {
        console.log(`stderr: ${stderr}`);
        return;
    }


    const { errorGit, stdoutGit, stderrGit } = await util.promisify(exec)(`cd /opt/scripts && ./github.sh  teaching-assistant-uop ${repo} `);
    if (errorGit) {
        console.log(`error: ${errorGit.message}`);
        return;

    }
    if (stderrGit) {
        console.log(`stderr: ${stderrGit}`);
        return;
    }


    const { errorEdit, stdoutEdit, stderrEdit } = await util.promisify(exec)(`gh repo edit teaching-assistant-uop/${repo} --template `);
    if (errorEdit) {
        console.log(`error: ${errorEdit.message}`);
        return;

    }
    if (stderrEdit) {
        console.log(`stderr: ${stderrEdit}`);
        return;
    }

    const { errorRM, stdoutRM, stderrRM } = await util.promisify(exec)(`rm -rdf  /tmp/newrepo `);
    if (errorRM) {
        console.log(`error: ${errorRM.message}`);
        return;

    }
    if (stderrRM) {
        console.log(`stderr: ${stderrRM}`);
        return;
    }

    return null;


}



export async function pushFileTorepo(repo, path, files) {
    let client;
    let rows = [];
    const { error, stdout, stderr } = await util.promisify(exec)(`mkdir /tmp/newrepo `);
    if (error) {
        console.log(`error: ${error.message}`);
        return;

    }
    if (stderr) {
        console.log(`stderr: ${stderr}`);
        return;
    }

    const { errorEdit, stdoutEdit, stderrEdit } = await util.promisify(exec)(`gh repo edit teaching-assistant-uop/${name} --template `);
    if (errorEdit) {
        console.log(`error: ${errorEdit.message}`);
        return;

    }
    if (stderrEdit) {
        console.log(`stderr: ${stderrEdit}`);
        return;
    }






    const { errorRM, stdoutRM, stderrRM } = await util.promisify(exec)(`rm -rdf  /tmp/newrepo `);
    if (errorRM) {
        console.log(`error: ${errorRM.message}`);
        return;

    }
    if (stderrRM) {
        console.log(`stderr: ${stderrRM}`);
        return;
    }

    return null;


}



