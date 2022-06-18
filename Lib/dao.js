import * as  util from 'util';
import _ from 'lodash';
import * as jose from 'jose'
import pool from './dbconfig'
import fs from 'fs'
import moment from 'moment';
import base64 from 'base-64';
import CryptoJS from 'crypto-js'
import Utf8 from 'crypto-js/enc-utf8'
import { parse } from 'csv-parse';
import { Octokit, App } from "octokit";
import { exec } from 'child_process'
import { createSecretKey } from "crypto";



export async function getAppCookies(req) {
    let client;

    try {
        let rows = [];
        client = await pool.connect();
        const jwt = req.cookies.supervisor
        if (jwt) {
            //Δημιουργούμε το secret key από το JWT που έχουμε στο .env αρχείο.
            const secretKey = await createSecretKey(
                Buffer.from(process.env.JWT_KEY)
            );
            //Κάνουμε decrypt το cookie με το secret key και παίρνουμε το email του χρήστη.
            const { payload } = await jose.jwtDecrypt(jwt, secretKey);
            if (payload.email) {
                let result = await client.query(
                    `
                  select * from users  where email=$1
                  `,
                    [payload.email]
                );
                rows = result.rows;
                //Αν υπάρχει ο χρήστης κάνουμε return όλα του τα στοιχεία αλλιώς κάνουμε return success: false
                if (rows.length > 0) {
                    return { sucess: true, supervisor: rows[0] };
                } else {
                    return { sucess: false };
                }
            }
        }
        return { sucess: false };

    } catch (err) {
        console.log(err);
        return { sucess: false, message: err };
    }finally{
        if(client) client.release()
    }


}
export async function deleteFile(organization, exercise, file) {
    let client;
    let rows = [];
    try{

    //Παίρνουμε πληροφορίες για το εργαστήριο
    client = await pool.connect();
    const orgNames = []
    let result = await client.query(
        `
                select * from organizations org 
                    where org.githubname=$1  
   `,
        [organization]
    );

    const octokit = new Octokit({
        auth: process.env.pat
    })
    //Χρησιμοποιώντας το github API φέρνουμε όλα τα commits που έχουν αλλάξει τον φάκελο που βρίσκεται προς διαγραφή.
    const reqCommit = await octokit.request('GET /repos/{owner}/{repo}/commits', {
        owner: result.rows[0].name,
        repo: exercise,
        path: file.path
    })

    //Χρησιμοποιώντας τις πληροφορίες από το  τελευταίο commit κάνω διαγραφή του φακέλου ακολουθώντας τις οδηγίες από το manual του github
    const req = await octokit.request('DELETE /repos/{owner}/{repo}/contents/{path}', {
        owner: result.rows[0].name,
        repo: exercise,
        path: file.path,
        message: reqCommit.data[0].commit.message,
        sha: file.sha
    }
    )
      const team = await client.query(
        `
    Select * from exercise  e inner join team t on e.team = t.team_id where e.name like $1
        `, [exercise])
    if (team.rows.length == 0) return false

    const studentRows = await client.query(
        `
    Select * from team_member where team like $1
        `, [team.rows[0].team_id])

    let students

    if (studentRows.rows.length > 0) {
        students = studentRows.rows.map((student) => {
            return student.member_github_name
        })

        //Για όλους τους μαθητές διαγράφουμε τα repositories  και τα  ξαναδημιουργούμε από την αρχή 
        for (let student of students) {

            const { errorDel, stdoutDel, stderrDel } = await util.promisify(exec)(` gh api  --method DELETE -H "Accept: application/vnd.github.v3+json" /repos/${result.rows[0].name}/${student}-${exercise}`);
            if (errorDel) {
                console.log(`error: ${errorDel.message}`);
                return;

            }
            if (stderrDel) {
                console.log(`stderr: ${stderrDel}`);
                return;
            }

            const { error, stdout, stderr } = await util.promisify(exec)(`gh repo create ${result.rows[0].name}/${student}-${exercise} --private --template ${result.rows[0].name}/${exercise} `);
            if (error) {
                console.log(`error: ${error.message}`);
                return false;

            }
            if (stderr) {
                console.log(`stderr: ${stderr}`);
                return false;
            }
            const { errorInv, stdoutInv, stderrInv } = await util.promisify(exec)(`  gh api --method PUT -H "Accept: application/vnd.github.v3+json" /repos/${result.rows[0].name}/${exercise}/collaborators/${student}`);
            if (errorInv) {
                console.log(`error: ${errorInv.message}`);
                return false;

            }
            if (stderrInv) {
                console.log(`stderr: ${stderrInv}`);
                return false;
            }
        }


    } else {
        return false
    }



    return null
}catch(error){
    return null
}finally{
    if(client) client.release()
}



}

export async function deleteLab(organization) {
    let client;
    let rows = [];
    try{

    
    client = await pool.connect();
    let result = await client.query(
        `
                select * from organizations org 
                    where org.githubname=$1  
   `,
        [organization]
    );
    if (result.rows.length == 0) return false
//--jq '.[] | [.name , ._links.html] 
  const { error, stdout, stderr } = await util.promisify(exec)(`gh api   -H "Accept: application/vnd.github.v3+json"  /orgs/${result.rows[0].name}/repos --jq '.[].name '`);
  if (error) {
      console.log(`error: ${error.message}`);

  }
  if (stderr) {
      console.log(`stderr: ${stderr}`);
  }
    let repos = stdout.split('\n');
    repos.pop()
    //Διαγράφουμε τα repositories
    for(let repo of repos){
        util.promisify(exec)(`gh api  --method DELETE -H "Accept: application/vnd.github.v3+json" /repos/${result.rows[0].name}/${repo} `).then( ({error, stdout, stderr})=>{
        });        
    }
    //Βρίσκουμε τα μέλη
    let members;
    await util.promisify(exec)(`gh api -H "Accept: application/vnd.github.v3+json"  /orgs/${result.rows[0].name}/members --jq '.[].login' `).then(({error,stdout,stderr})=>{
        if (error) {
            console.log(`error: ${error.message}`);
      
        }
        if (stderr) {
            console.log(`stderr: ${stderr}`);
        }
        members= stdout.split('\n')
        members.pop()
    });
    members= members.filter((member)=>member!='teachingAssistant-uop')
    //Διαγράφουμε  τα μέλη εκτός του διαχειριστή.

    for(let member of members){
        util.promisify(exec)(`gh api  --method DELETE -H "Accept: application/vnd.github.v3+json" /orgs/${result.rows[0].name}/members/${member} `).then( ({error, stdout, stderr})=>{
            console.log(stdout)  
        }); 
  
    }
    let invites;
    // Βρίσκουμε τα invites που είναι  pending
    await util.promisify(exec)(`gh api  -H "Accept: application/vnd.github.v3+json"  /orgs/${result.rows[0].name}/invitations --jq '.[].id' `).then(({error,stdout,stderr})=>{
        if (error) {
            console.log(`error: ${error.message}`);
      
        }
        if (stderr) {
            console.log(`stderr: ${stderr}`);
        }
        invites= stdout.split('\n')
        invites.pop()
    });
    for(let invite of invites){
            // Διαγράφουμε  τα invites που είναι  pending

        util.promisify(exec)(`gh api  --method DELETE -H "Accept: application/vnd.github.v3+json" /orgs/${result.rows[0].name}/invitations/${invite} `); 
    }

    let deleteExe1 = await client.query(
        `
                DELETE from grades  
                    where exercise  in  ( select name from exercise where lesson = $1)
   `,
        [organization]
    );

    let deleteExe = await client.query(
        `
                DELETE from exercise  
                    where lesson=$1  
   `,
        [organization]
    );

    let deleteTM = await client.query(
        `
                DELETE from team_member tm  
                    where EXISTS ( select 1 from team t where t.team_id = tm.team and t.lesson=$1)
   `,
        [organization]
    );

    
    let deleteT = await client.query(
        `
                DELETE from team   
                    where lesson = $1
   `,
        [organization]
    );

    let deleteOrgSu = await client.query(
        `
                DELETE from organization_supervisors   
                    where organization = $1
   `,
        [organization]
    );
      

    let updateOrg = await client.query(
        `
                UPDATE  organizations   SET githubname=name , year='',lab_name='',active=false
                    where githubname = $1
   `,
        [organization]
    );


    
    return true

    }catch(er){
        console.log(er);
        return false
    }finally{
        if(client) client.release()
    }
}


