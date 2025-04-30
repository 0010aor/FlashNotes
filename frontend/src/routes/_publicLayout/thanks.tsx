import Logo from '@/assets/Logo.svg'
import contributorsData from '@/assets/contributors.json'
import { Footer } from '@/components/commonUI/Footer'
import {
  Box,
  Link as ChakraLink,
  Container,
  Heading,
  Image,
  SimpleGrid,
  Text,
  VStack,
} from '@chakra-ui/react'
import { Link as RouterLink, createFileRoute } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'

interface Contributor {
  login: string
  name: string
  avatar_url: string
  profile: string
  contributions: string[]
}

const contributors: Contributor[] = contributorsData as Contributor[]

export const Route = createFileRoute('/_publicLayout/thanks')({
  component: ThanksPage,
})

function ContributorCard({ contributor }: { contributor: Contributor }) {
  return (
    <VStack p={4} align="center" gap={2}>
      <ChakraLink href={contributor.profile} target="_blank" rel="noopener noreferrer">
        <Image
          src={contributor.avatar_url}
          alt={contributor.name}
          boxSize="80px"
          borderRadius="full"
          mb={2}
        />
      </ChakraLink>
      <ChakraLink
        href={contributor.profile}
        target="_blank"
        rel="noopener noreferrer"
        _hover={{ textDecoration: 'underline' }}
      >
        <Text fontWeight="bold" fontSize="md" textAlign="center">
          {contributor.name}
        </Text>
      </ChakraLink>
    </VStack>
  )
}

function ThanksPage() {
  const { t } = useTranslation()
  return (
    <Container py={20} minH="100dvh" display="flex" flexDirection="column" justifyContent="center">
      <Box mb={8} display="flex" justifyContent="center">
        <RouterLink to="/">
          <Image src={Logo} alt="FlashNotes Logo" boxSize="80px" cursor="pointer" />
        </RouterLink>
      </Box>
      <VStack gap={8} align="center">
        <Heading as="h1" size="2xl" fontWeight="bold" textAlign="center">
          {t('routes.publicLayout.thanks.title')}
        </Heading>
        <Text fontSize="xl" color="gray.500" textAlign="center">
          {t('routes.publicLayout.thanks.description')}
        </Text>
        <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} gap={8} mt={4}>
          {contributors.map((contributor) => (
            <ContributorCard key={contributor.login} contributor={contributor} />
          ))}
        </SimpleGrid>
      </VStack>
      <Footer version="0.0.17" />
    </Container>
  )
}

export default ThanksPage
