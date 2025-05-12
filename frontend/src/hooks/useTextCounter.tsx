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
        setTextLength(currentText.length)
        if (currentText.length > MAX_CHARACTERS) {
          currentEditor.chain().undo().run()
          toaster.create({
            title: t('components.editorTextCounter.title'),
            description: t('components.editorTextCounter.description'),
            type: 'info',
          })
        }
      }
    },
    [setTextLength, t],
  )

  useEffect(() => {
    if (editor) {
      const handleUpdate = ({ editor: currentEditor }: { editor: Editor | null }) => {
        handleTextChange(currentEditor)
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