export async function saveGrade(exercise,teamMember,grade,comment) {
    let client;
    let rows = [];
    try{

   
    client = await pool.connect();

    const teamRows = await client.query(
        `
          Select * from  team_member tm  inner join exercise e on e.team = tm.team where tm.member_github_name = $1 and e.name = $2
           
            `, [teamMember,exercise])

        if(teamRows.rows.length==0)return []
    let result = await client.query(
        `
        select * from grades g inner  join team_member tm on tm.team_member_id = g.team_member where g.exercise = $1 and tm.member_github_name=  $2

   `,
        [exercise,teamMember]
    );

    if (result.rows.length == 0){
        let result = await client.query(
            `
            INSERT INTO  grades(exercise,team_member,grade,comment) VALUES( $1,$2,$3,$4)
            returning *
    
       `,
            [exercise,teamRows.rows[0].team_member_id, grade,comment]  );
            if(result.rows==0) return false
    } else{
        let result = await client.query(
            `
            UPDATE grades SET grade=$1 ,comment= $4 WHERE exercise = $2  and team_member = $3
            returning *
    
       `,
            [grade,exercise,teamRows.rows[0].team_member_id,comment]  );
            if(result.rows==0) return false
    }

    return true
    }catch(error){
        console.log(error)
        return false
    }
    finally {
		if (client) {
			client.release();
		}
	}
}
export async function getGithubInfo(classname) {
    let client;
    let rows = [];
    try{

   
    client = await pool.connect();
    let result = await client.query(
        `
                select * from organizations org 
                    where org.githubname=$1  
   `,
        [classname]
    );
    if (result.rows.length > 0) return result.rows[0]

    return false
    }catch(error){
        console.log(error)
        return false
    }
    finally {
		if (client) {
			client.release();
		}
	}
}

export async function getExerciseInfo(classname) {
    let client;
    let rows = [];
    try{

   
    client = await pool.connect();
    let result = await client.query(
        `
                select * from exercise e 
                    where e.lesson=$1  
   `,
        [classname]
    );
    if (result.rows.length > 0) return result.rows

    return false
    }catch(error){
        console.log(error)
        return false
    }
    finally {
		if (client) {
			client.release();
		}
	}
}

export async function getReposFiles(classname, repo) {
    let client;
    let rows = [];
    try{

    
    client = await pool.connect();
    const orgNames = []
    let result = await client.query(
        `
                select * from organizations org 
                    where org.githubname=$1  
   `,
        [classname]
    );
    if (result.rows.length > 0) {
        const { error, stdout, stderr } = await util.promisify(exec)(`gh api -H "Accept: application/vnd.github.v3+json"   /repos/${result.rows[0].name}/${repo}/git/trees  --jq '.[] | [.name , ._links.html] '`);
        if (error) {
            console.log(`error: ${error.message}`);
            return;

        }
        if (stderr) {
            console.log(`stderr: ${stderr}`);
            return;
        }
        let files = stdout.split('\n');
        files.pop()

        return files;
    } else {
        return ''
    }

}catch(e){
    console.log(e)
    return ''
}finally{
    if(client) client.release()
}

}



export async function getRepos(classname) {
    let client;
    let rows = [];
    try{
    client = await pool.connect();
    const orgNames = []
    let result = await client.query(
        `
                select * from organizations org 
                    where org.githubname=$1  
   `,
        [classname]
    );
    if (result.rows.length > 0) {
        //Φέρνουμε όλα τα repository κράτωντας μόνο την πληροφορία για το αν είναι template καθώς και το όνομα τους.
        const { error, stdout, stderr } = await util.promisify(exec)(`gh repo list ${result.rows[0].name} --json name,isTemplate`);
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
    } else {
        return []
    }
    }catch(e){
        return []
    }finally{
        if(client) client.release()
    }


}
export async function getContents(classname, exercise) {
    // Φέρνουμε τα στοιχεία του τελευταίου commit στην άσκηση, και μέσω αυτού βρίσκουμε τις πληορφορίες για τα αρχεία που υπάρχουν στο repository
    let client;
    let rows = [];
    client = await pool.connect();
    const orgNames = []
    let result = await client.query(
        `
                select * from organizations org 
                    where org.githubname=$1  
   `,
        [classname]
    );
    if (result.rows.length > 0) {
        const { error, stdout, stderr } = await util.promisify(exec)(`gh api -H "Accept: application/vnd.github.v3+json" /repos/${result.rows[0].name}/${exercise}/commits  --jq ".[0].commit.tree.sha"
        `);
        if (error) {
            console.log(`error: ${error.message}`);
            return [];

        }
        if (stderr) {
            console.log(`stderr: ${stderr}`);
            return [];
        }

        const sha = stdout.split('\n')


        const octokit = new Octokit({
            auth: process.env.pat
        })
        //Μέσω του github tree api φέρνουμε όλα τα αρχεία και πληροφορίες για αυτά.
        const req = await octokit.request('GET /repos/{owner}/{repo}/git/trees/{tree_sha}?recursive=1', {
            owner: result.rows[0].name,
            repo: exercise,
            tree_sha: sha[0]
        })



        let files
        if (req.data) {
            //Κρατάμε μόνο τα αρχεία από το response ελέγχοντας το type τους, το οποίο πρέπει να είναι blob
            files = req.data.tree.filter((value) => value.type == 'blob')
            return files;
        } else {
            return []
        }



    } else {
        return []
    }



}


export async function checkClass(user, orgName) {
    let client;
   
   try{ let rows = [];

    //Φέρνουμε όλους τους οργανισμούς
    var { error, stdout, stderr } = await util.promisify(exec)(`gh api -H "Accept: application/vnd.github.v3+json" /user/orgs --jq ".[].login" `);
    if (error) {
        console.log(`error: ${error.message}`);
        return false;

    }
    if (stderr) {
        console.log(`stderr: ${stderr}`);
        return false;
    }

    //Περνάμε τους οργανισμούς στον πίνακα orgs και κρατάμε τους active χρησιμοποιώντας τα δεδομένα από την βάση
    const orgs = stdout.split('\n');
    orgs.pop()
    client = await pool.connect();
    const orgNames = []
    for (let org of orgs) {
        let result = await client.query(
            `
                select * from organizations org 
                    where org.name=$1 
                    and  org.active is true 
   `,
            [org]
        );
        if (result.rows.length > 0) orgNames.push(result.rows[0].githubname);
    }


    if (orgNames.includes(orgName) == false) return false
    let result = await client.query(
        `
            select * from organizations org 
                where org.githubname=$1 
                and  org.active is true 
`,
        [orgName]
    );
    if (result.rows.length == 0) return false

    var { error, stdout, stderr } = await util.promisify(exec)(`gh api  -H "Accept: application/vnd.github.v3+json"  /orgs/${result.rows[0].name}/members --jq ".[].login"`);
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
    //check membership of 
    //if (!member.includes(user)) return false


    return true;
   }catch(error){
       return false
   }finally{
       if(client) client.release()
   }

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

    client = await pool.connect();

    // Φέρνουμε τους active οργανισμούς από την βάση κάνοντας φιλτράρισμα με το github ID
    for (let org of orgs) {
        let result = await client.query(
            `
            select * from organizations  where name=$1 and active is true 
            `,
            [org]
        );

        rows = result.rows;

        if (rows.length > 0) {
            activeOrgs.push(rows[0])
        }
    }

    return activeOrgs;
}


