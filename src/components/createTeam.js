import React, {
    useState, useContext
} from 'react';
import _ from 'lodash';
import {
    Typography, Card, Table, TableBody, TableCell, tableCellClasses, TableContainer, TableHead, TableRow, TextField, Button, Select, MenuItem, FormControl, InputLabel, Paper, Popover
} from '@mui/material';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import InfoRoundedIcon from '@mui/icons-material/InfoRounded';
import { contextOptions } from '../../pages/class/[name]';
import showNotification from '../../Lib/notification'



const Input = styled('input')({
    display: 'none',
});

export default function CreateTeam({ }) {

    const context = useContext(contextOptions);
    const [anchorEl, setAnchorEl] = React.useState(null);
    const [teamName, setTeamName] = useState([]);
    const [csvfiles, setCsvFiles] = useState({ csv: [] });
    const supervisor = context.supervisor;
    const organization = context.organization;
    const teams = context.teams;
    const setTeams = context.setTeams;
    const users = context.users;
    const [activeUser, setActiveUser] = useState(supervisor.githubname);


    const handlePopoverOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handlePopoverClose = () => {
        setAnchorEl(null);
    };

    const open = Boolean(anchorEl);

    const handleUserChange = (event) => {
        setActiveUser(event.target.value);
    };


    const handleTeamName = (event) => {
        setTeamName(event.target.value);
    };

    const handleCsvFileChange = (event) => {
        let files = event.target.files
        setCsvFiles({ csv: files });
    };

    //Καλούμε ένα api για την αρχικοποιήση της ομάδας
    const initilizeTeam = async () => {
        if (teamName && csvfiles.csv.length > 0) {

            const formData = new FormData();
            formData.append(
                'formData', //key
                JSON.stringify({ team: teamName, supervisor: activeUser, organization: organization }) //value
            );
            for (let i = 0; i < csvfiles.csv.length; i++) {
                formData.append("file", csvfiles.csv[i]);
            }


            const res = await fetch('/api/initializeTeam', {
                method: 'POST',
                body: formData,

            });

            const data = await res.json();
            if (data.success) {
                setTeams([...teams, { teamName: teamName, supervisor: activeUser }])
                showNotification(
                    'success',
                    'Επιτυχής αρχικοποίηση ομάδας',
                );
            } else {
                showNotification(
                    'error',
                    'Ανεπιτυχής αρχικοποίηση ομάδας',
                    'Συνέβη κάποιο σφάλμα, επικοινωνήστε με τον διαχειριστή.',
                );
            }
        } else {
            showNotification(
                'error',
                'Ανέπιτυχής αρχικοποίηση',
                'Δεν συμπληρώσατε όλα τα πεδία.'
            );
        }

    }







    return (
        <>


            <Card style={{ minWidth: '70vw', marginLeft: '2%' }}>
            <div style={{ widht: '100%', display: 'flex', justifyContent: 'center' }}> <p style={{ fontWeight: 'bold', fontSize: '17px' }}>Αρχικοποίηση Ομάδας</p></div>

                <TableContainer component={Paper}>
                    <Table sx={{ minWidth: '70vw' }} aria-label="caption table">
                        
                        <TableBody>
                            <TableRow>
                                <TableCell>
                                    <Box >
                                        <p style={{ fontWeight: 'bold', fontSize: '17px' }}>Όνομα ομάδας</p>

                                    </Box>
                                </TableCell>
                                <TableCell align='right'>
                                    <Box >
                                        <TextField size="small" label="Όνομα ομάδας" variant="outlined" type="text" onChange={handleTeamName} />
                                    </Box>
                                </TableCell>
                            </TableRow>

                            <TableRow>
                                <TableCell>
                                    <Box >
                                        <p style={{ fontWeight: 'bold', fontSize: '17px' }}>Υπεύθυνος ομάδας</p>

                                    </Box>
                                </TableCell>
                                <TableCell align='right'>

                                    <Box >
                                        <FormControl sx={{ m: 1, minWidth: 220 }}>
                                            <InputLabel id="demo-simple-select-helper-label">Υπεύθυνος ομάδας</InputLabel>
                                            <Select
                                                style={{ minWidth: '220px' }}
                                                labelId="demo-simple-select-label"
                                                id="demo-simple-select"
                                                value={activeUser}
                                                label="Υπεύθυνος ομάδας"
                                                onChange={handleUserChange}
                                            >

                                                {users && users.map((user) => {
                                                    return (<MenuItem value={user.githubname} key={user.id}> {user.first_name} {user.last_name} </MenuItem>)
                                                })}

                                            </Select>
                                        </FormControl>
                                    </Box>
                                </TableCell>
                            </TableRow>






                            <TableRow>
                                <TableCell>
                                    <Box style={{ display: 'flex', verticalAlign: 'middle' }} >
                                        <InfoRoundedIcon onMouseEnter={handlePopoverOpen}
                                            onMouseLeave={handlePopoverClose}
                                            color="warning" />
                                        <Popover
                                            id="mouse-over-popover"
                                            sx={{
                                                pointerEvents: 'none',
                                            }}
                                            open={open}
                                            anchorEl={anchorEl}
                                            anchorOrigin={{
                                                vertical: 'bottom',
                                                horizontal: 'left',
                                            }}
                                            transformOrigin={{
                                                vertical: 'top',
                                                horizontal: 'left',
                                            }}
                                            style={{ marginTop: '1%', opacity: '0.9' }}
                                            PaperProps={{
                                                sx: {
                                                    "backgroundColor": 'gray',
                                                    "color": 'white',
                                                    "fontSize": '14px',
                                                    "width": '400px'

                                                }
                                            }}
                                            color="warning"
                                            onClose={handlePopoverClose}
                                            disableRestoreFocus

                                        >
                                            <Typography sx={{ p: 1 }}>Χρειάζεται να δωθεί ένα csv αρχείο που περιέχει τo όνομα
                                                του GitHub account των φοιτητών καθώς επίσης το AM και τα προσωπικά τους στοιχεία.                                          </Typography>
                                        </Popover>
                                        <span style={{ fontWeight: 'bold', fontSize: '17px' }}>CSV αρχείο φοιτητών</span>
                                    </Box>

                                </TableCell>
                                <TableCell align='right'>
                                    <Box >
                                        <div >
                                            <label htmlFor="contained-csv-button-file">
                                                <Input id="contained-csv-button-file" accept=".csv" type="file" onChange={handleCsvFileChange} />
                                                <Button type="submit" color="primary" variant="contained" component="span" style={{ minWidth: 220 }}>
                                                    CSV μαθητων
                                                </Button>
                                            </label>
                                        </div>                                   </Box>
                                </TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell align='left'>
                                    <div style={{ width: '100%' }}>
                                        <Button type="submit" variant="contained" color="warning" onClick={initilizeTeam} >
                                            Αρχικοποιηση
                                        </Button>
                                    </div>
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

