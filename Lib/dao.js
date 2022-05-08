import * as  util from 'util';
import _ from 'lodash';
import fs from "fs";
import { parse } from 'csv-parse';
import { exec } from 'child_process'




export async function getRepos() {
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

    // Σώζουμε το αρχείο csv στο /tmp χρησιμοποιώντας την fs.rename() 
    // Σε όλες τις ασύχρονες συναρτήσεις χρησιμοποιούμε την util.promisfy για να κάνουμε await μέχρι να τελειώσουν. 
    await util.promisify(fs.rename)(file.file.filepath, '/tmp' + '/' + file.file.originalFilename);
    const content = await util.promisify(fs.readFile)("/tmp/" + file.file.originalFilename);
    const records = await util.promisify(parse)(content);


    const { error, stdout, stderr } = await util.promisify(exec)(`if [ -f "/opt/scripts/students.txt" ]; then rm -rf /opt/scripts/students.txt ; fi`);
    if (error) {
        console.log(`error: ${error.message}`);
        return;

    }
    if (stderr) {
        console.log(`stderr: ${stderr}`);
        return;
    }
    // Αφού διαγράψουμε το παλιό students.txt το ξαναφτιάχνουμε με τα στοιχεία που υπάρχουν στο csv στην τέταρτη στήλη. 
    for (let temp of records.slice(1, records.length)) {
        
        await util.promisify(fs.appendFile)('/opt/scripts/students.txt', temp[3] + '\n')
    }


    
    // Μέσω του repobee αρχικοποιούμε τα repositories των μαθητών που βρίσκονται στο csv με βάση το template repo  

    const { errorRep, stdoutRep, stderrRep } = await util.promisify(exec)(` repobee repos setup --assignments  ${repo} --sf /opt/scripts/students.txt `);
    if (errorRep) {
        console.log(`error: ${errorRep.message}`);
        return;

    }
    if (stderrRep) {
        console.log(`stderr: ${stderrRep}`);
        return;
    }

    // Διαγράφουμε το αρχείο csv από το  /tmp 

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
    // Δημιουργόυμε στο /tmp έναν καινουργίο φάκελο 
    // Σε όλες τις ασύχρονες συναρτήσεις χρησιμοποιούμε την util.promisfy για να κάνουμε await μέχρι να τελειώσουν.
    
    const { errorcheck, stdoutcheck, stderrcheck } = await util.promisify(exec)(`if [ -d "/tmp/newrepo" ]; then rm -rf /tmp/newrepo ; fi `);
    if (errorcheck) {
        console.log(`error: ${errorcheck.message}`);
        return;

    }
    if (stderrcheck) {
        console.log(`stderr: ${stderrcheck}`);
        return;
    }
    const { errorMk, stdoutMk, stderrMk } = await util.promisify(exec)(`mkdir /tmp/newrepo `);
    if (errorMk) {
        console.log(`error: ${errorMk.message}`);
        return;

    }
    if (stderrMk) {
        console.log(`stderr: ${stderrMk}`);
        return;
    }
    //Ελέγχουμε αν υπάρχουν φάκελοι 
    if (files) {
        if (files.file) {
            //Έλεγχος για το αν υπάρχουν πολλοί φάκελοι ή μόνο ένας
            if (Array.isArray(files.file)) {
                for (let file of files.file) {
                    await util.promisify(fs.rename)(file.filepath, '/tmp/newrepo' + '/' + file.originalFilename);
                }
            }
            else {
                await util.promisify(fs.rename)(files.file.filepath, '/tmp/newrepo' + '/' + files.file.originalFilename);
            }
        }
        //Ελέγχουμε αν υπάρχουν φάκελοι που πρέπει αν μπουν στο github workflows
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
            //Έλεγχος για το αν υπάρχουν πολλοί φάκελοι ή μόνο ένας
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


     //Δημιουργούμε private repository στον οργανισμό με το όνομα που δήλωθηκε

    const { error, stdout, stderr } = await util.promisify(exec)(`gh repo create teaching-assistant-uop/${repo} --private `);
    if (error) {
        console.log(`error: ${error.message}`);
        return;

    }
    if (stderr) {
        console.log(`stderr: ${stderr}`);
        return;
    }

     //Κάνουμε cd στο /opt/scripts και τρέχουμε το github.sh το οποίο αρχικοποεί το repository με τα αρχεία που έχουμε στο /tmp/newrepo

    const { errorGit, stdoutGit, stderrGit } = await util.promisify(exec)(`cd /opt/scripts && ./github.sh  teaching-assistant-uop ${repo} `);
    if (errorGit) {
        console.log(`error: ${errorGit.message}`);
        return;

    }
    if (stderrGit) {
        console.log(`stderr: ${stderrGit}`);
        return;
    }

     //Κάνουμε edit στο repository ώστε να το κάνουμε template μέσω του github cli

    const { errorEdit, stdoutEdit, stderrEdit } = await util.promisify(exec)(`gh repo edit teaching-assistant-uop/${repo} --template `);
    if (errorEdit) {
        console.log(`error: ${errorEdit.message}`);
        return;

    }
    if (stderrEdit) {
        console.log(`stderr: ${stderrEdit}`);
        return;
    }
    
    // Διαγράφουμε τα αρχεία που φτιάξαμε
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