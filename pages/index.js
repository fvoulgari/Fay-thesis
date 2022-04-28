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
      <Container maxWidth="md" style={{ display: 'flex', justifyContent: 'center', height: '80%', marginBottom: '5%', marginTop: '3%', padding: '4%'  }}>
        <Card style={{ maxWidth: 700, minWidth: 400 }}>
          <div style={{ padding: '5%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-around', width: '100%' }}>

              <Typography variant="h5" style={{ marginBottom: '5%', fontFamily: "oxygen", color: "#494949"}} >
                Συνδεθείτε στο σύστημα
              </Typography>
            </div>
            <form method="POST" action="javascript:void(0);" >
              <Box style={{ display: 'flex', width: '100%', justifyContent: 'center', marginBottom: '5%' }}>
                <TextField size="small" label="Email" variant="outlined" type="email" onChange={handleEmail} />
              </Box>
              <Box style={{ display: 'flex', width: '100%', justifyContent: 'center', marginBottom: '5%' }}>
                <TextField size="small" label="Κωδικός" variant="outlined" type="password" onChange={handlePass} />
              </Box>

              <div style={{ display: 'flex', justifyContent: 'center', width: '100%', marginBottom: '5%' }}>
                <Button type="submit" variant="contained"  onClick={signIn} style={{backgroundColor: "#696969"}}>
                  Συνδεση
                </Button>
              </div>
            </form>
            <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
              &nbsp; ή &nbsp;
              <Link href="signup">
                <a style={{ textDecoration: "underline", color: "#76a68f" }} href="">Εγγραφή</a>
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

