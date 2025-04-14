import { Box, HStack, IconButton } from '@chakra-ui/react'
import type { Editor } from '@tiptap/react'
import { memo, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import {
  RiBold,
  RiCodeBoxLine,
  RiCodeLine,
  RiH1,
  RiH2,
  RiH3,
  RiItalic,
  RiListOrdered,
  RiListUnordered,
  RiStrikethrough,
} from 'react-icons/ri'

interface EditorToolbarProps {
  editor: Editor | null
}

interface ToolbarButton {
  icon: React.ReactElement
  command: string
  tooltip: string
}

function EditorToolbar({ editor }: EditorToolbarProps) {
  if (!editor) {
    return null
  }
  const { t } = useTranslation()

  const toolbarButtons: ToolbarButton[] = [
    {
      icon: <RiH1 size={20} />,
      command: 'heading-1',
      tooltip: t('components.editorToolbar.heading1'),
    },
    {
      icon: <RiH2 size={20} />,
      command: 'heading-2',
      tooltip: t('components.editorToolbar.heading2'),
    },
    {
      icon: <RiH3 size={20} />,
      command: 'heading-3',
      tooltip: t('components.editorToolbar.heading3'),
    },
    {
      icon: <RiBold size={20} />,
      command: 'bold',
      tooltip: t('components.editorToolbar.bold'),
    },
    {
      icon: <RiItalic size={20} />,
      command: 'italic',
      tooltip: t('components.editorToolbar.italic'),
    },
    {
      icon: <RiStrikethrough size={20} />,
      command: 'strike',
      tooltip: t('components.editorToolbar.strikethrough'),
    },
    {
      icon: <RiListUnordered size={20} />,
      command: 'bulletList',
      tooltip: t('components.editorToolbar.bulletList'),
    },
    {
      icon: <RiListOrdered size={20} />,
      command: 'orderedList',
      tooltip: t('components.editorToolbar.numberedList'),
    },
    {
      icon: <RiCodeLine size={20} />,
      command: 'code',
      tooltip: t('components.editorToolbar.inlineCode'),
    },
    {
      icon: <RiCodeBoxLine size={20} />,
      command: 'codeBlock',
      tooltip: t('components.editorToolbar.codeBlock'),
    },
  ]

  const toggleFormat = useCallback(
    (command: string) => {
      switch (command) {
        case 'heading-1':
          editor.chain().focus().toggleHeading({ level: 1 }).run()
          break
        case 'heading-2':
          editor.chain().focus().toggleHeading({ level: 2 }).run()
          break
        case 'heading-3':
          editor.chain().focus().toggleHeading({ level: 3 }).run()
          break
        case 'bulletList':
          editor.chain().focus().toggleBulletList().run()
          break
        case 'orderedList':
          editor.chain().focus().toggleOrderedList().run()
          break
        case 'codeBlock':
          editor.chain().focus().toggleCodeBlock().run()
          break
        default:
          editor.chain().focus().toggleMark(command).run()
      }
    },
    [editor],
  )

  const isActive = useCallback(
    (command: string) => {
      switch (command) {
        case 'heading-1':
          return editor.isActive('heading', { level: 1 })
        case 'heading-2':
          return editor.isActive('heading', { level: 2 })
        case 'heading-3':
          return editor.isActive('heading', { level: 3 })
        case 'bulletList':
          return editor.isActive('bulletList')
        case 'orderedList':
          return editor.isActive('orderedList')
        case 'codeBlock':
          return editor.isActive('codeBlock')
        default:
          return editor.isActive(command)
      }
    },
    [editor],
  )

  return (
    <HStack
      gap={{ base: 0.5, md: 1 }}
      p={{ base: 0.5, md: 1 }}
      bg="bg.100"
      borderTopRadius="md"
      mb={1}
      overflowX="auto"
      flexWrap="nowrap"
      overflowY="hidden"
      css={{
        '&::-webkit-scrollbar': {
          height: '4px',
        },
        '&::-webkit-scrollbar-track': {
          background: 'transparent',
        },
        '&::-webkit-scrollbar-thumb': {
          background: 'var(--chakra-colors-bg-200)',
          borderRadius: '2px',
        },
      }}
    >
      {toolbarButtons.map((button) => (
        <Box key={button.command} title={button.tooltip}>
          <IconButton
            aria-label={button.tooltip}
            as="button"
            display="inline-flex"
            alignItems="center"
            justifyContent="center"
            size={{ base: 'md', md: 'sm' }}
            variant="ghost"
            colorScheme={isActive(button.command) ? 'teal' : 'gray'}
            onClick={() => toggleFormat(button.command)}
            _hover={{ bg: 'bg.50' }}
            minW={{ base: '40px', md: '32px' }}
            h={{ base: '40px', md: '32px' }}
            bg={isActive(button.command) ? 'bg.50' : 'transparent'}
            borderWidth={isActive(button.command) ? '1px' : '0'}
            _active={{
              bg: 'bg.50',
              transform: 'scale(0.95)',
            }}
          >
            {button.icon}
          </IconButton>
        </Box>
      ))}
    </HStack>
  )
}

export default memo(EditorToolbar)
