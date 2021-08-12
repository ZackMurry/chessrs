import { Box, Flex, Grid, GridItem } from '@chakra-ui/react'
import { FC } from 'react'
import DashboardMoveData from './DashboardMoveData'

const DashboardPage: FC = () => {
  return (
    <Grid templateColumns={{ base: 'repeat(1, 1fr)', lg: 'repeat(2, 1fr)' }} minH='90vh' gap={4} mt='10px' p='5vw'>
      <GridItem>
        <DashboardMoveData />
      </GridItem>
      <GridItem>
        <DashboardMoveData />
      </GridItem>
      <GridItem>
        <DashboardMoveData />
      </GridItem>
    </Grid>
  )
}

export default DashboardPage
