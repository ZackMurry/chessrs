import { Box, Flex, Grid, GridItem, Heading, Link as ChakraLink, Text } from '@chakra-ui/react'
import { FC } from 'react'
import { useAppSelector } from 'utils/hooks'
import DashboardMoveData from './DashboardMoveData'

const DashboardPage: FC = () => {
  const { name } = useAppSelector(state => ({
    name: state.user?.account?.username
  }))
  return (
    <>
      <Box mt='10px' p='5vw' pt='2vw'>
        <Heading mb='2vw'>Welcome back, {name}</Heading>
        <Grid templateColumns={{ base: 'repeat(1, 1fr)', lg: 'repeat(2, 1fr)' }} minH='70vh' gap={6}>
          <GridItem>
            <DashboardMoveData />
          </GridItem>
          <GridItem />
          <GridItem />
          <GridItem />
        </Grid>
      </Box>
      <footer>
        <Flex w='100%' justifyContent='center' pb='25px'>
          <Text color='whiteText'>
            Created by Zack Murry |{' '}
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