export async function getUserOrganizations(user) {
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
    const userOrgs = []
    let client;
    let rows = [];

    client = await pool.connect();
    // Φέρνουμε τους active οργανισμούς από την βάση κάνοντας φιλτράρισμα με το github ID
    for (let org of orgs) {
        let result = await client.query(
            `
                select * from organizations org 
                    inner join  organization_supervisors t on  t.organization = org.githubname  
                    where org.name=$1 
                    and  org.active is true 
                    and t.supervisor  = $2
   `,
            [org, user]
        );

        rows = result.rows;

        if (rows.length > 0) {
            userOrgs.push(rows[0].githubname)
        }
    }

    return userOrgs;
}


export async function deleteSupervisor(organization,email){
    let client;
       
    try{
        client = await pool.connect();
        const result = await client.query(
            `
            Select * from organizations where  githubname=$1
            `, [organization])
        if(result.rows.length==0)return false
     
        const user =  await client.query(
            `
            Select * from users where  email=$1
            `, [email])
            console.log(user.rows)

            if(user.rows.length==0) return false
            console.log('here')
            var { error, stdout, stderr } = await util.promisify(exec)(`  gh api  --method DELETE  -H "Accept: application/vnd.github.v3+json" /orgs/${result.rows[0].name}/members/${user.rows[0].githubname} `);

            if (error) {
                console.log(`error: ${error.message}`);
                return;

            }
            if (stderr) {
                console.log(`stderr: ${stderr}`);
                return;
            }

        const update = await client.query(
            `DELETE FROM  organization_supervisors WHERE supervisor=$1 and owner = false
                `, [user.rows[0].githubname])

        return true
        
    }catch(error){
        console.log(error)
        return false
    }
    
}


export async function getTests(organization,exercise){

    try{
        
        var { error, stdout, stderr } = await util.promisify(exec)(`gh api -H "Accept: application/vnd.github.v3+json"  /repos/${organization}/${exercise}/actions/workflows  --jq '.total_count'`)
        if (error) {
            console.log(`error: ${error.message}`);
            return false;
    
        }
        if (stderr) {
            console.log(`stderr: ${stderr}`);
            return false;;
        }

        const arr= stdout.split('\n');
        arr.pop()
        
        if(arr.length==0) return 0
      
      // console.log(JSON.parse(stdout))
      return arr[0]
    }catch(error){
        console.log(error)
        return []
    }
  
}
export async function getWorkflowRuns(organization,exercise, member){
    
    try{
 
        var { error, stdout, stderr } = await util.promisify(exec)(`gh api -H "Accept: application/vnd.github.v3+json"  /repos/${organization}/${member}-${exercise}/actions/runs --jq '.workflow_runs.[] | [.conclusion , .name , .actor.login , .path] '`)
        if (error) {
            console.log(`error: ${error.message}`);
            return false;
    
        }
        if (stderr) {
            console.log(`stderr: ${stderr}`);
            return false;;
        }

        const arr= stdout.split('\n');
        arr.pop()
        const  finalArray= [];
        for(let temp of arr){
            const obj= JSON.parse( '{ "arr": ' + temp +"}" )
            finalArray.push(obj.arr)          
        }
        if(finalArray.length==0) return []
        const workFlowRuns = finalArray.filter( (arr)=> arr[2]!='teachingAssistant-uop')
      // console.log(JSON.parse(stdout))
      return workFlowRuns
    }catch(error){
        console.log(error)
        return []
    }
  
}


export async function exportCSV(exercise,team,organization){
    let client;
console.log(exercise,team,organization)
    try{
        client = await pool.connect();

        const teamRows = await client.query(
            `
              Select * from team where team_id = $1 and lesson = $2
               
                `, [team,organization])
    
            if(teamRows.rows.length==0)return []
            //Παίρνουμε πληροφορίες για τον εκάστοτε φοιτητή
        const result = await client.query(`    
                    select  o.lab_name as lab ,
                    e."name" as exercise,
                    e.lesson  as LabCode ,
                    e.no_exercise as  NumExercise,
                    tm.member_github_name  as Github,
                    tm.first_name  as firstName,
                    tm.last_name  as lastName,
                    tm.am  as am,
                    g.grade as grade,
                    g.comment as comment   from  exercise e
                       inner join team_member tm on tm.team = e.team  
                     inner join organizations o on o.githubname = e.lesson 
                      left  join grades g on g.exercise  = e."name"  
                                                where e.name=$1 and e.team=$2 and e.lesson=$3
                                                `,[exercise,teamRows.rows[0].team_id,organization]);
        if(result.rows.length==0)return []
        return result.rows

    }catch(error){
        console.log(error)
        return []
    }finally{
        if(client) client.release()
    }
}

export async function getStudentsInfo(organization, team,exercise){
    let client;
    try{
        client = await pool.connect();
        console.log(organization, team,exercise)
        const teamRows = await client.query(
            `
              Select * from team where team_id = $1 and lesson = $2
               
                `, [team,organization])
    
            if(teamRows.rows.length==0)return  []

        console.log(exercise,team,organization)
        const result = await client.query(`select e.*,tm.*,o."name" as org from exercise e
                                                inner join team_member tm on tm.team = e.team  
                                                inner join organizations o  on o.githubname =e.lesson 
                                                where e.name=$1 and e.team=$2 and e.lesson=$3`,        
                                        [exercise,teamRows.rows[0].team_id,organization]);
        if(result.rows.length==0)return []
        console.log('here')
        for(let i = 0; i<result.rows.length ; i++){
            const tempArr =  await getCommitsWithTime(result.rows[i].org,exercise, result.rows[i].member_github_name);

            console.log(tempArr)
            console.log('tempArr')

            result.rows[i].commits =  tempArr.length
            const temp=   JSON.parse( '{ "arr": ' + tempArr[0] +"}" )

            result.rows[i].commitTime= moment(temp.arr[1]).format('YYYY-MM-DD')
            const tempWork= await getWorkflowRuns(result.rows[i].org, exercise, result.rows[i].member_github_name)
            let workflow; 
            if(tempWork.length>0){
                const workflowTemp = tempWork.map((flow)=> { return{ test: flow[3], value: flow}})
                workflow = _.groupBy(workflowTemp,"test")

            }else{
                workflow=[]
            }

            result.rows[i].workflow=workflow
            const grade = await client.query(`
                        select * from grades g inner join team_member tm on 
                        g.team_member =tm.team_member_id where g.exercise = $1 and tm.team = $2 and tm.member_github_name=$3  
                        ` , [exercise, teamRows.rows[0].team_id,result.rows[i].member_github_name]);
                console.log(grade)

                if(grade.rows.length > 0 ){
                    result.rows[i].grade= grade.rows[0].grade
                    result.rows[i].comment= grade.rows[0].comment

                }else{
                    result.rows[i].grade=[]

                }

                const averageGrade = await client.query(`
                select * from grades g inner join team_member tm on g.team_member = tm.team_member_id where tm.team = $1 and tm.member_github_name=$2   and g.exercise != $3
                `,[teamRows.rows[0].team_id , result.rows[i].member_github_name,exercise]);
           
                if(averageGrade.rows.length > 0 ){
                    result.rows[i].averageGrade= averageGrade.rows
                }else{
                    result.rows[i].averageGrade=[]

                }

            }  
        return result.rows
    }catch(error){
        console.log(error)
        return []
    }finally{
        if(client) client.release()
    }
   



}

