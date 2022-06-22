import React, {
    useState, useEffect, createContext
} from 'react';
import { useRouter } from 'next/router';
import _ from 'lodash';
import EditExercise from '../../src/components/editExercise'
import CreateExercise from '../../src/components/createExercise';
import CreateTeam from '../../src/components/createTeam';
import EditTeam from '../../src/components/editTeam';
import EditLab from '../../src/components/editLab';
import {
    Container, Breadcrumbs, emphasize, Typography, TableCell, tableCellClasses, Chip
} from '@mui/material';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import Divider from '@mui/material/Divider';
import ListItem from '@mui/material/ListItem';
import Stats from '../../src/components/stats';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import EditIcon from '@mui/icons-material/Edit';
import AddBoxIcon from '@mui/icons-material/AddBox';
import HomeIcon from '@mui/icons-material/Home';
import InsightsIcon from '@mui/icons-material/Insights';
import { getTeams, getAppCookies, checkClass, getRepos, getGithubInfo, getCoSupervisors, getExerciseInfo, getTotals, getUsers } from '../../Lib/dao';
import { styled } from '@mui/material/styles';
import HomeClass from '../../src/components/home';
import { Button } from 'antd';



//Δημιουργούμε context έτσι ώστε να μπορούμε να μοιραστούμε state, μεταβλητές και συναρτήσεις με imported components
export const contextOptions = createContext();


const drawerWidth = 240;

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

