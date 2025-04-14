import { Stack, Text } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import { ImGithub } from 'react-icons/im'

interface FooterProps {
  version?: string
  githubUrl?: string
  copyrightYear?: string
}

export function Footer({
  version = '0.8',
  githubUrl = 'https://github.com/0010aor/FlashNotes',
  copyrightYear = new Date().getFullYear().toString(),
}: FooterProps) {
  const { t } = useTranslation()
  return (
    <Stack
      direction={{ base: 'column', md: 'row' }}
      justify="center"
      align="center"
      gap={4}
      mt={16}
      pb={8}
      color="gray.500"
      fontSize="sm"
    >
      <a
        href={githubUrl}
        target="_blank"
        rel="noopener noreferrer"
        style={{ textDecoration: 'none', color: 'inherit' }}
      >
        <Stack direction="row" align="center" gap={2}>
          <ImGithub />

          <Text>{t('general.words.github')}</Text>
        </Stack>
      </a>
      <Text>•</Text>
      <Text color="gray.500">
        {t('general.words.version')} {version}
      </Text>
      <Text>•</Text>
      <Text>
        © {copyrightYear} {t('general.words.flashNotes')}
      </Text>
    </Stack>
  )
}
