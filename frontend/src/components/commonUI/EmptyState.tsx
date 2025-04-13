import { Center, Text, VStack } from '@chakra-ui/react'

interface EmptyStateProps {
  title: string
  message: string
}

export default function EmptyState({ title, message }: EmptyStateProps) {
  return (
    <Center h="60dvh">
      <VStack gap={4}>
        <Text fontSize="2xl" fontWeight="bold" color="fg.DEFAULT">
          {title}
        </Text>
        <Text color="fg.DEFAULT" textAlign="center">
          {message}
        </Text>
      </VStack>
    </Center>
  )
}
