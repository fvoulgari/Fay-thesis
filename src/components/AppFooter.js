import React, { useContext } from 'react';
import Image from 'next/image';
// import Image from 'material-ui-image'
import {
  Grid, Box, Typography, Link,
} from '@mui/material';
import moment from 'moment';


export default function AppFooter() {
  return (
    <>
    
    <footer>
      <Box sx={{   
          bgcolor: '#194b8c',
          maxWidth	: '100%',
          left: 0,
          bottom: 0,
          width: '100%',
          position: "relative" }} >
        <Grid
          container
          spacing={0}
          direction="column"
          alignItems="center"
          justify="center"
        >
          <Grid item xs={12}>
            <Image src="/img/uop.png" width={90} height={90} />
          </Grid>
          <Grid item xs={12}>
            <a href="https://www.uhc.gr/" style={{ textDecoration: 'none' }} target="_blank" rel="noreferrer">
              <Typography style={{ color: 'white' }}>
                ©&nbsp;
                {`${'ΚΕΝΤΡΙΚΗ ΕΝΩΣΗ ΕΠΙΜΕΛΗΤΗΡΙΩΝ ΕΛΛΑΔΟΣ'} ${moment().format('YYYY')}`}
              </Typography>
            </a>
          </Grid>
          <Grid item xs={12}>
            <Typography style={{ color: 'white' }}>
              Designed & Developed by
              <Link
                style={{ textDecoration: 'none', color: 'white' }}
                target="__blank"
                href="https://www.knowledge.gr/"
              >
&nbsp;Knowledge AE
              </Link>
            </Typography>
          </Grid>
        </Grid>
      </Box>
    </footer>
    
    </>
  );
}