import React, {
    useState, useEffect,
} from 'react';
import { useRouter } from 'next/router';
import _ from 'lodash';
import { getActiveOrganizations } from '../Lib/dao';
import {
    Button,
    Container,
    Typography,
    Card,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper
} from '@mui/material';
import showNotification from '../Lib/notification'

const myOrgs = ['TA-PythonLab']


export default function ClassHome({ orgs }) {
    const router = useRouter();

    function createData(name) {
        return { name };
    }
    const rows = orgs.map((org) => {
        return (createData(org))
    })


    const  enterOrg = async (event) => {
        const org = event.target.id
        router.push('/class/' + org)

    }
    //Καλούμε ένα api έτσι ώστε να γίνει invited στον οργανισμό ο χρήστης
    const signupInOrg = async (event) => {
        const org = event.target.id


        const res = await fetch('/api/signupInOrg', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: org,
                email: 'fayrevof@gmail.com'
            })
        });


        const data = await res.json();
        router.push('/class/' + org)


    }


    const createNewClass = async (event) => {
        router.push('/createClass')

    }



    return (
        <>
            <div style={{ display: 'flex', justifyContent: 'space-around', width: '100%' }}>
                <Typography variant="h4" style={{ marginTop: '4%', }} >
                    Δημιουργία  μαθήματος
                </Typography>
            </div>
            <Container maxWidth="lg" style={{ display: 'flex', justifyContent: 'center', paddingTop: '6%', padding: '3%' }}>
                <Card style={{ minWidth: '450px', marginLeft: '2%' }}>
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
                                            <Button id={row.name}
                                                type="submit"
                                                variant="contained"
                                                //Ελέγχουμε αν το active organization ανήκει στα organizations στα οποία ο χρήστης είναι owner
                                                // και τροποποιούμε ανάλογα το περιεχόμενο της σελίδας
                                                style={{ backgroundColor: myOrgs.includes(row.name) ? "#4caf50" : "#1976d2" }} 
                                                onClick={(event) => {
                                                    if (myOrgs.includes(row.name)) {
                                                        enterOrg(event)
                                                    } else {
                                                        signupInOrg(event)
                                                    }
                                                }}>
                                                {(myOrgs.includes(row.name)) ? "Εισοδος" : "Εγγραφη"}

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


export async function getServerSideProps() {
    //Παίρνουμε όλους τους ενεργούς οργανισμούς  μέσω της getActiveOrganizations()
    const orgs = await getActiveOrganizations();
    //const myOrgs = await listUserOrganizations

    return {
        props: {
            orgs: orgs,
        }
    }
}

