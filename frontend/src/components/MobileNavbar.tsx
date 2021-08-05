import { HamburgerIcon } from '@chakra-ui/icons'
import { Link } from 'react-router-dom'
import { FC } from 'react'
import { Box, Flex, Collapse, IconButton, useBoolean, Heading } from '@chakra-ui/react'
import theme from 'theme'

const MobileNavbar: FC = () => {
  const [isExpanded, { toggle }] = useBoolean(false)

  return (
    <header style={{ background: theme.colors.surface }}>
      <Flex h='7vh' p='12.5px 25px' justifyContent='space-between' alignItems='center'>
        <IconButton onClick={toggle} bg='transparent' aria-label='Open navigation'>
          <HamburgerIcon w='35px' h='35px' color='grayBtn' />
        </IconButton>
        <Link to='/' onClick={toggle}>
          <Heading as='h2' fontSize='28px' fontWeight='normal' color='whiteText'>
            ChesSRS
          </Heading>
        </Link>
      </Flex>
      <Collapse in={isExpanded}>
        <Box bg='surface' pb='10px'>
          <Link to='/create' onClick={toggle}>
            <Heading as='h4' fontSize='24px' fontWeight='normal' ml='25px' color='whiteText'>
              Create
            </Heading>
          </Link>
          <Link to='/study' onClick={toggle}>
            <Heading as='h4' fontSize='24px' fontWeight='normal' ml='25px' color='whiteText'>
              Study
            </Heading>
          </Link>
          <Link to='/practice' onClick={toggle}>
            <Heading as='h4' fontSize='24px' fontWeight='normal' ml='25px' color='whiteText'>
              Practice
            </Heading>
          </Link>
          <Heading as='h4' fontSize='24px' fontWeight='normal' ml='25px' color='whiteText' onClick={toggle}>
            <a href='/api/v1/oauth2/code/lichess' rel='noreferrer noopener'>
              Login
            </a>
          </Heading>
        </Box>
      </Collapse>
    </header>
  )
}

export default MobileNavbar
