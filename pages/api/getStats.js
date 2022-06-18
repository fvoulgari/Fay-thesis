import { LocalConvenienceStoreOutlined } from "@mui/icons-material";
import formidable from "formidable";
import _ from 'lodash';
import { getExercises } from "../../Lib/dao";


export default async function handler(req, res) {
    return new Promise(async (resolve) => {

        try {

            const exercises = await getExercises(req.body.organization);
            console.log('getExercises')
            const exercisesDB = _.chain(exercises)
                // Group the elements of Array based on `color` property
                .groupBy("team")
                // `key` is group's name (color), `value` is the array of objects
                .map((value, key) => ({ team: key, supervisor: value[0].supervisor, length: value.length, exercises: _.chain(value).sortBy("initialized").value() }))
                .value()


            var max = 0;

            for (let temp of exercisesDB) {
                if (temp.length > max) max = temp.length
            }

            res.json({
                success: true,
                exercises: exercisesDB,
                max: max

            });

            return resolve


        } catch (error) {
            console.log(error)
            res.json({
                success: false,
            });
            return resolve
        }

    })

}
