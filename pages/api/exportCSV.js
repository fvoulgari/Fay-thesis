import _ from 'lodash';
import { exportCSV } from "../../Lib/dao";
import { parse } from 'csv-parse';
import * as  util from 'util';
import { stringify } from 'csv-stringify';
import stream from 'stream';
import fs from 'fs'


export default async function handler(req, res) {
    return new Promise(async (resolve) => {


        try {
            const csvData = await exportCSV(req.body.exercise, req.body.team, req.body.organization)
            if (csvData.length > 0) {
                console.log(csvData)
                //Χρησιμοποιώντας τον stringnifier του csv module  μετατρέπουμε το json σε csv και το επιστρέφουμε στο client.
                stringify(csvData, { header: true , bom: true
                })
                .pipe(res);
            
                 res.setHeader('Content-Disposition', 'attachment; filename=Lab-content.csv');
                res.setHeader('Content-Type', 'application/octet-stream');
                res.status(200)


                return resolve
            } else {
                res.json({
                    success: false
                });

                return resolve
            }



        } catch (error) {
            console.log(error)
            res.json({
                success: false,
            });
            return resolve
        }

    })

}
