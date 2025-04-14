import { IconButton, Spinner } from '@chakra-ui/react'

export interface FloatingActionButtonProps {
  icon: React.ReactNode
  onClick?: () => void
  position?: 'right' | 'left'
  bgColor?: string
  'aria-label': string
  isLoading?: boolean
}

function FloatingActionButton({
  icon,
  onClick,
  position = 'right',
  bgColor = 'fbuttons.blue',
  'aria-label': ariaLabel,
  isLoading = false,
}: FloatingActionButtonProps) {
  return (
    <IconButton
      position="fixed"
      bottom="1.5rem"
      {...(position === 'right' ? { right: '2rem' } : { left: '2rem' })}
      aria-label={ariaLabel}
      bgColor={bgColor}
      rounded="full"
      size="2xl"
      transition="all 0.4s"
      _hover={{
        transform: 'scale(1.1)',
      }}
      _active={{
        transform: 'scale(0.95)',
      }}
      onClick={onClick}
      loading={isLoading}
      spinner={<Spinner color="white" />}
    >
      {icon}
    </IconButton>
  )
}

export default FloatingActionButton
