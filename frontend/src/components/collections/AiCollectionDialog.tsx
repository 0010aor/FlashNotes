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
import { Text } from '@chakra-ui/react'
import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { BlueButton, RedButton } from '../commonUI/Button'
import { DefaultInput } from '../commonUI/Input'
import { type OpenChangeDetails } from 'node_modules/@chakra-ui/react/dist/types/components/dialog/namespace'

interface AiCollectionDialogProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (prompt: string) => void
  isLoading: boolean
}

const MAX_CHARS = 100 //TODO: move to const folder

const AiCollectionDialog: React.FC<AiCollectionDialogProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
}) => {
  const { t } = useTranslation()
  const [prompt, setPrompt] = useState<string>('')
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  const handleSubmit = () => {
    if (!prompt.trim() || isLoading) return
    onSubmit(prompt)
    setPrompt('')
  }

  if (!isOpen && prompt !== '') {
    setPrompt('')
  }

  const handleOpenChange = (detail: OpenChangeDetails) => {
    if (!detail.open) {
      onClose()
    }
  }
  
  const handleKeyDown = (event: { key: string; preventDefault: () => void }) => {
    if (event.key === 'Enter' && !isLoading) {
      event.preventDefault()
      handleSubmit()
    }
  }

  return (
    <DialogRoot
      key="add-ai-collection-dialog"
      placement="center"
      motionPreset="slide-in-bottom"
      open={isOpen}
      onOpenChange={handleOpenChange}
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
            onKeyDown={handleKeyDown}
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
            <BlueButton onClick={handleSubmit} disabled={isLoading || !prompt.trim()}>
              {isLoading ? `${t('general.actions.creating')}...` : t('general.actions.create')}
            </BlueButton>
          </DialogActionTrigger>
        </DialogFooter>
        <DialogCloseTrigger ref={closeButtonRef} />
      </DialogContent>
    </DialogRoot>
  )
}

export default AiCollectionDialog
