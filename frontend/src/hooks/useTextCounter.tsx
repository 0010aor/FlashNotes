import { toaster } from '@/components/ui/toaster'
import { MAX_CHARACTERS } from '@/utils/text'
import type { Editor } from '@tiptap/react'
import { useCallback, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

function useTextCounter(editor: Editor | null, setTextLength: (length: number) => void) {
  const { t } = useTranslation()

  const handleTextChange = useCallback(
    (currentEditor: Editor | null) => {
      if (currentEditor) {
        const currentText = currentEditor.getText()

        if (currentText.length > MAX_CHARACTERS) {
          const truncatedText = currentText.substring(0, MAX_CHARACTERS)

          if (currentEditor.getText() !== truncatedText) {
            setTimeout(() => {
              // Prevent race condition with tiptap paste event
              if (currentEditor && !currentEditor.isDestroyed) {
                currentEditor.commands.setContent(truncatedText)
                setTextLength(currentEditor.getText().length)
              }
            }, 0)

            toaster.create({
              title: t('components.editorTextCounter.title'),
              description: t('components.editorTextCounter.description'),
              type: 'info',
            })
          }
        }
        // Update length no matter truncated or not
        setTextLength(currentEditor.getText().length)
      }
    },
    [setTextLength, t],
  )

  useEffect(() => {
    if (editor) {
      const handleUpdate = ({ editor: currentEditor }: { editor: Editor | null }) => {
        // Make sure editor has already updated
        setTimeout(() => {
          if (currentEditor && !currentEditor.isDestroyed) {
            handleTextChange(currentEditor)
          }
        }, 0)
      }
      editor.on('update', handleUpdate)
      // Calculate when initialization
      handleTextChange(editor)

      return () => {
        editor.off('update', handleUpdate)
      }
    }
  }, [editor, handleTextChange])

  return
}

export default useTextCounter
