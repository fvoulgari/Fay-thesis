import React, {
    useState, useEffect,
} from 'react';
import { useRouter } from 'next/router';
import _ from 'lodash';
// import { getActiveOrganizations } from '../Lib/dao';
import {
    Button, TextField, Container, Typography, Card, CardHeader, Table, IconButton, List, ListItem, ListItemAvatar, TableBody, TableCell, ListItemText, tableCellClasses, TableContainer, TableHead, TableRow, Checkbox, Paper, FormControl, InputLabel, Select, MenuItem, Modal, Box, Chip, Breadcrumbs
} from '@mui/material';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import DeleteIcon from '@mui/icons-material/Delete';
import HomeIcon from '@mui/icons-material/Home';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { emphasize, styled } from '@mui/material/styles';
import GitHubIcon from '@mui/icons-material/GitHub';
import { getAppCookies } from '../Lib/dao';
import showNotification from '../Lib/notification';



const ece = [
    { code: 'ECE_Y215', name: 'Διαδικαστικός Προγραμματισμός' },

    { code: 'ECE_Y106', name: 'Εισαγωγή στους Υπολογιστές' },

    { code: 'ECE_Υ325', name: 'Αντικειμενοστρεφής Τεχνολογία' },

    { code: 'ECE_Υ625', name: 'Αλγόριθμοι και Δομές Δεδομένων' },

    { code: 'ECE_ΓΚ703', name: 'Βάσεις Δεδομένων' },

    { code: 'ECE_ΓΚ802', name: 'Προγραμματισμός Διαδικτύου' },

]




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
const StyledBreadcrumb = styled(Chip)(({ theme }) => {
    const backgroundColor =
        theme.palette.mode === 'light'
            ? theme.palette.grey[100]
            : theme.palette.grey[800];
    return {
        backgroundColor,
        height: theme.spacing(3),
        color: theme.palette.text.primary,
        fontWeight: theme.typography.fontWeightRegular,
        '&:hover, &:focus': {
            backgroundColor: emphasize(backgroundColor, 0.06),
        },
        '&:active': {
            boxShadow: theme.shadows[1],
            backgroundColor: emphasize(backgroundColor, 0.12),
        },
    };
})
export default function CreateClass({ supervisor }) {
    const router = useRouter();
    const [organization, setOrganization] = useState([]);
    const [year, setYear] = useState('22/23');
    const [email, setEmail] = useState([]);
    const [secret, setSecret] = useState('');


    const [coSupervisors, setCoSupervisors] = useState({ account: ['fayrevof@gmail.com'] });

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
    const handleSecret = (event) => {
        setSecret(event.target.value);
    };


    const createNewClass = async () => {
        if (organization && coSupervisors.account && secret) {
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
                    supervisor: supervisor.githubname,
                    secret
                })
            });
            const data = await res.json()
            if (data.success) {
                showNotification(
                    'success',
                    'Επιτυχής αρχικοποιήση μαθήματος',
                    'Μόλις προσθέσατε ένα νέο μάθημα.'
                );
                router.push('/class/' + organization)
            } else {
                showNotification(
                    'error',
                    'Ανεπιτυχής αρχικοποιήση μαθήματος',
                );
            }


        } else {
            showNotification(
                'warning',
                'Ανεπιτυχής αρχικοποιήση μαθήματος',
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
            <div style={{ marginTop: '6%', marginLeft: '15%' }} role="presentation">
                <Breadcrumbs aria-label="breadcrumb">
                    <StyledBreadcrumb
                        component="a"
                        label="Classhome"
                        onClick={() => { router.push('/classhome') }}
                        icon={<HomeIcon fontSize="small" />}
                    />
                </Breadcrumbs>
            </div>
            <Container maxWidth="lg" style={{ display: 'flex', justifyContent: 'center', paddingTop: '1%', marginBottom: '2%', padding: '3%' }}>

                <Card style={{ width: '100%', marginLeft: '2%' }}>
                    <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}><h1 style={{ color: '#424242', margin: '2%' }}>Αρχικοποίηση Μαθήματος</h1></div>

                    <TableContainer component={Paper}>
                        <Table aria-label="caption table">
                            <TableBody>

                                <StyledTableRow >
                                    <StyledTableCell component="th" scope="row">
                                        <h4 style={{ fontWeight: 'bold' }}>Επιλογή μαθήματος</h4>
                                    </StyledTableCell>
                                    <StyledTableCell>
                                    </StyledTableCell>
                                    <StyledTableCell align="right" component="th" scope="row">
                                        {/* <TextField required style={{ height: ' 50px' }}  size="small" label="Ονομασία" variant="outlined" type="text" onChange={handleOrganization} /> */}
                                        <FormControl >
                                            <InputLabel >Μάθημα</InputLabel>
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
                                        <h4 style={{ fontWeight: 'bold' }}>Προσθήκη υπεύθυνου </h4>
                                    </StyledTableCell>
                                    <StyledTableCell align="left" component="th" scope="row">
                                        <TextField style={{ width: '60%' }} value={email} label="Github Email" variant="outlined" type="text" onChange={handleName} />
                                        <IconButton onClick={addCoSupervisors} style={{ marginLeft: '2%' }} > <AddCircleIcon fontSize="large" color="primary" /></IconButton>

                                    </StyledTableCell>
                                    <StyledTableCell align="right" component="th" scope="row">

                                        {coSupervisors.account.length > 0 ? <Card >
                                            <CardHeader titleTypographyProps={{ variant: 'h6', fontWeight: 'bold', fontSize: '15px', align: "left", margin: '0' }} title="Υπεύθυνοι" />
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
                                    <h4 style={{ fontWeight: 'bold' }}>  Συνθηματικό μαθήματος</h4>

                                    </StyledTableCell>
                                    <StyledTableCell align='right' component="th" scope="row">
                                    
                                    </StyledTableCell>
                                    <StyledTableCell align='right' component="th" scope="row">
                                    <TextField style={{ width: '60%' }} value={secret} label="Συνθηματικό" variant="outlined" type="text" onChange={handleSecret} />

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

