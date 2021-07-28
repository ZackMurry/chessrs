import { Tooltip, ComponentWithAs, TooltipProps } from '@chakra-ui/react'

const DarkTooltip: ComponentWithAs<'div', TooltipProps> = props => (
  <Tooltip bg='elevated' color='whiteText' borderRadius='3px' {...props} />
)

export default DarkTooltip
