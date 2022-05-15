import * as React from 'react';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import { useRouter } from 'next/router';
import CssBaseline from '@mui/material/CssBaseline';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import InboxIcon from '@mui/icons-material/MoveToInbox';
import MailIcon from '@mui/icons-material/Mail';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import EditIcon from '@mui/icons-material/Edit';
import AddBoxIcon from '@mui/icons-material/AddBox';
import InsightsIcon from '@mui/icons-material/Insights';
import ScienceIcon from '@mui/icons-material/Science';

const drawerWidth = 240;

export default function PermanentDrawerLeft({ name }) {
  const router = useRouter();

  const [expanded, setExpanded] = React.useState(false);
  const handleChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  const handleClick = async (event) => {
    router.push('/test')

  }


  return (
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
        <Toolbar ><span style={{ width: '100%', display: 'flex', justifyContent: 'center', fontWeight: 'bold', fontSize: '15px' }}>{name}</span> </Toolbar>

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
                <ListItemButton>
                  <ListItemIcon>
                    <InsightsIcon />
                  </ListItemIcon>
                  <ListItemText primary={'Στατιστικά'} />
                </ListItemButton>
              </ListItem>
              <ListItem disablePadding>
                <ListItemButton>
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
                <ListItemButton>
                  <ListItemIcon>
                    {<EditIcon />}
                  </ListItemIcon>
                  <ListItemText primary={'Επεξεργασία '} />
                </ListItemButton>
              </ListItem>
              <Divider />
              <ListItem disablePadding>
                <ListItemButton onClick={handleClick}>
                  <ListItemIcon>
                    {<AddBoxIcon />}
                  </ListItemIcon>
                  <ListItemText primary={'Δημιουργία '} />
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
                <ListItemButton>
                  <ListItemIcon>
                    {<EditIcon />}
                  </ListItemIcon>
                  <ListItemText primary={'Επεξεργασία '} />
                </ListItemButton>
              </ListItem>
              <Divider />
              <ListItem disablePadding>
                <ListItemButton onClick={handleClick}>
                  <ListItemIcon>
                    {<AddBoxIcon />}
                  </ListItemIcon>
                  <ListItemText primary={'Δημιουργία '} />
                </ListItemButton>
              </ListItem>
              <Divider />

            </List>
          </AccordionDetails>
        </Accordion>
      </Drawer>
    </Box>
  );
}