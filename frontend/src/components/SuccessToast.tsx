import { CheckIcon } from '@chakra-ui/icons'
import { Box, Text, Flex, CloseButton } from '@chakra-ui/react'
import { FC } from 'react'

interface Props {
  onClose: () => void
  description: string
}

const SuccessToast: FC<Props> = ({ description, onClose }) => (
  <Box bg='success' borderRadius='5px' p='10px'>
    <Flex justifyContent='space-between' alignItems='center'>
      <Flex alignItems='center'>
        <CheckIcon color='whiteText' fontSize='30px' pr='10px' />
        <Text color='whiteText' fontSize='14px'>
          {description}
        </Text>
      </Flex>
      <CloseButton onClick={onClose} />
    </Flex>
  </Box>
)

export default SuccessToast
