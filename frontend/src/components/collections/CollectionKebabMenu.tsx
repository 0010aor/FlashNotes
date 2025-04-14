import { MenuContent, MenuItem, MenuRoot, MenuTrigger } from '@/components/ui/menu'
import { Box } from '@chakra-ui/react'
import { useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { HiDotsVertical } from 'react-icons/hi'
import { IoStatsChart } from 'react-icons/io5'
import { MdDelete } from 'react-icons/md'
import { RiEdit2Fill } from 'react-icons/ri'

interface CollectionKebabMenuProps {
  collectionId: string
  onDelete: (collectionId: string) => void
  onRename: () => void
}

function CollectionKebabMenu({ collectionId, onDelete, onRename }: CollectionKebabMenuProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  return (
    <MenuRoot>
      <MenuTrigger asChild>
        <Box
          as="span"
          p={2}
          borderRadius="md"
          cursor="pointer"
          display="flex"
          alignItems="center"
          justifyContent="center"
          _hover={{ bg: 'bg.100' }}
        >
          <HiDotsVertical size={20} />
        </Box>
      </MenuTrigger>
      <MenuContent bg="bg.50">
        <MenuItem value="Rename" onClick={onRename} borderRadius="md" _hover={{ bg: 'bg.100' }}>
          <RiEdit2Fill />
          <Box flex="1">{t('general.actions.rename')}</Box>
        </MenuItem>
        <MenuItem
          value="Stats"
          onClick={() => navigate({ to: `/collections/${collectionId}/stats` })}
          borderRadius="md"
          _hover={{ bg: 'bg.100' }}
        >
          <IoStatsChart />
          <Box flex="1">{t('general.words.statistics')}</Box>
        </MenuItem>
        <MenuItem
          value="delete"
          onClick={() => onDelete(collectionId)}
          borderRadius="md"
          _hover={{ bg: 'bg.100' }}
        >
          <MdDelete />
          <Box flex="1">{t('general.actions.delete')}</Box>
        </MenuItem>
      </MenuContent>
    </MenuRoot>
  )
}

export default CollectionKebabMenu
