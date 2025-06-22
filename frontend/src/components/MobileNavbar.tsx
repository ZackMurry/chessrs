import { HamburgerIcon } from '@chakra-ui/icons'
import { Link } from 'react-router-dom'
import { FC } from 'react'
import { Box, Flex, Collapse, IconButton, useBoolean, Heading } from '@chakra-ui/react'
import theme from 'theme'
import { useAppSelector } from 'utils/hooks'

const MobileNavbar: FC = () => {
  const [isExpanded, { toggle, off }] = useBoolean(false)
  const isAuthenticated = useAppSelector(state => state.user.account !== null)

  return (
    <header style={{ background: String(theme.colors.surface) }}>
      <Flex h='7vh' p='12.5px 25px' w='100%' justifyContent='space-between' alignItems='center'>
        <IconButton onClick={toggle} bg='transparent' aria-label='Open navigation' borderRadius='3px'>
          <HamburgerIcon w='35px' h='35px' color='grayBtn' />
        </IconButton>
        <Link to='/home' onClick={off}>
          <div className='flex justify-start align-center'>
            <img
              src='/whitePawn.png'
              alt='Canvas Sync for Notion logo'
              // className='-mt-2'
              width={36}
              height={36}
            />
            <h2 className='font-redhat my-auto text-xl font-bold text-white pt-2'>Chessrs</h2>
          </div>
        </Link>
      </Flex>
      {/* @ts-ignore next-line */}
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
            {isAuthenticated ? (
              <Link to='/account'>Account</Link>
            ) : (
              <a href='/api/v1/oauth2/code/lichess' rel='noreferrer noopener'>
                Login
              </a>
            )}
          </Heading>
        </Box>
      </Collapse>
    </header>
  )
}

export default MobileNavbar