export async function getCommitsWithTime(organization,exercise, member){
    try{

        var { error, stdout, stderr } = await util.promisify(exec)(`gh api -H "Accept: application/vnd.github.v3+json" /repos/${organization}/${member}-${exercise}/commits --jq '.[].commit.author | [.name , .date] '`)
            if (error) {
                console.log(`error: ${error.message}`);
                return [];
        
            }
            if (stderr) {
                console.log(`stderr: ${stderr}`);
                return [];;
            }
            const arr= stdout.split('\n');
            arr.pop()
           
          // console.log(JSON.parse(stdout))
          return arr.filter((name)=>name[0]!='teachingAssistant-uop')
        }catch(e){
            console.log(e)
            return []
        }
      
    }
export async function getCommits(organization,exercise, member){

    try{

    var { error, stdout, stderr } = await util.promisify(exec)(`gh api -H "Accept: application/vnd.github.v3+json" /repos/${organization}/${member}-${exercise}/commits --jq '.[].commit.author.name '`)
        if (error) {
            console.log(`error: ${error.message}`);
            return [];
    
        }
        if (stderr) {
            console.log(`stderr: ${stderr}`);
            return [];;
        }
        const arr= stdout.split('\n');
        arr.pop()
       
      // console.log(JSON.parse(stdout))
      return arr.filter((name)=>name!='teachingAssistant-uop')
    }catch(e){
        console.log(e)
        return []
    }
  
}


export async function getExercises(organization){
    let client
    try{
        
   
    client = await pool.connect();
    const result = await client.query(
        `
        
        Select e.*,u.name as org from exercise e inner join organizations u on u.githubname=e.lesson where  e.lesson=$1
        `, [organization])
    if(result.rows.length==0)return false
    for(let i=0;i<result.rows.length; i++){
        const teamMembers = await client.query(
            `
            Select * from team_member where team=$1
            `, [result.rows[i].team])

        if(teamMembers.rows.length==0){
            continue
        }
        
        var commits = 0;
        for(let j=0; j<teamMembers.rows.length; j++){
            const tempArr = await getCommits(result.rows[i].org,result.rows[i].name,teamMembers.rows[j].member_github_name)
            commits+=tempArr.length
        }
        result.rows[i].commits=commits
        var workflow=[];
        result.rows[i].workflow=[]
        const exerciseTests = await getTests(result.rows[i].org,result.rows[i].name)
        var totalTests=0
        for(let w=0; w<teamMembers.rows.length; w++){
            //console.log(exerciseTests)
            totalTests+=parseInt(exerciseTests);
            const tempArr= await getWorkflowRuns(result.rows[i].org,result.rows[i].name, teamMembers.rows[w].member_github_name)
            if(tempArr.length>0){
                workflow.push(...tempArr) 
            }

        }
        console.log("DaoW Workflow: " ,workflow)
        const workflowTemp = workflow.map((flow)=> { return{ test: flow[3], value: flow}})
        result.rows[i].workflow=  _.groupBy(workflowTemp,"test")


        result.rows[i].totalTests=totalTests
    }


    return result.rows
    }catch(error){
        console.log(error)
        return []
    }finally{
        if(client) client.release()
    }
}

export async function addSupervisor(organization,email){
    let client;
       
    try{
        client = await pool.connect();
        const result = await client.query(
            `
            Select * from organizations where  githubname=$1
            `, [organization])
        if(result.rows.length==0)return false
     
        const user =  await client.query(
            `
            Select * from users where  email=$1
            `, [email])
            console.log(user.rows)

            if(user.rows.length==0) return false
            //Για όλους του  coSupervisors κάνουμε invite στο github account τους
        await signupInOrganization(result.rows[0].githubname, email , user.rows[0].githubname ,result.rows[0].secret  );
        const update = await client.query(
            `INSERT INTO organization_supervisors(owner,organization,supervisor) VALUES (FALSE,$1,$2)
                `, [organization,user.rows[0].githubname])

        return true
        
    }catch(error){
        console.log(error)
        return false
    }
    
}

export async function getCoSupervisors(lab){
    let client;

    try{
        client = await pool.connect();
        //Παίρνουμε όλες τις πληροφορίες για τους coSupervisors
        const supervisors = await client.query(
            `
                Select * from organization_supervisors o  inner join users u on u.githubname=o.supervisor where o.owner = false and o.organization = $1
                `, [lab])

        return supervisors.rows

    }catch(error){
        console.log(error)
        return []
    }finally{
        if(client) client.release()
    }
    
}


