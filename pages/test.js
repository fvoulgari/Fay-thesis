import React, {
  useState, useEffect,
} from 'react';
import _ from 'lodash';
import { getRepos } from '../Lib/dao';
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


const Input = styled('input')({
  display: 'none',
});

export default function Test({ repos }) {
  const [templateRepo, setTemplateRepo] = useState(null);
  const [repo, setRepo] = useState([]);
  const [files, setFiles] = useState([{ files: [] }]);
  const [testfiles, setTestFiles] = useState({ testfiles: [] });
  const [csvfiles, setCsvFiles] = useState({ csv: [] });

  const InitializeRepository = async () => {

    const formData = new FormData();
    formData.append(
      'formData',
      JSON.stringify({ name: repo })
    );
    for (let i = 0; i < files.files.length; i++) {
      formData.append("file", files.files[i]);
    }
    for (let j = 0; j < testfiles.testfiles.length; j++) {
      formData.append("testFile", testfiles.testfiles[j]);
    }

    const res = await fetch('/api/initializeTemplate', {
      method: 'POST',
      body: formData,
    });

    const data = await res.json();

  }




  const InitializeStudentsRepository = async () => {


    if (templateRepo && !(_(csvfiles.csv).isEmpty())) {

      // Αρχικοποιούμε ένα FormData object  και του περνάμε το επιλεγμένο templateRepo και τα csv files.
      const formData = new FormData();
      formData.append(
        'formData', //key
        JSON.stringify({ name: templateRepo }) //value
      );
      for (let i = 0; i < csvfiles.csv.length; i++) {
        formData.append("file", csvfiles.csv[i]);
      }


      const res = await fetch('/api/initializeStudentRepos', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
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
    console.log(repo)
    console.log(testfiles)
    console.log(csvfiles)

  }, [files, testfiles, repo, csvfiles]);


  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-around', width: '100%' }}>
        <Typography variant="h4" style={{ marginTop: '7%', color: 'white' }} >
          Δημιουργία & αρχικοποίηση αποθετηρίων
        </Typography>
      </div>
      <Container maxWidth="lg" style={{ display: 'flex', justifyContent: 'center', paddingTop: '6%', marginBottom: '2%', padding: '3%' }}>
        <Card style={{ minWidth: '450px', paddingTop: '3%', marginRight: '2%' }}>
          <div>
           

            <form method="POST" action="javascript:void(0);" style={{ minWidth: '550px', width: '100%', justifyContent: 'center' }} >
            <div style={{ display: 'flex', justifyContent: 'center', width: '100%', marginBottom: '5%' }}>
              <Box >
                <TextField size="small" label="Repository Name" variant="outlined" type="text" onChange={handleRepo} style={{ marginRight: '2%' }} />
              </Box>

            </div>
              <div style={{ display: 'flex', justifyContent: 'center', width: '100%', marginBottom: '2%' }}>
                <label htmlFor="contained-button-file">
                  <Input id="contained-button-file" multiple type="file" onChange={handleFileChange} />
                  <Button type="submit" color="primary" variant="contained" component="span" style={{ marginRight: '4%', minWidth: 220 }}>
                    Επιλογη αρχειων
                  </Button>
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'center', width: '100%', marginBottom: '5%' }}>
                <label htmlFor="contained-test-button-file">
                  <Input id="contained-test-button-file" multiple type="file" onChange={handleTestFileChange} />
                  <Button type="submit" color="primary" variant="contained" component="span" style={{ marginRight: '4%', minWidth: 220 }}>
                    Επιλογη αρχειων yml
                  </Button>
                </label>
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', width: '100%', marginBottom: '8%' }}>
                <Button type="submit" variant="contained" color="warning" onClick={InitializeRepository} >
                  Αρχικοποιηση
                </Button>
              </div>


            </form>


          </div>
        </Card>
        <Card style={{ minWidth: '450px', paddingTop: '3%', marginLeft: '2%' }}>
          <div>
            {/* Βάζοντας το Button και το styled input μαζί φροντίζουμε να έχουμε ως UI το button και να έχουμε ταυτόχρονα τις 
          λειτουργικότητες του input για να πάρουμε τα csv files */ }
            <div style={{ display: 'flex', justifyContent: 'center', width: '100%', marginBottom: '4%' }}>
              <label htmlFor="contained-csv-button-file">
                <Input id="contained-csv-button-file" accept=".csv" type="file" onChange={handleCsvFileChange} />
                <Button type="submit" color="primary" variant="contained" component="span" style={{ marginRight: '4%', marginTop: '5%', minWidth: 220 }}>
                  CSV μαθητων
                </Button>
              </label>
            </div>
            {/*Παίρνουμε όλα τα repo που είναι templates και κάνοντας iterate μέσω του map() θέτουμε ως επιλογές  στο select  τις τιμές αυτές */}
            <form method="POST" action="javascript:void(0);" style={{ minWidth: '550px', width: '100%', justifyContent: 'center', }} >
              <Box style={{ display: 'flex', minWidth: '550px', width: '100%', justifyContent: 'center' }}>
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
                      return (<MenuItem value={repo} key={repo}> {repo} </MenuItem>)
                    })}

                  </Select>
                </FormControl>
              </Box>
              <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '2%', width: '100%' }}>
                <Button type="submit" variant="contained" color="primary" onClick={InitializeStudentsRepository}>
                  Δημιουργια
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
  //Παίρνουμε όλα τα repos μέσω της getRepos(), έπειτα ελέγχουμε ποιά από αυτά είναι template και τα δίνουμε ως prop στο component  
  const template = await getRepos();
  const repos = [];
  for (let temp of template) {
    if (temp.isTemplate) repos.push(temp.name)
  }
  return {
    props: { repos }
  }
}

