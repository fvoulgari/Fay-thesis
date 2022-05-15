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
    ListItemText,
    tableCellClasses,
    TableContainer,
    TableHead,
    TableRow,
    Checkbox,
    Paper
} from '@mui/material';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import DeleteIcon from '@mui/icons-material/Delete';
import { styled } from '@mui/material/styles';
import GitHubIcon from '@mui/icons-material/GitHub';
import CheckBoxOutlineBlankRoundedIcon from '@mui/icons-material/CheckBoxOutlineBlankRounded';
import CheckBoxRoundedIcon from '@mui/icons-material/CheckBoxRounded';
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
export default function CreateClass() {
    const router = useRouter();
    const [className, setClassName] = useState([]);
    const [checked, setChecked] = useState(false);
    const [name, setName] = useState([]);
    const [users, setusers] = useState({ account: ['uop.supervisor.1@gmail.com','fayrevof@gmail.com'] });
    const [csvfiles, setCsvFiles] = useState({ csv: [] });


    const handleName = (event) => {
        setName(event.target.value);
    };
    const handleClassName = (event) => {
        setClassName(event.target.value);
    };
    const handleCheckBox = (event) => {
        var isTrueSet = (event.target.value === 'true');
        setChecked(!isTrueSet);
    };
    

    const createNewClass = async () => {
        if (className) {
            // Αρχικοποιούμε ένα FormData object  και του περνάμε το επιλεγμένο templateRepo και τα csv files.
            const formData = new FormData();
            formData.append(
                'formData', //key
                JSON.stringify({
                    className: className,
                    checked: checked,
                    users: users.account
                }) //value
            );

            for (let i = 0; i < csvfiles.csv.length; i++) {
                formData.append("file", csvfiles.csv[i]);
            }


            const res = await fetch('/api/createClass', {
                method: 'POST',
                body: formData,
            });

            const data = await res.json();
            console.log(data)
            router.push('/class/' + className)

        }
    }

    const deleteUser = (event, user) => {
        setusers(prevState => ({
            account: [...prevState.account].filter((name) => name != user)
        }))
    };
    const addUser = (event) => {
        setusers(prevState => ({
            account: [...prevState.account, name]
        }))
        setName('')
    };

    const handleCsvFileChange = (event) => {
        let files = event.target.files
        setCsvFiles({ csv: files });
    };
    return (
        <>
            <div style={{ display: 'flex', justifyContent: 'space-around', width: '100%' }}>
                <Typography variant="h4" style={{ marginTop: '2%', color: 'white' }} >
                    Δημιουργία  μαθήματος
                </Typography>
            </div>
            <Container maxWidth="lg" style={{ display: 'flex', justifyContent: 'center', paddingTop: '6%', marginBottom: '2%', padding: '3%' }}>
                <Card style={{ width: '100%', marginLeft: '2%' }}>
                    <TableContainer component={Paper}>
                        <Table sx={{ minWidth: 650 }} aria-label="caption table">
                            <TableHead>
                                <StyledTableRow>

                                    <StyledTableCell></StyledTableCell>
                                    <StyledTableCell style={{ paddingLeft: '10%' }}><h1 style={{ color: '#424242' }}>Νέο Μάθημα</h1></StyledTableCell>
                                    <StyledTableCell></StyledTableCell>

                                </StyledTableRow>
                            </TableHead>
                            <TableBody>

                                <StyledTableRow >
                                    <StyledTableCell component="th" scope="row">
                                        <h4>Όνομα μαθήματος</h4>
                                    </StyledTableCell>
                                    <StyledTableCell>
                                    </StyledTableCell>
                                    <StyledTableCell lign="right" component="th" scope="row">
                                        <TextField size="small" label="Όνομα μαθήματος" variant="outlined" type="text" onChange={handleClassName} />
                                    </StyledTableCell>

                                </StyledTableRow>
                                <StyledTableRow sx={{ height: '200px' }}>
                                    <StyledTableCell component="th" scope="row">
                                        <h4 style={{ fontWeight: 'bold' }}>Προσθέστε συνεπιβλέποντες εργαστηρίου</h4>
                                    </StyledTableCell>
                                    <StyledTableCell align="left" component="th" scope="row">
                                        <TextField style={{ width: '60%' }} value={name} label="Όνομα επιβλέποντα" variant="outlined" type="text" onChange={handleName} />
                                        <IconButton onClick={addUser} style={{ marginLeft: '2%' }} > <AddCircleIcon fontSize="large" color="primary" /></IconButton>

                                    </StyledTableCell>
                                    <StyledTableCell align="right" component="th" scope="row">

                                        {users.account.length > 0 ? <Card >
                                            <CardHeader titleTypographyProps={{ variant: 'h6', fontWeight: 'bold', fontSize: '15px', align: "left", margin: '0' }} title="Συν-επιβλέποντες" />
                                            <List dense={true}>
                                                {users.account.map((user) => {
                                                    return (
                                                        <>
                                                            <ListItem
                                                                secondaryAction={
                                                                    <IconButton onClick={(event) => deleteUser(event, user)} edge="end" aria-label="delete">
                                                                        <DeleteIcon color="error" />
                                                                    </IconButton>
                                                                }
                                                            >
                                                                <ListItemAvatar>
                                                                    <GitHubIcon fontSize='large' />
                                                                </ListItemAvatar>
                                                                <ListItemText
                                                                    primary={user}
                                                                // secondary={secondary ? 'Secondary text' : null}
                                                                />
                                                            </ListItem>

                                                        </>
                                                    )
                                                })}


                                            </List>

                                        </Card> : <Card style={{ width: '100px', height: '100px' }}><div></div> </Card>}


                                    </StyledTableCell>
                                </StyledTableRow>
                                <StyledTableRow >
                                    <StyledTableCell component="th" scope="row">
                                        <h4>Προσθέστε φοιτητές</h4>
                                    </StyledTableCell>
                                    <StyledTableCell>
                                    </StyledTableCell>
                                    <StyledTableCell align="right" component="th" scope="row">
                                        <div >
                                            <label htmlFor="contained-csv-button-file">
                                                <Input id="contained-csv-button-file" accept=".csv" type="file" onChange={handleCsvFileChange} />
                                                <Button color="primary" variant="contained" component="span" style={{ marginRight: '20%' }}>
                                                    Αρχειο φοιτητων
                                                </Button>
                                            </label>
                                        </div>

                                    </StyledTableCell>

                                </StyledTableRow>
                                <StyledTableRow >
                                    <StyledTableCell component="th" scope="row">
                                    </StyledTableCell>
                                    <StyledTableCell aligh="left" component="th" scope="row">
                                        <Typography variant="p" style={{ fontSize: '13px', fontWeight: 'bold' }}>
                                            Θέλετε να ανατεθούν φοιτητές ανά επιβλέποντα?
                                            <Checkbox
                                                value={checked}
                                                onClick={handleCheckBox}
                                                icon={<CheckBoxOutlineBlankRoundedIcon color="primary" />}
                                                checkedIcon={<CheckBoxRoundedIcon color='primary' />}
                                            />
                                        </Typography>

                                    </StyledTableCell>
                                    <StyledTableCell component="th" scope="row">
                                    </StyledTableCell>
                                </StyledTableRow>
                                <StyledTableRow >
                                    <StyledTableCell component="th" scope="row">
                                    </StyledTableCell>
                                    <StyledTableCell style={{ display: 'flex', justifyContent: 'center' }} component="th" scope="row">
                                        <Button color="primary" variant="contained" component="span" onClick={createNewClass}>
                                            ΔΗΜΙΟΥΡΓΙΑ ΜΑΘΗΜΑΤΟΣ
                                        </Button>
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

    return {
        props: {
        }
    }
}

