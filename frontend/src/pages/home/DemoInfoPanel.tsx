import { Box } from '@chakra-ui/react'
import { FC } from 'react'

const DemoInfoPanel: FC = () => (
  <Box
    borderRadius='3px'
    bg='surface'
    borderWidth='2px'
    borderStyle='solid'
    borderColor='surfaceBorder'
    h='100%'
    p='5%'
    className='text-offwhite'
  >
    <h1 className='text-2xl font-bold'>You are using a demo account</h1>
    <ul className='list-disc ml-8 mt-2 text-[18px]'>
      <li className='mt-1'>Your account is for one-time use</li>
      <li className='mt-1'>All of your account data will be lost when you sign out</li>
      <li className='mt-1'>
        You may use the "Import Games from Lichess" button to view sample games from the developer's Lichess account
      </li>
      <li className='mt-1'>To create a full account, log out and sign in with Lichess</li>
    </ul>
  </Box>
)

export default DemoInfoPanel
