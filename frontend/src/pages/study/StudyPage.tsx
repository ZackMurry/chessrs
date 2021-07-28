import { FC } from 'react'
import { Grid, GridItem } from '@chakra-ui/react'
import Chessboard from 'components/board/Chessboard'
import StudyMainPanel from './StudyMainPanel'
import { useEffect } from 'react'
import { useAppDispatch } from 'utils/hooks'
import { resetBoard } from 'store/boardSlice'

const StudyPage: FC = () => {
  const dispatch = useAppDispatch()

  useEffect(() => {
    dispatch(resetBoard())
  }, [dispatch])

  return (
    <>
      <Grid
        templateColumns='repeat(12, 1fr)'
        templateRows={{ base: 'repeat(5, 1fr)', md: 'repeat(5, 1fr)', xl: 'repeat(1, 1fr)' }}
        minH='90vh'
        gap={{ base: 0, md: 4 }}
      >
        <GridItem colSpan={{ base: 12, xl: 3 }} rowSpan={1} padding={{ base: '1%', xl: '5% 10%' }}>
          <StudyMainPanel />
        </GridItem>
        <GridItem colSpan={{ base: 12, md: 9, xl: 6 }} rowSpan={{ base: 3, md: 4, xl: 1 }}>
          <Chessboard />
        </GridItem>
        <GridItem
          colSpan={{ base: 12, md: 3, xl: 3 }}
          rowSpan={{ base: 1, md: 4, xl: 1 }}
          padding={{ base: '1%', lg: '5% 10%' }}
        ></GridItem>
      </Grid>
    </>
  )
}

export default StudyPage
