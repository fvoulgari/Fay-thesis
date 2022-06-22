import React, {
    useState, useEffect, useContext,
} from 'react';
import { useRouter } from 'next/router';

import _ from 'lodash';
import {
    Card, Table, TableBody, TableCell, tableCellClasses, TableContainer, TableHead, TableRow,  Select, MenuItem, FormControl, InputLabel, Paper
} from '@mui/material';

import { styled } from '@mui/material/styles';

import Box from '@mui/material/Box';
import { contextOptions } from '../../pages/class/[name]';

import CircularProgress from '@mui/material/CircularProgress';
import CircularProgressWithLabel from './CircularProgressWithLabel';


// TypeScript only: need a type cast here because https://github.com/Microsoft/TypeScript/issues/26591

const StyledTableCell = styled(TableCell)(({ theme }) => ({
    [`&.${tableCellClasses.head}`]: {
        backgroundColor: theme.palette.common.black,
        color: theme.palette.common.white,
    },
    [`&.${tableCellClasses.body}`]: {
        fontSize: 14,
    },
}));
const Input = styled('input')({
    display: 'none'
});
const drawerWidth = 240;


export default function Stats({ }) {

    const router = useRouter();

    const context = useContext(contextOptions);

    const organization = context.organization;
    const selectStats = context.type;
    const isLoading = context.isLoading;
    const github = context.github;
    const max = context.max;
    const totals = context.totals;
    const teams = context.teams;

    const exercisesDB = context.exercisesDB;
    const setSelectStats = context.setSelectStats;
    const handleChangeStats = (event) => {
        setSelectStats(event.target.value);
    };
    function handleCellClick(orgName, team, lab) {
        router.push({ pathname: `/class/${orgName}/${lab}`, query: { team: team } });

    }

    function getColor(progress,tests) {
        console.log(totals.teamMembers/teams.length)
        console.log('totals.teamMembers/teams.length')

        if (selectStats == 'Commits') {
            if (progress < 2*(totals.teamMembers/teams.length)) return 'error'
            if (progress >= 2*(totals.teamMembers/teams.length) && progress < 4*((totals.teamMembers/teams.length))) return 'warning'
            return 'success'
        } else {
            let succesffulTests = 0
            console.log('workflow',progress)
            for (let tempWorkFlow in progress) {
                var check = progress[tempWorkFlow].filter((item) => {
                    return item.value.includes('success')
                })
                check=[...new Set(check.map( (val)=>val.value[2]))]

                if (check.length > 0) succesffulTests +=  check.length

            }
            if (tests == 0) return 'success'
            if (succesffulTests == 0) return 'error'
            const color = succesffulTests / tests * 100
            if (color < 35) return 'error'
            if (color >= 35 && color < 70) return 'warning'
            return 'success'
        }

    }

    return (
        <>
            <div style={{ display: 'flex', justifyContent: 'center', width: '100%',marginBottom: '2%' }}>
                    
                    <h2 style={{ marginLeft: '1%', color: 'black', borderRight: '0.1em solid black' }}> {organization}  &nbsp;</h2>
                    <h2 style={{ marginLeft: '1%', color: 'black' }}> {github.lab_name}  &nbsp;</h2>

            </div>



            <Card style={{ minWidth: '450px', marginLeft: '2%' }}>
                <div style={{ float: 'right' }}>
                    <FormControl sx={{ m: 1, minWidth: 220 }}>
                        <InputLabel id="demo-simple-select-helper-label">Προβολή</InputLabel>
                        <Select
                            style={{ minWidth: '250px', float: 'right' }}
                            labelId="demo-simple-select-label"
                            id="demo-simple-select"
                            value={selectStats}
                            label="Προβολή"
                            onChange={handleChangeStats}
                        >

                            <MenuItem value={'Commits'}> {'Commits'} </MenuItem>
                            <MenuItem value={'Tests'}> {'Tests'} </MenuItem>

                        </Select>
                    </FormControl>
                </div>
                {!isLoading ? <TableContainer component={Paper}>
                    <Table sx={{ minWidth: '70vw' }} aria-label="caption table">
                        <TableHead>
                            <TableRow>
                                <TableCell>
                                    <p style={{ fontWeight: 'bold', fontSize: '17px' }}>Ομάδα</p>

                                </TableCell>
                                {[...Array(max)].map((val, index) => (
                                    <TableCell
                                        key={`key-${index}`}

                                    >
                                        <p style={{ fontWeight: 'bold', fontSize: '17px' }}>{`Άσκηση-${index + 1}`}</p>
                                    </TableCell>
                                )

                                )}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {selectStats  && exercisesDB && exercisesDB.map((row) => (
                                <TableRow key={row.team}>
                                    {console.log(row)
                                    
                                    
                                    }
                                    {console.log('here')}
                                    <StyledTableCell scope="row">
                                        <p style={{ fontWeight: 'bold', fontSize: '17px', marginBottom: '5%' }}>{row.team}</p>
                                        <p style={{ color: `${row.supervisor == 'fvoulgari' ? 'blue' : 'black'}` }}>{row.supervisor == 'fvoulgari' ? 'H ομάδα μου' : row.supervisor}</p>
                                    </StyledTableCell>
                                    {row.exercises.map((column, index) => {
                                        console.log('column', column)
                                        //Μέσα στο CingularProgess περνάμε το thicknessν, το χρώμα που θέλουμε με την getColor, το size και το progress 
                                      
                                        return (
                                            <TableCell
                                                key={`${column.exercise_id}`}
                                                //Όταν κάνουμε click σε ένα από τα cell καλούμε την HandleCellClick με παραμέτρους τον οργανισμό, την ομάδα, και την άσκηση
                                                onClick={() => { console.log(row); handleCellClick(organization, row.team, column.name) }}
                                                style={{ cursor: 'pointer' }}
                                            >
                                                <CircularProgressWithLabel thickness={5} color={getColor(selectStats == 'Commits' ? column.commits : column.workflow , column.totalTests)}
                                                    size="7em" value={selectStats == 'Commits' ? column.commits : column.workflow} totalTest={column.totalTests}/>
                                            </TableCell>
                                        )
                                    })}
                                    {row.exercises.length < max ? [...Array(max - row.exercises.length)].map((id) => (
                                        <TableCell
                                            key={id}
                                        >
                                        </TableCell>
                                    )) : ''}


                                </TableRow>
                            ))}

                        </TableBody>
                    </Table>

                </TableContainer> : 
                <Box sx={{ width: '100%',marginBottom: '20%',marginTop: '15%' ,display: 'flex' , justifyContent: 'center'}}>
                    <CircularProgress color="warning" size={100} />
                </Box>

                }
            </Card>
        </>
    )
}







