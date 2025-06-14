import { Tooltip } from 'radix-ui'
import { FC } from 'react'
import { ReactNode } from 'react'

interface Props {
  label: string
  children: ReactNode
}

const DarkTooltip: FC<Props> = ({ label, children }) => (
  <Tooltip.Provider>
    <Tooltip.Root>
      <Tooltip.Trigger asChild>{children}</Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Content className='bg-surface text-offwhite p-1 border-[2px] border-solid border-surfaceBorder text-sm'>
          {label}
          <Tooltip.Arrow />
        </Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip.Root>
  </Tooltip.Provider>
)

export default DarkTooltip
