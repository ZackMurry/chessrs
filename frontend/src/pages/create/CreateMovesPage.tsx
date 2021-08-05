import { Box, Flex, Grid, GridItem } from '@chakra-ui/react'
import { FC, useEffect } from 'react'
import PositionPanel from './PositionPanel'
import OverviewPanel from './OverviewPanel'
import Chessboard from 'components/board/Chessboard'
import { useAppDispatch } from 'utils/hooks'
import { resetBoard } from 'store/boardSlice'

const CreateMovesPage: FC = () => {
  const dispatch = useAppDispatch()

  useEffect(() => {
    dispatch(resetBoard())
  }, [dispatch])

  return (
    <>
      <Grid
        templateColumns='repeat(12, 1fr)'
        templateRows={{ base: 'repeat(10, 1fr)', md: 'repeat(5, 1fr)', xl: 'repeat(1, 1fr)' }}
        minH='90vh'
        gap={{ base: 0, md: 4 }}
        mt='10px'
      >
        <GridItem
          colSpan={{ base: 12, xl: 3 }}
          rowSpan={2}
          padding={{ base: '2.5%', xl: '5% 10%' }}
          order={{ base: 2, lg: 1 }}
        >
          <OverviewPanel />
        </GridItem>
        <GridItem colSpan={{ base: 12, lg: 9, xl: 6 }} rowSpan={{ base: 3, md: 2, xl: 1 }} order={{ base: 1, lg: 2 }}>
          <Chessboard />
        </GridItem>
        <GridItem
          colSpan={{ base: 12, lg: 3, xl: 3 }}
          rowSpan={{ base: 3, lg: 4, xl: 1 }}
          padding={{ base: '2.5%', lg: '5% 10%' }}
          order={{ base: 3 }}
        >
          <PositionPanel />
        </GridItem>
      </Grid>
    </>
  )
}

export default CreateMovesPage
