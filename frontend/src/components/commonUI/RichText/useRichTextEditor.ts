import CharacterCount from '@tiptap/extension-character-count'
import { type EditorOptions, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Markdown } from 'tiptap-markdown'

interface UseRichTextEditorOptions {
  content?: string
  characterLimit?: number
  onUpdate?: EditorOptions['onUpdate']
}

/**
 * A custom hook that provides a configured TipTap editor instance
 * with common extensions and settings.
 *
 * @param options Configuration options for the editor
 * @returns A configured TipTap editor instance
 */
export function useRichTextEditor({
  content = '',
  characterLimit = 3000,
  onUpdate,
}: UseRichTextEditorOptions = {}) {
  return useEditor({
    shouldRerenderOnTransaction: false,
    extensions: [
      StarterKit,
      Markdown.configure({
        html: true,
        transformPastedText: true,
        transformCopiedText: false,
      }),
      CharacterCount.configure({
        limit: characterLimit,
      }),
    ],
    content,
    editorProps: {
      attributes: {
        class: 'tiptap-editor',
      },
    },
    onUpdate,
  })
}