export async function createOrganizations(org, organizationName, user, supervisors, year,endDate) {
    let client;
    let rows = [];
    client = await pool.connect();
    const nonActiveMyOrgs = await client.query(
        `
            Select * from organizations where active = false
            `, [])
            //Έλεγχος αν υπάρχει ήδη υπάρχον εργαστηρίο
    const check = await client.query(
        `
                Select * from organizations where active = true and year=$2 and lab_name=$1 and githubname=$3
                    `, [organizationName, year, org])
    //Μετανομάζουμε το πρώτο μη ενεργό organization στον όνομα που δώθηκε από τον χρήστη και το θέτουμε ως active
    if (check.rows.length > 0) return false

    await client.query(
        `
            UPDATE organizations SET githubname=$1 ,year=$3 ,lab_name=$4, active= true  WHERE name = $2 
            `, [org, nonActiveMyOrgs.rows[0].name, year, organizationName])

    const update = await client.query(
                `
                INSERT INTO  organization_supervisors (supervisor,organization) VALUES($1 ,$2) 
                returning *
                `, [user, org])
    
    
            if (update.rows.length == 0) return false
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
        signupInOrganization(nonActiveMyOrgs.rows[0].githubname, supervisor,nonActiveMyOrgs.rows[0].githubname ,nonActiveMyOrgs.rows[0].secret  );

        const supervisorRes= await client.query(`
        select * from users where email = $1
        `,[supervisor])
        if(supervisorRes.rows.length>0){
            await client.query(
                `
                INSERT INTO  organization_supervisors (supervisor,organization,owner) VALUES($1 ,$2,false) 
                returning *
                `, [supervisorRes.rows[0].githubname, org])
        }

        
    }

    // var records;
    // var content
    // if (files) {
    //     if (files.file) {
    //         // Σώζουμε το αρχείο csv στο /tmp χρησιμοποιώντας την fs.rename() 
    //         await util.promisify(fs.rename)(files.file.filepath, '/tmp' + '/' + files.file.originalFilename);
    //         content = await util.promisify(fs.readFile)("/tmp/" + files.file.originalFilename);
    //         records = await util.promisify(parse)(content);
    //         records.shift()
    //         //Αν δεν έχει επιλεγεί η αυτόματη ανάθεση φοιτητών, δεν δημιουργούμε τις ομάδες.
    //         if (checked) {
    //             //Υπολογίζουμε πόσοι φοιτητές πρέπει να ανατεθούν σε κάθε supervisor
    //             var chunksize = Math.ceil(records.length / supervisors.length);
    //             //Χρησιμοποιώντας την _.chunk  της loadash χωρίζουμε τον έναν πίνακα σε πολλούς όπου ο κάθε ένας πίνακας έχει length ίδιο με το chunksize
    //             const chunked = _.chunk(records, chunksize)

    //             for (let i = 0; i < chunked.length; i++) {
    //                 let supervisorsDb = await client.query(
    //                     `
    //                         select * from users  where email=$1
    //                         `,
    //                     [supervisors[i]]
    //                 );
    //                 // Δημιουργούμε νέα ομάδα στο github μέσω του github cli
    //                 var { error, stdout, stderr } = await util.promisify(exec)(`gh api --method POST -H "Accept: application/vnd.github.v3+json" /orgs/${nonActiveMyOrgs.rows[0].name}/teams -f name='${org}-team-${i}'  -f description='Team ${i} for lesson ${org}'  -f permission='push' -f privacy='closed'`);
    //                 if (error) {
    //                     console.log(`error: ${error.message}`);
    //                     return false;

    //                 }
    //                 if (stderr) {
    //                     console.log(`stderr: ${stderr}`);
    //                     return false;
    //                 }

    //                 //Περνάμε τα στοιχεία και στη βάση
    //                 await client.query(
    //                     `
    //                         INSERT INTO team( team_name ,team_supervisor, lesson ) VALUES ( $1,$2,$3)
    //                         `,
    //                     [`${org}-team-${i}`, supervisorsDb.rows[0].githubname, org]

    //                 );
    //                 //Παίρνουμε το GITHUB ID της ομάδας που μόλις δημιουργήσαμε
    //                 var { error, stdout, stderr } = await util.promisify(exec)(` gh api  -H "Accept: application/vnd.github.v3+json"  /orgs/${nonActiveMyOrgs.rows[0].name}/teams/${org}-team-${i} --jq '.id' `);
    //                 if (error) {
    //                     console.log(`error: ${error.message}`);
    //                     return false;

    //                 }
    //                 if (stderr) {
    //                     console.log(`stderr: ${stderr}`);
    //                     return false;
    //                 }
    //                 //Περνάμε το id από το stdout σε έναν πίνακα
    //                 const teamID = stdout.split('\n');
    //                 teamID.pop()

    //                 for (let j = 0; j < chunked[i].length; j++) {
    //                     //Βάζουμε τα στοιχεία των φοιτητών στην βάση
    //                     await client.query(
    //                         `
    //                             INSERT INTO team_member(team_name, member_github_name,active) VALUES ( $1,$2,$3)
    //                             `,
    //                         [`${org}-team-${i}`, chunked[i][j][3], false]

    //                     );
    //                     //Δημιουργούμε ένα request ώστε να κάνουμε invite στον organization τους φοιτητές μέσω του Github API .
    //                     const octokit = new Octokit({
    //                         auth: process.env.pat
    //                     })

    //                     await octokit.request('POST /orgs/{org}/invitations', {
    //                         org: nonActiveMyOrgs.rows[0].name,
    //                         email: chunked[i][j][4],
    //                         role: 'direct_member',
    //                         team_ids: [
    //                             parseInt(teamID[0])
    //                         ]
    //                     })

    //                     /*var { error, stdout, stderr } = await util.promisify(exec)(`curl -u teachingAssistant-uop:${process.env.pat} -X POST -H "Accept: application/vnd.github.v3+json"  https://api.github.com/orgs/${myOrgs.rows[0].name}/invitations -d '{"email":"${chunked[i][j][4]}","role":"direct_member","team_ids":[${team[0]}]}'  `);
    //                     if (error) {
    //                         console.log(`error: ${error.message}`);
    //                         return false;

    //                     }
    //                     if (stderr) {
    //                         console.log(`stderr: ${stderr}`);
    //                         return false;
    //                     }
    //                     */


    //                 }
    //             }

    //         }



    //     }
    // }


    return true;
}




