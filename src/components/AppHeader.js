import {
    React, useState, useContext, useEffect,
  } from 'react';
  //import router from 'next/router';
  // eslint-disable-next-line import/no-extraneous-dependencies
  import { Box,Typography,Button,Toolbar,AppBar } from '@mui/material';
  // eslint-disable-next-line import/no-cycle
  //import { MyContext } from '../../pages/_app';
  

  
  export default function AppHeader() {
   


    return (
      <>
      
          <div sx={{      flexGrow: 1        }}>
            <AppBar sx={{    bgColor: '#194b8c', position: "static"}} style={{ height: 95 }}>
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
                    <h4>{'Αναζήτηση στην Δημοσιότητα ΓΕΜΗ'}</h4>
                  </Button>
                </Typography>
                <Button
                  color="inherit"
                  aria-controls="simple-menu"
                  aria-haspopup="true"
                  style={{ textTransform: 'none' }}
                >
                    <Box display="flex" justifyItems="center" textAlign="center">
                      {'Ελληνικά'}
                    </Box>
                    <Box display="flex" justifyItems="center" textAlign="center">
                      {'English'}
                    </Box>
                  
                    <Box display="flex" justifyItems="center" textAlign="center">
                      {'Français'}
                    </Box>
               
                    <Box display="flex" justifyItems="center" textAlign="center">
                      {'Deutsch'}
                    </Box>
                 
                    <Box display="flex" justifyItems="center" textAlign="center">
                      {'Italiano'}
                    </Box>
                  
                </Button>
              </Toolbar>
            </AppBar>
          </div>

      </>
    );
  }