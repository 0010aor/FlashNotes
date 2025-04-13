import Logo from '@/assets/Logo.svg'
import { FlashcardsService } from '@/client'
import { useColorMode } from '@/components/ui/color-mode'
import {
  DrawerBackdrop,
  DrawerBody,
  DrawerCloseTrigger,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerRoot,
} from '@/components/ui/drawer'
import useAuth from '@/hooks/useAuth'
import { HStack, IconButton, Image, List, Spinner, Text, VStack } from '@chakra-ui/react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { FiLogOut, FiMoon, FiSun } from 'react-icons/fi'
import { DefaultButton } from './Button'
import LanguageSelector from './LanguageSelector'

function getCollectionsQueryOptions() {
  return {
    queryFn: () => FlashcardsService.readCollections(),
    queryKey: ['collections'],
  }
}

function Drawer({
  isOpen,
  setIsOpen,
}: {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
}) {
  const { t } = useTranslation()
  const { logout } = useAuth()
  const { colorMode, toggleColorMode } = useColorMode()
  const queryClient = useQueryClient()
  const currentUser = queryClient.getQueryData<{ email: string }>(['currentUser'])
  const { data, isLoading } = useQuery({
    ...getCollectionsQueryOptions(),
    placeholderData: (prevData) => prevData,
  })
  const collections = data?.data ?? []

  const handleNavigate = () => setIsOpen(false)

  const handleLogout = async () => {
    logout()
    setIsOpen(false)
  }

  return (
    <DrawerRoot open={isOpen} onOpenChange={(e) => setIsOpen(e.open)} placement="end">
      <DrawerBackdrop />
      <DrawerContent rounded="none" maxW="280px" bg="bg.box">
        <DrawerHeader display="flex" justifyContent="center" padding=".5rem">
          <Link to="/collections" onClick={handleNavigate}>
            <Image width="3rem" src={Logo} alt="logo" />
          </Link>
        </DrawerHeader>
        <DrawerBody py={2} px={1}>
          <VStack align="stretch">
            {isLoading ? (
              <VStack py={4}>
                <Spinner />
              </VStack>
            ) : (
              <List.Root>
                {collections.map((collection) => (
                  <List.Item
                    key={collection.id}
                    display="flex"
                    alignItems="center"
                    px={3}
                    py={2}
                    borderRadius="lg"
                    transition="all 0.4s"
                    _hover={{ bg: 'bg.100' }}
                    _active={{ bg: 'bg.100' }}
                  >
                    <Link
                      to="/collections/$collectionId"
                      params={{ collectionId: collection.id }}
                      onClick={handleNavigate}
                      style={{ width: '100%' }}
                    >
                      <Text fontSize="15px" color="fg.DEFAULT" truncate>
                        {collection.name}
                      </Text>
                    </Link>
                  </List.Item>
                ))}
              </List.Root>
            )}
          </VStack>
        </DrawerBody>
        <DrawerFooter>
          <VStack width="100%" gap={2}>
            <HStack justifyContent="space-between" w="100%" alignItems="center">
              {currentUser?.email && (
                <Text fontSize="sm" color="fg.muted" maxWidth="11.5rem" truncate>
                  {currentUser.email}
                </Text>
              )}
              <LanguageSelector placement="top" />
            </HStack>
            <HStack width="100%" justifyContent="space-between">
              <DefaultButton onClick={handleLogout} flex="1">
                <FiLogOut size={20} />
                {t('general.actions.logout')}
              </DefaultButton>
              <IconButton
                aria-label={t('general.actions.toggleColorMode')}
                onClick={toggleColorMode}
                size="md"
                variant="outline"
                borderRadius="md"
              >
                {colorMode === 'light' ? <FiMoon /> : <FiSun />}
              </IconButton>
            </HStack>
          </VStack>
        </DrawerFooter>
        <DrawerCloseTrigger />
      </DrawerContent>
    </DrawerRoot>
  )
}

export default Drawer
