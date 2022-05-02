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
import { styled } from '@mui/material/styles';
import showNotification from '../Lib/notification'
import configShow from '../Lib/dao'


const Input = styled('input')({
  display: 'none',
});

export default function Test({ repos }) {
  const [templateRepo, setTemplateRepo] = React.useState('');
  const router = useRouter();
  const [repo, setRepo] = useState([]);
  const [files, setFiles] = useState({ files: [] });
  const [testfiles, setTestFiles] = useState({ testfiles: [] });
  const [csvfiles, setCsvFiles] = useState({ csv: [] });

  const InitializeRepository = async () => {

    const formData = new FormData(); formData.append(
      'formData',
      JSON.stringify({ name: repo })
    );
    for (let i = 0; i < files.files.length; i++) {
      formData.append("file", files.files[i]);
    }
    for (let j = 0; j < testfiles.testfiles.length; j++) {
      formData.append("testFile", testfiles.testfiles[j]);
    }

    const res = await fetch('/api/test', {
      method: 'POST',
      body: formData,
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




  const InitializeStudentsRepository = async () => {
  if(templateRepo){

  
    const formData = new FormData(); formData.append(
      'formData',
      JSON.stringify({ name: templateRepo })
    );
    for (let i = 0; i < csvfiles.csv.length; i++) {
      formData.append("file", csvfiles.csv[i]);
    }
  

    const res = await fetch('/api/test', {
      method: 'POST',
      body: formData,
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
  }else{
    showNotification(
      'error',
      'Σφάλμα Αρχικοποιήσης',
      'Δεν έχει επιλεχθεί template repository.'
    );
  }
}










  const handleFileChange = (event) => {
    let files = event.target.files
    setFiles({ files: files });
  };

  const handleTestFileChange = (event) => {
    let files = event.target.files
    setTestFiles({ testfiles: files });
  };

  const handleCsvFileChange = (event) => {
    let files = event.target.files
    setCsvFiles({ csv: files });
  };

  const handleRepo = (event) => {
    setRepo(event.target.value);
  };
 

  const handletemplateRepo = (event) => {
    setTemplateRepo(event.target.value);
  };


  useEffect(() => {
    console.log(files)

    console.log(testfiles)
  }, [files,testfiles]);


  return (
    <>
      <Container maxWidth="lg" style={{ display: 'flex', justifyContent: 'center', marginBottom: '2%', marginTop: '2%', padding: '3%' }}>
        <Card style={{ minWidth: '700px' }}>
          <div style={{ padding: '5%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-around', width: '100%' }}>

              <Typography variant="h6" style={{ marginBottom: '5%' }} >
                Δημιουργήστε αποθετήρια
              </Typography>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'center', width: '100%', marginBottom: '8%' }}>
                <label htmlFor="contained-test-button-file">
                  <Input id="contained-test-button-file" accept=".csv"  type="file" onChange={handleCsvFileChange} />
                  <Button type="submit" color="primary" variant="contained" component="span" style={{ marginRight: '4%', minWidth: 220 }}>
                    CSV μαθητων
                  </Button>
                </label>
              </div>

            <form method="POST" action="javascript:void(0);" style={{ minWidth: '550px', width: '100%', justifyContent: 'center', }} >
              <Box style={{ display: 'flex', minWidth: '550px', width: '100%', justifyContent: 'center', }}>
                <FormControl sx={{ m: 1, minWidth: 220 }}>
                  <InputLabel id="demo-simple-select-helper-label">Template Repositories</InputLabel>

                  <Select
                    style={{ minWidth: '250px' }}
                    labelId="demo-simple-select-label"
                    id="demo-simple-select"
                    value={templateRepo}
                    label="Template Repositories"
                    onChange={handletemplateRepo}
                  >
                    {repos.map((repo) => {
                      return (<MenuItem value={repo}> {repo} </MenuItem>)
                    })}

                  </Select>


                </FormControl>

              </Box>
              <div style={{ display: 'flex', justifyContent: 'center', width: '100%', marginBottom: '8%' }}>
                <Button type="submit" variant="contained" color="primary" onClick={InitializeStudentsRepository}>
                  Επιλογη
                </Button>
              </div>


              <div style={{ display: 'flex', justifyContent: 'center', width: '100%', marginBottom: '8%' }}>
                <label htmlFor="contained-button-file">
                  <Input id="contained-button-file" multiple type="file" onChange={handleFileChange} />
                  <Button type="submit" color="primary" variant="contained" component="span" style={{ marginRight: '4%', minWidth: 220 }}>
                    Επιλογη αρχειου
                  </Button>
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'center', width: '100%', marginBottom: '8%' }}>
                <label htmlFor="contained-test-button-file">
                  <Input id="contained-test-button-file" multiple type="file" onChange={handleTestFileChange} />
                  <Button type="submit" color="primary" variant="contained" component="span" style={{ marginRight: '4%', minWidth: 220 }}>
                    Επιλογη αρχειου test
                  </Button>
                </label>
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', width: '100%', marginBottom: '5%' }}>
                <Box >
                  <TextField size="small" label="Repository Name" variant="outlined" type="text" onChange={handleRepo} style={{ marginRight: '2%' }} />
                </Box>
                <Button type="submit" variant="contained" color="primary" onClick={InitializeRepository} >
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

  const template = await getTemplates();
  const repos = [];
  for (let temp of template) {
    if (temp.isTemplate) repos.push(temp.name)
  }
  return {
    props: { repos },
  }
}

