import React, {
    useState, useEffect,
} from 'react';
import { useRouter } from 'next/router';
import _ from 'lodash';
// import { getActiveOrganizations } from '../Lib/dao';
import {
    Button,
    TextField,
    Container,
    Typography,
    Card,
    Box,
    Avatar,
    Select,
    CardHeader,
    MenuItem,
    FormControl,
    InputLabel,
    Table,
    IconButton,
    List,
    ListItem,
    ListItemAvatar,
    TableBody,
    TableCell,
    tableCellClasses,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
} from '@mui/material';

import { styled } from '@mui/material/styles';
import GitHubIcon from '@mui/icons-material/GitHub';

import moment from 'moment';
import CircularProgress from '@mui/material/CircularProgress';
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';




const StyledTableCell = styled(TableCell)(({ theme }) => ({
    [`&.${tableCellClasses.head}`]: {
        backgroundColor: theme.palette.common.black,
        color: theme.palette.common.white,
    },
    [`&.${tableCellClasses.body}`]: {
        fontSize: 14,
    },
}));



export default function Class({ name, team, lab }) {

    const totalTest = 3;


    const tempStudents = [
        {
            name: 'Φοιτητής 1',
            githubLink: 'https://github.com/TA-PythonLab',
            stats: { commits: 8, testsPassed: 2 },
            lastCommitDay: moment().subtract(1, 'day').format('YYYY-MM-DD'),
            openIssues: 2
        },
        {
            name: 'Φοιτητής 2',
            githubLink: 'https://github.com/TA-PythonLab',
            stats: { commits: 3, testsPassed: 3 },
            lastCommitDay: moment().subtract(10, 'day').format('YYYY-MM-DD'),
            openIssues: 3
        },
        {
            name: 'Φοιτητής 3',
            githubLink: 'https://github.com/TA-PythonLab',
            stats: { commits: 0, testsPassed: 0 },
            lastCommitDay: '-',
            openIssues: 1
        }

    ]

    function getColor(progress) {
        if (progress < 35) return 'error'
        if (progress >= 35 && progress < 70) return 'warning'
        return 'success'
    }

    return (
        <>

            <div style={{ margin: '4%', display: 'flex', justifyContent: 'center' }}>

                <h3 style={{ color: 'black', borderRight: '0.1em solid black ' }}> {name}  &nbsp; </h3>
                <h3 style={{ marginLeft: '1%', color: 'black', borderRight: '0.1em solid black' }}> {lab}&nbsp;</h3>

                <h3 style={{ marginLeft: '1%', color: 'black' }}> {team}</h3>
            </div>

            <div style={{ margin: '4%', display: 'flex', justifyContent: 'center', backgroundColor: "white" }}>
                <Container maxWidth="xl" style={{ paddingTop: '3%', marginBottom: '2%', padding: '3%' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-around', width: '100%' }}>
                        <Typography variant="h4" style={{ marginBottom: '2%', color: 'Black' }} >
                            Πρόοδος φοιτητών
                        </Typography>
                    </div>
                    <Card style={{ minWidth: '450px', marginLeft: '2%' }}>

                        <TableContainer component={Paper}>
                            <Table sx={{ minWidth: '70vw' }} aria-label="caption table">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>
                                            <span style={{ fontWeight: 'bold', width: '100%', display: 'flex', justifyContent: 'center' }}>  Όνομα</span>
                                        </TableCell>
                                        <TableCell>
                                            <span style={{ fontWeight: 'bold', width: '100%', display: 'flex', justifyContent: 'center' }}>  Λογαριασμός GitHub</span>
                                        </TableCell>
                                        <TableCell>
                                            <span style={{ fontWeight: 'bold', width: '100%', display: 'flex', justifyContent: 'center' }}>  Commits</span>
                                        </TableCell>
                                        <TableCell>
                                            <span style={{ fontWeight: 'bold', width: '100%', display: 'flex', justifyContent: 'center' }}> Επιτυχή tests</span>
                                        </TableCell>
                                        <TableCell>
                                            <span style={{ fontWeight: 'bold', width: '100%', display: 'flex', justifyContent: 'center' }}> Ημερομηνία τελευταίου commit</span>
                                        </TableCell>
                                        <TableCell>
                                            <span style={{ fontWeight: 'bold', width: '100%', display: 'flex', justifyContent: 'center' }}> Ανοιχτά issues</span>
                                        </TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {tempStudents.map((row) => (
                                        <TableRow key={row.name}>
                                            <StyledTableCell scope="row">
                                                <p style={{ fontWeight: 'bold', fontSize: '17px', marginBottom: '5%' }}>{row.name}</p>
                                            </StyledTableCell>
                                            <TableCell key={row.githubLink}>
                                                <a style={{ display: 'flex', justifyContent: 'center' }} href={row.githubLink} target="_blank">
                                                    <GitHubIcon fontSize='large' />
                                                </a>
                                            </TableCell>
                                            <TableCell key={row.stats.commits}>
                                                <span style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>{row.stats.commits}</span>
                                            </TableCell>
                                            <TableCell key={row.stats.testsPassed}>
                                                <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>


                                                    <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                                                        <CircularProgress
                                                            variant="determinate"
                                                            thickness={5}
                                                            //Περνάμε το ποσοστό των επιτυχημένων task σε κλίμακα 0-100 ως value τόσο στην getColor για να πάρουμε το σωστό χρώμα, όσο και ως value
                                                            color={getColor(Math.round((row.stats.testsPassed / totalTest) * 100))}
                                                            size="7em" value={Math.round((row.stats.testsPassed / totalTest) * 100) == 0 ? Math.round((row.stats.testsPassed / totalTest) * 100) + 5 : Math.round((row.stats.testsPassed / totalTest) * 100)} />
                                                        <Box
                                                            sx={{
                                                                top: 0,
                                                                left: 0,
                                                                bottom: 0,
                                                                right: 0,
                                                                position: 'absolute',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                            }}
                                                        >
                                                            <Typography variant="caption" component="div" color="text.secondary" style={{ fontWeight: 'bold' }}>
                                                                {`${totalTest - row.stats.testsPassed} Tasks left`}
                                                            </Typography>
                                                        </Box>
                                                    </Box>
                                                </div>
                                            </TableCell>
                                            <TableCell key={row.lastCommitDay}>
                                                <span style={{ width: '100%', display: 'flex', justifyContent: 'center', color: moment(row.lastCommitDay).isAfter('2022-05-13') ? 'red' : 'black' }}>{moment(row.lastCommitDay).isAfter('2022-05-13') ? <PriorityHighIcon fontSize="small" color="error" /> : ''} {row.lastCommitDay}  </span>
                                            </TableCell>
                                            <TableCell key={row.openIssues}>
                                                <span style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>{row.openIssues}</span>
                                            </TableCell>


                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>

                        </TableContainer>
                    </Card>
                </Container>
            </div>

        </>
    )
}


export async function getServerSideProps(context) {

    const name = context.query.name;
    const team = context.query.team
    const lab = context.query.lab


    const labProgress = [
        31, 10, 99, 27, 18, 22, 56, 94,
        38, 100, 10, 37, 4, 49, 75, 25,
        22, 36, 91, 87, 100, 70, 45, 88,
        55
    ]
    return {
        props: {
            name: name,
            team: team,
            lab: lab
        }
    }
}

