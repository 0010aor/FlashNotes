import { createSystem, defaultConfig, defineConfig } from '@chakra-ui/react'
const config = defineConfig({
  theme: {
    semanticTokens: {
      colors: {
        bg: {
          DEFAULT: {
            value: { _light: '#FFFFFF', _dark: '#312a37' },
          },
          primary: {
            value: { _light: '#FFFFFF', _dark: '#312a37' },
          },
          50: {
            value: { _light: '{colors.gray.100}', _dark: '#2F363D' },
          },
          100: {
            value: { _light: '#E4E4E7', _dark: '#453f4b' },
          },
          200: {
            value: { _light: '#CDCED6', _dark: '#78727c' },
          },
          input: {
            value: { _light: '#F0F0F3', _dark: '#2c2531' },
          },
          box: {
            value: { _light: '#F4F4F5', _dark: '#24292E' },
          },
          code: {
            value: { _light: '#f0f0f3', _dark: '#202429' },
          },
        },
        fg: {
          DEFAULT: {
            value: { _light: '{colors.gray.700}', _dark: '{colors.gray.300}' },
          },
          primary: {
            value: { _light: '{colors.gray.700}', _dark: '{colors.gray.300}' },
          },
          muted: {
            value: { _light: '{colors.gray.600}', _dark: '{colors.gray.400}' },
          },
        },
        fbuttons: {
          blue: {
            value: '{colors.blue.600}',
          },
          green: {
            value: '{colors.green.600}',
          },
          orange: {
            value: '#F49F76',
          },
        },
        bd: {
          blue: {
            value: { _light: '#89c3ca', _dark: '#78727c' },
          },
          red: {
            value: { _light: '#ddbebe', _dark: '#78727c' },
          },
        },
        accent: {
          blue: {
            value: '#20B8CD',
          },
          'blue.light': {
            value: '#0588F0',
          },
          'blue.dark': {
            value: '#047AD8',
          },
          'red.dark': {
            value: '#57303A',
          },
          'green.dark': {
            value: '#2E493F',
          },
        },
        stat: {
          positive: {
            value: {
              _light: '#38A169',
              _dark: '#38A169',
            },
          },
          negative: {
            value: { _light: '#E53E3E', _dark: '#E53E3E' },
          },
          neutral: {
            value: { _light: '#A0AEC0', _dark: '#A0AEC0' },
          },
          primaryData: {
            value: { _light: '{colors.teal.400}', _dark: '{colors.teal.200}' },
          },
          secondaryData: {
            value: { _light: '{colors.blue.400}', _dark: '{colors.blue.200}' },
          },
          axis: {
            value: { _light: '{colors.gray.500}', _dark: '{colors.gray.400}' },
          },
        },
      },
    },
  },
})

export const system = createSystem(defaultConfig, config)
