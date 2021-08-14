import { Grid, GridItem, useBreakpointValue } from '@chakra-ui/react'
import { FC, useEffect } from 'react'
import PositionPanel from './PositionPanel'
import OverviewPanel from './OverviewPanel'
import Chessboard from 'components/board/Chessboard'
import { useAppDispatch } from 'utils/hooks'
import { resetBoard } from 'store/boardSlice'
import MobileTraverseBar from 'components/MobileTraverseBar'

const CreateMovesPage: FC = () => {
  const dispatch = useAppDispatch()
  const shouldShowTraverseBar = useBreakpointValue({ base: true, lg: false })

  useEffect(() => {
    dispatch(resetBoard())
  }, [dispatch])

  return (
    <Grid
      templateColumns='repeat(12, 1fr)'
      templateRows={{ base: 'repeat(10, 1fr)', md: 'repeat(5, 1fr)', lg: 'repeat(2, 1fr)', '2xl': 'repeat(1, 1fr)' }}
      minH='90vh'
      gap={{ base: 0, '2xl': 4 }}
      mt='10px'
      mb={shouldShowTraverseBar ? '75px' : '0px'}
    >
      <GridItem
        colSpan={{ base: 12, lg: 6, '2xl': 3 }}
        rowSpan={{ base: 2, '2xl': 1 }}
        padding={{ base: '2.5%', lg: '5% 2.5%', '2xl': '5% 10%' }}
        order={{ base: 2, '2xl': 1 }}
      >
        <OverviewPanel />
      </GridItem>
      <GridItem colSpan={{ base: 12, '2xl': 6 }} rowSpan={{ base: 3, md: 2, '2xl': 1 }} order={{ base: 1, '2xl': 2 }}>
        <Chessboard />
      </GridItem>
      <GridItem
        colSpan={{ base: 12, lg: 6, '2xl': 3 }}
        rowSpan={{ base: 2, '2xl': 1 }}
        padding={{ base: '2.5%', lg: '5% 2.5%', '2xl': '5% 10%' }}
        order={3}
      >
        <PositionPanel />
      </GridItem>
      {shouldShowTraverseBar && <MobileTraverseBar />}
    </Grid>
  )
}

export default CreateMovesPage
