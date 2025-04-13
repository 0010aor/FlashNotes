import { Box, type BoxProps } from '@chakra-ui/react'
import type { PropsWithChildren } from 'react'

type ScrollableContainerProps = PropsWithChildren<BoxProps>

export default function ScrollableContainer({ children, ...props }: ScrollableContainerProps) {
  return (
    <Box
      h="calc(100vh - 10rem)"
      overflowY="auto"
      pr="3"
      css={{
        '&::-webkit-scrollbar': {
          width: '.5rem',
        },
        '&::-webkit-scrollbar-track': {
          background: 'transparent',
        },
        '&::-webkit-scrollbar-thumb': {
          background: 'bg.50',
          borderRadius: '3px',
        },
        '&::-webkit-scrollbar-thumb:hover': {
          background: 'bg.200',
        },
      }}
      {...props}
    >
      {children}
    </Box>
  )
}
