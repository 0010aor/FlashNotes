import {
  DialogActionTrigger,
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { BlueButton, RedButton } from '../commonUI/Button'
import { DefaultInput } from '../commonUI/Input'

interface CollectionDialogProps {
  onAdd: (collectionData: { name: string }) => Promise<void>
  children: React.ReactNode
}

const CollectionDialog: React.FC<CollectionDialogProps> = ({ onAdd, children }) => {
  const { t } = useTranslation()
  const [collectionName, setCollectionName] = useState('')
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  const handleSubmit = async () => {
    if (!collectionName.trim()) return

    try {
      await onAdd({ name: collectionName })
      setCollectionName('')
      closeButtonRef.current?.click()
    } catch (error) {
      console.error('Failed to create collection:', error)
    }
  }

  return (
    <DialogRoot key="add-collection-dialog" placement="center" motionPreset="slide-in-bottom">
      <DialogTrigger asChild>{children}</DialogTrigger>
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
            <RedButton onClick={() => setCollectionName('')}>
              {t('general.actions.cancel')}
            </RedButton>
          </DialogActionTrigger>
          <DialogActionTrigger asChild>
            <BlueButton onClick={handleSubmit}>{t('general.actions.save')}</BlueButton>
          </DialogActionTrigger>
        </DialogFooter>
        <DialogCloseTrigger ref={closeButtonRef} />
      </DialogContent>
    </DialogRoot>
  )
}

export default CollectionDialog
