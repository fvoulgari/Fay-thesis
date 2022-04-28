import {
    React, useState, useContext, useEffect,
  } from 'react';
 
  import { Box,Typography,Button,Toolbar,AppBar } from '@mui/material';
 
  
  export default function AppHeader() {
   


    return (
      <>
      
          <div sx={{      flexGrow: 1        }}>
            <AppBar sx={{    backgroundColor: '#85b09c', position: "static"}} style={{ height: 95 }}>
              <Toolbar style={{ alignItems: 'center', height: 95 }}>
                <Typography
                  type="title"
                  color="inherit"
                  style={{ borderRight: '0.1em solid white', padding: '0.5em' }}
                >
                  <img
                    src="/img/uop.png"
                    alt="logo"
                    style={{ height: 50, paddingRight: 5, paddingLeft: 5 }}
                  />
                </Typography>
                <Typography variant="h6" sx={{      flexGrow: 1, }}>
                  <Button
                    style={{ textTransform: 'none', textDecoration: 'none', color: 'white' }}
                    color="inherit"
                  >
                    <h4>{'Ενα εργαλείο διαχείρησης εκπαιδευτικών εργασιών'}</h4>
                  </Button>
                </Typography>
                <Button
                  color="inherit"
                  aria-controls="simple-menu"
                  aria-haspopup="true"
                  style={{ textTransform: 'none' }}
                > 
                  
                </Button>
              </Toolbar>
            </AppBar>
          </div>

      </>
    );
  }