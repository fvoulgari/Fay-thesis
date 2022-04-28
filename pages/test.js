import React, {
  useState, useEffect, useContext, useMemo,
} from 'react';
import { getTemplates } from '../Lib/dao';
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

export default function Test({repos}) {
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
      body: JSON.stringify({ name: repo }),
    });

    const data = await res.json();

    if (res.status === 200 && data.success && data.token) {
      console.log('here');

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
                Δημιουργήστε αποθετήρια
              </Typography>
            </div>
            <form method="POST" action="javascript:void(0);" >
              <Box style={{ display: 'flex', minWidth:'350px' , width: '100%', justifyContent: 'center',  }}>
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
                  {repos.map((repo)=> {
                    return (<MenuItem value={repo}> {repo} </MenuItem>)
                  })}
                  
                </Select>
                </FormControl>

              </Box>
              <div style={{ display: 'flex', justifyContent: 'center', width: '100%', marginBottom: '8%' }}>
                <Button type="submit" variant="contained" color="primary" onClick={signIn}>
                  Επιλογη
                </Button>
              </div>
              <Box style={{ display: 'flex', width: '100%', justifyContent: 'center', marginBottom: '5%' }}>
                <TextField size="small" label="Repository Name" variant="outlined" type="text" onChange={handleRepo} />
              </Box>

              <div style={{ display: 'flex', justifyContent: 'center', width: '100%', marginBottom: '5%' }}>
                <Button type="submit" variant="contained" color="primary" onClick={signIn}>
                  Αρχικοποιηση
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

  const template =  await getTemplates();
  const repos = [];
  for(let temp of template ){
      if(temp.isTemplate) repos.push(temp.name)
  }
  return {
    props: { repos },
  }
}

