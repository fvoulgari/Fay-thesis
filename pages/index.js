import React, {
  useState, useEffect, useContext, useMemo
} from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {Button, TextField, Container, Typography, Card, Box} from '@mui/material';
import showNotification from '../Lib/notification'
import { getAppCookies } from '../Lib/dao'
import {MyContext } from './_app'


export default function Home() {
  const router = useRouter();
  const context= useContext(MyContext)
  const supervisor = context.supervisor;
  const setSupervisor= context.setSupervisor
  const [email, setEmail] = useState([]);
  const [password, setPassword] = useState([]);
  const signIn = async (e) => {
    e.preventDefault();
    try {
      if (email && password) {
        const bodyData = {
          email: email,
          password: password
        }
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          body: JSON.stringify(bodyData),
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json'
          }
        });
        const data = await res.json()
        if (res.status === 200 && data.success) {
          setSupervisor(true)
          showNotification(
            'success',
            'Επιτυχής πρόσβαση',
            'Επιτυχής σύνδεση. Καλώς ήρθατε στο σύστημα.'
          );
          await router.push('/classhome');

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
      <div style={{ display: 'flex', justifyContent: 'space-around', width: '100%' }}>
        <Typography variant="h4" style={{ marginTop: '3%' }} >
          Σύνδεση
        </Typography>
      </div>
      <Container maxWidth="md" style={{ display: 'flex', justifyContent: 'center', height: '80%', marginBottom: '5%', padding: '4%' }}>
        <Card style={{ maxWidth: 700, minWidth: 400 }}>
          <div style={{ padding: '5%' }}>

            <form method="POST" onSubmit={signIn} >
              <Box style={{ display: 'flex', width: '100%', justifyContent: 'center', marginBottom: '5%' }}>
                <TextField size="small" label="Email" variant="outlined" type="email" onChange={handleEmail} />
              </Box>
              <Box style={{ display: 'flex', width: '100%', justifyContent: 'center', marginBottom: '5%' }}>
                <TextField size="small" label="Κωδικός" variant="outlined" type="password" onChange={handlePass} />
              </Box>

              <div style={{ display: 'flex', justifyContent: 'center', width: '100%', marginBottom: '5%' }}>
                <Button type="submit" variant="contained"   >
                  Συνδεση
                </Button>
              </div>
            </form>
            <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
              &nbsp; ή &nbsp;
              <Link href="signup">
                <a style={{ textDecoration: "underline", color: "#e28743" }} href="">Εγγραφή</a>
              </Link>
            </div>

          </div>
        </Card>
      </Container>
    </>
  )
}


export async function getServerSideProps(context) {
  let cookies = await getAppCookies(context.req);
  if (cookies.sucess) {
      return {
          redirect: {
              destination: '/classhome',
              permanent: false,
          },
      }
  }
  return {
    props: {},
  }
}

