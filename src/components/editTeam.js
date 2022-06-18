import React, {
    useState, useEffect, useContext
} from 'react';
import _ from 'lodash';
import {
     Typography, Card, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Button, Select, MenuItem, FormControl, InputLabel, Paper, Popover, Modal
} from '@mui/material';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import InfoRoundedIcon from '@mui/icons-material/InfoRounded';
import { contextOptions } from '../../pages/class/[name]';
import showNotification from '../../Lib/notification'
import { Popconfirm } from 'antd';
import { DataGrid } from '@mui/x-data-grid';


//TODO 1 Να μην πατιέται το κουμπί αρχικοποίηση εάν δεν έχει οριστεί όνομα άσκησης

const Input = styled('input')({
    display: 'none',
});
const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '60vw',
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
};
const columns = [
    { field: 'id', minWidth: 20, flex: 1 },
    { field: 'team', flex: 1 },
    { field: 'lab', minWidth: 50, flex: 1 },
    { field: 'github', minWidth: 150, flex: 1},
    { field: 'am', minWidth: 50, flex: 1, editable: true },
    { field: 'firstname', minWidth: 80, flex: 1, editable: true },
    { field: 'lastname', minWidth: 80, flex: 1, editable: true },
];


export default function EditTeam() {



    const [rows, setRows] = React.useState([]);




    const context = useContext(contextOptions);
    const [anchorEl, setAnchorEl] = React.useState(null);
    const [editedTeam, setEditedTeam] = useState(false)
    const [csvfiles, setCsvFiles] = useState({ csv: [] });
    const supervisor = context.supervisor;
    const organization = context.organization;
    const teams = context.teams
    const setTeams = context.setTeams


    
    const [selectionModel, setSelectionModel] = useState([]);
    const [openModal, setOpenModal] = useState(false);

    const [githubInsert, setGithubInsert] = useState('');
    const [amInsert, setAmInsert] = useState('');
    const [firstNameInsert, setFirstNameInsert] = useState('');
    const [lastNameInsert, setLastNameInsert] = useState('');

    const handleOpen = () => setOpenModal(true);
    const handleClose = () => setOpenModal(false);





    const handleGithubInsert = (event) => {
        setGithubInsert(event.target.value);
    };
    const handleAmInsert = (event) => {
        setAmInsert(event.target.value);
    };
    const handleFirstNameInsert = (event) => {
        setFirstNameInsert(event.target.value);
    };

    const handleLastNameInsert = (event) => {
        setLastNameInsert(event.target.value);
    };




    const handlePopoverOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handlePopoverClose = () => {
        setAnchorEl(null);
    };

    const open = Boolean(anchorEl);


    //Κάνουμε update στις πληροφορίες κάποιου φοιτητή
    const handleEditRow = async (row) => {
        const res = await fetch('/api/editTeamRow', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                team: row,
                lab: organization
            })
        });

        const data = await res.json()
        if (data.success) {
            showNotification(
                'success',
                'Επιτυχής ανανέωση ομάδας',
            );
        } else {
            showNotification(
                'error',
                'Ανεπιτυχής ανανέωση ομάδας',
                'Συνέβη κάποιο σφάλμα, επικοινωνήστε με τον διαχειριστή.',
            );
        }

    }

    //Καλούμε ένα api για να διαγράψουμε έναν φοιτητή απο την ομάδα

    const deleteRow = async (id) => {
        console.log(id)
        const res = await fetch('/api/deleteTeamRows', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                teamRows: id,
            })
        });
        const data = await res.json()
        if (data.success) {
            showNotification(
                'success',
                'Επιτυχής ανανέωση ομάδας',
            );
            setRows((prevState) => prevState.filter((row) => !id.includes(row.id)))

        } else {
            showNotification(
                'error',
                'Ανεπιτυχής ανανέωση ομάδας',
                'Συνέβη κάποιο σφάλμα, επικοινωνήστε με τον διαχειριστή.',
            );
        }

    }

    //Καλούμε ένα api για να κάνουμε delete την ομάδα 

    const deleteTeam = async () => {
        
        if (editedTeam) {


            const res = await fetch('/api/deleteTeam', {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    team: editedTeam,
                    lab: organization,

                })
            });
            const data = await res.json()
            if (data.success) {
                showNotification(
                    'success',
                    'Επιτυχής διαγραφή ομάδας ομάδας',
                );
                setTeams([...teams].filter((team)=>team.teamName!=editedTeam))
                setEditedTeam(null)

            } else {
                showNotification(
                    'error',
                    'Ανεπιτυχής ανανέωση ομάδας',
                    'Συνέβη κάποιο σφάλμα, επικοινωνήστε με τον διαχειριστή.',
                );
            }
        }else{
            showNotification(
                'warning',
                'Ανεπιτυχής διαγραφή ομάδας',
                'Πρέπει να επιλεχθεί ομάδα.',
            );
        }

    }

    //Καλούμε ένα api για να κάνουμε insert στην ομάδα έναν νέο φοιτητή

    const addTeamRow = async () => {
        const res = await fetch('/api/addTeamRow', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                editedTeam,
                githubInsert,
                amInsert,
                firstNameInsert,
                lastNameInsert,
                lab: organization,
            })
        });
        const data = await res.json()
        setGithubInsert('')
        setAmInsert('')
        setFirstNameInsert('')
        setLastNameInsert('')
        if (data.success) {
            console.log(data)
            showNotification(
                'success',
                'Επιτυχής εισαγωγή εγγραφής στην ομάδας',
            );
            setRows([...rows, {
                id: data.data.team_member_id,
                team: editedTeam,
                lab: organization,
                github: data.data.member_github_name,
                am: data.data.am,
                firstname: data.data.first_name,
                lastname: data.data.last_name
            }])

        } else {
            showNotification(
                'error',
                'Ανεπιτυχής εισαγωγή εγγραφής στην ομάδας',
                'Συνέβη κάποιο σφάλμα, επικοινωνήστε με τον διαχειριστή.',
            );
        }

    }
    
    const handleInfoChange = async () => {
        //Φέρνουμε τα στοιχεία για  τις ομάδες από την βάση
        const res = await fetch('/api/getTeamInfo', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                team: editedTeam,
                lab: organization
            })
        });
        const data = await res.json()
        if (data.success) {
            if (data.data) {
                //Δηλώνουμε ως state τα δεδομένα που πήραμε από το api
                setRows(() => {
                    return data.data.map((member) => {
                        return {
                            id: member.team_member_id,
                            team: member.team_name,
                            lab: member.lesson,
                            github: member.member_github_name,
                            am: member.am,
                            firstname: member.first_name,
                            lastname: member.last_name
                        }
                    })
                })
            } else {
                setRows([]);
            }
        } else {
            setRows([]);
        }



    }
    useEffect(() => {
        if (editedTeam) {
            handleInfoChange()
        }
    }, [editedTeam])



    //Κάνουμε πλήρη ανανέωση κάνοντας overide στην προηγούμενη ομάδα.
    const initilizeTeam = async () => {
        if (editedTeam && csvfiles.csv.length > 0) {

            const formData = new FormData();
            formData.append(
                'formData', //key
                JSON.stringify({ team: editedTeam, supervisor: supervisor, organization: organization }) //value
            );
            for (let i = 0; i < csvfiles.csv.length; i++) {
                formData.append("file", csvfiles.csv[i]);
            }


            const res = await fetch('/api/reInitializeTeam', {
                method: 'POST',
                body: formData,

            });

            const data = await res.json();

            if (data.success) {
                setRows(() => {
                    return data.data.map((member) => {
                        return {
                            id: member.team_member_id,
                            team: member.team_name,
                            lab: organization,
                            github: member.member_github_name,
                            am: member.am,
                            firstname: member.first_name,
                            lastname: member.last_name
                        }
                    })
                })
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


    const handleEditedTeam = (event) => {
        setEditedTeam(event.target.value);
    };
    const handleTestFileChange = (event) => {
        let files = event.target.files
        setTestFiles({ testfiles: files });
    };


    const handleCsvFileChange = (event) => {
        let files = event.target.files
        setCsvFiles({ csv: files });
    };






    return (
        <>

            <Card style={{ minWidth: '70vw', marginLeft: '2%' }}>
                <div style={{ widht: '100%', display: 'flex', justifyContent: 'center' }}> <p style={{ fontWeight: 'bold', fontSize: '17px' }}>Επεξεργασία Ομάδας</p></div>
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
                                        <FormControl sx={{ m: 1, minWidth: 220 }}>
                                            <InputLabel id="demo-simple-select-helper-label">Όνομα ομάδας</InputLabel>
                                            <Select
                                                style={{ minWidth: '250px' }}
                                                labelId="demo-simple-select-label"
                                                id="demo-simple-select"
                                                value={editedTeam}
                                                label="Όνομα ομάδας"
                                                onChange={handleEditedTeam}
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
                                            <Typography sx={{ p: 1 }}>Στην περίπτωση που δωθεί νέο CSV, θα κάνει overwrite στην υπάρχουσα ομάδα. Το csv αρχείο πρέπει να  περιέχει τo όνομα
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
                                        <Button style={{ minWidth: 220 }} type="submit" variant="contained" color="warning" onClick={initilizeTeam} >
                                            Ανανέωση
                                        </Button>
                                    </div>
                                </TableCell>
                                <TableCell>

                                </TableCell>

                            </TableRow>
                            <TableRow>
                                <TableCell align='left'>
                                    <Popconfirm
                                        title={'Είστε σίγουρος ότι θέλετε να διαγράψετε την ομάδα'}
                                        onConfirm={deleteTeam}
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

                {editedTeam && <>
                    <Modal
                        keepMounted
                        open={openModal}
                        onClose={handleClose}
                    >
                        <Box sx={style}>
                            <TableContainer component={Paper}>
                                <Table sx={{ minWidth: 650 }} aria-label="caption table">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell><h2>Github</h2></TableCell>
                                            <TableCell><h2>ΑΜ</h2></TableCell>
                                            <TableCell><h2>Όνομα</h2></TableCell>
                                            <TableCell><h2>Επώνυμο</h2></TableCell>

                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        <TableRow>
                                            <TableCell>
                                                <TextField size="small" value={githubInsert} label="Github" variant="outlined" onChange={handleGithubInsert} />
                                            </TableCell>
                                            <TableCell>
                                                <TextField size="small" value={amInsert} label="ΑΜ" variant="outlined" onChange={handleAmInsert} />
                                            </TableCell>
                                            <TableCell>
                                                <TextField size="small" value={firstNameInsert} label="Όνομα" variant="outlined" onChange={handleFirstNameInsert} />
                                            </TableCell>
                                            <TableCell>
                                                <TextField size="small" value={lastNameInsert} label="Επώνυμο" variant="outlined" onChange={handleLastNameInsert} />
                                            </TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>

                            </TableContainer>
                            <div style={{ marginTop: '6%', width: '100%', display: 'flex', justifyContent: 'center' }}>
                                <Button style={{ backgroundColor: "#1976d2" }} variant="contained" onClick={() => {
                                    addTeamRow();
                                    handleClose();
                                }}>Εισαγωγή</Button>

                            </div>



                        </Box>
                    </Modal>
                    <div style={{ width: '100%' }}>

                        <Box sx={{ height: '50vh', bgcolor: 'background.paper' }}>
                            <DataGrid onRowEditStop={(params, event) => {
                                handleEditRow(params.row)
                            }}
                                experimentalFeatures={{ newEditingApi: true }}
                                editMode='row'
                                hideFooter
                                rows={rows}
                                columns={columns}
                                checkboxSelection
                                disableSelectionOnClick
                                onSelectionModelChange={(newSelectionModel) => {
                                    setSelectionModel(newSelectionModel);
                                }}
                                selectionModel={selectionModel}
                            />

                        </Box>
                        <Button onClick={() => { deleteRow(selectionModel) }} style={{ marginRight: '1%', marginLeft: '1%' }} variant="contained" color="error">
                            Διαγραφη
                        </Button>
                        <Button variant="contained" onClick={handleOpen}>
                            Εισαγωγη
                        </Button>
                    </div>

                </>}
            </Card>
        </>

    )
}

