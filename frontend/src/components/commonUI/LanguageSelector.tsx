import { MenuContent, MenuItem, MenuRoot, MenuTrigger } from '@/components/ui/menu'
import { Avatar, Flex, HStack } from '@chakra-ui/react'
import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { LOCALE_KEYS } from '@/i18n'

type Language = (typeof LOCALE_KEYS)[number]
type Placement = 'top' | 'bottom' | 'left' | 'right'

interface LanguageSelectorProps {
  placement?: Placement
}

const useLanguageSelection = () => {
  const { i18n } = useTranslation()
  const [selectedLanguage, setSelectedLanguage] = useState<Language>(
    LOCALE_KEYS.find(({ key }) => key === i18n.language) || LOCALE_KEYS[0],
  )

  const selectLanguage = useCallback(
    (language: Language) => {
      setSelectedLanguage(language)
      i18n.changeLanguage(language.key)
    },
    [i18n],
  )

  return { selectedLanguage, selectLanguage }
}

const LanguageAvatar = ({ language, onClick }: { language: Language; onClick?: () => void }) => (
  <Avatar.Root
    size="2xs"
    onClick={onClick}
    aria-label={`Select ${language.name} language`}
    cursor="pointer"
  >
    <Avatar.Fallback name={language.name} />
    <Avatar.Image src={`https://flagcdn.com/${language.flag}.svg`} alt={`${language.name} flag`} />
  </Avatar.Root>
)

export default function LanguageSelector({ placement = 'bottom' }: LanguageSelectorProps) {
  const { selectedLanguage, selectLanguage } = useLanguageSelection()

  return (
    <MenuRoot positioning={{ placement }}>
      <MenuTrigger asChild>
        <Flex padding="0 8px" cursor="pointer">
          <LanguageAvatar language={selectedLanguage} />
        </Flex>
      </MenuTrigger>
      <MenuContent
        minWidth="0"
        background="transparent"
        boxShadow="none"
        portalled={false}
        role="menu"
        aria-label="Language selection menu"
      >
        {LOCALE_KEYS.filter((language) => language.key !== selectedLanguage.key).map((language) => (
          <MenuItem
            paddingInline={0}
            key={language.key}
            background="transparent"
            value={language.key}
            role="menuitem"
          >
            <HStack
              cursor="pointer"
              _active={{ opacity: 0.8 }}
              _hover={{
                transform: 'scale(1.15)',
                transition: 'all 0.3s ease',
              }}
            >
              <LanguageAvatar language={language} onClick={() => selectLanguage(language)} />
            </HStack>
          </MenuItem>
        ))}
      </MenuContent>
    </MenuRoot>
  )
}
