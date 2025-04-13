import { Stack, VStack } from '@chakra-ui/react'
import { Skeleton } from '@chakra-ui/react'

export default function ListSkeleton({ count = 7 }) {
  return (
    <VStack gap="8">
      {[...Array(count)].map((_, index) => (
        // biome-ignore lint/suspicious/noArrayIndexKey:
        <Stack flex="1" key={`skeleton-${index}`} width="100%">
          <Skeleton height="3rem" bg="bg.50" />
        </Stack>
      ))}
    </VStack>
  )
}
