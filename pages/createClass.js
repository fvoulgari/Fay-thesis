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
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Table,
    TableBody,
    TableCell,
    tableCellClasses,
    TableContainer,
    TableHead,
    TableRow,
    Paper
} from '@mui/material';

import { styled } from '@mui/material/styles';
import showNotification from '../Lib/notification'

const Input = styled('input')({
    display: 'none',
});

const StyledTableCell = styled(TableCell)(({ theme }) => ({
    [`&.${tableCellClasses.head}`]: {
        backgroundColor: theme.palette.action.disabledBackground,
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
export default function ClassHome() {
    const router = useRouter();
    const [name, setName] = useState([]);


    const handleName = (event) => {
        setName(event.target.value);
      };





    return (
        <>
            <div style={{ display: 'flex', justifyContent: 'space-around', width: '100%' }}>
                <Typography variant="h4" style={{ marginTop: '7%', color: 'white' }} >
                    Δημιουργία  μαθήματος
                </Typography>
            </div>
            <Container maxWidth="lg" style={{ display: 'flex', justifyContent: 'center', paddingTop: '6%', marginBottom: '2%', padding: '3%' }}>
                <Card style={{ width: '100%', marginLeft: '2%' }}>
                    <TableContainer component={Paper}>
                        <Table sx={{ minWidth: 650 }} aria-label="caption table">
                            <TableHead>
                                <StyledTableRow>

                                    <StyledTableCell><h2>Μαθήματα</h2></StyledTableCell>
                                    <StyledTableCell></StyledTableCell>

                                </StyledTableRow>
                            </TableHead>
                            <TableBody>

                                <StyledTableRow >
                                    <StyledTableCell component="th" scope="row">
                                        <h3>Όνομα μαθήματος</h3>
                                    </StyledTableCell>
                                    <StyledTableCell align="right" component="th" scope="row">
                                        <TextField size="small" label="Όνομα μαθήματος" variant="outlined" type="text" onChange={handleName}  />

                                    </StyledTableCell>
                                </StyledTableRow>
                                <StyledTableRow >
                                    <StyledTableCell component="th" scope="row">
                                        <h3>Όνομα μαθήματος</h3>
                                    </StyledTableCell>
                                    <StyledTableCell align="right" component="th" scope="row">
                                        <TextField size="small" label="Όνομα μαθήματος" variant="outlined" type="text" onChange={handleName}  />

                                    </StyledTableCell>
                                </StyledTableRow>
                                <StyledTableRow >
                                    <StyledTableCell component="th" scope="row">
                                        <h3>Όνομα μαθήματος</h3>
                                    </StyledTableCell>
                                    <StyledTableCell align="right" component="th" scope="row">
                                        <TextField size="small" label="Όνομα μαθήματος" variant="outlined" type="text" onChange={handleName}  />

                                    </StyledTableCell>
                                </StyledTableRow>
                                <StyledTableRow >
                                    <StyledTableCell component="th" scope="row">
                                        <h3>Όνομα μαθήματος</h3>
                                    </StyledTableCell>
                                    <StyledTableCell align="right" component="th" scope="row">
                                        <TextField size="small" label="Όνομα μαθήματος" variant="outlined" type="text" onChange={handleName}  />

                                    </StyledTableCell>
                                </StyledTableRow>
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Card>
            </Container>
        </>
    )
}


export async function getServerSideProps(context) {
    const KEY = process.env.JWT_KEY;
    //Παίρνουμε όλα τα repos μέσω της getRepos(), έπειτα ελέγχουμε ποιά από αυτά είναι template και τα δίνουμε ως prop στο component  
    //const myOrgs = await listUserOrganizations

    return {
        props: {
        }
    }
}

