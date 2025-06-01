import { useBreakpointValue } from '@chakra-ui/react'
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
    <div
      className={`
    grid
    grid-cols-12
    min-h-[90vh]
    mt-[10px]
    ${shouldShowTraverseBar ? 'mb-[75px]' : 'mb-0'}
    gap-0 2xl:gap-4
    grid-rows-[repeat(10,minmax(0,1fr))] 
    md:grid-rows-[repeat(5,minmax(0,1fr))]
    lg:grid-rows-[repeat(2,minmax(0,1fr))]
    2xl:grid-rows-[repeat(1,minmax(0,1fr))]
  `}
    >
      <div
        className={`
      col-span-12 
      lg:col-span-6 
      2xl:col-span-3 
      row-span-2 
      2xl:row-span-1 
      order-2 
      2xl:order-1 
      p-[2.5%] 
      lg:py-[5%] lg:px-[2.5%] 
      2xl:py-[5%] 2xl:px-[10%]
    `}
      >
        <OverviewPanel />
      </div>

      <div
        className={`
      col-span-12 
      2xl:col-span-6 
      row-span-3 
      md:row-span-2 
      2xl:row-span-1 
      order-1 
      2xl:order-2
    `}
      >
        <Chessboard />
      </div>

      <div
        className={`
      col-span-12 
      lg:col-span-6 
      2xl:col-span-3 
      row-span-2 
      2xl:row-span-1 
      order-3 
      p-[2.5%] 
      lg:py-[5%] lg:px-[2.5%] 
      2xl:py-[5%] 2xl:px-[10%]
    `}
      >
        <PositionPanel />
      </div>

      {shouldShowTraverseBar && <MobileTraverseBar />}
    </div>

    // <Grid
    //   templateColumns='repeat(12, 1fr)'
    //   templateRows={{ base: 'repeat(10, 1fr)', md: 'repeat(5, 1fr)', lg: 'repeat(2, 1fr)', '2xl': 'repeat(1, 1fr)' }}
    //   minH='90vh'
    //   gap={{ base: 0, '2xl': 4 }}
    //   mt='10px'
    //   mb={shouldShowTraverseBar ? '75px' : '0px'}
    // >
    //   <GridItem
    //     colSpan={{ base: 12, lg: 6, '2xl': 3 }}
    //     rowSpan={{ base: 2, '2xl': 1 }}
    //     padding={{ base: '2.5%', lg: '5% 2.5%', '2xl': '5% 10%' }}
    //     order={{ base: 2, '2xl': 1 }}
    //   >
    //     <OverviewPanel />
    //   </GridItem>
    //   <GridItem colSpan={{ base: 12, '2xl': 6 }} rowSpan={{ base: 3, md: 2, '2xl': 1 }} order={{ base: 1, '2xl': 2 }}>
    //     <Chessboard />
    //   </GridItem>
    //   <GridItem
    //     colSpan={{ base: 12, lg: 6, '2xl': 3 }}
    //     rowSpan={{ base: 2, '2xl': 1 }}
    //     padding={{ base: '2.5%', lg: '5% 2.5%', '2xl': '5% 10%' }}
    //     order={3}
    //   >
    //     <PositionPanel />
    //   </GridItem>
    //   {shouldShowTraverseBar && <MobileTraverseBar />}
    // </Grid>
  )
}

export default CreateMovesPage
