import { Button } from '@chakra-ui/react'

interface ActionButtonProps {
  children: React.ReactNode
  colorPalette?: string
  onClick?: () => void
  variant?: string
}

const ActionButton: React.FC<ActionButtonProps> = ({
  children,
  colorPalette = 'blue',
  onClick
}) => (
  <Button
    colorPalette={colorPalette}
    onClick={onClick}
    size="lg"
  >
    {children}
  </Button>
)

export default ActionButton