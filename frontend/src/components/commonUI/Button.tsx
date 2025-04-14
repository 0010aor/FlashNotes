import { Button, type ButtonProps } from '@chakra-ui/react'
import { forwardRef } from 'react'

export const DefaultButton = forwardRef<HTMLButtonElement, ButtonProps>((props, ref) => (
  <Button
    ref={ref}
    boxShadow="rgba(0, 0, 0, 0.12) 0px 1px 1px 0px, var(--chakra-colors-bg-200) 0px 0px 0px 1px, rgba(0, 0, 0, 0.2) 0px 2px 5px 0px"
    borderWidth="1px"
    bg="bg.50"
    color="fg.primary"
    _hover={{
      bg: 'bg.100',
    }}
    {...props}
  />
))

DefaultButton.displayName = 'DefaultButton'

export const BlueButton = forwardRef<HTMLButtonElement, ButtonProps>((props, ref) => (
  <Button
    ref={ref}
    borderRadius="sm"
    borderWidth="1px"
    color="accent.blue"
    boxShadow={{
      _light:
        'rgba(5, 136, 240, 0.12) 0px 1px 1px 0px, rgba(5, 136, 240, 0.3) 0px 0px 0px 1px, rgba(5, 136, 240, 0.2) 0px 2px 5px 0px',
      _dark:
        'rgba(0, 0, 0, 0.12) 0px 1px 1px 0px, var(--chakra-colors-bd-blue) 0px 0px 0px 1px, rgba(0, 0, 0, 0.2) 0px 2px 5px 0px',
    }}
    bg="bg.50"
    _hover={{
      bg: 'rgba(5, 136, 240, 0.15)',
    }}
    _active={{
      bg: 'rgba(5, 136, 240, 0.15)',
    }}
    {...props}
  />
))

BlueButton.displayName = 'BlueButton'

export const RedButton = forwardRef<HTMLButtonElement, ButtonProps>((props, ref) => (
  <Button
    ref={ref}
    borderRadius="sm"
    borderWidth="1px"
    color="#E57373"
    boxShadow={{
      _light:
        'rgba(229, 115, 115, 0.12) 0px 1px 1px 0px, rgba(229, 115, 115, 0.3) 0px 0px 0px 1px, rgba(229, 115, 115, 0.2) 0px 2px 5px 0px',
      _dark:
        'rgba(0, 0, 0, 0.12) 0px 1px 1px 0px, var(--chakra-colors-bd-red) 0px 0px 0px 1px, rgba(0, 0, 0, 0.2) 0px 2px 5px 0px',
    }}
    bg="bg.100"
    _hover={{
      bg: 'rgba(229, 115, 115, 0.15)',
    }}
    _active={{
      bg: 'rgba(229, 115, 115, 0.15)',
    }}
    {...props}
  />
))

RedButton.displayName = 'RedButton'
