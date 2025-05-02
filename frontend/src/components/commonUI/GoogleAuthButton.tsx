import GoogleIcon from '@/assets/google-icon.svg'
import { Button, type ButtonProps, HStack, Image, Text } from '@chakra-ui/react'
import { forwardRef } from 'react'

interface GoogleAuthButtonProps extends ButtonProps {
  action: 'login' | 'signup'
}

export const GoogleAuthButton = forwardRef<HTMLButtonElement, GoogleAuthButtonProps>(
  ({ action, ...props }, ref) => (
    <Button
      ref={ref}
      variant="outline"
      width="100%"
      boxShadow="rgba(0, 0, 0, 0.12) 0px 1px 1px 0px, var(--chakra-colors-bg-200) 0px 0px 0px 1px, rgba(0, 0, 0, 0.2) 0px 2px 5px 0px"
      borderWidth="1px"
      borderColor="bg.200"
      bg="bg.50"
      color="fg.primary"
      borderRadius="md"
      height="40px"
      _hover={{
        bg: 'bg.100',
      }}
      {...props}
    >
      <HStack spacing={2} width="100%" justifyContent="center">
        <Image src={GoogleIcon} alt="Google" boxSize="18px" />
        <Text>{action === 'login' ? 'Continue with Google' : 'Sign up with Google'}</Text>
      </HStack>
    </Button>
  ),
)

GoogleAuthButton.displayName = 'GoogleAuthButton'
