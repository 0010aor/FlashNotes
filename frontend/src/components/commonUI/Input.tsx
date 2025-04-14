import { Input, type InputProps } from '@chakra-ui/react'
import { forwardRef } from 'react'

export const DefaultInput = forwardRef<HTMLInputElement, InputProps>((props, ref) => (
  <Input
    ref={ref}
    borderRadius="sm"
    color="fg.DEFAULT"
    bg="bg.input"
    css={{
      '&:focus': {
        outline: 'none',
        borderColor: 'bg.50',
        bg: 'bg.100',
      },
      '&::selection': {
        backgroundColor: 'bg.50',
        color: 'accent.blue',
      },
    }}
    {...props}
  />
))

DefaultInput.displayName = 'DefaultInput'
