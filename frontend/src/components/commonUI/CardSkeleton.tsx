import { Box, Flex, VStack } from '@chakra-ui/react'

import { Skeleton, SkeletonText } from '@/components/ui/skeleton'

export default function CardSkeleton() {
  const skeletonCardStyles = {
    padding: '1rem',
    width: '100%',
    height: '100%',
    borderRadius: 'lg',
    borderWidth: '1px',
    boxShadow: 'sm',
    borderColor: 'bg.200',
  }

  return (
    <VStack gap={4} h="calc(100dvh - 8rem)" width="100%">
      <Flex height="4rem" w="100%" alignItems="end">
        <SkeletonText noOfLines={2} gap="1" />
      </Flex>

      <Box position="relative" height="100%" width="100%" flex="1">
        <Box {...skeletonCardStyles} bg="bg.50">
          <Skeleton height="100%" width="100%" />
        </Box>
      </Box>

      <Flex height="4rem" w="100%" justifyContent="center" alignItems="center">
        <Skeleton height="50%" width="50%" />
      </Flex>
    </VStack>
  )
}
