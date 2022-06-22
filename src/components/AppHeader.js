import {
  React, useState, useContext, useEffect,
} from 'react';
import _ from 'lodash';
import { useRouter } from 'next/router';
import { Box, Typography, Button, Toolbar, AppBar } from '@mui/material';
import showNotification from '../../Lib/notification';
import { MyContext } from '../../pages/_app';


export default function AppHeader() {
  const router = useRouter();
  const context = useContext(MyContext)

  const supervisor= context.supervisor
  const setSupervisor= context.setSupervisor

  const handleClick = async () => {
    router.push('/classhome')
  }

  const logout = async (event) => {
    const res = await fetch('/api/auth/logout', {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    });
    const data = await res.json();

    if (data.success) {
      setSupervisor(false)
      showNotification(
        'success',
        'Eπιτυχής αποσύνδεση',
      );
    } else {
      showNotification(
        'error',
        'Προέκυψε κάποιο σφάλμα'
      );
    }
    router.push('/')
  }

  // const handleCookie = async () => {
  //   const res = await fetch('/api/authenticateUser', {
  //     method: 'GET',
  //     headers: {
  //       Accept: 'application/json',
  //       'Content-Type': 'application/json',
  //     },
  //   });
  //   const data = await res.json()
  //   console.log(data)
  //   if (data.sucess) {
  //     setSupervisor(data.supervisor)
  //   }
  // }
  

  return (
    <>

      <div sx={{ flexGrow: 1 }}>
        <AppBar sx={{ backgroundColor: 'rgb(255, 255, 255)', position: "static" }} style={{ height: 95 }}>
          <Toolbar style={{ alignItems: 'center', height: 95 }} onClick={handleClick}>
            <Typography
              type="title"
              color="inherit"
              style={{ borderRight: '0.1em solid black', padding: '0.5em' }}
            >
              <img
                src="/img/logo4.png"
                alt="logo"
                style={{ height: 50, paddingRight: 5, paddingLeft: 5, }}
              />
            </Typography>
            <Typography variant="h6" sx={{ flexGrow: 1, }}>
              <Button
                style={{ textTransform: 'none', textDecoration: 'none', color: "black" }}

              >
                <h4>{'Ενα εργαλείο διαχείρισης εκπαιδευτικών εργασιών'}</h4>
              </Button>
            </Typography>
            <Button
              color="inherit"
              aria-controls="simple-menu"
              aria-haspopup="true"
              style={{ textTransform: 'none' }}
            >

            </Button>
            {supervisor && <><Button variant='contained' color="warning" stlye={{ minWidth: 150 }} onClick={logout}> Αποσυνδεση </Button> </>}
          </Toolbar>
        </AppBar>
      </div>

    </>
  );
}