export async function signupInOrganization(name, email, githubname, secret) {
    try {


        let client;
        let rows = [];
        client = await pool.connect();
        const result = await client.query(
            `
            Select * from organizations where secret like $1 and githubname=$2
            `, [secret, name])
        //Εάν το συνθηματικό που έβαλε ο χρήστης δεν αντιστοιχεί με αυτό που έχει δηλωθεί στη βάση -> return false 
        if (result.rows.length == 0) return false
        // Χρησιμοποιούμε το cli για να δημιουργήσουμε ένα invitation για τον χρήστη
        const octokit = new Octokit({
            auth: process.env.pat
          })
          
          const data = await octokit.request('POST /orgs/{org}/invitations', {
            org:result.rows[0].name,
            email: email,
            role: 'admin',
         
          })
     
        const update = await client.query(
            `
            INSERT INTO  organization_supervisors (supervisor,organization) VALUES($1 ,$2) 
            returning *
            `, [githubname, name])


        if (update.rows.length == 0) return false

        return true;
    } catch (error) {
        console.log(error)
        return false
    }

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



export async function deleteExercise(organization, exercise) {
    let client;
    let rows = [];
    try{

        //Παίρνουμε πληροφορίες για το εργαστήριο
    client = await pool.connect();
  
    let result = await client.query(
        `
                select * from organizations org 
                    where org.githubname=$1  
   `,
        [organization]
    );


    if (result.rows.length == 0) return false
    
    const team = await client.query(
        `
    Select * from exercise  e inner join team t on e.team = t.team_id where e.name like $1
        `, [exercise])
    if (team.rows.length == 0) return false

    const studentRows = await client.query(
        `
    Select * from team_member where team = $1
        `, [team.rows[0].team_id])

    //Διαγράφουμε την άσκηση από το github
    const { error, stdout, stderr } = await util.promisify(exec)(` gh api  --method DELETE -H "Accept: application/vnd.github.v3+json" /repos/${result.rows[0].name}/${exercise}`);
    if (error) {
        console.log(`error: ${error.message}`);

    }
    if (stderr) {
        console.log(`stderr: ${stderr}`);
    }


    let students
   
    if (studentRows.rows.length > 0) {
        students = studentRows.rows.map((student) => {
            return student.member_github_name
        })

        //Διαγράφουμε τα repos των φοιτητών από το github
        for (let student of students) {

            const { errorDel, stdoutDel, stderrDel } = await util.promisify(exec)(` gh api  --method DELETE -H "Accept: application/vnd.github.v3+json" /repos/${result.rows[0].name}/${student}-${exercise}`);
            if (errorDel) {
                console.log(`error: ${errorDel.message}`);

            }
            if (stderrDel) {
                console.log(`stderr: ${stderrDel}`);
            }

        }

    }
    
    await client.query(
        `
                DELETE from grades where exercise=$1
   `,
        [exercise]
    );

     await client.query(
        `
                DELETE from exercise where name=$1
   `,
        [exercise]
    );


    return true;

}catch(error){
    console.log( error)
    return false
}
}

export async function reInitializeTeam(team, supervisor, organization, file) {
    let client;
    let rows = [];
    const resp = [];
    try {
        client = await pool.connect();
        //Παίρνουμε πληροφορίες της ομάδας
        const teamRows = await client.query(
            `
              Select * from team where team_name = $1 and lesson = $2
               
                `, [team,organization])
    
    
         if(teamRows.rows.length==0) return false
         //Διαβάζουμε το csv που περιέχει τους φοιτητές και το κάνουμε parse
        await util.promisify(fs.rename)(file.file.filepath, '/tmp' + '/' + file.file.originalFilename);
        const content = await util.promisify(fs.readFile)("/tmp/" + file.file.originalFilename);
        const records = await util.promisify(parse)(content);
        if (records.length == 0) return false
        //Διαγράφουμε τα παλιά μέλη από την ομάδα
        const result = await client.query(
            `
                DELETE FROM team_member WHERE team = $1
                returning *
   `,
            [teamRows.rows[0].team_id]

        );
        for (let i = 1; i < records.length; i++) {
            //Βάζουμε τα καινούργια  μέλη στην ομάδα

            const temp = await client.query(
                `
                    INSERT INTO team_member(team,member_github_name,active,am,first_name,last_name) VALUES($1,$2,$3,$4,$5,$6)
                    returning*
       `,
                [teamRows.rows[0].team_id, records[i][3], false, records[i][5], records[i][6], records[i][7]]
            );
         
            if (temp.rows.length > 0) resp.push(temp.rows[0])
        }


        return resp;
    } catch (e) {
        console.log( e)
        return false
    }

}



export async function initializeTeam(team, supervisor, organization, file) {
    let client;
    let rows = [];
    try {


        client = await pool.connect();
        console.log(team, supervisor, organization)
        await util.promisify(fs.rename)(file.file.filepath, '/tmp' + '/' + file.file.originalFilename);
        const content = await util.promisify(fs.readFile)("/tmp/" + file.file.originalFilename);
        const records = await util.promisify(parse)(content);
        console.log(records)
        if (records.length == 0) return false

        const result = await client.query(
            `
                INSERT INTO team(team_name,team_supervisor,lesson) VALUES($1,$2,$3)
                returning *
   `,
            [team, supervisor.githubname, organization]

        );
        for (let i = 1; i < records.length; i++) {
            const temp = await client.query(
                `
                    INSERT INTO team_member(team,member_github_name,active,am,first_name,last_name) VALUES($1,$2,$3,$4,$5,$6)
       `,
                [result.rows[0].team_id, records[i][3], false, records[i][5], records[i][6], records[i][7]]
            );
        }


        return true;
    } catch (e) {
        console.log(e)
        return false
    }

}

export async function getTeamInformation(team , lab) {
    let client;
    let rows = [];
    try {
        client = await pool.connect();

        const teams = await client.query(
            `
            Select * from team t inner join team_member tm on tm.team =t.team_id where t.team_name = $1 and t.lesson = $2
            `, [team,lab])


        if (teams.rows.length == 0) return false


        return teams.rows;
    } catch (e) {
        console.log(e)
        return false
    }



}
export async function deleteTeam(editedTeam , lab) {
    let client;
    let rows = [];
    try {
        client = await pool.connect();
        //Παίρνουμε πληροφορίες της ομάδας που βρίσκεται προς διαγραφή
        const team = await client.query(
        `
          Select * from team where team_name = $1 and lesson = $2
           
            `, [editedTeam,lab])


            if(team.rows.length==0) return false
            //Διαγραφή των μελών της ομάδας
            const result = await client.query(
            `
            DELETE FROM team_member WHERE team=$1  
            returning *
           
            `, [team.rows[0].team_id])

            //Διαγραφή  της ομάδας

        const res = await client.query(
            `
            DELETE FROM team WHERE team_id=$1 
            returning *
           
            `, [team.rows[0].team_id])

        return true
    } catch (e) {
        console.log(e)
        return false
    }
}


export async function getTotals(name) {
    let client;
    let rows = [];
    try{
   
    client = await pool.connect();

    const teamMembers = await client.query(
        `
        Select count(*) as num from team t inner join team_member tm  on tm.team  = t.team_id  where t.lesson =$1
        `, [name])

   

    const exercises = await client.query(
        `
        select count(*) as num from exercise e  where e.lesson =$1 group by team 
        `, [name])
        

        let max=0
        if(exercises.rows.length>0){

     
        for(let row of exercises.rows){
            if(max<row.num) max=row.num
        }
    }
        console.log({ teamMembers: teamMembers.rows[0].num, exercises: max})
   
        return { teamMembers: teamMembers.rows[0].num, exercises: max}

}catch(error){
    return []
}finally{
    if(client)client.release()
}

}






export async function demoCheckSimilarity() {
    
    try{
    //Τρέχουμε scirpt που κατεβάζει τρια repositories τοπικά στο server μας  
    //και τρέχει το similarity check το οποίο αποθηκεύει τα αποτελέσαμτα στο /tmp/outputjplag
    const { errorMk, stdoutMk, stderrMk } = await util.promisify(exec)(`cd /opt/scripts && ./github2.sh `);
    if (errorMk) {
        console.log(`error: ${errorMk.message}`);
        return;

    }
    if (stderrMk) {
        console.log(`stderr: ${stderrMk}`);
        return;
    }

    //Τρέχουμε scirpt που κατεβάζει τρια repositories τοπικά στο server μας 

    const content = await util.promisify(fs.readFile)("/tmp/outputjplag/index.html");
    //κάνουμε clean up διαγράφοντας τα παραγώμενα αρχεία από το script

    const { errorRM, stdoutRM, stderrRM } = await util.promisify(exec)(`rm -rf /tmp/outputjplag `);
    if (errorRM) {
        console.log(`error: ${errorRM.message}`);
        return;

    }
    if (stderrRM) {
        console.log(`stderr: ${stderrRM}`);
        return;
    }
   


    return content

}catch(error){
    return false
}

}






export async function getTeams(name) {
    let client;
    let rows = [];
    try{
   
    client = await pool.connect();

    const teams = await client.query(
        `
            Select * from team where lesson=$1
            `, [name])


    return teams.rows;
     
}catch(error){
    return []
}finally{
    if(client)client.release()
}

}

export async function getStudents(teams) {
    let client;
    let rows = [];
    client = await pool.connect();
    const students = []
    for (let i = 0; i < teams.length; i++) {
        const result = await client.query(
            `
                Select * from team_member where team=$1
                `, [teams[i].team_id])
        for (let student of result.rows) {
            students.push(student)

        }
    }




    return students;


}


export async function addTeamRow(editedTeam, githubInsert, amInsert, firstNameInsert, lastNameInsert,lab) {
    let client;
    try {

    
    client = await pool.connect();
    //Παίρνουμε πληροφορίες της ομάδας 
    const team = await client.query(
        `
          Select * from team where team_name = $1 and lesson = $2
           
            `, [editedTeam,lab])
            console.log(team.rows.length==0)

        if(team.rows.length==0) return false
        console.log(team.rows[0].team_id)
        //Κάνουμε insert στην βάση της  πληροφορίες του νέου μέλους
        const result = await client.query(
            `
                INSERT INTO  team_member(team , member_github_name,active,am,first_name,last_name) VALUES ($1,$2,false,$3,$4,$5)
                returning *
               
                `, [team.rows[0].team_id, githubInsert, amInsert, firstNameInsert, lastNameInsert])
        if (result.rows == 0) return false
        //Βρίσκουμε τις ασκήσεις της ομάδας και τις πληροφορίες του github από την βάση
        const exercises = await client.query(
            `
            Select e.exercise_id as eid, 
                    e.team as team, 
                    e.supervisor as supervisor ,
                    e.name as exerciseName,
                    e.lesson as lesson  ,
                    o.id as id,
                    o."name" as name ,
                    o.githubname as githubname ,
                    o.active as active,
                    o.secret as secret  ,
                    o."year" as year,
                    o.lab_name as labName
                from exercise e inner join organizations o on o.githubname = e.lesson  where e.team = $1
            `, [team.rows[0].team_id])

        //Για κάθε άσκηση δημιουργούμε repo για τον νέο φοιτητή και τον κάνουμε invite μέχω του github CLI
        if (exercises.rows.length > 0) {

            for (let j = 0; j < exercises.rows.length; j++) {
                const { error, stdout, stderr } = await util.promisify(exec)(`gh repo create ${exercises.rows[j].name}/${result.rows[0].member_github_name}-${exercises.rows[j].exercisename} --private --template ${exercises.rows[j].name}/${exercises.rows[j].exercisename} `);
                if (error) {
                    console.log(`error: ${error.message}`);
                    return false;

                }
                if (stderr) {
                    console.log(`stderr: ${stderr}`);
                    return false;
                }
                const { errorInv, stdoutInv, stderrInv } = await util.promisify(exec)(`  gh api --method PUT -H "Accept: application/vnd.github.v3+json" /repos/${exercises.rows[j].name}/${result.rows[0].member_github_name}-${exercises.rows[j].exercisename}/collaborators/${result.rows[0].member_github_name}`);
                if (errorInv) {
                    console.log(`error: ${errorInv.message}`);
                    return false;

                }
                if (stderrInv) {
                    console.log(`stderr: ${stderrInv}`);
                    return false;
                }



            }
        }



        return result.rows[0]
    } catch (error) {
        console.log(error)
        return false

    }finally{
        if(client) client.release()
    }

}
export async function deleteTeamRows(teamRows) {
    let client;
    try {
    client = await pool.connect();

        //Διαγράφουμε απο την ομάδα το μέλος με το συγκεκριμένο id.
        for (let i = 0; i < teamRows.length; i++) {
            const result = await client.query(
                `
                DELETE FROM team_member WHERE team_member_id=$1 
                returning *
               
                `, [teamRows[i]])

            if (result.rows == 0) return false
        }

        return true
    } catch (error) {
        console.log(error)
        return false

    }finally{
        if(client) client.release()
    }

}
export async function editTeamRow(team,lab ) {
    let client;
    let rows = [];
    try {

    client = await pool.connect();
    //Παίρνουμε πληροφορίες της ομάδας
    const teamRows = await client.query(
        `
          Select * from team where team_name = $1 and lesson = $2
           
            `, [team.team,lab])

            if(teamRows.rows.length==0) return false
            
    //Ανανεώνουμε  πληροφορίες του φοιτητή 

        const result = await client.query(
            `
            UPDATE team_member SET team=$2 ,member_github_name = $3, am=$4 ,first_name = $5,last_name=$6 where team_member_id=$1
            returning *
            `, [team.id, teamRows.rows[0].team_id, team.github, team.am, team.firstname, team.lastname])

        console.log(result)
        if (result.rows == 0) return false

        
        return true
    } catch (error) {
        console.log(error)
        return false

    }finally{
        if(client) client.release()
    }

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


export async function initializeTemplateProject(repo, organization, team, supervisor,endDate, files) {
    // Δημιουργόυμε στο /tmp έναν καινουργίο φάκελο 
    // Σε όλες τις ασύχρονες συναρτήσεις χρησιμοποιούμε την util.promisfy για να κάνουμε await μέχρι να τελειώσουν.
    let client;

    try {


        client = await pool.connect()

        const teamRows = await client.query(
            `
              Select * from team where team_name = $1 and lesson = $2
               
                `, [team,organization])
    
    
         if(teamRows.rows.length==0) return false
        const result = await client.query(
            `
                Select * from organizations where githubname LIKE $1
                `, [organization])


        if(result.rows.length==0) return false

        const { errorcheck, stdoutcheck, stderrcheck } = await util.promisify(exec)(`if [ -d "/tmp/${repo}" ]; then rm -rf /tmp/${repo} ; fi `);
        if (errorcheck) {
            console.log(`error: ${errorcheck.message}`);
            return;

        }
        if (stderrcheck) {
            console.log(`stderr: ${stderrcheck}`);
            return;
        }
        const { errorMk, stdoutMk, stderrMk } = await util.promisify(exec)(`mkdir /tmp/${repo} `);
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
                        await util.promisify(fs.rename)(file.filepath, `/tmp/${repo}` + '/' + file.originalFilename);
                    }
                }
                else {
                    await util.promisify(fs.rename)(files.file.filepath, `/tmp/${repo}` + '/' + files.file.originalFilename);
                }
            }
            //Ελέγχουμε αν υπάρχουν φάκελοι που πρέπει αν μπουν στο github workflows
            if (files.testFile) {
                const { errorMkGit, stdoutMkGit, stderrMkGit } = await util.promisify(exec)(`mkdir -p /tmp/${repo}/.github/workflows `);
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
                        await util.promisify(fs.rename)(file.filepath, `/tmp/${repo}/.github/workflows` + '/' + file.originalFilename);
                    }
                }
                else {
                    await util.promisify(fs.rename)(files.testFile.filepath, `/tmp/${repo}/.github/workflows` + '/' + files.testFile.originalFilename);
                }
            }

        }


        //Δημιουργούμε private repository στον οργανισμό με το όνομα που δήλωθηκε

        const { error, stdout, stderr } = await util.promisify(exec)(`gh repo create ${result.rows[0].name}/${repo} --private `);
        if (error) {
            console.log(`error: ${error.message}`);
            return;

        }
        if (stderr) {
            console.log(`stderr: ${stderr}`);
            return;
        }
        const resultExercise = await client.query(
            `
               INSERT INTO exercise(team, supervisor, name, lesson,end_date) VALUES ($1,$2,$3,$4,$5)
               returning *
                `, [teamRows.rows[0].team_id, supervisor, repo, organization,endDate])

        //Κάνουμε cd στο /opt/scripts και τρέχουμε το github.sh το οποίο αρχικοποεί το repository με τα αρχεία που έχουμε στο /tmp/newrepo

        if (resultExercise.rows.length == 0) return false
        const { errorGit, stdoutGit, stderrGit } = await util.promisify(exec)(`cd /opt/scripts && ./github.sh  ${result.rows[0].name} ${repo} `);
        if (errorGit) {
            console.log(`error: ${errorGit.message}`);
            return;

        }
        if (stderrGit) {
            console.log(`stderr: ${stderrGit}`);
            return;
        }
        //Κάνουμε edit στο repository ώστε να το κάνουμε template μέσω του github cli

        const { errorEdit, stdoutEdit, stderrEdit } = await util.promisify(exec)(`gh repo edit ${result.rows[0].name}/${repo} --template `);
        if (errorEdit) {
            console.log(`error: ${errorEdit.message}`);
 
        }


        /*
            const { errorRep, stdoutRep, stderrRep } = await util.promisify(exec)(` repobee repos setup --assignments  ${repo} --config /opt/config/${classname}.ini --sf /opt/students/${classname}.txt `);
            if (errorRep) {
                console.log(`error: ${errorRep.message}`);
                return;
        
            }
            if (stderrRep) {
                console.log(`stderr: ${stderrRep}`);
                return;
            }
    */
        const studentRows = await client.query(
            `
        Select * from team_member where team = $1
            `, [teamRows.rows[0].team_id])

        let students

        if (studentRows.rows.length > 0) {
            students = studentRows.rows.map((student) => {
                return student.member_github_name
            })


            for (let student of students) {
                const { error, stdout, stderr } = await util.promisify(exec)(`gh repo create ${result.rows[0].name}/${student}-${repo} --private --template ${result.rows[0].name}/${repo} `);
                if (error) {
                    console.log(`error: ${error.message}`);
                    return false;

                }
                if (stderr) {
                    console.log(`stderr: ${stderr}`);
                    return false;
                }
                const { errorInv, stdoutInv, stderrInv } = await util.promisify(exec)(`  gh api --method PUT -H "Accept: application/vnd.github.v3+json" /repos/${result.rows[0].name}/${student}-${repo}/collaborators/${student}`);
                if (errorInv) {
                    console.log(`error: ${errorInv.message}`);
                    return false;

                }
                if (stderrInv) {
                    console.log(`stderr: ${stderrInv}`);
                    return false;
                }
            }


        } else {
            return false
        }



        // Διαγράφουμε τα αρχεία που φτιάξαμε
        const { errorRM, stdoutRM, stderrRM } = await util.promisify(exec)(`rm -rdf /tmp/${repo} `);
        if (errorRM) {
            console.log(`error: ${errorRM.message}`);
            return;

        }
        if (stderrRM) {
            console.log(`stderr: ${stderrRM}`);
            return;
        }
        return resultExercise.rows[0].name;
    }
    catch (error) {
        console.log(error)
        return false
    }finally{
        if(client) client.release()
    }

}

