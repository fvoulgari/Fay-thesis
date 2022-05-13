import React, {
    useState, useEffect,
} from 'react';
import {useRouter} from 'next/router';
import _ from 'lodash';
import { getActiveOrganizations } from '../Lib/dao';
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
    TableContainer,
    TableHead,
    TableRow,
    Paper
} from '@mui/material';
import { styled } from '@mui/material/styles';
import showNotification from '../Lib/notification'

const myOrgs=['TA-PythonLab']
const Input = styled('input')({
    display: 'none',
});

export default function ClassHome({ orgs }) {
    const router = useRouter();

    function createData(name) {
        return { name };
    }

    const active = orgs.filter((org) => !(org.startsWith('Uninitialized')))
    const rows = active.map((org) => {
        return (createData(org))
    })


    
    const signupInOrg = async (event) => {
        const org = event.target.id
        router.push('/class/' + org )

    }
    const enterOrg = async (event) => {
        const org = event.target.id


        const res = await fetch('/api/enterOrg', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: org,
                email: 'up1053649@upnet.gr'
            })
        });


        const data = await res.json();
        router.push('/class/' + org )


    }


    const createNewClass = async (event) => {
        router.push('/createClass')

    }



    return (
        <>
            <div style={{ display: 'flex', justifyContent: 'space-around', width: '100%' }}>
                <Typography variant="h4" style={{ marginTop: '7%', color: 'white' }} >
                    Δημιουργία  μαθήματος
                </Typography>
            </div>
            <Container maxWidth="lg" style={{ display: 'flex', justifyContent: 'center', paddingTop: '6%', marginBottom: '2%', padding: '3%' }}>
                <Card style={{ minWidth: '450px', paddingTop: '3%', marginLeft: '2%' }}>
                    <TableContainer component={Paper}>
                        <Table sx={{ minWidth: 650 }} aria-label="caption table">
                            <TableHead>
                                <TableRow>

                                    <TableCell><h2>Μαθήματα</h2></TableCell>
                                    <TableCell></TableCell>

                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {rows.map((row) => (
                                    <TableRow key={row.name}>
                                        <TableCell component="th" scope="row">
                                            {row.name}
                                        </TableCell>
                                        <TableCell align="right" component="th" scope="row">
                                            <Button id={row.name} type="submit" variant="contained" color={myOrgs.includes(row.name)?"warning":"primary"} onClick={(event)=>{
                                                console.log(row.name)
                                                if(myOrgs.includes(row.name)){
                                                    enterOrg(event)
                                                } else{
                                                    signupInOrg(event)
                                                }
                                            }}>
                                                 {  (myOrgs.includes(row.name)) ? "Εισοδος": "Εγγραφη"}

                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                        <div style={{ margin: '2%' }}>
                            <Button type="submit" variant="contained" color="primary" onClick={createNewClass}>
                                Δημηιουργια νεου μαθηματοσ
                            </Button>
                        </div>
                    </TableContainer>
                </Card>
            </Container>
        </>
    )
}


export async function getServerSideProps(context) {
    const KEY = process.env.JWT_KEY;
    //Παίρνουμε όλα τα repos μέσω της getRepos(), έπειτα ελέγχουμε ποιά από αυτά είναι template και τα δίνουμε ως prop στο component  
    const orgs = await getActiveOrganizations();
    //const myOrgs = await listUserOrganizations

    return {
        props: {
            orgs: orgs,
        }
    }
}

