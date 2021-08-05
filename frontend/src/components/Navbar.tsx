import { Flex, Heading, useBreakpointValue } from '@chakra-ui/react'
import { FC } from 'react'
import { Link } from 'react-router-dom'
import MobileNavbar from './MobileNavbar'

const Navbar: FC = () => {
  const isMobile = useBreakpointValue({ base: true, md: false })
  return isMobile ? (
    <MobileNavbar />
  ) : (
    <Flex alignItems='center' pl='50px' pt='20px' color='whiteText'>
      <a href='/'>
        <Heading as='h2' fontSize='32px' fontWeight='normal'>
          ChesSRS
        </Heading>
      </a>
      <Link to='/create'>
        <Heading as='h4' fontSize='24px' fontWeight='normal' ml='25px' color='whiteText'>
          Create
        </Heading>
      </Link>
      <Link to='/study'>
        <Heading as='h4' fontSize='24px' fontWeight='normal' ml='25px' color='whiteText'>
          Study
        </Heading>
      </Link>
      <Link to='/practice'>
        <Heading as='h4' fontSize='24px' fontWeight='normal' ml='25px' color='whiteText'>
          Practice
        </Heading>
      </Link>
      <Heading as='h4' fontSize='24px' fontWeight='normal' ml='25px' color='whiteText'>
        <a href='/api/v1/oauth2/code/lichess' rel='noreferrer noopener'>
          Login
        </a>
      </Heading>
    </Flex>
  )
}

export default Navbar
