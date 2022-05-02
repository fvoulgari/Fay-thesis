import React, { createContext, useEffect, useState } from 'react';
import Head from 'next/head';
//import { ThemeProvider, createMuiTheme } from '@material-ui/core/styles';
//import CssBaseline from '@material-ui/core/CssBaseline';
import AppHeader from '../src/components/AppHeader';
import AppFooter from '../src/components/AppFooter';
import '../styles/globals.css'





export const MyContext = createContext();

function MyApp(props) {
  
  const { Component, pageProps, router } = props;



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
   
            }}
          >
              <AppHeader  />
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
