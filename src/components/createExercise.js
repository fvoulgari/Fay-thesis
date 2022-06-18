import React, {
    useState, useContext
} from 'react';
import _ from 'lodash';
import {
    Container, Typography, Card, Table, TableBody, TableCell, TableContainer, TableRow, TextField, Button, Select, MenuItem, FormControl, InputLabel, Paper, Popover
} from '@mui/material';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import InfoRoundedIcon from '@mui/icons-material/InfoRounded';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import { contextOptions } from '../../pages/class/[name]';
import showNotification from '../../Lib/notification'


//TODO 1 Να μην πατιέται το κουμπί αρχικοποίηση εάν δεν έχει οριστεί όνομα άσκησης

const Input = styled('input')({
    display: 'none',
});

export default function CreateExercise({ classname }) {

    const context = useContext(contextOptions);
    const files = context.filesContext.files
    const setFiles = context.filesContext.setFiles
    const teams = context.teams
    const testfiles = context.testfilesContext.testfiles;
    const setTestFiles = context.testfilesContext.setTestFiles;
    const [anchorEl, setAnchorEl] = React.useState(null);
    const [selectedTeam, setSelectedTeam] = useState('');
    const [anchorEl2, setAnchorEl2] = React.useState(null);
    const [anchorEl3, setAnchorEl3] = React.useState(null);
    const exercises = context.exercises
    const setExercises = context.setExercises

    const supervisor = context.supervisor
    const [repo, setRepo] = useState([]);
    const [value, setValue] = useState(null);



    const handlePopoverOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handlePopoverClose = () => {
        setAnchorEl(null);
    };
    const handleSelectedTeam = (event) => {
        setSelectedTeam(event.target.value);
    };

    const open = Boolean(anchorEl);

    const handlePopoverOpen2 = (event) => {
        setAnchorEl2(event.currentTarget);
    };

    const handlePopoverClose2 = () => {
        setAnchorEl2(null);
    };

    const open2 = Boolean(anchorEl2);

    const handlePopoverOpen3 = (event) => {
        setAnchorEl3(event.currentTarget);
    };

    const handlePopoverClose3 = () => {
        setAnchorEl3(null);
    };

    const open3 = Boolean(anchorEl3);
    //Καλούμε ένα api για να αρχικοποιήσουμε καινούργια άσκηση
    const InitializeRepository = async () => {
        if (repo && selectedTeam && (files.files.length > 0 || testfiles.testfiles.length > 0)) {
            const formData = new FormData();
            formData.append(
                'formData',
                JSON.stringify({ name: repo, classname: classname, team: selectedTeam, supervisor: supervisor.githubname, endDate: value ? value.format('YYYY-MM-DD') : '' })
            );
            for (let i = 0; i < files.files.length; i++) {
                formData.append("file", files.files[i]);
            }
            for (let j = 0; j < testfiles.testfiles.length; j++) {
                formData.append("testFile", testfiles.testfiles[j]);
            }

            const res = await fetch('/api/initializeExercise', {
                method: 'POST',
                body: formData,
            });

            const data = await res.json();
            if (data.success) {
                setExercises([...exercises, data.data])
                showNotification(
                    'success',
                    'Eπιτυχής αρχικοποίηση εργασίας',
                );
            } else {
                showNotification(
                    'error',
                    'Ανεπιτυχής αρχικοποίηση εργασίας',
                );
            }
        } else {
            showNotification(
                'warning',
                'Ανεπιτυχής αρχικοποίηση εργασίας',
                'Δεν έχουν επιλεχθεί όλα τα πεδία.',
            );
        }

    }


    const handleFileChange = (event) => {
        let files = event.target.files
        setFiles({ files: files });
    };
    const handleTestFileChange = (event) => {
        let files = event.target.files
        setTestFiles({ testfiles: files });
    };


    const handleRepo = (event) => {
        setRepo(event.target.value);
    };







    return (
        <>


            <Card style={{ minWidth: '70vw', marginLeft: '2%' }}>

                <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                    <p style={{ fontWeight: 'bold', fontSize: '17px' }}>Αρχικοποίηση άσκησης</p>
                </div>

                <TableContainer component={Paper}>
                    <Table sx={{ minWidth: '70vw' }} aria-label="caption table">

                        <TableBody>
                            <TableRow>
                                <TableCell>
                                    <Box >
                                        <p style={{ fontWeight: 'bold', fontSize: '17px' }}>Όνομα άσκησης</p>

                                    </Box>
                                </TableCell>
                                <TableCell align='right'>
                                    <Box >
                                        <TextField size="small" style={{ minWidth: '260px' }} label="Όνομα άσκησης" variant="outlined" type="text" onChange={handleRepo} />
                                    </Box>
                                </TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>
                                    <Box style={{ display: 'flex', verticalAlign: 'middle' }} >
                                        <InfoRoundedIcon onMouseEnter={handlePopoverOpen3}
                                            onMouseLeave={handlePopoverClose3}
                                            color="warning" />
                                        <Popover
                                            id="mouse-over-popover"
                                            sx={{
                                                pointerEvents: 'none',
                                            }}
                                            open={open3}
                                            anchorEl={anchorEl3}
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
                                            onClose={handlePopoverClose3}
                                            disableRestoreFocus

                                        >
                                            <Typography sx={{ p: 1 }}>Για τους φοιτητές που ανήκουν στην επιλεγμένη ομάδα θα αρχικοποιήθεί ένα repository στο github
                                                το οποίο θα περιέχει τα αρχεία και την εκφώνηση της άσκησης
                                            </Typography>
                                        </Popover>
                                        <span style={{ fontWeight: 'bold', fontSize: '17px' }}>Επιλογή ομάδας φοιτητών</span>
                                    </Box>

                                </TableCell>
                                <TableCell align='right'>
                                    <Box >
                                        <FormControl sx={{ m: 1, minWidth: 220 }}>
                                            <InputLabel id="demo-simple-select-helper-label"> Ομάδα</InputLabel>
                                            <Select
                                                style={{ minWidth: '250px' }}
                                                labelId="demo-simple-select-label"
                                                id="demo-simple-select"
                                                value={selectedTeam}
                                                label="Oμάδα"
                                                onChange={handleSelectedTeam}
                                            >

                                                {teams && teams.map((team) => {
                                                    return (<MenuItem value={team.teamName} key={team.teamName}> {team.teamName} </MenuItem>)
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
                                            <Typography sx={{ p: 1 }}>Χρειάζεται να δωθούν τα αρχεία τα οποία θα περιέχει η άσκηση, τα tests μέσω των οποίων θα γίνεται ο αυτόματος έλεγχος
                                                και η εκφώνηση σε μορφή .md
                                            </Typography>
                                        </Popover>
                                        <span style={{ fontWeight: 'bold', fontSize: '17px' }}>Αρχικοποιήση αρχείων</span>
                                    </Box>

                                </TableCell>
                                <TableCell align='right'>
                                    <Box >
                                        <div style={{ width: '100%' }}>
                                            <label htmlFor="contained-button-file">
                                                <Input id="contained-button-file" multiple type="file" onChange={handleFileChange} />
                                                <Button type="submit" color="primary" variant="contained" component="span" style={{ minWidth: 220 }}>
                                                    Επιλογη αρχειων
                                                </Button>
                                            </label>
                                        </div>                                                </Box>
                                </TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>
                                    <Box style={{ display: 'flex', verticalAlign: 'middle' }} >
                                        <InfoRoundedIcon onMouseEnter={handlePopoverOpen2}
                                            onMouseLeave={handlePopoverClose2}
                                            color="warning" />
                                        <Popover
                                            id="mouse-over-popover"
                                            anchorOrigin={{
                                                vertical: 'bottom',
                                                horizontal: 'left',
                                            }}
                                            transformOrigin={{
                                                vertical: 'top',
                                                horizontal: 'left',
                                            }}
                                            sx={{
                                                pointerEvents: 'none',
                                            }}
                                            open={open2}
                                            anchorEl={anchorEl2}

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
                                            <Typography sx={{ p: 1 }}>Χρείαζεται να δωθεί ένα αρχείο .yml το οποίο θα αρχικοποιεί το workflow που διαθέτει το GitHub </Typography>
                                        </Popover>
                                        <span style={{ fontWeight: 'bold', fontSize: '17px' }}>Αρχικοποίηση github CI/CD</span>
                                    </Box>

                                </TableCell>
                                <TableCell align='right'>
                                    <Box >
                                        <div style={{ width: '100%' }}>
                                            <label htmlFor="contained-test-button-file">
                                                <Input id="contained-test-button-file" multiple type="file" onChange={handleTestFileChange} />
                                                <Button type="submit" color="primary" variant="contained" component="span" style={{ minWidth: 220 }}>
                                                    Επιλογη αρχειων yml
                                                </Button>
                                            </label>
                                        </div>                                            </Box>
                                </TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell component="th" scope="row">
                                    <span style={{ fontWeight: 'bold', fontSize: '17px' }}>Ημερομηνία προθεσμίας</span>
                                </TableCell>
                                <TableCell align="right" component="th" scope="row">
                                    <LocalizationProvider dateAdapter={AdapterMoment}>
                                        <DatePicker
                                            label="Basic example"
                                            value={value}
                                            disablePast
                                            onChange={(newValue) => {
                                                setValue(newValue);
                                            }}
                                            renderInput={(params) => <TextField {...params} />}
                                        />
                                    </LocalizationProvider>
                                </TableCell>
                            </TableRow>



                        </TableBody>
                    </Table>
                    <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                        <Button style={{ marginTop: '2%', marginBottom: '2%' }} type="submit" variant="contained" color="warning" onClick={InitializeRepository} >
                            Αρχικοποιηση
                        </Button>
                    </div>
                </TableContainer>
            </Card>

            <Container maxWidth="lg" style={{ display: 'flex', justifyContent: 'center', paddingTop: '6%', marginBottom: '2%', padding: '3%' }}>

                {/* Αριστερή Κάρτα - Δημιουργία και αρχικοποίηση template repository */}
                {/* <Card style={{ minWidth: '450px', paddingTop: '3%', marginRight: '2%' }}>
                                <div>


                                    <form method="POST" action="javascript:void(0);" style={{ minWidth: '550px', width: '100%', justifyContent: 'center' }} >
                                        <div style={{ display: 'flex', justifyContent: 'center', width: '100%', marginBottom: '5%' }}>
                                            <Box >
                                                <TextField size="small" label="Repository Name" variant="outlined" type="text" onChange={handleRepo} style={{ marginRight: '2%' }} />
                                            </Box>

                                        </div> */}
                {/* <div style={{ display: 'flex', justifyContent: 'center', width: '100%', marginBottom: '2%' }}>
                                            <label htmlFor="contained-button-file">
                                                <Input id="contained-button-file" multiple type="file" onChange={handleFileChange} />
                                                <Button type="submit" color="primary" variant="contained" component="span" style={{ marginRight: '4%', minWidth: 220 }}>
                                                    Επιλογη αρχειων
                                                </Button>
                                            </label>
                                        </div> */}

                {/* <div style={{ display: 'flex', justifyContent: 'center', width: '100%', marginBottom: '5%' }}>
                                            <label htmlFor="contained-test-button-file">
                                                <Input id="contained-test-button-file" multiple type="file" onChange={handleTestFileChange} />
                                                <Button type="submit" color="primary" variant="contained" component="span" style={{ marginRight: '4%', minWidth: 220 }}>
                                                    Επιλογη αρχειων yml
                                                </Button>
                                            </label>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'center', width: '100%', marginBottom: '8%' }}>
                                            <Button type="submit" variant="contained" color="warning" onClick={InitializeRepository} >
                                                Αρχικοποιηση
                                            </Button>
                                        </div>


                                    </form>


                                </div>
                            </Card> */}
                {/* Δεξιά Κάρτα - Δημιουργία και αρχικοποίηση  repositories φοιτητών */}

            </Container>

        </>

    )
}

