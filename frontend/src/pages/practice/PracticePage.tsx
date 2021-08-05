import { FC } from 'react'
import { Grid, GridItem } from '@chakra-ui/react'
import Chessboard from 'components/board/Chessboard'
import PracticeMainPanel from './PracticeMainPanel'
import { useEffect } from 'react'
import { useAppDispatch } from 'utils/hooks'
import { resetBoard } from 'store/boardSlice'

const PracticePage: FC = () => {
  const dispatch = useAppDispatch()

  useEffect(() => {
    dispatch(resetBoard())
  }, [dispatch])

  return (
    <>
      <Grid
        templateColumns='repeat(12, 1fr)'
        templateRows={{ base: 'repeat(3, 1fr)', md: 'repeat(5, 1fr)', xl: 'repeat(1, 1fr)' }}
        minH='90vh'
        gap={{ base: 0, lg: 4 }}
        mt='10px'
      >
        <GridItem
          colSpan={{ base: 12, xl: 3 }}
          rowSpan={1}
          order={{ base: 2, lg: 1 }}
          padding={{ base: '2.5%', xl: '5% 10%' }}
        >
          <PracticeMainPanel />
        </GridItem>
        <GridItem colSpan={{ base: 12, lg: 9, xl: 6 }} rowSpan={{ base: 1, md: 2, xl: 1 }} order={{ base: 1, lg: 2 }}>
          <Chessboard />
        </GridItem>
        <GridItem
          colSpan={{ base: 12, lg: 3, xl: 3 }}
          rowSpan={{ base: 1, lg: 4, xl: 1 }}
          padding={{ base: '2.5%', lg: '5% 10%' }}
          order={{ base: 3 }}
        />
      </Grid>
    </>
  )
}

export default PracticePage
