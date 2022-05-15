import {
    React, useState, useContext, useEffect,
  } from 'react';
  import { useRouter } from 'next/router'; 
  import { Box,Typography,Button,Toolbar,AppBar } from '@mui/material';
 
  
  export default function AppHeader() {
    const router = useRouter();

    const handleClick = async () => {
      router.push('/classhome')
    }


    return (
      <>
      
          <div sx={{      flexGrow: 1        }}>
            <AppBar sx={{    backgroundColor: 'rgb(255, 255, 255)', position: "static"}} style={{ height: 95 }}>
              <Toolbar style={{ alignItems: 'center', height: 95 }}    onClick={handleClick}>
                <Typography
                  type="title"
                  color="inherit"
                  style={{ borderRight: '0.1em solid black', padding: '0.5em' }}
                >
                  <img
                    src="/img/logoUOP.png"
                    alt="logo"
                    style={{ height: 50, paddingRight: 5, paddingLeft: 5,   }}
                  />
                </Typography>
                <Typography variant="h6" sx={{      flexGrow: 1, }}>
                  <Button
                    style={{ textTransform: 'none', textDecoration: 'none' ,color: "black"}}
                    
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