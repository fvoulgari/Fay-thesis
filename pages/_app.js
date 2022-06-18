import React, { createContext, useEffect, useState } from 'react';
import Head from 'next/head';
import 'antd/dist/antd.css';
//import { ThemeProvider, createMuiTheme } from '@material-ui/core/styles';
//import CssBaseline from '@material-ui/core/CssBaseline';
import AppHeader from '../src/components/AppHeader';
import AppFooter from '../src/components/AppFooter';
import '../styles/globals.css'





export const MyContext = createContext();

function MyApp(props) {
  
  const { Component, pageProps, router } = props;
  const [supervisor , setSupervisor]  = useState(false)
  const [bool , setBool]  = useState(true)

  useEffect(() => {
    try {
      const fetchName = async () => {
        try {
          const resp = await fetch('/api/authenticateUser', {
            method: 'GET',
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json',
            },
          });
          const data = await resp.json()
          console.log(data)
          if (data.sucess) {
            setSupervisor(data.supervisor)
          }
        } catch (err) {
          console.log(err);
        }
      };
      if(bool){
        setBool(false)
        fetchName();
        setBool(true)
        console.log('fetct')

      }
    } catch (err) {
      console.log(err);
    }
  },[]);


  return (
    <>
      <Head>
        <title>Thesis :: Classroom with git</title>
        <link rel="shortcut icon" href="/static/Favicon.ico" />
        <meta name="viewport" content="minimum-scale=1, initial-scale=1, width=device-width" />
      </Head>
       {/*  <ThemeProvider theme={theme}>
       <CssBaseline />
       */}
          <MyContext.Provider
            value={{
              supervisor: supervisor,
              setSupervisor: setSupervisor
            }}
          >
               <AppHeader   />
              <div style={{ minHeight: '80.5vh' }}>
                <Component {...pageProps} />
              </div> 
             <AppFooter />
          </MyContext.Provider>
        {/*</></ThemeProvider>*/}
    </>
  );
}


export default MyApp
