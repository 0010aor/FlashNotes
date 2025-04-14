import LanguageSelector from '@/components/commonUI/LanguageSelector'
import { Container, Flex } from '@chakra-ui/react'
import { Outlet, createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_publicLayout')({
  component: PublicLayout,
})

function PublicLayout() {
  return (
    <Container>
      <Flex
        position="absolute"
        top="0"
        left="0"
        right="0"
        px="4"
        py="4"
        zIndex={1}
        justifyContent="flex-end"
      >
        <LanguageSelector />
      </Flex>
      <Outlet />
    </Container>
  )
}
