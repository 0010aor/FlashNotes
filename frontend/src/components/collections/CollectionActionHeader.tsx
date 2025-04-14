import { Box, Button, Flex } from '@chakra-ui/react'
import { useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { IoStatsChart } from 'react-icons/io5'
import { MdSchool } from 'react-icons/md'
import { VscAdd } from 'react-icons/vsc'

interface CollectionActionHeaderProps {
  collectionId: string
  cardCount: number
}

function CollectionActionHeader({ collectionId, cardCount }: CollectionActionHeaderProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()

  return (
    <Flex justifyContent="center" gap={4} mb={4}>
      <Button
        variant="ghost"
        _hover={{ bg: 'bg.50' }}
        onClick={() => navigate({ to: `/collections/${collectionId}/cards/new` })}
        aria-label={t('general.actions.addCard')}
      >
        <VscAdd />
        <Box as="span" ml={2} display={{ base: 'none', md: 'inline' }}>
          {t('general.actions.addCard')}
        </Box>
      </Button>
      <Button
        variant="ghost"
        _hover={{ bg: 'bg.50' }}
        disabled={cardCount === 0}
        onClick={() => navigate({ to: `/collections/${collectionId}/practice` })}
        aria-label={t('general.actions.practice')}
      >
        <MdSchool />
        <Box as="span" ml={2} display={{ base: 'none', md: 'inline' }}>
          {t('general.actions.practice')}
        </Box>
      </Button>
      <Button
        variant="ghost"
        _hover={{ bg: 'bg.50' }}
        onClick={() => navigate({ to: `/collections/${collectionId}/stats` })}
        aria-label={t('general.words.statistics')}
      >
        <IoStatsChart />
        <Box as="span" ml={2} display={{ base: 'none', md: 'inline' }}>
          {t('general.words.statistics')}
        </Box>
      </Button>
    </Flex>
  )
}

export default CollectionActionHeader
