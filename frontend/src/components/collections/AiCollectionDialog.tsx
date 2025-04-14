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
import { Text, useDisclosure } from '@chakra-ui/react'
import { forwardRef, useImperativeHandle, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { BlueButton, RedButton } from '../commonUI/Button'
import { DefaultInput } from '../commonUI/Input'

interface AiCollectionDialogProps {
  onAddAi: (prompt: string) => Promise<void>
  isLoading: boolean
}

export interface AiCollectionDialogRef {
  open: () => void
  close: () => void
}

const MAX_CHARS = 100

const AiCollectionDialog = forwardRef<AiCollectionDialogRef, AiCollectionDialogProps>(
  (props, ref) => {
    const { onAddAi, isLoading } = props
    const { t } = useTranslation()
    const [prompt, setPrompt] = useState('')
    const closeButtonRef = useRef<HTMLButtonElement>(null)
    const { open, onOpen, onClose } = useDisclosure()

    useImperativeHandle(ref, () => ({
      open: onOpen,
      close: onClose,
    }))

    const handleSubmit = async () => {
      if (!prompt.trim() || isLoading) return

      try {
        await onAddAi(prompt)
        setPrompt('')
      } catch (error) {
        console.error('Failed to create AI collection:', error)
      }
    }

    return (
      <DialogRoot
        key="add-ai-collection-dialog"
        placement="center"
        motionPreset="slide-in-bottom"
        open={open}
      >
        <DialogContent bg="bg.50">
          <DialogHeader>
            <DialogTitle color="fg.DEFAULT">{t('components.AiCollectionDialog.title')}</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <DefaultInput
              disabled={isLoading}
              placeholder={t('components.AiCollectionDialog.placeholder')}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              maxLength={MAX_CHARS}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !isLoading) {
                  e.preventDefault()
                  handleSubmit()
                  onClose()
                }
              }}
            />
            <Text fontSize="xs" textAlign="right" color="gray.500" mt={1}>
              {prompt.length}/{MAX_CHARS}
            </Text>
          </DialogBody>
          <DialogFooter>
            <DialogActionTrigger asChild>
              <RedButton onClick={onClose} disabled={isLoading}>
                {t('general.actions.cancel')}
              </RedButton>
            </DialogActionTrigger>
            <DialogActionTrigger asChild>
              <BlueButton onClick={handleSubmit} disabled={isLoading}>
                {isLoading ? `${t('general.actions.creating')}...` : t('general.actions.create')}
              </BlueButton>
            </DialogActionTrigger>
          </DialogFooter>
          <DialogCloseTrigger ref={closeButtonRef} />
        </DialogContent>
      </DialogRoot>
    )
  },
)

export default AiCollectionDialog
