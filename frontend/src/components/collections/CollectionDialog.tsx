import {
  DialogActionTrigger,
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTitle,
} from '@/components/ui/dialog'
import { useDisclosure } from '@chakra-ui/react'
import { forwardRef, useImperativeHandle, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { BlueButton, RedButton } from '../commonUI/Button'
import { DefaultInput } from '../commonUI/Input'

interface CollectionDialogProps {
  onAdd: (collectionData: { name: string }) => Promise<void>
}

export interface CollectionDialogRef {
  open: () => void
  close: () => void
}

const CollectionDialog = forwardRef<CollectionDialogRef, CollectionDialogProps>((props, ref) => {
  const { onAdd } = props
  const { t } = useTranslation()
  const [collectionName, setCollectionName] = useState('')
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const { open, onOpen, onClose } = useDisclosure()

  useImperativeHandle(ref, () => ({
    open: onOpen,
    close: onClose,
  }))

  const handleSubmit = async () => {
    if (!collectionName.trim()) return

    try {
      await onAdd({ name: collectionName })
      setCollectionName('')
      onClose()
    } catch (error) {
      console.error('Failed to create collection:', error)
    }
  }

  return (
    <DialogRoot
      key="add-collection-dialog"
      placement="center"
      motionPreset="slide-in-bottom"
      open={open}
      onOpenChange={(e) => {
        if (!e.open) {
          onClose()
        }
      }}
    >
      <DialogContent bg="bg.50">
        <DialogHeader>
          <DialogTitle color="fg.DEFAULT">{t('components.collectionDialog.title')}</DialogTitle>
        </DialogHeader>
        <DialogBody>
          <DefaultInput
            placeholder={t('general.words.collectionName')}
            value={collectionName}
            onChange={(e) => setCollectionName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                handleSubmit()
              }
            }}
          />
        </DialogBody>
        <DialogFooter>
          <DialogActionTrigger asChild>
            <RedButton onClick={onClose}>{t('general.actions.cancel')}</RedButton>
          </DialogActionTrigger>
          <DialogActionTrigger asChild>
            <BlueButton onClick={handleSubmit}>{t('general.actions.save')}</BlueButton>
          </DialogActionTrigger>
        </DialogFooter>
        <DialogCloseTrigger ref={closeButtonRef} />
      </DialogContent>
    </DialogRoot>
  )
})

export default CollectionDialog
