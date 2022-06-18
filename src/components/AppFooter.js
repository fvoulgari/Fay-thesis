import React, { useContext } from 'react';
import Image from 'next/image';

import {
  Grid, Box, Typography, Link,
} from '@mui/material';


export default function AppFooter() {
  return (
    <>
    
    <footer>
      <Box sx={{   
          bgcolor: 'rgb(255, 255, 255)',
          maxWidth	: '100%',
          left: 0,
          bottom: 0,
          width: '100%',
          position: "relative",
          height: '13vh',
          minHeight: 100
          }} >
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