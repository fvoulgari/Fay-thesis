import React, {
  useState, useEffect, useContext, useMemo,
} from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  Button,
  TextField,
  Container,
  Typography,
  Card,
  Box,
  Select,
  MenuItem,
  FormControl,
  InputLabel 
} from '@mui/material';
import showNotification from '../Lib/notification'
import configShow from '../Lib/dao'

export default function Test() {
  const [templateRepo, setTemplateRepo] = React.useState('');
  const router = useRouter();
  const [repo, setRepo] = useState([]);
  const signIn = async () => {

    const res = await fetch('/api/test', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    });

    const data = await res.json();

    if (res.status === 200 && data.success && data.token) {
      console.log('here');
      await router.push('user/dashboard');

    }
    else {
      showNotification(
        'error',
        'Σφάλμα πρόσβασης',
        'Μη αποδεκτά συνθηματικά. Παρακαλούμε επαναλάβετε.'
      );
    }
  }


  const handleRepo = (event) => {
    setRepo(event.target.value);
  };

  const handletemplateRepo= (event) => {
    setTemplateRepo(event.target.value);
  };




  return (
    <>
      <Container maxWidth="md" style={{ display: 'flex', justifyContent: 'center', marginBottom: '2%', marginTop: '2%', padding: '3%' }}>
        <Card >
          <div style={{ padding: '5%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-around', width: '100%' }}>

              <Typography variant="h6" style={{ marginBottom: '5%' }} >
                Δηλώστε το όνομα του repository που θα αρχικοποιηθεί.
              </Typography>
            </div>
            <form method="POST" action="javascript:void(0);" >
              <Box style={{ display: 'flex', minWidth:'350px' , width: '100%', justifyContent: 'center', marginBottom: '5%' }}>
              <FormControl sx={{ m: 1, minWidth: 120 }}>
              <InputLabel id="demo-simple-select-helper-label">Template Repositories</InputLabel>

                <Select
                 style={{  minWidth:'250px'}}
                  labelId="demo-simple-select-label"
                  id="demo-simple-select"
                  value={templateRepo}
                  label="Template Repositories"
                  onChange={handletemplateRepo}
                >
                  <MenuItem value={10}>Ten</MenuItem>
                  <MenuItem value={20}>Twenty</MenuItem>
                  <MenuItem value={30}>Thirty</MenuItem>
                </Select>
                </FormControl>

              </Box>
              <div style={{ display: 'flex', justifyContent: 'center', width: '100%', marginBottom: '5%' }}>
                <Button type="submit" variant="contained" color="primary" onClick={signIn}>
                  Αρχικοποιήση
                </Button>
              </div>
              <Box style={{ display: 'flex', width: '100%', justifyContent: 'center', marginBottom: '5%' }}>
                <TextField size="small" label="Repository Name" variant="outlined" type="text" onChange={handleRepo} />
              </Box>

              <div style={{ display: 'flex', justifyContent: 'center', width: '100%', marginBottom: '5%' }}>
                <Button type="submit" variant="contained" color="primary" onClick={signIn}>
                  Αρχικοποιήση
                </Button>
              </div>

            </form>


          </div>
        </Card>
      </Container>
    </>
  )
}


export async function getServerSideProps(context) {
  const KEY = process.env.JWT_KEY;
  return {
    props: {},
  }
}

