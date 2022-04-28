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
} from '@mui/material';
import showNotification from '../Lib/notification'

export default function Home() {
  const router = useRouter();
  const [email, setEmail] = useState([]);
  const [password, setPassword] = useState([]);
  const signIn = async () => {
    try {
      if (email && password) {
        const bodyData = {
          email: email,
          password: password
        }
        const res = await fetch('/api/auth/signin', {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(bodyData),
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


  return (
    <>
      <Container maxWidth="md" style={{ display: 'flex', justifyContent: 'center', height: '45vh', marginBottom: '2%', marginTop: '2%', padding: '3%' }}>
        <Card style={{ maxWidth: 500 }}>
          <div style={{ padding: '5%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-around', width: '100%' }}>

              <Typography variant="body2" style={{ marginBottom: '5%' }} >
                Συνδεθείτε στο σύστημα εισάγοντας το email και το password σας.
              </Typography>
            </div>
            <form method="POST" action="javascript:void(0);" >
              <Box style={{ display: 'flex', width: '100%', justifyContent: 'center', marginBottom: '5%' }}>
                <TextField size="small" label="email" variant="outlined" type="email" onChange={handleEmail} />
              </Box>
              <Box style={{ display: 'flex', width: '100%', justifyContent: 'center', marginBottom: '5%' }}>
                <TextField size="small" label="password" variant="outlined" type="password" onChange={handlePass} />
              </Box>

              <div style={{ display: 'flex', justifyContent: 'center', width: '100%', marginBottom: '5%' }}>
                <Button type="submit" variant="contained" color="primary" onClick={signIn}>
                  Συνδεση
                </Button>
              </div>
            </form>
            <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
              &nbsp; ή &nbsp;
              <Link href="signup">
                <a href="">Εγγραφή</a>
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

