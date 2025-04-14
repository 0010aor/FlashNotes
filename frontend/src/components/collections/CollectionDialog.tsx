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
import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { BlueButton, RedButton } from '../commonUI/Button'
import { DefaultInput } from '../commonUI/Input'

interface CollectionDialogProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (name: string) => void
}

const CollectionDialog: React.FC<CollectionDialogProps> = ({ isOpen, onClose, onSubmit }) => {
  const { t } = useTranslation()
  const [collectionName, setCollectionName] = useState('')
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  const handleSubmit = () => {
    if (!collectionName.trim()) return
    onSubmit(collectionName)
    setCollectionName('')
  }

  if (!isOpen && collectionName !== '') {
    setCollectionName('')
  }

  return (
    <DialogRoot
      key="add-collection-dialog"
      placement="center"
      motionPreset="slide-in-bottom"
      open={isOpen}
      onOpenChange={(detail) => {
        if (!detail.open) {
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
            <BlueButton onClick={handleSubmit} disabled={!collectionName.trim()}>
              {t('general.actions.save')}
            </BlueButton>
          </DialogActionTrigger>
        </DialogFooter>
        <DialogCloseTrigger ref={closeButtonRef} />
      </DialogContent>
    </DialogRoot>
  )
}

export default CollectionDialog
