import React, {
    useState, useEffect,
} from 'react';
import { useRouter } from 'next/router';
import _ from 'lodash';
// import { getActiveOrganizations } from '../Lib/dao';
import {
    Button, TextField, Container, Typography, Card, Box, Avatar, Select, CardHeader, MenuItem, FormControl, InputLabel, Table, IconButton, List, ListItem, ListItemAvatar, TableBody, TableCell, tableCellClasses, TableContainer, TableHead, TableRow, Paper, FormControlLabel, Breadcrumbs, Chip, emphasize, ListItemText
} from '@mui/material';

import { styled } from '@mui/material/styles';
import GitHubIcon from '@mui/icons-material/GitHub';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import moment from 'moment';
import CheckBoxRoundedIcon from '@mui/icons-material/CheckBoxRounded';
import ReportGmailerrorredRoundedIcon from '@mui/icons-material/ReportGmailerrorredRounded';
import CircularProgress from '@mui/material/CircularProgress';
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';
import HomeIcon from '@mui/icons-material/Home';
import { getStudentsInfo } from '../../../Lib/dao';
import { Popconfirm } from 'antd';
import showNotification from '../../../Lib/notification';
const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
    PaperProps: {
        style: {
            maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
            width: 250,
        },
    },
};
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

const StyledTableCell = styled(TableCell)(({ theme }) => ({
    [`&.${tableCellClasses.head}`]: {
        backgroundColor: theme.palette.common.black,
        color: theme.palette.common.white,
    },
    [`&.${tableCellClasses.body}`]: {
        fontSize: 14,
    },
}));



