import React, {
    useState, useContext
} from 'react';
import _ from 'lodash';
import { ListItemAvatar, Card, Table, TableBody, TableCell, tableCellClasses, IconButton, TableContainer, TableHead, TableRow, TextField, Button, Select, MenuItem, FormControl, InputLabel, Paper, Popover, Stack, Modal, CardHeader, Link, Chip, emphasize
} from '@mui/material';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import DeleteIcon from '@mui/icons-material/Delete';
import GitHubIcon from '@mui/icons-material/GitHub';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import { contextOptions } from '../../pages/class/[name]';
import showNotification from '../../Lib/notification'
import { Popconfirm } from 'antd';
import { useRouter } from 'next/router';


// TypeScript only: need a type cast here because https://github.com/Microsoft/TypeScript/issues/26591


export default function EditLab() {


    const router = useRouter();





    const context = useContext(contextOptions);

    const organization = context.organization;
    const coSupervisors = context.orgnizationSupervisors
    const [email, setEmail] = useState([]);
    const [stateSupervisor, setStateSupervisor] = useState(coSupervisors.map((supervisor) => supervisor.email))



    //Καλούμε api για να διαγράψουμε έναν coSupervisor
    const deleteCoSupervisors = async (event, user) => {
        setStateSupervisor(prevState => ([...prevState].filter((name) => name != user)))
        const res = await fetch('/api/deleteSupervisor', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                organization: organization,
                email: user
            })
        });
        const data = await res.json()
        if (data.success) {
            showNotification(
                'success',
                'Επιτυχής πρόσθεση supervisor ',
            );

        } else {
            showNotification(
                'error',
                'Ανεπιτυχής  πρόσθεση supervisor',
                'Συνέβη κάποιο σφάλμα, επικοινωνήστε με τον διαχειριστή.',
            );

        }
    };
        //Καλούμε api για να προσθέσουμε έναν coSupervisor

    const addCoSupervisors = async (event) => {
        console.log(email)
        setStateSupervisor(prevState => ([...prevState, email]))

        const res = await fetch('/api/addSupervisor', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                organization: organization,
                email: email
            })
        });
        const data = await res.json()
        if (data.success) {
            setEmail('')
            showNotification(
                'success',
                'Επιτυχής πρόσθεση supervisor ',
            );

        } else {
            showNotification(
                'error',
                'Ανεπιτυχής  πρόσθεση supervisor',
                'Συνέβη κάποιο σφάλμα, επικοινωνήστε με τον διαχειριστή.',
            );

        }
    };



//Διαγραφή του εργαστηρίου
    const deleteLab = async () => {
        const res = await fetch('/api/deleteLab', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                organization: organization,
            })
        });
        const data = await res.json()
        if (data.success) {
            showNotification(
                'success',
                'Επιτυχής διαγραφή εργαστηρίου',
            );
            router.push('/classhome')
        } else {
            showNotification(
                'error',
                'Ανεπιτυχής διαγραφή ομάδας',
                'Συνέβη κάποιο σφάλμα, επικοινωνήστε με τον διαχειριστή.',
            );
        }

    }






    const handleEmail = (event) => {
        setEmail(event.target.value);
    };





    return (
        <>

            <Card style={{ minWidth: '70vw', marginLeft: '2%' }}>

                <div style={{ widht: '100%', display: 'flex', justifyContent: 'center' }}> <p style={{ fontWeight: 'bold', fontSize: '17px' }}>Επεξεργασία Εργαστηρίου</p></div>

                <TableContainer component={Paper}>
                    <Table sx={{ minWidth: '70vw' }} aria-label="caption table">
                        <TableBody>
                            <TableRow sx={{ height: '200px' }}>
                                <TableCell component="th" scope="row">
                                    <h4 style={{ fontWeight: 'bold' }}>Προσθήκη υπευθύνου</h4>
                                </TableCell>
                                <TableCell align="left" component="th" scope="row">
                                    <TextField style={{ width: '60%' }} label="Github Email" variant="outlined" type="text" onChange={handleEmail} />
                                    <Popconfirm
                                        title={`θέλετε να προσθέσετε υπεύθυνο με email:  ${email} ;`}
                                        onConfirm={addCoSupervisors}
                                        okText={'Ναι'}
                                        cancelText={'Οχι'}

                                    >
                                        <IconButton style={{ marginLeft: '2%' }}  > <AddCircleIcon fontSize="large" color="primary" /></IconButton>

                                    </Popconfirm>


                                </TableCell>
                                <TableCell align="right" component="th" scope="row">

                                    {stateSupervisor ? <Card >
                                        <CardHeader titleTypographyProps={{ variant: 'h6', fontWeight: 'bold', fontSize: '15px', align: "left", margin: '0' }} title="Υπεύθυνοι" />
                                        <List dense={true}>
                                            {/*Κάνουμε iterate στους προς εισαγωγή επιβλέποντες και δημιουργούμε μια λίστα που την γεμίζουμε με τα στοιχεία τους*/}
                                            {stateSupervisor.map((user) => {
                                                return (
                                                    <>
                                                        <ListItem
                                                            secondaryAction={
                                                                <Popconfirm
                                                                    title={'Είστε σίγουρος ότι θέλετε να διαγράψετε τον υπεύθυνο εργαστηρίου'}
                                                                    onConfirm={(event) => deleteCoSupervisors(event, user)}
                                                                    okText={'Ναι'}
                                                                    cancelText={'Οχι'}

                                                                >
                                                                    <IconButton  edge="end" aria-label="delete">
                                                                        <DeleteIcon color="error" />
                                                                    </IconButton>
                                                                </Popconfirm>

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

                                    </Card> : ''}


                                </TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell align='left'>
                                    <Popconfirm
                                        title={'Είστε σίγουρος ότι θέλετε να διαγράψετε το εργαστήριο'}
                                        onConfirm={deleteLab}
                                        okText={'Ναι'}
                                        cancelText={'Οχι'}

                                    >
                                        <Button style={{ minWidth: 220 }} type="submit" variant="contained" color="error" >
                                            διαγραφη
                                        </Button>
                                    </Popconfirm>
                                </TableCell>
                                <TableCell>

                                </TableCell>

                            </TableRow>

                        </TableBody>
                    </Table>

                </TableContainer>
            </Card>
        </>

    )
}

