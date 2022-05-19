import * as  util from 'util';
import _ from 'lodash';
import pool from './dbconfig'
import fs from 'fs'
import { parse } from 'csv-parse';
import { Octokit, App } from "octokit";
import { exec } from 'child_process'

// TODO #1 make dev and prod envs for connecting to DB




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


export async function checkClass(user, orgName) {
    let client;
    let rows = [];

    var { error, stdout, stderr } = await util.promisify(exec)(`gh api -H "Accept: application/vnd.github.v3+json" /user/orgs --jq ".[].login" `);
    if (error) {
        console.log(`error: ${error.message}`);
        return false;

    }
    if (stderr) {
        console.log(`stderr: ${stderr}`);
        return false;
    }
    const orgs = stdout.split('\n');
    orgs.pop()

    if (!orgs.includes(orgName)) return false

    var { error, stdout, stderr } = await util.promisify(exec)(`gh api  -H "Accept: application/vnd.github.v3+json"  /orgs/${orgName}/members --jq ".[].login"`);
    if (error) {
        console.log(`error: ${error.message}`);
        return false;

    }
    if (stderr) {
        console.log(`stderr: ${stderr}`);
        return false;
    }

    const member = stdout.split('\n');
    member.pop();
    if (!member.includes(user)) return false


    return true;


}
export async function getActiveOrganizations() {
    // Παίρνουμε  όλους τους οργανισμούς μέσω του github cli
    const { error, stdout, stderr } = await util.promisify(exec)(" gh api  /user/memberships/orgs  --jq '.[].organization.login'");
    if (error) {
        console.log(`error: ${error.message}`);
        return;

    }
    if (stderr) {
        console.log(`stderr: ${stderr}`);
        return;
    }
    // Δημιουργούμε έναν πίνακα από το string στο sdout με όλους τους οργανισμούς
    const orgs = stdout.split('\n');
    orgs.pop()
    const activeOrgs = []
    let client;
    let rows = [];


    // Φέρνουμε τους active οργανισμούς από την βάση κάνοντας φιλτράρισμα με το github ID
    for (let org of orgs) {
        client = await pool.connect();
        let result = await client.query(
            `
            select * from organizations  where name=$1 and active is true 
            `,
            [org]
        );

        rows = result.rows;
        
        if (rows.length > 0) {
            activeOrgs.push(rows[0].githubname)
        }
        console.log(activeOrgs)
    }

    return activeOrgs;
}


