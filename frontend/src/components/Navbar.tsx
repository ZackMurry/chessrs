import { Flex, Heading, useBreakpointValue } from '@chakra-ui/react'
import { FC } from 'react'
import { Link } from 'react-router-dom'
import { useAppSelector } from 'utils/hooks'
import MobileNavbar from './MobileNavbar'

const Navbar: FC = () => {
  const isMobile = useBreakpointValue({ base: true, md: false })
  const isAuthenticated = useAppSelector((state) => state.user.account !== null)
  return isMobile ? (
    <MobileNavbar />
  ) : (
    <Flex alignItems='center' pl='50px' pt='20px' color='whiteText'>
      <Link to='/home'>
        <div className='flex justify-start align-center'>
          <img
            src='/whitePawn.png'
            alt='Canvas Sync for Notion logo'
            // className='-mt-2'
            width={48}
            height={48}
          />
          <h2 className='font-redhat my-auto text-xl font-bold text-white pt-2'>
            Chessrs
          </h2>
        </div>
      </Link>
      <div className='flex justify-between align-center space-x-8 my-auto text-white text-xl ml-10 pt-2'>
        <Link to='/create'>Create</Link>
        <Link to='/study'>Study</Link>
        <Link to='/practice'>Practice</Link>
        {isAuthenticated ? (
          <Link to='/account'>Account</Link>
        ) : (
          <a
            href='/api/v1/oauth2/code/lichess'
            rel='noreferrer noopener'
            target='_blank'
          >
            Login
          </a>
        )}
      </div>
    </Flex>
  )
}

export default Navbar
