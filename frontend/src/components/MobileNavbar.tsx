import { HamburgerIcon } from '@chakra-ui/icons'
import { Link } from 'react-router-dom'
import { FC } from 'react'
import { Box, Flex, Collapse, useBoolean } from '@chakra-ui/react'
import { useAppSelector } from 'utils/hooks'
import { IconButton } from '@radix-ui/themes'

const MobileNavbar: FC = () => {
  const [isExpanded, { toggle, off }] = useBoolean(false)
  const isAuthenticated = useAppSelector(state => state.user.account !== null)

  return (
    <header className='bg-surface'>
      <Flex h='7vh' p='12.5px 25px' w='100%' justifyContent='space-between' alignItems='center'>
        <IconButton onClick={toggle} variant='soft' aria-label='Open navigation' className='rounded-sm !bg-surface'>
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
            <h4 className='text-xl ml-[25px] text-offwhite'>Create</h4>
          </Link>
          <Link to='/study' onClick={toggle}>
            <h4 className='text-xl ml-[25px] text-offwhite'>Study</h4>
          </Link>
          <Link to='/practice' onClick={toggle}>
            <h4 className='text-xl ml-[25px] text-offwhite'>Practice</h4>
          </Link>
          <h4 className='text-xl ml-[25px] text-offwhite'>
            {isAuthenticated ? (
              <Link to='/account'>Account</Link>
            ) : (
              <a href='/api/v1/oauth2/code/lichess' rel='noreferrer noopener'>
                Login
              </a>
            )}
          </h4>
        </Box>
      </Collapse>
    </header>
  )
}

export default MobileNavbar