export default function Class({ name, team, lab, students }) {
    const router = useRouter();

    const arr = []
    for (let i = 0; i <= 10; i += 0.1) {
        arr.push(Math.round(i * 10) / 10
        )
    }
    const [grade, setGrade] = useState({ students: students.map((student) => student.grade) })
    const [comment, setComment] = useState({ comments: students.map((student) => student.comment) })

    const handleComment = (event,index) => {
        setComment((prevState) => {
            var newState = [...prevState.comments]
            newState[index] = event.target.value
            return { comments: newState }

        })
    }
    const handleGrade = (event, index) => {
        setGrade((prevState) => {
            var newState = [...prevState.students]
            newState[index] = event.target.value
            return { students: newState }

        })
    }

       
    //Καλούμε api για να κάνουμε update στα σχόλια και την βαθμολογία του εκάστοτε φοιτητή

    const handleSaveGrade = async (grade, member,index) => {
        if(typeof grade == 'number'){
            const res = await fetch('/api/saveGrade', {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    organization: name,
                    exercise: lab,
                    teamMember: member,
                    grade: grade,
                    comment: comment.comments[index]
                })
            });
            const data = await res.json( )
            if (data.success) {
                showNotification(
                    'success',
                    'Επιτυχής εγγραφή πληροφοριών',
                );
            } else {
                showNotification(
                    'error',
                    'Ανεπιτυχής εγγραφή πληροφοριών',
                );
            }
        }else{
            showNotification(
                'warning',
                'Παρακαλώ συμπληρώστε  βαθμολογία πριν την αποθήκευση ',
            );
        }
      


    };
    //Καλούμε api για να γίνει export to csv
    const csvExport = async () => {
        fetch('/api/exportCSV', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                organization: name,
                exercise: lab,
                team: team,
            })
        }).then(res => {
			return res.blob();
		}).then(blob => {
			const href = window.URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.download ='Content-lab.csv';
			a.href = href;
            a.type= "text/plain;charset=utf-8"
			a.click();
		});

    };

    //Καλούμε api για να γίνει export to similarity check

    const similarityExport = async () => {
        const data= fetch('/api/similarityExport', {
            method: 'GET'
        }).then(res => {
			return res.blob();
		}).then(blob => {
			const href = window.URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.download ='similarity.html';
			a.href = href;
            a.type= "text/plain;charset=utf-8"
			a.click();

		});

    };

    const handleText = (workflow) => {
        var succesffulTests = 0;
        var totalTests = 0;
        if (workflow.length == 0) {
            return 0
        } else {
            for (let tempWorkFlow in workflow) {
                const check = workflow[tempWorkFlow].filter((item) => {
                    return item.value.includes('success')
                })
                if (check.length > 0) succesffulTests += 1

            }
            if (Object.keys(workflow).length == 0) return '0 Tests'
            return `${succesffulTests}/${Object.keys(workflow).length} Tests`
        }
    }
    const handleWorkflow = (workflow) => {
        var succesffulTests = 0;
        var totalTests = 0;
        if (workflow.length == 0) {
            return 0
        } else {
            for (let tempWorkFlow in workflow) {
                const check = workflow[tempWorkFlow].filter((item) => {
                    return item.value.includes('success')
                })
                if (check.length > 0) succesffulTests += 1

            }
            if (Object.keys(workflow).length == 0) return 100
            if (succesffulTests == 0) return 3
            return succesffulTests / Object.keys(workflow).length * 100
        }
    }

    function getColor(workflow) {
        var succesffulTests = 0;
        var totalTests = 0;
        if (workflow.length == 0) {
            return 'error'
        } else {
            for (let tempWorkFlow in workflow) {
                const check = workflow[tempWorkFlow].filter((item) => {
                    return item.value.includes('success')
                })
                if (check.length > 0) succesffulTests += 1

            }

        }
        if (Object.keys(workflow).length == 0) return 'warning'

        if ((succesffulTests / Object.keys(workflow).length) * 100 < 35) return 'error'
        if ((succesffulTests / Object.keys(workflow).length * 100) >= 35 && succesffulTests / Object.keys(workflow).length * 100 < 70) return 'warning'
        return 'success'

    }

    return (
        <>
            <div style={{ marginTop: '2%', marginLeft: '4%', marginBottom: '1%' }} role="presentation">
                <Breadcrumbs aria-label="breadcrumb">
                    <StyledBreadcrumb
                        component="a"
                        label="Classhome"
                        onClick={() => { router.push('/classhome') }}
                        icon={<HomeIcon fontSize="small" />}
                    />
                    <StyledBreadcrumb
                        label={name}
                        onClick={() => { router.push(`/class/${name}`) }}

                    />
                    <StyledBreadcrumb
                        label={lab}

                    />
                </Breadcrumbs>
            </div>



            <div style={{ marginLeft: '4%', marginRight: '4%', marginBottom: '4%', display: 'flex', justifyContent: 'center', backgroundColor: "white" }}>
                <Container maxWidth="xl" style={{ paddingTop: '3%', marginBottom: '2%', padding: '3%' }}>
                    <div style={{ marginLeft: '4%', marginRight: '4%', maringBottom: '4%', display: 'flex', justifyContent: 'center' }}>

                        <h2 style={{ color: 'black', borderRight: '0.1em solid black ' }}> {name}  &nbsp; </h2>
                        <h2 style={{ marginLeft: '1%', color: 'black', borderRight: '0.1em solid black' }}> {lab}&nbsp;</h2>

                        <h2 style={{ marginLeft: '1%', color: 'black' }}> {team}</h2>
                    </div>
                    <Card style={{ minWidth: '72vw', marginLeft: '2%' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', margin: '2%', width: '100%', float: 'right' }}>
                            
                            
                            <Button style={{ minWidth: 200 }} onClick={csvExport} type="submit" variant="contained" color="success" >
                                Εξαγωγη αρχειου CSV
                            </Button>
                        </div>
                      

                        <TableContainer component={Paper}>
                            <Table sx={{ minWidth: '70vw' }} aria-label="caption table">
                                <TableHead>
                                    <TableRow>
                                        <TableCell align='center'>
                                            <span style={{ fontWeight: 'bold' }}>  Όνομα</span>
                                        </TableCell>
                                        <TableCell align='center'>
                                            <span style={{ fontWeight: 'bold' }}>  Commits</span>
                                        </TableCell>
                                        <TableCell align='center'>
                                            <span style={{ fontWeight: 'bold' }}>  Τests</span>
                                        </TableCell>
                                        <TableCell align='center'>
                                            <span style={{ fontWeight: 'bold' }}> Ημ/νία τελευταίου commit</span>
                                        </TableCell>
                                        <TableCell align='center'>
                                            <span style={{ fontWeight: 'bold' }}> Βαθμός άσκησης </span>
                                        </TableCell>
                                        <TableCell align='center'>
                                            <span style={{ fontWeight: 'bold' }}> Σχόλια</span>
                                        </TableCell>
                                        <TableCell align='center'>
                                            <span style={{ fontWeight: 'bold' }}>M.O. ασκήσεων</span>
                                        </TableCell>
                                        <TableCell align='center'>
                                        </TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {students.map((row, index) => (
                                        <TableRow key={row.team_member_id}>
                                            <StyledTableCell scope="row" style={{ maxWidth: '200px' }} >
                                                <List dense={true} style={{ maxWidth: '200px' }}>
                                                    <ListItem
                                                        secondaryAction={
                                                            <a href={`https://github.com/${row.org}/${row.member_github_name}-${row.name}/`} target="_blank" >
                                                                <GitHubIcon fontSize='medium' />
                                                            </a>
                                                        }
                                                    >
                                                        <ListItemText
                                                            primary={row.first_name + ' ' + row.last_name} style={{textAlign: 'center'}}
                                                        />
                                                    </ListItem>
                                                </List>

                                            </StyledTableCell>

                                            <TableCell key={row.commits}>
                                                <span style={{ width: '100%', fontSize: 15, fontWeight: 'bold', display: 'flex', justifyContent: 'center' }}>{row.commits}</span>
                                            </TableCell>
                                            <TableCell key={row.commits + row.team_member_id}>
                                                <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                                                <List dense={true} style={{ maxWidth: '200px' }}>
                                                { Object.keys(row.workflow).map((key)=>{ console.log(row.workflow); console.log([...row.workflow[key].map( (work)=>work.value[0])]); return <>
                                                    <ListItem
                                                        secondaryAction={
                                                            <>
                                                                {[...row.workflow[key].map( (work)=>work.value[0])].includes('success')? <CheckBoxRoundedIcon color="success" fontSize='medium'/>: <ReportGmailerrorredRoundedIcon color="error" fontSize='medium'/>}

                                                            </>
                                                            
                                                        
                                                        }
                                                    >
                                                        <ListItemText
                                                            primary={row.workflow[key][0].value[1]} style={{fontWeight: 'bold'}}
                                                        />
                                                    </ListItem>
                                                
                                                
                                                </>}) } 
                                                   
                                                </List>
{/* 
                                                    <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                                                        <CircularProgress
                                                            variant="determinate"
                                                            thickness={5}
                                                            //Περνάμε το ποσοστό των επιτυχημένων task σε κλίμακα 0-100 ως value τόσο στην getColor για να πάρουμε το σωστό χρώμα, όσο και ως value
                                                            color={getColor(row.workflow)}
                                                            size="7em" value={handleWorkflow(row.workflow)} />
                                                        <Box
                                                            sx={{
                                                                top: 0,
                                                                left: 0,
                                                                bottom: 0,
                                                                right: 0,
                                                                position: 'absolute',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                            }}
                                                        >
                                                            <Typography variant="caption" component="div" color="text.secondary" style={{ fontWeight: 'bold' }}>
                                                                {handleText(row.workflow)}
                                                            </Typography>
                                                        </Box>
                                                    </Box> */}
                                                </div>
                                            </TableCell>
                                            <TableCell key={row.commitTime}>
                                                <span style={{ width: '100%', display: 'flex', justifyContent: 'center', color: moment(row.commitTime).isAfter(moment(row.end_date)) ? 'red' : 'black' }}>{moment(row.commitTime).isAfter(moment(row.end_date, '')) ? <PriorityHighIcon fontSize="small" color="error" /> : ''} {row.commitTime}  </span>
                                            </TableCell>
                                            <TableCell key={row.commitTime + 'id'}>
                                                <div style={{ width: '100%' }}>


                                                    <FormControl sx={{ m: 1, minWidth: 170 }}>
                                                        <InputLabel id="demo-simple-select-helper-label">Βαθμός άσκησης</InputLabel>
                                                        <Select
                                                            style={{ Width: '125px', float: 'right', height: ' 50px' }}
                                                            labelId="demo-simple-select-label"
                                                            id="demo-simple-select"
                                                            value={grade.students[index]}
                                                            label="Βαθμός άσκησης"
                                                            MenuProps={MenuProps}
                                                            onChange={(event) => handleGrade(event, index)}
                                                        >
                                                            {arr.map((temp) => {
                                                                return (<MenuItem value={temp} key={temp}> {temp} </MenuItem>)
                                                            })}

                                                        </Select>

                                                    </FormControl>
                                                 

                                                </div>
                                            </TableCell>

                                            <TableCell key={row.openIssues}>
                                                <TextField value={comment.comments[index]} label="Σχόλιο" variant="outlined" type="text" onChange={ (event)=>handleComment(event,index)} />
                                            </TableCell>
                                            <TableCell>
                                                <span style={{ fontWeight: 'bold', width: '100%', display: 'flex', justifyContent: 'center', textAlign:'center'}}> {row.averageGrade.length > 0 ? _.mean(row.averageGrade.map((grade) => grade.grade).filter((item) => {
                                                    if (item) return true
                                                    return false
                                                })) : ''}  {row.averageGrade.length > 0 ? `(${row.averageGrade.map((grade) => grade.grade).filter((item) => {
                                                    if (item) return true
                                                    return false
                                                }).length} / ${row.averageGrade.length}  Ασκήσεις)` : 'Δεν υπάρχουν βαθμολογημένες ασκήσεις'}</span>
                                            </TableCell>
                                                <TableCell>
                                                <Popconfirm
                                                        title={'Είστε σίγουρος ότι θέλετε να αλλάξετε τις πληροφορίες του φοιτητή'}
                                                        onConfirm={() => {
                                                            handleSaveGrade(grade.students[index], row.member_github_name,index)
                                                        }}
                                                        okText={'Ναι'}
                                                        cancelText={'Οχι'}

                                                    >
                                                        <IconButton style={{ marginTop: '4%' }} >
                                                            <SaveIcon color='warning' fontSize="large" > </SaveIcon>

                                                        </IconButton>
                                                    </Popconfirm>
                                                </TableCell>

                                        </TableRow>
                                    ))}

                                </TableBody>
                            </Table>
                            <div style={{ margin: '2%', width: '100%' }}>
                            
                            
                            <Button style={{ minWidth: 200 }} onClick={similarityExport} type="submit" variant="contained" color="error" >
                                ελεγχος ομοιοτητας 
                            </Button>
                        </div>

                        </TableContainer>
                    </Card>
                </Container>
            </div>

        </>
    )
}


export async function getServerSideProps(context) {

    const name = context.query.name;
    const team = context.query.team
    const lab = context.query.lab

    const students = await getStudentsInfo(name, team, lab)
    return {
        props: {
            name: name,
            team: team,
            lab: lab,
            students,
        }
    }
}

