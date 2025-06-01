import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Button,
} from '@chakra-ui/react'
import { FC, useRef } from 'react'

interface Props {
  open: boolean
  onCancel: () => void
  onConfirm: () => void
  body: string
  title: string
  isLoading: boolean
}

const ConfirmationDialog: FC<Props> = ({
  open,
  body,
  title,
  onCancel,
  onConfirm,
  isLoading,
}) => {
  const cancelRef = useRef(null)
  return (
    <AlertDialog
      isOpen={open}
      onClose={onCancel}
      leastDestructiveRef={cancelRef}
    >
      <AlertDialogOverlay>
        <AlertDialogContent bgColor='surface'>
          <AlertDialogHeader fontSize='lg' fontWeight='bold'>
            {title}
          </AlertDialogHeader>
          <AlertDialogBody>{body}</AlertDialogBody>
          <AlertDialogFooter>
            <Button ref={cancelRef} onClick={onCancel}>
              Cancel
            </Button>
            <Button isLoading={isLoading} onClick={onConfirm} ml={3}>
              Confirm
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogOverlay>
    </AlertDialog>
  )
}

export default ConfirmationDialog
