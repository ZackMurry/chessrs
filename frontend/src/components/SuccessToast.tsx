import { CheckIcon } from '@chakra-ui/icons'
import { Box, Text, Flex, CloseButton } from '@chakra-ui/react'
import { Check } from 'lucide-react'
import { FC } from 'react'

interface Props {
  onClose: () => void
  description: string
}

const SuccessToast: FC<Props> = ({ description, onClose }) => (
  <Box bg='success' borderRadius='5px' p='10px'>
    <Flex justifyContent='space-between' alignItems='center'>
      <Flex alignItems='center'>
        <Check className='text-offwhite text-lg pr-5' />
        <Text color='whiteText' fontSize='14px'>
          {description}
        </Text>
      </Flex>
      <CloseButton onClick={onClose} />
    </Flex>
  </Box>
)

export default SuccessToast
