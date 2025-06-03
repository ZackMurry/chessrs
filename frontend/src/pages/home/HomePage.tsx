import {
  Box,
  Flex,
  Grid,
  GridItem,
  Link as ChakraLink,
  Text,
} from '@chakra-ui/react'
import { FC } from 'react'
import { useAppSelector } from 'utils/hooks'
import DemoInfoPanel from './DemoInfoPanel'
import DashboardMoveData from './HomePageMoveData'
import TimeBasedGreeting from './TimeGreeting'

const DashboardPage: FC = () => {
  const { name, isDemo } = useAppSelector((state) => ({
    name: state.user?.account?.username,
    isDemo: state.user?.account?.isDemo,
  }))

  return (
    <>
      <Box mt='10px' p='5vw' pt='2vw'>
        <TimeBasedGreeting userName={name} />
        <Grid
          templateColumns={{ base: 'repeat(1, 1fr)', lg: 'repeat(2, 1fr)' }}
          minH='65vh'
          gap={6}
        >
          <GridItem>
            <DashboardMoveData />
          </GridItem>
          <GridItem>{isDemo && <DemoInfoPanel />}</GridItem>
          <GridItem />
          <GridItem />
        </Grid>
      </Box>
      <footer>
        <Flex w='100%' justifyContent='center' pb='25px'>
          <Text color='whiteText'>
            Created by{' '}
            <ChakraLink isExternal href='https://zackmurry.com'>
              Zack Murry
            </ChakraLink>
            {' | '}
            <ChakraLink isExternal href='https://github.com/ZackMurry/chessrs'>
              GitHub
            </ChakraLink>
          </Text>
        </Flex>
      </footer>
    </>
  )
}

export default DashboardPage
