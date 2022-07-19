import * as React from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { contextOptions } from '../../pages/class/[name]';

export default function CircularProgressWithLabel(props) {
  const { thickness,color, size, value ,selectStats,totalTest} = props
  const context = React.useContext(contextOptions)
  const type=context.type
  const getValue = (value) =>{
    if(value==0){
        return 2
      }else if(value>0 && value< 5){
        return 30
      }else if( value>=5 && value<8){
        return 50
      }else if( value>=8 && value<15){
        return 70
      }else if( value>=15 ){
        return 90
      }
    }

    const getSuccess = (workflow)=>{
      var succesffulTests = 0;
        for(let tempWorkFlow in  workflow){
          var check = workflow[tempWorkFlow].filter( (item) => {
              return item.value.includes('success') 
            })
            check=[...new Set(check.map( (val)=>val.value[2]))]

                if (check.length > 0) succesffulTests +=  check.length


        }
        return succesffulTests
      
   }
    const handleWorkflow = (workflow)=>{
      var succesffulTests = 0;

     // console.log("workflow ",  workflow)
      if (workflow.length==0){
          return 0  
      }else{
        for(let tempWorkFlow in  workflow){
         var check = workflow[tempWorkFlow].filter( (item) => {
              return item.value.includes('success') 
            })
            check=[...new Set(check.map( (val)=>val.value[2]))]

            if (check.length > 0) succesffulTests +=  check.length

        

        }
       
      }
      if(succesffulTests==0) return 2
      return succesffulTests/totalTest *100
   }


  return (
    <Box sx={{ position: 'relative', display: 'inline-flex' }}>
      {/*Ελέγχουμε δυναμικά αν το Type είναι Tests η commits ώστε να ΄βαλουμε διαφορετικές τιμές στο progress και στο value */}
      <CircularProgress variant="determinate" thickness={thickness} color={color}  size={size}  value={type=='Commits'?getValue(value):handleWorkflow(value)} />
      <Box
        sx={{
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
          position: 'absolute',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography variant="caption" component="div" color="text.secondary" fontSize={type=='Test'?13:10} style={{ fontWeight:'bold'}}>
          {type=='Tests'?(value.length==0?'---': `${getSuccess(value)} / ${totalTest} Tests `):`${value} commits`}
        </Typography>
      </Box>
    </Box>
  );
}