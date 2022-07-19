import React, {
    useState,
} from 'react';
import { useRouter } from 'next/router';
import _ from 'lodash';
import { getActiveOrganizations, getAppCookies, getUserOrganizations } from '../Lib/dao';
import {
    Button, Container, Modal, Card, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Box, Paper, TextField
} from '@mui/material';
import showNotification from '../Lib/notification'

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
};

export default function ClassHome({ orgs, cookies, supervisorOrgs }) {
    const router = useRouter();
    const [organization, setOrganization] = useState('')
    const [open, setOpen] = useState(false);
    const [secret, setSecret] = useState('');
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);
    const handleSecret = (event) => {
        setSecret(event.target.value);
    };

  


    // Ανακατεύθηνση του χρήστη στον οργανισμό του. 
    const enterOrg = async (event) => {
        const org = event.target.id
        showNotification(
            'success',
            'Επιτυχής εισαγωγή',
            'Καλώς ήρθατε στο Εργαστήριο.'
        );
        router.push('/class/' + org)

    }
    //Καλούμε ένα api έτσι ώστε να γίνει invited στον οργανισμό ο χρήστης
    const signupInOrg = async () => {
        const res = await fetch('/api/signupInOrg', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: organization,
                email: cookies.supervisor.email,
                githubname: cookies.supervisor.githubname,
                secret: secret
            })
        });
        const data = await res.json();
        if (data.success) {
            showNotification(
                'success',
                'Επιτυχής εγγραφή',
                'Καλώς ήρθατε στο εργαστήριο.'
            );
            router.push('/class/' + organization)

        } else {
            handleClose()
            showNotification(
                'error',
                'Ανέπιτυχής εγγραφή',
                'Δεν ολοκληρώθηκε η εγγραφή στο εργαστήριο'
            );
        }


    }


    const createNewClass = async (event) => {
        router.push('/createClass')
    }



    return (
        <>
            <Modal
                keepMounted
                open={open}
                onClose={handleClose}
            >
                <Box sx={style}>
                    <TextField size="small" label="Συνθηματικό μαθήματος" variant="outlined" type="password" onChange={handleSecret} />
                    <Button style={{ backgroundColor: "#1976d2" }} variant="contained" onClick={signupInOrg}>Εγγραφη</Button>
                </Box>
            </Modal>

            <Container maxWidth="lg" style={{ display: 'flex', justifyContent: 'center', paddingTop: '6%', padding: '3%' }}>
                <Card style={{ minWidth: '450px', marginLeft: '2%', marginTop: '6%' }}>
                    <TableContainer component={Paper}>
                        <div style={{ widht: '100%', display: 'flex', justifyContent: 'center' , marginTop: '2%'}}>
                            <h2>Μαθήματα</h2>
                        </div>
                        <Table sx={{ minWidth: 650 }} aria-label="caption table">
                            <TableHead>
                                <TableRow>

                                    <TableCell><h2>Κωδικός</h2></TableCell>
                                    <TableCell><h2>Όνομα</h2></TableCell>
                                    <TableCell><h2>Έτος</h2></TableCell>
                                    <TableCell></TableCell>


                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {orgs.map((row) => (
                                    <TableRow key={row.name}>
                                        <TableCell component="th" scope="row">
                                            {row.githubname}
                                        </TableCell>
                                        <TableCell component="th" scope="row">
                                            {row.lab_name}
                                        </TableCell>
                                        <TableCell component="th" scope="row">
                                            {row.year}
                                        </TableCell>
                                        <TableCell align="right" component="th" scope="row">
                                            <Button id={row.githubname}
                                                type="submit"
                                                variant="contained"
                                                //Ελέγχουμε αν το active organization ανήκει στα organizations στα οποία ο χρήστης είναι owner
                                                // και τροποποιούμε ανάλογα το περιεχόμενο της σελίδας
                                                style={{ backgroundColor: supervisorOrgs.includes(row.githubname) ? "#4caf50" : "#1976d2" }}
                                                onClick={(event) => {
                                                    if (supervisorOrgs.includes(row.githubname)) {
                                                        enterOrg(event)
                                                    } else {
                                                        setOrganization(event.target.id)
                                                        handleOpen()
                                                    }
                                                }}>
                                                {(supervisorOrgs.includes(row.githubname)) ? "Εισοδος" : "Εγγραφη"}

                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                        <div style={{ margin: '2%' }}>
                            <Button type="submit" variant="contained" color="primary" onClick={createNewClass}>
                                Δημιουργια  μαθηματος
                            </Button>
                        </div>
                    </TableContainer>

                </Card>

            </Container>
        </>
    )
}


export async function getServerSideProps(context) {
    //Παίρνουμε όλους τους ενεργούς οργανισμούς  μέσω της getActiveOrganizations()
    const orgs = await getActiveOrganizations();
    //Ελέγχουμε αν είναι συνδεδεμένος ο χρήστης και γυρνάμε τα στοιχεία του.
    let cookies = await getAppCookies(context.req);
    if (!cookies.sucess) {
        return {
            redirect: {
                destination: '/',
                permanent: false,
            },
        }
    }
    //Βρίσκουμε σε ποιους οργανισμούς έχει ήδη ενταχθεί ο χρήστης
    
    const supervisorOrgs = await getUserOrganizations(cookies.supervisor.githubname);
    return {
        props: {
            orgs: orgs,
            cookies: cookies,
            supervisorOrgs: supervisorOrgs
        }
    }
}

