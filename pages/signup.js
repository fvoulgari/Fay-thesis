import React, {
  useContext,
  useState,
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
  Popover,
  List,
  ListItem,
  Checkbox,
  ListItemButton,
  ListItemAvatar,
  Avatar,
  ListItemText,
} from "@mui/material";
import showNotification from '../Lib/notification'
import InfoRoundedIcon from '@mui/icons-material/InfoRounded';

import { MyContext } from './_app';



export default function SignUp() {
  const context = useContext(MyContext)
  const router = useRouter();
  const [email, setEmail] = useState([]);
  const [password, setPassword] = useState([]);
  const [name, setName] = useState([]);
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [lastname, setLastname] = useState([]);
  const [confirmPass, setConfirmPass] = useState([]);
  const [github, setGithub] = useState([]);
  const setSupervisor = context.setSupervisor
  const supervisor = context.supervisor


  const handlePopoverOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  function validateEmail(email) {
    const re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
  }
  const signup = async () => {
    try {
      if (email && password && lastname && name && confirmPass && github) {
        if (validateEmail(email)) {
          if (password === confirmPass) {
            const bodyData = {
              email: email,
              password: password,
              name: name,
              lastname: lastname,
              github: github
            }
            const res = await fetch('/api/auth/signup', {
              method: 'POST',
              headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(bodyData),
            });

            const data = await res.json();

            if (res.status === 200 && data.success) {
              setSupervisor(true)
              showNotification(
                'success',
                'Επιτυχημένη εγγραφή ',
                'Καλώς ήρθατε. Μπορείτε πλέον να συνδεθείτε στο σύστημα.'
              );
              await router.push('/');
            }
            else {
              showNotification(
                'error',
                'Σφάλμα πρόσβασης',
                'Μη αποδεκτά συνθηματικά. Παρακαλούμε επαναλάβετε.'
              );
            }
          } else {
            showNotification(
              'error',
              'Σφάλμα πρόσβασης',
              'Οι κωδικοί που βάλατε δεν ταιριάζουν'
            );

          }
        } else {
          showNotification(
            'error',
            'Σφάλμα ',
            'Παρακαλόυμε εισάγετε σωστή διεύθυνση email'
          );

        }
      } else {
        showNotification(
          'error',
          'Σφάλμα ',
          'Παρακαλούμε συμπληρώστε όλα τα πεδία'
        );
      }

    }
    catch (e) {
      console.error(e);
      showNotification(
        'error',
        'Σφάλμα πρόσβασης',
        'Σφάλμα συστήματος. Επικοινωνήστε με τον διαχειριστή'
      );
    }
  }

  const handleEmail = (event) => {
    setEmail(event.target.value);
  };
  const handlePass = (event) => {
    setPassword(event.target.value);
  };
  const handleName = (event) => {
    setName(event.target.value);
  };
  const handleLastName = (event) => {
    setLastname(event.target.value);
  };
  const handleConfirmPass = (event) => {
    setConfirmPass(event.target.value);
  };
  const handleGithub = (event) => {
    setGithub(event.target.value)
  };



  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-around', width: '100%' }}>
        <Typography variant="h4" style={{ marginTop: '3%' }} >
          Εγγραφή
        </Typography>
      </div>

      <Container style={{ display: 'flex', justifyContent: 'center', height: '80%', marginBottom: '5%', padding: '4%' }}>
        <Card style={{ minWidth: 400 }}>
          <div style={{ padding: '5%',marginBottom: '5%'}}>
            <form method="POST" action="javascript:void(0);" >


              <Box style={{ display: 'flex', width: '100%', justifyContent: 'center', marginBottom: '5%' , marginTop: '10%' }}>
                <TextField onChange={handleName} size="small" label="Όνομα" variant="outlined" />
              </Box>
              <Box style={{ display: 'flex', width: '100%', justifyContent: 'center', marginBottom: '5%' }}>
                <TextField onChange={handleLastName} size="small" label="Επώνυμο" variant="outlined" />
              </Box>
              <Box style={{ display: 'flex', width: '100%', justifyContent: 'center' , marginBottom: '5%' }}>
                <TextField onChange={handleEmail} size="small" label="Github Email" variant="outlined" type="email" />
              </Box>
              <Box style={{ display: 'flex', width: '100%', justifyContent: 'center', marginBottom: '5%'}}>
                <TextField onChange={handleGithub} size="small" label="Github account" variant="outlined" />
              </Box>
            

              <Box style={{ display: 'flex', width: '100%', justifyContent: 'center', marginBottom: '5%' }}>
                <TextField onChange={handlePass} size="small" label="Κωδικός" variant="outlined" type="password" />
              </Box>
              <Box style={{ display: 'flex', width: '100%', justifyContent: 'center', marginBottom: '5%' }}>
                <TextField onChange={handleConfirmPass} size="small" label="Επανάληψη κωδικού" variant="outlined" type="password" />
              </Box>

              {/* <Box style={{ display: 'flex',width: '100%', justifyContent: 'center',marginBottom: '5%', verticalAlign: 'middle' }} >

                <InfoRoundedIcon onMouseEnter={handlePopoverOpen}
                  onMouseLeave={handlePopoverClose}
                  fontSize="large"
                  color="warning" />
                <Popover
                  id="mouse-over-popover"
                  sx={{
                    pointerEvents: 'none',
                  }}
                  open={open}
                  anchorEl={anchorEl}
                  anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                  }}
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'left',
                  }}
                  style={{ marginTop: '1%', opacity: '0.9' }}
                  PaperProps={{
                    sx: {
                      "backgroundColor": 'gray',
                      "color": 'white',
                      "fontSize": '14px',
                      "width": '400px'

                    }
                  }}
                  color="warning"
                  onClose={handlePopoverClose}
                  disableRestoreFocus

                >
                  <Typography sx={{ p: 1 }}>Χρειάζεται να δωθούν τα αρχεία τα οποία θα περιέχει η άσκηση,τα tests μέσω των οποίων θα γίνεται ο αυτόματος έλεγχος
                    και η εκφώνηση σε μορφή .md
                  </Typography>
                </Popover>

              </Box> */}

              <div style={{ display: 'flex', justifyContent: 'center', width: '100%', marginBottom: '5%' }}>
                <Button type="submit" variant="contained" onClick={signup} >
                  Εγγραφη
                </Button>
              </div>
            </form>
            <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
              &nbsp; ή &nbsp;
              <Link href="/">
                <a style={{ textDecoration: "underline", color: "#e28743" }} href="">Σύνδεση</a>
              </Link>
            </div>

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
