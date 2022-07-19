import React, {
    useState, useEffect, useContext
} from 'react';
import _ from 'lodash';
import {
    Typography, Card, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, ListItemAvatar, ListItem, List, Button, Select, MenuItem, FormControl, InputLabel, Paper, IconButton, Popover
} from '@mui/material';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import ListItemText from '@mui/material/ListItemText';
import InfoRoundedIcon from '@mui/icons-material/InfoRounded';
import GitHubIcon from '@mui/icons-material/GitHub';
import DeleteIcon from '@mui/icons-material/Delete';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import { contextOptions } from '../../pages/class/[name]';
import { Popconfirm } from 'antd';
import showNotification from '../../Lib/notification';


const Input = styled('input')({
    display: 'none',
});

export default function EditExercise({ repos }) {
    //Αρχικοποιούμε το context που κάναμε import
    const context = useContext(contextOptions);
    const files = context.filesContext.files
    const setFiles = context.filesContext.setFiles
    const testfiles = context.testfilesContext.testfiles;
    const setTestFiles = context.testfilesContext.setTestFiles;
    const [githubFiles, setGithubFiles] = useState([]);
    const [anchorEl, setAnchorEl] = React.useState(null);
    const [anchorEl2, setAnchorEl2] = React.useState(null);
    const [anchorEl3, setAnchorEl3] = React.useState(null);
    const [anchorEl4, setAnchorEl4] = React.useState(null);
    const templateRepo = context.templateRepoContext.templateRepo
    const setTemplateRepo = context.templateRepoContext.setTemplateRepo
    const lesson = context.organization;
    const github = context.github
    const exercises = context.exercises


    const handlePopoverOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handlePopoverClose = () => {
        setAnchorEl(null);
    };

    const open = Boolean(anchorEl);

    const handlePopoverOpen2 = (event) => {
        setAnchorEl2(event.currentTarget);
    };

    const handlePopoverClose2 = () => {
        setAnchorEl2(null);
    };


    const handlePopoverOpen3 = (event) => {
        setAnchorEl3(event.currentTarget);
    };

    const handlePopoverClose3 = () => {
        setAnchorEl3(null);
    };

    const handlePopoverOpen4 = (event) => {
        setAnchorEl4(event.currentTarget);
    };

    const handlePopoverClose4 = () => {
        setAnchorEl4(null);
    };
    const open2 = Boolean(anchorEl2);

    const open3 = Boolean(anchorEl3);

    const open4 = Boolean(anchorEl4);

    const handleFileChange = (event) => {
        let files = event.target.files
        setFiles({ files: files });
    };

    const handleTestFileChange = (event) => {
        let files = event.target.files
        setTestFiles({ testfiles: files });
    };



    // Καλούμε ένα api για να κάνουμε update στην άσκηση

    const updateStudentsRepository = async () => {

        if (templateRepo && (!(_(testfiles.testfiles).isEmpty()) || !_(files.files).isEmpty())) {

            const formData = new FormData();
            formData.append(
                'formData', //key
                JSON.stringify({ name: templateRepo, lesson: lesson }) //value
            );
            if (files.files) {
                for (let i = 0; i < files.files.length; i++) {
                    formData.append("file", files.files[i]);
                }
            }
            if (testfiles.testfiles) {

                for (let j = 0; j < testfiles.testfiles.length; j++) {
                    formData.append("testFile", testfiles.testfiles[j]);
                }
            }


            const res = await fetch('/api/updateStudentRepo', {
                method: 'POST',
                body: formData,
            });

            const data = await res.json();
            if (data.success) {
                setGithubFiles([...githubFiles, ...data.data])
                showNotification(
                    'success',
                    'Επιτυχής πρόσθεση αρχείων ',
                );

            } else {
                showNotification(
                    'error',
                    'Ανεπιτυχής πρόσθεση αρχείων',
                    'Συνέβη κάποιο σφάλμα, επικοινωνήστε με τον διαχειριστή.',
                );



            }
        }
    }

    // Διαγραφή της άσκησης
    const deleteExercise = async () => {

        if (templateRepo) {
            const res = await fetch('/api/deleteExercise', {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    organization: lesson,
                    exercise: templateRepo,
                })
            });

            const data = await res.json();
            if (data.success) {
                showNotification(
                    'success',
                    'Επιτυχής διαγραφή αρχείων ',
                );
                setGithubFiles([])
                setTemplateRepo(null)


            } else {
                showNotification(
                    'error',
                    'Ανεπιτυχής διαγραφή αρχείων',
                    'Συνέβη κάποιο σφάλμα, επικοινωνήστε με τον διαχειριστή.',
                );


            }
        }
    }








    const handletemplateRepo = (event) => {
        setTemplateRepo(event.target.value);
    };
    //Καλούμε ένα api για να διαγράψουμε ένα αρχείο
    const deleteFile = async (file) => {
        const res = await fetch('/api/deleteFile', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                lesson: lesson,
                templateRepo: templateRepo,
                file: file
            })
        });
        const files = await res.json()
        if (files.success) {
            setGithubFiles([...githubFiles.filter(fileGit => fileGit.sha !== file.sha)])
        }


    }

    const handleInfoChange = async () => {
        //Όταν αλλάζει το templateRepo τότε φέρνουμε όλα τα αρχεία από το github
        const res = await fetch('/api/getRepoInformation', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                lesson: lesson,
                templateRepo: templateRepo
            })
        });
        const files = await res.json()
        if (files.success) {
            setGithubFiles(files.data)
        } else {
            setGithubFiles([])
        }


    }
    useEffect(() => {
        if (templateRepo) {
            handleInfoChange()
        }
    }, [templateRepo])




    return (
        <>

            <Card style={{ minWidth: '70vw', marginLeft: '2%' }}>

                <TableContainer component={Paper}>
                    <Table sx={{ minWidth: '70vw' }} aria-label="caption table">
                        <TableHead>
                            <TableRow>
                                <TableCell
                                    align='left'

                                >
                                    <p style={{ fontWeight: 'bold', fontSize: '20px' }}>Επεξεργασία  άσκησης</p>
                                </TableCell>
                                <TableCell>
                                </TableCell>


                            </TableRow>
                        </TableHead>
                        <TableBody>
                            <TableRow>
                                <TableCell>
                                    <Box >
                                        <p style={{ fontWeight: 'bold', fontSize: '16px' }}>Όνομα άσκησης</p>

                                    </Box>
                                </TableCell>
                                <TableCell align='right'>
                                    <Box >
                                        <FormControl sx={{ m: 1, minWidth: 220 }}>
                                            <InputLabel id="demo-simple-select-helper-label">Όνομα άσκησης</InputLabel>
                                            <Select
                                                style={{ minWidth: '250px' }}
                                                labelId="demo-simple-select-label"
                                                id="demo-simple-select"
                                                value={templateRepo}
                                                label="Όνομα άσκησης"
                                                onChange={handletemplateRepo}
                                            >

                                                {exercises && exercises.map((repo) => {
                                                    return (<MenuItem value={repo} key={repo}> {repo} </MenuItem>)
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
                                            <Typography sx={{ p: 1 }}>Χρειάζεται να δωθούν τα αρχεία τα οποία θα περιέχει η άσκηση,τα tests μέσω των οποίων θα γίνεται ο αυτόματος έλεγχος
                                                και η εκφώνηση σε μορφή .md
                                            </Typography>
                                        </Popover>
                                        <span style={{ fontWeight: 'bold', fontSize: '17px' }}>Προσθήκη αρχείων</span>
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
                                            <Typography sx={{ p: 1 }}>Χρείαζεται να δωθεί ένα αρχείο .yml το οποίο θα αρχικοποιεί τον τρόπο λειτουγίας testing που διαθέτει το GitHub </Typography>
                                        </Popover>
                                        <span style={{ fontWeight: 'bold', fontSize: '17px' }}>Προσθέστε αρχεία για github CI/CD</span>
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
                            <TableRow >
                                <TableCell >
                                </TableCell>
                                <TableCell align='right' >
                                    <Button style={{ minWidth: 220 }} type="submit" variant="contained" color="success" onClick={updateStudentsRepository}>
                                        Προσθηκη αρχειων
                                    </Button>
                                </TableCell>

                            </TableRow>
                            <TableRow >
                                <TableCell  >
                                </TableCell>
                                <TableCell align='right'>
                                    <Popconfirm
                                        title={'Είστε σίγουρος ότι θέλετε να διαγράψετε την άσκηση'}
                                        onConfirm={deleteExercise}
                                        okText={'Ναι'}
                                        cancelText={'Οχι'}

                                    >
                                        <Button style={{ minWidth: 220 }} type="submit" variant="contained" color="error" >
                                            διαγραφη
                                        </Button>
                                    </Popconfirm>
                                </TableCell>
                            </TableRow>

                        </TableBody>
                    </Table>

                </TableContainer>
                <TableContainer style={{ marginTop: '2%' }} component={Paper}>
                    <Table>
                        <TableBody>

                            {!(_(githubFiles).isEmpty()) && <>
                                <TableRow>
                                    <TableCell
                                        align='middle'
                                    >
                                        <List dense={true}>
                                            {/*Αν υπάρχουν githubFiles κάνουμε iteration και κάνουμε render στην σελίδα τα αρχεία*/}
                                            <ListItem>

                                                <ListItemAvatar>
                                                    <a style={{ fontSize: '20px' }} href={`https://github.com/${github.name}/${templateRepo}`} target="_blank">
                                                        <GitHubIcon fontSize='large' />
                                                    </a>
                                                </ListItemAvatar>
                                                <div style={{ verticalAlign: 'middle' }}>
                                                    <span style={{ fontSize: '20px', fontWeight: 'bold' }}>Αρχεία Άσκησης   </span>

                                                </div>
                                            </ListItem>

                                        </List>
                                    </TableCell>
                                    <TableCell align='right'>
                                    </TableCell>

                                </TableRow>
                                {githubFiles.map((file, index) => {
                                    return (<>
                                        <TableRow>
                                            <TableCell style={{ height: '50%' }}>
                                                <List dense={true}>
                                                    <ListItem>
                                                        <ListItemAvatar>
                                                            <InsertDriveFileIcon color="disabled" fontSize='medium' />
                                                        </ListItemAvatar>
                                                        {/*Αν είναι αρχείο CI/CD θα περιέχει στο path το 'workflows' και θα εμφανίσουμε ένα popover όπου δίνει κάποιες πληροφορίες */}
                                                        {file.path.includes('workflows') && <Box style={{ display: 'inline-flex', verticalAlign: 'middle' }} >
                                                            <InfoRoundedIcon onMouseEnter={handlePopoverOpen3}
                                                                onMouseLeave={handlePopoverClose3}
                                                                color="warning" />
                                                            <Popover
                                                                anchorOrigin={{
                                                                    vertical: 'center',
                                                                    horizontal: 'left',
                                                                }}
                                                                transformOrigin={{
                                                                    vertical: 'top',
                                                                    horizontal: 'right',
                                                                }}
                                                                sx={{
                                                                    pointerEvents: 'none',
                                                                }}
                                                                open={open3}
                                                                anchorEl={anchorEl3}

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
                                                                <Typography sx={{ p: 1 }}>To αρχείο αυτό χρησιμοποιείται για την αρχικοποιήση του github CI/CD</Typography>
                                                            </Popover>


                                                        </Box>}
                                                        {/*Αν είναι README θα είναι η εκφώνηση της άσκησης */}

                                                        {file.path.includes('README.md') && <Box style={{ display: 'inline-flex', verticalAlign: 'middle' }} >
                                                            <InfoRoundedIcon onMouseEnter={handlePopoverOpen4}
                                                                onMouseLeave={handlePopoverClose4}
                                                                color="warning" />
                                                            <Popover
                                                                anchorOrigin={{
                                                                    vertical: 'center',
                                                                    horizontal: 'left',
                                                                }}
                                                                transformOrigin={{
                                                                    vertical: 'top',
                                                                    horizontal: 'right',
                                                                }}
                                                                sx={{
                                                                    pointerEvents: 'none',
                                                                }}
                                                                open={open4}
                                                                anchorEl={anchorEl4}

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
                                                                <Typography sx={{ p: 1 }}>To αρχείο αυτό χρησιμοποιείται για την αρχικοποιήση της εκφώνησης της άσκησης</Typography>
                                                            </Popover>


                                                        </Box>}
                                                        <ListItemText
                                                            primaryTypographyProps={{
                                                                sx: {
                                                                    'fontSize': '13px',
                                                                    'fontWeight': 'bold',

                                                                }
                                                            }}
                                                            primary={file.path.split('/').pop()}
                                                        // secondary={secondary ? 'Secondary text' : null}
                                                        />
                                                    </ListItem>

                                                </List>
                                            </TableCell>
                                            <TableCell style={{ height: '50%' }} align='right'>
                                                <IconButton onClick={(event) => deleteFile(file)} edge="end" aria-label="delete">
                                                    <DeleteIcon color="error" fontSize='medium' />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    </>)
                                }
                                )}
                            </>



                            }
                        </TableBody>
                    </Table>

                </TableContainer >
            </Card >

        </>
    )
}