export default function Class({ exerciseInfo, totals,users, name, teamsProps, repos, githubInfo, supervisor, coSupervisors }) {
    const router = useRouter();
    const [containerContent, setContainerContent] = useState('home') // Αρχική προβολή σελίδα με στατιστικά
    const [expanded, setExpanded] = React.useState(false);
    const [templateRepo, setTemplateRepo] = useState(null);
    const [exercises, setExercises] = useState(repos);
    const [orgnizationSupervisors, setOrgnizationSupervisors] = useState(coSupervisors)
    const [selectStats, setSelectStats] = useState('Tests');
    const [teams, setTeams] = useState(teamsProps)
    const [repo, setRepo] = useState([]);
    const [files, setFiles] = useState([{ files: [] }]);
    const [testfiles, setTestFiles] = useState({ testfiles: [] });
    const [csvfiles, setCsvFiles] = useState({ csv: [] });
    const [isLoading, setIsLoading] = React.useState(true);
    const [exercisesDB, setExercisesDB] = useState(null);
    const [max, setMax] = useState(0);



    //Φέρνουμε τα στατιστικά απο τις ασκήσεις
    const getStats = async () => {
        const res = await fetch('/api/getStats', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                organization: name,
            })
        })

        const data = await res.json();

        if (data.success) {
            setExercisesDB(data.exercises)
            setMax(data.max)
        }
        setIsLoading(false)
    }

    useEffect(() => {
        try {
            getStats()

        } catch (error) {
            console.log(error)
        }
    }, [])


    const handleChange = (panel) => (event, isExpanded) => {
        setExpanded(isExpanded ? panel : false);
    };




    const handleHome = async (event) => {
        setContainerContent('home')
    }
    const handleCreateTeam = async (event) => {
        setContainerContent('createTeam')
    }
    const handleEditExercise = async (event) => {
        setContainerContent('editExercise')
    }
    const handleClick = async (event) => {
        setContainerContent('createExercise')
    }
    const handleClickStats = async (event) => {
        setContainerContent('stats')
    }
    const handleEditTeam = async (event) => {
        setContainerContent('editTeam')
    }
    const handleEditLab = async (event) => {
        setContainerContent('editLab')
    }







    return (
        <>
            {/*Δηλώνουμε ποιες μεταβλητές και συναρτήσεις να δηλωθούν ως context ώστε να μπορούν να γίνουν imported στα components */}
            <contextOptions.Provider
                value={{
                    templateRepoContext: { templateRepo, setTemplateRepo },
                    repoContext: { repo, setRepo },
                    filesContext: { files, setFiles },
                    testfilesContext: { testfiles, setTestFiles },
                    csvfilesContext: { csvfiles, setCsvFiles },
                    organization: name,
                    supervisor: supervisor,
                    github: githubInfo,
                    exercises,
                    exerciseInfo,
                    setExercises,
                    max,
                    users,
                    isLoading,
                    setSelectStats: setSelectStats,
                    type: selectStats,
                    setType: setSelectStats,
                    exercisesDB,
                    teams: teams,
                    totals,
                    setTeams: setTeams,
                    orgnizationSupervisors: orgnizationSupervisors,
                    setOrgnizationSupervisors: setOrgnizationSupervisors
                }}
            >
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
                            deleteIcon={<ExpandMoreIcon />}

                        />
                    </Breadcrumbs>
                </div>
                <div style={{ marginBottom: '4%', marginLeft: '4%', marginRight: '4%', display: 'flex', justifyContent: 'center', backgroundColor: "white" }}>

                    <Box sx={{ display: 'flex' }}>

                        <Drawer
                            sx={{
                                width: drawerWidth,
                                '& .MuiDrawer-paper': {
                                    width: drawerWidth,
                                    boxSizing: 'border-box',
                                    position: "relative"
                                },
                            }}
                            variant="permanent"
                            anchor="left"
                        >
                            <Toolbar ><Button onClick={handleHome} style={{ width: '100%', borderRadius: 20, display: 'flex', justifyContent: 'center', fontWeight: 'bold', fontSize: '15px' }}>Home</Button>  </Toolbar>

                            <Divider />
                            <Accordion expanded={expanded === 'panel3'} onChange={handleChange('panel3')}>
                                <AccordionSummary
                                    expandIcon={<ExpandMoreIcon />}
                                    aria-controls="panel1bh-content"
                                    id="panel1bh-header"
                                >
                                    <Typography sx={{ width: '33%', flexShrink: 0, fontWeight: 'bold' }}>
                                        Εργαστήριο
                                    </Typography>
                                </AccordionSummary>
                                <AccordionDetails>
                                    <List sx={{ padding: '0', margin: 0 }}>
                                        <ListItem disablePadding>
                                            <ListItemButton onClick={handleClickStats}>
                                                <ListItemIcon>
                                                    <InsightsIcon />
                                                </ListItemIcon>
                                                <ListItemText primary={'Dashboard'} />
                                            </ListItemButton>
                                        </ListItem>
                                        <ListItem disablePadding>
                                            <ListItemButton onClick={handleEditLab}>
                                                <ListItemIcon>
                                                    <EditIcon />
                                                </ListItemIcon>
                                                <ListItemText primary={'Επεξεργασία'} />
                                            </ListItemButton>
                                        </ListItem>

                                    </List>
                                </AccordionDetails>
                            </Accordion>
                            <Accordion expanded={expanded === 'panel1'} onChange={handleChange('panel1')}>
                                <AccordionSummary
                                    expandIcon={<ExpandMoreIcon />}
                                    aria-controls="panel1bh-content"
                                    id="panel1bh-header"
                                >
                                    <Typography sx={{ width: '33%', flexShrink: 0, fontWeight: 'bold' }}>
                                        Ασκήσεις
                                    </Typography>
                                </AccordionSummary>
                                <AccordionDetails>
                                    <List sx={{ padding: '0', margin: 0 }}>
                                        <ListItem disablePadding>
                                            <ListItemButton onClick={handleClick}>
                                                <ListItemIcon>
                                                    {<AddBoxIcon />}
                                                </ListItemIcon>
                                                <ListItemText primary={'Δημιουργία'} />
                                            </ListItemButton>
                                        </ListItem>

                                        <Divider />
                                        <ListItem disablePadding>
                                            <ListItemButton onClick={handleEditExercise}>
                                                <ListItemIcon>
                                                    {<EditIcon />}
                                                </ListItemIcon>
                                                <ListItemText primary={'Επεξεργασία '} />
                                            </ListItemButton>
                                        </ListItem>
                                        <Divider />

                                    </List>
                                </AccordionDetails>
                            </Accordion>
                            <Accordion expanded={expanded === 'panel2'} onChange={handleChange('panel2')}>
                                <AccordionSummary
                                    expandIcon={<ExpandMoreIcon />}
                                    aria-controls="panel1bh-content"
                                    id="panel1bh-header"
                                >
                                    <Typography sx={{ width: '33%', flexShrink: 0, fontWeight: 'bold' }}>
                                        Ομάδες
                                    </Typography>
                                </AccordionSummary>
                                <AccordionDetails>
                                    <List sx={{ padding: '0', margin: 0 }}>
                                        <ListItem disablePadding>
                                            <ListItemButton onClick={handleCreateTeam}>
                                                <ListItemIcon>
                                                    {<AddBoxIcon />}
                                                </ListItemIcon>
                                                <ListItemText primary={'Δημιουργία '} />
                                            </ListItemButton>
                                        </ListItem>
                                        <Divider />
                                        <ListItem disablePadding>
                                            <ListItemButton onClick={handleEditTeam} >
                                                <ListItemIcon>
                                                    {<EditIcon />}
                                                </ListItemIcon>
                                                <ListItemText primary={'Επεξεργασία '} />
                                            </ListItemButton>
                                        </ListItem>
                                        <Divider />


                                    </List>
                                </AccordionDetails>
                            </Accordion>
                        </Drawer>
                    </Box>


                    <Container maxWidth="xl" style={{ paddingTop: '3%', marginBottom: '2%', padding: '3%', minHeight: '80vh' }}>

                        {/*Καλούμε την CreateExercise και δίνουμε ως prop το classname */}

                        {containerContent == 'createExercise' && <CreateExercise classname={name} />
                        }
                        {/*Καλούμε την EditExercise και δίνουμε ως prop τα repos */}

                        {containerContent == 'editExercise' && <EditExercise repos={repos} />}

                        {containerContent == 'createTeam' && <CreateTeam />}

                        {containerContent == 'editTeam' && <EditTeam />}

                        {containerContent == 'editLab' && <EditLab />}

                        {containerContent == 'stats' && <Stats />}

                        {containerContent == 'home' && <HomeClass />}


                    </Container>
                </div>
            </contextOptions.Provider>
        </>
    )
}


export async function getServerSideProps(context) {
    const name = context.params.name;
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
    //Ελέγχουμε αν ο χρήστης έχει πρόσβαση στο μάθημα
    const valid = await checkClass(cookies.supervisor.githubname, name)
    if (!valid) {
        return {
            redirect: {
                destination: '/classhome',
                permanent: false,
            },
        };
    }
    const teamRows = await getTeams(name)
    const teams = teamRows.map((team) => {
        return {

            teamName: team.team_name,
            supervisor: team.team_supervisor

        }
    })
    const template = await getRepos(name);
    const repos = [];
    const githubInfo = await getGithubInfo(name)
    const exerciseInfo = await getExerciseInfo(name)
    const totals = await getTotals(name)
    const users = await getUsers(name)

    const coSupervisors = await getCoSupervisors(name);

    for (let temp of template) {
        if (temp.isTemplate) repos.push(temp.name)
    }

    return {
        props: {
            name: name,
            teamsProps: teams,
            repos,
            exerciseInfo,
            totals,
            users,
            githubInfo: githubInfo,
            supervisor: cookies.supervisor,
            coSupervisors: coSupervisors

        }
    }
}