{ /* {containerContent == 'statss' && <div style={{ float: 'right' }}>
                            <FormControl sx={{ m: 1, minWidth: 220 }}>
                                <InputLabel id="demo-simple-select-helper-label">Προβολή</InputLabel>
                                <Select
                                    style={{ minWidth: '250px', float: 'right' }}
                                    labelId="demo-simple-select-label"
                                    id="demo-simple-select"
                                    value={selectStats}
                                    label="Προβολή"
                                    onChange={handleChangeStats}
                                >

                                    <MenuItem value={'Commits'}> {'Commits'} </MenuItem>
                                    <MenuItem value={'Tests'}> {'Tests'} </MenuItem>

                                </Select>
                            </FormControl>
                        </div>
                        }
                        {containerContent == 'statss' && <>
                            <div style={{ display: 'flex', justifyContent: 'space-around', width: '100%' }}>
                                <Typography variant="h4" style={{ marginBottom: '2%', color: 'Black' }} >
                                    Πληροφορίες Εργαστηρίου
                                </Typography>
                            </div>
                            <Card style={{ minWidth: '450px', marginLeft: '2%' }}>

                                <TableContainer component={Paper}>
                                    <Table sx={{ minWidth: '70vw' }} aria-label="caption table">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>
                                                </TableCell>
                                                {labs.map((column) => (
                                                    <TableCell
                                                        key={column.name}

                                                    >
                                                        <p style={{ fontWeight: 'bold', fontSize: '17px' }}>{column.name}</p>
                                                    </TableCell>
                                                ))}
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {selectStats && tempTeams.map((row) => (
                                                <TableRow key={row.team}>
                                                    <StyledTableCell scope="row">
                                                        <p style={{ fontWeight: 'bold', fontSize: '17px', marginBottom: '5%' }}>{row.team}</p>
                                                        <p style={{ color: `${row.supervisor == 'Υπεύθυνος 1' ? 'blue' : 'black'}` }}>{row.supervisor == 'Υπεύθυνος 1' ? 'H ομάδα μου' : row.supervisor}</p>
                                                    </StyledTableCell>
                                                    {row.labs.map((column, index) => {
                                                        //Μέσα στο CingularProgess περνάμε το thicknessν, το χρώμα που θέλουμε με την getColor, το size και το progress 
                                                        return (
                                                            <TableCell
                                                                key={`${column.progress}-${index}`}
                                                                //Όταν κάνουμε click σε ένα από τα cell καλούμε την HandleCellClick με παραμέτρους τον οργανισμό, την ομάδα, και την άσκηση
                                                                onClick={() => { handleCellClick(name, row.team, column.name) }}
                                                                style={{ cursor: 'pointer' }}
                                                            >
                                                                <CircularProgressWithLabel thickness={5} color={getColor(column.progress)}
                                                                    size="5em" value={column.progress} />
                                                            </TableCell>
                                                        )
                                                    })}


                                                </TableRow>
                                            ))}

                                        </TableBody>
                                    </Table>

                                </TableContainer>
                            </Card>
                        </>
                                                */}