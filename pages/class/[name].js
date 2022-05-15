import React, {
    useState, useEffect,
} from 'react';
import { useRouter } from 'next/router';
import _ from 'lodash';
import PermanentDrawerLeft from '../../src/components/PermanentDrawerLeft';
import CircularProgressWithLabel from '../../src/components/CircularProgressWithLabel';
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
    ListItemText,
    tableCellClasses,
    TableContainer,
    TableHead,
    TableRow,
    Checkbox,
    Paper
} from '@mui/material';
import { checkClass, getTeams } from '../../Lib/dao';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import DeleteIcon from '@mui/icons-material/Delete';
import { styled } from '@mui/material/styles';
import GitHubIcon from '@mui/icons-material/GitHub';
import CheckBoxOutlineBlankRoundedIcon from '@mui/icons-material/CheckBoxOutlineBlankRounded';
import CheckBoxRoundedIcon from '@mui/icons-material/CheckBoxRounded';
import showNotification from '../../Lib/notification'
import { fontSize } from '@mui/system';

const myOrgs = []
const Input = styled('input')({
    display: 'none',
});

const StyledTableCell = styled(TableCell)(({ theme }) => ({
    [`&.${tableCellClasses.head}`]: {
        backgroundColor: theme.palette.common.black,
        color: theme.palette.common.white,
    },
    [`&.${tableCellClasses.body}`]: {
        fontSize: 14,
    },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
    '&:nth-of-type(odd)': {
        backgroundColor: theme.palette.action.hover,
    },
    // hide last border
    '&:last-child td, &:last-child th': {
        border: 0,
    },
}));

export default function Class({ name, teams, labProgress }) {
    const router = useRouter();
    const [progress, setProgress] = useState(60);



    const labs = [
        { name: 'Άσκηση 1' },
        { name: 'Άσκηση 2' },
        { name: 'Άσκηση 3' },
        { name: 'Άσκηση 4' },
        { name: 'Άσκηση 5' },
    ]


    const tempTeams = [
        {
            team: 'Ομάδα 1', supervisor: 'Υπεύθυνος 1', labs: [
                { progress: labProgress[0] },
                { progress: labProgress[1] },
                { progress: labProgress[2] },
                { progress: labProgress[3] },
                { progress: labProgress[4] },
            ]
        },
        {
            team: 'Ομάδα 2', supervisor: 'Υπεύθυνος 2', labs: [
                { progress: labProgress[5] },
                { progress: labProgress[6] },
                { progress: labProgress[7] },
                { progress: labProgress[8] },
                { progress: labProgress[9] },
            ]
        },
        {
            team: 'Ομάδα 3', supervisor: 'Υπεύθυνος 3', labs: [
                { progress: labProgress[10] },
                { progress: labProgress[11] },
                { progress: labProgress[12] },
                { progress: labProgress[13] },
                { progress: labProgress[14] }
            ]
        },
        {
            team: 'Ομάδα 4', supervisor: 'Υπεύθυνος 4', labs: [
                { progress: labProgress[15] },
                { progress: labProgress[16] },
                { progress: labProgress[17] },
                { progress: labProgress[18] },
                { progress: labProgress[19] },
            ]
        },
        {
            team: 'Ομάδα 5', supervisor: 'Υπεύθυνος 5', labs: [
                { progress: labProgress[20] },
                { progress: labProgress[21] },
                { progress: labProgress[22] },
                { progress: labProgress[23] },
                { progress: labProgress[24] },
            ]
        }
    ]

    function getColor(progress) {
        if (progress < 35) return 'error'
        if (progress >= 35 && progress < 70) return 'warning'
        return 'success'
    }


    return (
        <>

            <div style={{ margin: '4%', display: 'flex', justifyContent: 'center', backgroundColor: "white" }}>
                <PermanentDrawerLeft name={name} />
                <Container maxWidth="xl" style={{ paddingTop: '3%', marginBottom: '2%', padding: '3%' }}>
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
                                    {tempTeams.map((row) => (
                                        <TableRow key={row.team}>
                                            <StyledTableCell scope="row">
                                                <p style={{ fontWeight: 'bold', fontSize: '17px', marginBottom: '5%' }}>{row.team}</p>
                                                <p style={{ color:`${row.supervisor=='Υπεύθυνος 1'? 'blue': 'black'}`}}>{row.supervisor=='Υπεύθυνος 1'?'H ομάδα μου':row.supervisor}</p>
                                            </StyledTableCell>
                                            {row.labs.map((column, index) => {
                                                return (
                                                    <TableCell
                                                        key={`${column.progress}-${index}`}

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
                </Container>
            </div>

        </>
    )
}


export async function getServerSideProps(context) {
    const KEY = process.env.JWT_KEY;

    const name = context.params.name;
    const valid = checkClass('fvoulgari', name)
    //Παίρνουμε όλα τα repos μέσω της getRepos(), έπειτα ελέγχουμε ποιά από αυτά είναι template και τα δίνουμε ως prop στο component  
    if (!valid) {
        return {
            redirect: {
                destination: '/classhome',
                permanent: false,
            },
        };
    }

    const teamRows = await getTeams(name)
    console.log(teamRows, name)
    const teams = teamRows.map((team) => {
        return {

            teamName: team.team_name,
            supervisor: team.team_supervisor

        }
    })
    const labProgress = [
        31, 10, 99, 27, 18, 22, 56, 94,
        38, 100, 10, 37, 4, 49, 75, 25,
        22, 36, 91, 87, 100, 70, 45, 88,
        55
    ]
    return {
        props: {
            name: name,
            teams: teams,
            labProgress
        }
    }
}

