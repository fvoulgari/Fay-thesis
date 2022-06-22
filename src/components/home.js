import React, {
     useContext,
} from 'react';
import _ from 'lodash';
import {
   Card, Table, TableBody, TableCell,  TableContainer, TableHead, TableRow,  Chip, Modal
} from '@mui/material';
import AccountBoxOutlinedIcon from '@mui/icons-material/AccountBoxOutlined';
import { contextOptions } from '../../pages/class/[name]';
import LibraryBooksOutlinedIcon from '@mui/icons-material/LibraryBooksOutlined';
import {  Calendar, Badge } from 'antd';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import moment from 'moment';
import { DataGrid } from '@mui/x-data-grid';

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '60vw',
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
    height: '50vh'
};


export default function HomeClass({ }) {
    const onPanelChange = (value, mode) => {
        console.log(value.format('YYYY-MM-DD'), mode);
    };

    const context = useContext(contextOptions);
    const totals = context.totals;
    const organization = context.organization;
    const exerciseInfo = context.exerciseInfo;
    const github = context.github;
    const teams = context.teams;
   


    const dateCellRender = (value) => {
        let date 
        if(exerciseInfo) { date = exerciseInfo.filter((exercise) => moment(exercise.end_date).isSame(value.format('YYYY-MM-DD'), 'day'))
    }else{
        date=[]
    }
        return (<>
            {date.length > 0 &&
                date.map((day, index) => (
                    <ul key={`date-${index}`}>
                        <li style={{ listStyleType: 'none' }} key={date.name}>
                            <Badge style={{ fontSize: '13px' }} status={'warning'} text={`Προθεσμία υποβολής ${day.name}`} />
                        </li>
                    </ul>
                ))

            }
        </>

        );
    };

    return (
        <>
            <div style={{ display: 'flex', justifyContent: 'center', width: '100%', marginBottom: '2%' }}>

                <h2 style={{ marginLeft: '1%', color: 'black', borderRight: '0.1em solid black' }}> {organization}  &nbsp;</h2>
                <h2 style={{ marginLeft: '1%', color: 'black' }}> {github.lab_name}  &nbsp;</h2>

            </div>

        
    
            <Card style={{ width: '70vw', height: '95%', marginLeft: '2%' }}>
                <div style={{ marginBottom: '5%', display: 'flex', justifyContent: 'space-around', width: '100%' }}>
                    <TableContainer style={{ marginRight: '1%' ,border: '1px solid rgba(224, 224, 224, 1)'}}>
                        <Table aria-label="caption table">
                            <TableHead>
                                <TableRow>

                                    <TableCell >
                                        <span style={{ fontWeight: 'bold', fontSize: '15px' }}> Πληροφορίες Εργαστηρίου </span>
                                    </TableCell>
                                    <TableCell align='center'>

                                    </TableCell>
                                </TableRow>

                            </TableHead>

                            <TableBody>
                                <TableRow>
                                    <TableCell align='center'>
                                        Σύνολο φοιτητών
                                    </TableCell>
                                    <TableCell align='center'>
                                        <   Chip icon={<SchoolOutlinedIcon />} label={`${totals.teamMembers}`} />
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell align='center'>
                                        Σύνολο ασκήσεων
                                    </TableCell>
                                    <TableCell align='center'>
                                        <   Chip icon={<LibraryBooksOutlinedIcon />} label={`${totals.exercises}`} />
                                    </TableCell>
                                </TableRow>


                            </TableBody>
                        </Table>

                    </TableContainer>
                    <TableContainer   style={{ border: '1px solid rgba(224, 224, 224, 1)'}}>
                        <Table aria-label="caption table">
                            <TableHead>

                                <TableRow>

                                    <TableCell align='center'>
                                        <span style={{ fontWeight: 'bold', fontSize: '15px' }}> Ομάδα  </span>
                                    </TableCell>
                                    <TableCell align='center'>
                                        <span style={{ fontWeight: 'bold', fontSize: '15px' }}> Υπεύθυνος ομάδας  </span>
                                    </TableCell>
                                </TableRow>

                            </TableHead>
                            <TableBody>
                                {teams.length > 0 && teams.map((tm, index) => (
                                    <TableRow key={index}>
                                        <TableCell align='center' key={`top${index}`}>
                                            {tm.teamName}
                                        </TableCell>
                                        <TableCell align='center' key={`bottom${index}`}>

                                            <   Chip icon={<AccountBoxOutlinedIcon />} label={`${tm.supervisor}`} />
                                        </TableCell>
                                    </TableRow>
                                ))}


                            </TableBody>
                        </Table>

                    </TableContainer>
                </div>

                <div >
                    <Calendar dateCellRender={dateCellRender} onPanelChange={onPanelChange} />
                </div>
            </Card>
        </>
    )
}
