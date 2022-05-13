import React, {
    useState, useEffect,
} from 'react';
import {useRouter} from 'next/router';
import _ from 'lodash';
import { getOrganizations,checkClass } from '../../Lib/dao';
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
    InputLabel,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper
} from '@mui/material';
import { styled } from '@mui/material/styles';
import showNotification from '../../Lib/notification'

const myOrgs=[]
const Input = styled('input')({
    display: 'none',
});

const StyledTableCell = styled(TableCell)(({ theme }) => ({
    [`&.${tableCellClasses.head}`]: {
      backgroundColor: theme.palette.text.primary,
      color: theme.palette.common.white,
    },
    [`&.${tableCellClasses.body}`]: {
      fontSize: 14,
    },
  }));
  
  const StyledTableRow = styled(TableRow)(({ theme }) => ({
    '&:nth-of-type(odd)': {
      backgroundColor: theme.palette.action.hover,
    },
    // hide last border
    '&:last-child td, &:last-child th': {
      border: 0,
    },
  }));

export default function Class({ name, orgs }) {
    const router = useRouter();

    function createData(name) {
        return { name };
    }

    const active = orgs.filter((org) => !(org.startsWith('Uninitialized')))
    const rows = active.map((org) => {
        return (createData(org))
    })


    
    const signupInOrg = async (event) => {
        console.log(event.target.id)
        const org = event.target.id

        router.push('/class/' + org )
        
    }
    const enterOrg = async (event) => {
        console.log(event.target.id)
        const org = event.target.id


        const res = await fetch('/api/enterOrg', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: org,
                email: 'up1053649@upnet.gr'
            })
        });


        const data = await res.json();


    }






    return (
        <>
            <div style={{ display: 'flex', justifyContent: 'space-around', width: '100%' }}>
                <Typography variant="h4" style={{ marginTop: '7%', color: 'white' }} >
                    Δημιουργία  μαθήματος
                </Typography>
            </div>
            <Container maxWidth="lg" style={{ display: 'flex', justifyContent: 'center', paddingTop: '6%', marginBottom: '2%', padding: '3%' }}>
                <Card style={{ minWidth: '450px', paddingTop: '3%', marginLeft: '2%' }}>
                    <TableContainer component={Paper}>
                        <Table sx={{ minWidth: 650 }} aria-label="caption table">
                            <TableHead>
                                <StyledTableRow>

                                    <StyledTableCell><h2>Μαθήματα</h2></StyledTableCell>
                                    <StyledTableCell></StyledTableCell>

                                </StyledTableRow>
                            </TableHead>
                            <TableBody>
                                {rows.map((row) => (
                                    <TableRow key={row.name}>
                                        <StyledTableCell component="th" scope="row">
                                            {row.name}
                                        </StyledTableCell>
                                        <StyledTableCell align="right" component="th" scope="row">
                                            <Button id={row.name} type="submit" variant="contained" color="primary" onClick={(event)=>{
                                                console.log(row.name)
                                                if(myOrgs.includes(row.name)){
                                                    enterOrg(event)
                                                } else{
                                                    signupInOrg(event)
                                                }
                                            }}>
                                                { ! (myOrgs.includes(row.name)) ? "Εισοδος": "Εγγραφη"}
                                            </Button>
                                        </StyledTableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                        <div style={{ margin: '2%' }}>
                            <Button type="submit" variant="contained" color="primary">
                                Δημηιουργια νεου μαθηματοσ
                            </Button>
                        </div>
                    </TableContainer>
                </Card>
            </Container>
        </>
    )
}


export async function getServerSideProps(context) {
    const KEY = process.env.JWT_KEY;

    const name = context.params.name;
    const valid = checkClass('fvoulgari', name)
    //Παίρνουμε όλα τα repos μέσω της getRepos(), έπειτα ελέγχουμε ποιά από αυτά είναι template και τα δίνουμε ως prop στο component  
    if(!valid){
        return {
			redirect: {
				destination: '/classhome',
				permanent: false,
			},
		};
    }
    const orgs = await getOrganizations();
    //const myOrgs = await listUserOrganizations

    return {
        props: {
            orgs: orgs,
            name: name
        }
    }
}