export async function updateExercise(organization, exercise, files) {
    const resp = []
    let client;

    try {

        const octokit = new Octokit({
            auth: process.env.pat
        })

        client = await pool.connect()
        const result = await client.query(
            `
                Select * from organizations where githubname LIKE $1
                `, [organization])

        //Ελέγχουμε αν υπάρχουν φάκελοι και αν υπάρχει το organization
        if (files && result.rows.length > 0) {
            if (files.file) {
                //Έλεγχος για το αν υπάρχουν πολλοί φάκελοι ή μόνο ένας
                if (Array.isArray(files.file)) {
                    for (let file of files.file) {
                        await util.promisify(fs.rename)(file.filepath, `/tmp/` + file.originalFilename);
                        const originalFile = await (await util.promisify(fs.readFile)(`/tmp/` + file.originalFilename)).toString()
                        const { errorRM, stdoutRM, stderrRM } = await util.promisify(exec)(`rm -rdf /tmp/${file.originalFilename}`);
                        if (errorRM) {
                            console.log(`error: ${errorRM.message}`);
                            return resp;

                        }
                        if (stderrRM) {
                            console.log(`stderr: ${stderrRM}`);
                            return resp;
                        }
                        //Κάνουμε encrypt τον φάκελο για να τον στείλουμε στο github
                        var content = CryptoJS.enc.Base64.stringify(Utf8.parse(originalFile));

                        //Στέλνουμε τον φάκελο στο github

                        const request = await octokit.request('PUT /repos/{owner}/{repo}/contents/{path}', {
                            owner: result.rows[0].name,
                            repo: exercise,
                            path: file.originalFilename,
                            message: 'update contents',
                            content: content
                        });
                        if (request.status == 201) {
                            resp.push({
                                path: request.data.content.path,
                                size: request.data.content.size,
                                sha: request.data.content.sha,
                                type: request.data.content.type,
                                url: request.data.content.url
                            })

                        }
                    }
                }
                else {
                    await util.promisify(fs.rename)(files.file.filepath, `/tmp/` + files.file.originalFilename);
                    const originalFile = await (await util.promisify(fs.readFile)(`/tmp/` + files.file.originalFilename)).toString()
                    const { errorRM, stdoutRM, stderrRM } = await util.promisify(exec)(`rm -rdf /tmp/${files.file.originalFilename}`);
                    if (errorRM) {
                        console.log(`error: ${errorRM.message}`);
                        return resp;

                    }
                    if (stderrRM) {
                        console.log(`stderr: ${stderrRM}`);
                        return resp;
                    }

                    var content = CryptoJS.enc.Base64.stringify(Utf8.parse(originalFile));
                    const req = await octokit.request('PUT /repos/{owner}/{repo}/contents/{path}', {
                        owner: result.rows[0].name,
                        repo: exercise,
                        path: files.file.originalFilename,
                        message: 'update contents',
                        content: content
                    });
                    if (req.status == 201) {
                        resp.push({
                            path: req.data.content.path,
                            size: req.data.content.size,
                            sha: req.data.content.sha,
                            type: req.data.content.type,
                            url: req.data.content.url
                        })

                    }

                }
            }
            if (files.testFile) {
                //Έλεγχος για το αν υπάρχουν πολλοί φάκελοι ή μόνο ένας
                if (Array.isArray(files.testFile)) {
                    for (let file of files.testFile) {

                        await util.promisify(fs.rename)(file.filepath, `/tmp/` + file.originalFilename);
                        const originalFile = await (await util.promisify(fs.readFile)(`/tmp/` + file.originalFilename)).toString()
                        const { errorRM, stdoutRM, stderrRM } = await util.promisify(exec)(`rm -rdf /tmp/${file.originalFilename}`);
                        if (errorRM) {
                            console.log(`error: ${errorRM.message}`);
                            return resp;

                        }
                        if (stderrRM) {
                            console.log(`stderr: ${stderrRM}`);
                            return resp;
                        }
                        var content = CryptoJS.enc.Base64.stringify(Utf8.parse(originalFile));
                        
                        const req = await octokit.request('PUT /repos/{owner}/{repo}/contents/{path}', {
                            owner: result.rows[0].name,
                            repo: exercise,
                            path: `.github/workflows/${file.originalFilename}`,
                            message: 'update contents',
                            content: content
                        });
                        if (req.status == 201) {
                            resp.push({
                                path: req.data.content.path,
                                size: req.data.content.size,
                                sha: req.data.content.sha,
                                type: req.data.content.type,
                                url: req.data.content.url
                            }
                            )
                        }

                    }
                }
            }
            else {
                await util.promisify(fs.rename)(files.testFile.filepath, `/tmp/` + files.testFile.originalFilename);
                const originalFile = await (await util.promisify(fs.readFile)(`/tmp/` + files.testFile.originalFilename)).toString()
                const { errorRM, stdoutRM, stderrRM } = await util.promisify(exec)(`rm -rdf /tmp/${files.testFile.originalFilename}`);
                if (errorRM) {
                    console.log(`error: ${errorRM.message}`);
                    return resp;

                }
                if (stderrRM) {
                    console.log(`stderr: ${stderrRM}`);
                    return resp;
                }
                var content = CryptoJS.enc.Base64.stringify(Utf8.parse(originalFile));
                const req = await octokit.request('PUT /repos/{owner}/{repo}/contents/{path}', {
                    owner: result.rows[0].name,
                    repo: exercise,
                    path: `.github/workflows/${files.testFile.originalFilename}`,
                    message: 'update contents',
                    content: content
                });
                if (req.status == 201) {
                    resp.push({
                        path: req.data.content.path,
                        size: req.data.content.size,
                        sha: req.data.content.sha,
                        type: req.data.content.type,
                        url: req.data.content.url
                    })
                }
            }
        }
        const team = await client.query(
            `
        Select * from exercise  e inner join team t on e.team = t.team_id where e.name like $1
            `, [exercise])
        if (team.rows.length == 0) return false
    
        const studentRows = await client.query(
            `
        Select * from team_member where team = $1
            `, [team.rows[0].team_id])

        

        let students

        if (studentRows.rows.length > 0) {
            students = studentRows.rows.map((student) => {
                return student.member_github_name
            })


            for (let student of students) {

                const { errorDel, stdoutDel, stderrDel } = await util.promisify(exec)(` gh api  --method DELETE -H "Accept: application/vnd.github.v3+json" /repos/${result.rows[0].name}/${student}-${exercise}`);
                if (errorDel) {
                    console.log(`error: ${errorDel.message}`);
                    return;

                }
                if (stderrDel) {
                    console.log(`stderr: ${stderrDel}`);
                    return;
                }

                const { error, stdout, stderr } = await util.promisify(exec)(`gh repo create ${result.rows[0].name}/${student}-${exercise} --private --template ${result.rows[0].name}/${exercise} `);
                if (error) {
                    console.log(`error: ${error.message}`);
                    return false;

                }
                if (stderr) {
                    console.log(`stderr: ${stderr}`);
                    return false;
                }
                const { errorInv, stdoutInv, stderrInv } = await util.promisify(exec)(`  gh api --method PUT -H "Accept: application/vnd.github.v3+json" /repos/${result.rows[0].name}/${exercise}/collaborators/${student}`);
                if (errorInv) {
                    console.log(`error: ${errorInv.message}`);
                    return false;

                }
                if (stderrInv) {
                    console.log(`stderr: ${stderrInv}`);
                    return false;
                }
            }


        } else {
            return false
        }


        return resp
    } catch (error) {
        console.log(error)
        return resp
    }finally{
        if(client) client.release()
    }
}