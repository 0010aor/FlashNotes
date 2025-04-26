import { PasswordInput as ChakraPasswordInput } from '@/components/ui/password-input'
import { forwardRef } from 'react'
import { FiEye, FiEyeOff } from 'react-icons/fi'

interface PasswordInputProps {
  placeholder: string
  value?: string
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  name?: string
  ref?: React.Ref<HTMLInputElement>
}

const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>((props, ref) => {
  return (
    <ChakraPasswordInput
      ref={ref}
      placeholder={props.placeholder}
      value={props.value}
      onChange={props.onChange}
      name={props.name}
      borderRadius="sm"
      color="fg.DEFAULT"
      bg="bg.input"
      width="100%"
      visibilityIcon={{ on: <FiEye />, off: <FiEyeOff /> }}
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
    />
  )
})

export default PasswordInput
