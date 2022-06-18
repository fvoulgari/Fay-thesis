import React, {
    useState, useEffect,
} from 'react';
import { useRouter } from 'next/router';
import _ from 'lodash';
// import { getActiveOrganizations } from '../Lib/dao';
import {
    Button, TextField, Container, Typography, Card, CardHeader, Table, IconButton, List, ListItem, ListItemAvatar, TableBody, TableCell, ListItemText, tableCellClasses, TableContainer, TableHead, TableRow, Checkbox, Paper, FormControl, InputLabel, Select, MenuItem, Modal, Box
} from '@mui/material';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import DeleteIcon from '@mui/icons-material/Delete';
import { styled } from '@mui/material/styles';
import GitHubIcon from '@mui/icons-material/GitHub';
import { getAppCookies } from '../Lib/dao';
import showNotification from '../Lib/notification'

//TODO 1 Να γίνει πιο τυποποιημένη η ονομασία των εργαστηρίων 
//TODO 2 Να γίνει υποχρεωτική η συμπλήρωση του ονόματος του εργαστηρίου για να πατηθεί το κουμπί δημιουργία. 
//TODO 3 Μη αυτόματος χωρισμός ομάδων φοιτητών (Εισαγωγή πολλών csv?)






const ece = [
    { code: 'ECE_Y215', name: 'Διαδικαστικός Προγραμματισμός' },

    { code: 'ECE_Y106', name: 'Εισαγωγή στους Υπολογιστές' },

    { code: 'ECE_Υ325', name: 'Αντικειμενοστρεφής Τεχνολογία' },

    { code: 'ECE_Υ625', name: 'Αλγόριθμοι και Δομές Δεδομένων' },

    { code: 'ECE_ΓΚ703', name: 'Βάσεις Δεδομένων' },

    { code: 'ECE_ΓΚ802', name: 'Προγραμματισμός Διαδικτύου' },

]