export async function createOrganizations(org, supervisors, checked, files) {

   let client;
    let rows = [];
    client = await pool.connect();
    const nonActiveMyOrgs = await client.query(
        `
            Select * from organizations where active = false
            `, [])

            //Μετανομάζουμε το πρώτο μη ενεργό organization στον όνομα που δώθηκε από τον χρήστη και το θέτουμε ως active
    await client.query(
        `
            UPDATE organizations SET githubname=$1 , active= true  WHERE name = $2 
            `, [org, nonActiveMyOrgs.rows[0].name])
        //Μέσω github cli κάνουμε μετονομασία του public name του οργανισμού.
    var { error, stdout, stderr } = await util.promisify(exec)(` gh api   --method PATCH   -H "Accept: application/vnd.github.v3+json"   /orgs/${nonActiveMyOrgs.rows[0].name}   -f name='${org}'`);

    if (error) {
        console.log(`error: ${error.message}`);
        return;

    }
    if (stderr) {
        console.log(`stderr: ${stderr}`);
        return;
    }

    for (let supervisor of supervisors) {
        //Στέλνουμε invitation στους supervisors
        signupInOrganization(nonActiveMyOrgs.rows[0].name, supervisor);
    }

    var records;
    var content
    if (files) {
        if (files.file) {
                // Σώζουμε το αρχείο csv στο /tmp χρησιμοποιώντας την fs.rename() 
            await util.promisify(fs.rename)(files.file.filepath, '/tmp' + '/' + files.file.originalFilename);
            content = await util.promisify(fs.readFile)("/tmp/" + files.file.originalFilename);
            records = await util.promisify(parse)(content);
            records.shift()
            //Αν δεν έχει επιλεγεί η αυτόματη ανάθεση φοιτητών, δεν δημιουργούμε τις ομάδες.
            if (checked) {
                //Υπολογίζουμε πόσοι φοιτητές πρέπει να ανατεθούν σε κάθε supervisor
                var chunksize = Math.ceil(records.length / supervisors.length);
                //Χρησιμοποιώντας την _.chunk  της loadash χωρίζουμε τον έναν πίνακα σε πολλούς όπου ο κάθε ένας πίνακας έχει length ίδιο με το chunksize
                const chunked = _.chunk(records, chunksize)
  
                for (let i = 0; i < chunked.length; i++) {
                    let supervisorsDb = await client.query(
                        `
                            select * from users  where email=$1
                            `,
                        [supervisors[i]]
                    );
                        // Δημιουργούμε νέα ομάδα στο github μέσω του github cli
                    var { error, stdout, stderr } = await util.promisify(exec)(`gh api --method POST -H "Accept: application/vnd.github.v3+json" /orgs/${nonActiveMyOrgs.rows[0].name}/teams -f name='${org}-team-${i}'  -f description='Team ${i} for lesson ${org}'  -f permission='push' -f privacy='closed'`);
                    if (error) {
                        console.log(`error: ${error.message}`);
                        return false;

                    }
                    if (stderr) {
                        console.log(`stderr: ${stderr}`);
                        return false;
                    }


                    await client.query(
                        `
                            INSERT INTO team( team_name ,team_supervisor, lesson ) VALUES ( $1,$2,$3)
                            `,
                        [`${org}-team-${i}`, supervisorsDb.rows[0].githubname, org]

                    );
                    //Παίρνουμε το GITHUB ID της ομάδας που μόλις δημιουργήσαμε
                    var { error, stdout, stderr } = await util.promisify(exec)(` gh api  -H "Accept: application/vnd.github.v3+json"  /orgs/${nonActiveMyOrgs.rows[0].name}/teams/${org}-team-${i} --jq '.id' `);
                    if (error) {
                        console.log(`error: ${error.message}`);
                        return false;

                    }
                    if (stderr) {
                        console.log(`stderr: ${stderr}`);
                        return false;
                    }
                    //Περνάμε το id από το stdout σε έναν πίνακα
                    const teamID = stdout.split('\n');
                    teamID.pop()

                    for (let j = 0; j < chunked[i].length; j++) {
                        //Βάζουμε τα στοιχεία των φοιτητών στην βάση
                        await client.query(
                            `
                                INSERT INTO team_member(team_name, member_github_name,active) VALUES ( $1,$2,$3)
                                `,
                            [`${org}-team-${i}`, chunked[i][j][3], false]

                        );
                        //Δημιουργούμε ένα request ώστε να κάνουμε invite στον organization τους φοιτητές μέσω του Github API .
                        const octokit = new Octokit({
                            auth: process.env.pat
                        })

                        await octokit.request('POST /orgs/{org}/invitations', {
                            org: nonActiveMyOrgs.rows[0].name,
                            email: chunked[i][j][4],
                            role: 'direct_member',
                            team_ids: [
                                parseInt(teamID[0])
                            ]
                        })

                        /*var { error, stdout, stderr } = await util.promisify(exec)(`curl -u teachingAssistant-uop:${process.env.pat} -X POST -H "Accept: application/vnd.github.v3+json"  https://api.github.com/orgs/${myOrgs.rows[0].name}/invitations -d '{"email":"${chunked[i][j][4]}","role":"direct_member","team_ids":[${team[0]}]}'  `);
                        if (error) {
                            console.log(`error: ${error.message}`);
                            return false;

                        }
                        if (stderr) {
                            console.log(`stderr: ${stderr}`);
                            return false;
                        }
                        */
                        

                    }
                }

            }



        }
    }


    return true;
}

export async function signupInOrganization(name, email) {
    
    /*let client;
    let rows = [];
    client = await pool.connect();
    let result = await client.query(
        `
            select * from users  where email=$1
            `,
        [email]
    );

    rows = result.rows;

*/
        // Χρησιμοποιούμε το cli για να δημιουργήσουμε ένα invitation για τον χρήστη
    const { error, stdout, stderr } = await util.promisify(exec)(` gh api   --method POST  -H "Accept: application/vnd.github.v3+json" /orgs/${name}/invitations -f email=${email} -f role=admin `);
    if (error) {
        console.log(`error: ${error.message}`);
        return;

    }
    if (stderr) {
        console.log(`stderr: ${stderr}`);
        return;
    }
    const orgs = stdout.split('\n');
    orgs.pop()

    return null;


}



export async function getOrganizations() {
    let client;
    let rows = [];
    const { error, stdout, stderr } = await util.promisify(exec)(" gh api  /user/memberships/orgs  --jq '.[].organization.login'");
    if (error) {
        console.log(`error: ${error.message}`);
        return;

    }
    if (stderr) {
        console.log(`stderr: ${stderr}`);
        return;
    }


    const orgs = stdout.split('\n');
    orgs.pop()
    return orgs;


}

export async function getTeams(name) {
    let client;
    let rows = [];
    client = await pool.connect();

    const teams = await client.query(
        `
            Select * from team where lesson=$1
            `, [name])
    

    return teams.rows;


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