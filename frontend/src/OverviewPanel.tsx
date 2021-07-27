import { Flex, Text } from '@chakra-ui/layout'
import { Button } from '@chakra-ui/react'
import { FC, useEffect, useState } from 'react'
import { useAppSelector } from './hooks'

const OverviewPanel: FC = () => {
  const { lastMove } = useAppSelector(state => ({
    lastMove: state.board.moveHistory.length > 0 ? state.board.moveHistory[state.board.moveHistory.length - 1] : ''
  }))
  return (
    <Flex
      flexDir='column'
      justifyContent='space-between'
      borderRadius='3px'
      bg='surface'
      borderWidth='2px'
      borderStyle='solid'
      borderColor='surfaceBorder'
      w='100%'
      h='100%'
      p='5%'
      fontWeight='bold'
    >
      <Button isDisabled={!lastMove}>Add {lastMove || 'Move'} (A)</Button>
    </Flex>
  )
}

export default OverviewPanel