const Input = styled('input')({
    display: 'none'
});

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 500,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
};

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
export default function CreateClass({ supervisor }) {
    const router = useRouter();
    const [organization, setOrganization] = useState([]);
    const [year, setYear] = useState('22/23');
    const [email, setEmail] = useState([]);
    const [open, setOpen] = useState(false);


    const [coSupervisors, setCoSupervisors] = useState({ account: ['uop.supervisor.1@gmail.com', 'fayrevof@gmail.com'] });
    const [csvfiles, setCsvFiles] = useState({ csv: [] });

    //email επιβλέποντα
    const handleName = (event) => {
        setEmail(event.target.value);
    };
    const handleYear = (event) => {
        setYear(event.target.value);
    };
    //Όνομα εργαστηρίου
    const handleOrganization = (event) => {
        setOrganization(event.target.value);
    };


    const createNewClass = async () => {
        if (organization && coSupervisors.account) {
            // Αρχικοποιούμε ένα FormData object  και του περνάμε τα δεδομένα απο την φόρμα μας.

            const res = await fetch('/api/createClass', {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    organization: organization,
                    organizationName: ece.filter((temp) => temp.code == organization),
                    coSupervisors: coSupervisors.account,
                    year: year,
                    supervisor: supervisor.githubname
                })
            });
            const data = await res.json()
            if (data.success) {
                showNotification(
                    'success',
                    'Επιτυχής αρχικοποιήση εργαστηρίου',
                    'Μόλις προσθέσατε ένα νέο  εργαστήριο.'
                );
                router.push('/class/' + organization)
            } else {
                showNotification(
                    'error',
                    'Anπιτυχής αρχικοποιήση εργαστηρίου',
                );
            }


        } else {
            showNotification(
                'warning',
                'Anπιτυχής αρχικοποιήση εργαστηρίου',
                'Δεν έχετε συμπληρώσει όλα τα πεδία.'
            );
        }
    }

    const deleteCoSupervisors = (event, user) => {
        setCoSupervisors(prevState => ({
            account: [...prevState.account].filter((name) => name != user)
        }))
    };
    const addCoSupervisors = (event) => {
        setCoSupervisors(prevState => ({
            account: [...prevState.account, email]
        }))
        setEmail('')
    };


    return (
        <>
            <Container maxWidth="lg" style={{ display: 'flex', justifyContent: 'center', paddingTop: '6%', marginBottom: '2%', padding: '3%' }}>
                <Card style={{ width: '100%', marginLeft: '2%' }}>
                    <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}><h1 style={{ color: '#424242' }}>Αρχικοποίηση Εργαστηρίου</h1></div>

                    <TableContainer component={Paper}>
                        <Table aria-label="caption table">
                            <TableBody>

                                <StyledTableRow >
                                    <StyledTableCell component="th" scope="row">
                                        <h4 style={{ fontWeight: 'bold' }}>Επιλογή Εργαστηρίου</h4>
                                    </StyledTableCell>
                                    <StyledTableCell>
                                    </StyledTableCell>
                                    <StyledTableCell align="right" component="th" scope="row">
                                        {/* <TextField required style={{ height: ' 50px' }}  size="small" label="Ονομασία" variant="outlined" type="text" onChange={handleOrganization} /> */}
                                        <FormControl >
                                            <InputLabel >Εργαστήριο</InputLabel>
                                            <Select
                                                style={{ width: '150px', marginRight: '5%', height: ' 50px' }}
                                                value={organization}
                                                label="Εργαστήριο"
                                                onChange={handleOrganization}
                                            >
                                                {ece && ece.map((temp) => {
                                                    return (<MenuItem value={temp.code} key={temp.code}> {temp.name} - {temp.code} </MenuItem>)
                                                })}

                                            </Select>
                                        </FormControl>
                                        <FormControl >
                                            <InputLabel id="demo-simple-select-helper-label">Έτος</InputLabel>
                                            <Select
                                                style={{ width: '150px', marginLeft: '5%', height: ' 50px' }}
                                                labelId="demo-simple-semlect-label"
                                                id="demo-simple-select"
                                                value={year}
                                                label="Έτος"
                                                onChange={handleYear}
                                            >
                                                {['20/21', '21/22', '22/23', '23/24', '24/25', '26/27'].map((temp) => {
                                                    return (<MenuItem value={temp} key={temp}> {temp} </MenuItem>)
                                                })}

                                            </Select>
                                        </FormControl>
                                    </StyledTableCell>

                                </StyledTableRow>
                                <StyledTableRow sx={{ height: '200px' }}>
                                    <StyledTableCell component="th" scope="row">
                                        <h4 style={{ fontWeight: 'bold' }}>Συνεπιβλέποντες εργαστηρίου</h4>
                                    </StyledTableCell>
                                    <StyledTableCell align="left" component="th" scope="row">
                                        <TextField style={{ width: '60%' }} value={email} label="Email επιβλέποντα" variant="outlined" type="text" onChange={handleName} />
                                        <IconButton onClick={addCoSupervisors} style={{ marginLeft: '2%' }} > <AddCircleIcon fontSize="large" color="primary" /></IconButton>

                                    </StyledTableCell>
                                    <StyledTableCell align="right" component="th" scope="row">

                                        {coSupervisors.account.length > 0 ? <Card >
                                            <CardHeader titleTypographyProps={{ variant: 'h6', fontWeight: 'bold', fontSize: '15px', align: "left", margin: '0' }} title="Συν-επιβλέποντες" />
                                            <List dense={true}>
                                                {/*Κάνουμε iterate στους προς εισαγωγή επιβλέποντες και δημιουργούμε μια λίστα που την γεμίζουμε με τα στοιχεία τους*/}
                                                {coSupervisors.account.map((user) => {
                                                    return (
                                                        <>
                                                            <ListItem
                                                                secondaryAction={
                                                                    <IconButton onClick={(event) => deleteCoSupervisors(event, user)} edge="end" aria-label="delete">
                                                                        <DeleteIcon color="error" />
                                                                    </IconButton>
                                                                }
                                                            >
                                                                <ListItemAvatar>
                                                                    <GitHubIcon fontSize='large' />
                                                                </ListItemAvatar>
                                                                <ListItemText
                                                                    primary={user}
                                                                />
                                                            </ListItem>

                                                        </>
                                                    )
                                                })}


                                            </List>

                                        </Card> : ''}


                                    </StyledTableCell>
                                </StyledTableRow>
                          

                              
                                    <StyledTableRow>
                                        <StyledTableCell component="th" scope="row">
                                            <Button color="primary" variant="contained" component="span" onClick={createNewClass}>
                                                ΔΗΜΙΟΥΡΓΙΑ
                                            </Button>
                                        </StyledTableCell>
                                        <StyledTableCell align='right' component="th" scope="row">

                                        </StyledTableCell>
                                        <StyledTableCell component="th" scope="row">
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
    return {
        props: {
            supervisor: cookies.supervisor
        }
    }
}

