import React, { useContext } from 'react';
import Image from 'next/image';

import {
  Grid, Box, Typography, Link,
} from '@mui/material';
import moment from 'moment';


export default function AppFooter() {
  return (
    <>
    
    <footer>
      <Box sx={{   
          bgcolor: '#85b09c',
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
          
          
        </Grid>
      </Box>
    </footer>
    
    </>
  );
}