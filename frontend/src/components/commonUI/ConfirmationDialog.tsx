import type React from 'react'
import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import {
  DialogActionTrigger,
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTitle,
} from '../ui/dialog'
import { BlueButton, RedButton } from './Button'

interface ConfirmationProps {
  isOpen: boolean
  message: string
  onClose: () => void
  onConfirm: () => void
}

const ConfirmationDialog: React.FC<ConfirmationProps> = ({
  isOpen,
  message,
  onClose,
  onConfirm,
}: ConfirmationProps) => {
  const { t } = useTranslation()
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const cancelButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (isOpen && cancelButtonRef.current) {
      setTimeout(() => {
        cancelButtonRef.current?.focus()
      }, 50)
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <DialogRoot
      key="delete-collection-confirmation-dialog"
      placement="center"
      motionPreset="slide-in-bottom"
      open={isOpen}
      onOpenChange={(detail) => {
        if (!detail.open) {
          onClose()
        }
      }}
    >
      <DialogContent bg={'bg.50'}>
        <DialogHeader>
          <DialogTitle color="fg.DEFAULT">{t('components.confirmationDialog.title')}</DialogTitle>
        </DialogHeader>
        <DialogBody>
          <p>{message}</p>
        </DialogBody>
        <DialogFooter>
          <DialogActionTrigger asChild>
            <BlueButton onClick={onClose} ref={cancelButtonRef} tabIndex={0}>
              {t('general.actions.cancel')}
            </BlueButton>
          </DialogActionTrigger>
          <RedButton onClick={onConfirm} colorPalette="red">
            {t('general.actions.delete')}
          </RedButton>
        </DialogFooter>
        <DialogCloseTrigger ref={closeButtonRef} />
      </DialogContent>
    </DialogRoot>
  )
}

export default ConfirmationDialog
