import { Tooltip } from '@/components/ui/tooltip'
import { Box, IconButton, Spinner, Stack, useDisclosure } from '@chakra-ui/react'
import { keyframes } from '@emotion/react'
import type React from 'react'
import { useTranslation } from 'react-i18next'
import { VscAdd, VscClose } from 'react-icons/vsc'

const fadeIn = keyframes`
	from { opacity: 0; transform: translateY(10px); }
	to { opacity: 1; transform: translateY(0); }
`

const rotateOpen = keyframes`
	from { transform: rotate(0deg); }
	to { transform: rotate(45deg); }
`

const rotateClose = keyframes`
	from { transform: rotate(45deg); }
	to { transform: rotate(0deg); }
`

export interface SpeedDialActionItem {
  id: string
  icon: React.ReactElement
  label: string
  onClick: () => void
  bgColor?: string
  color?: string
}

interface SpeedDialProps {
  actions: SpeedDialActionItem[]
  mainButtonBgColor?: string
  isLoading?: boolean
}

const SpeedDial: React.FC<SpeedDialProps> = ({
  actions,
  mainButtonBgColor = 'fbuttons.blue',
  isLoading = false,
}) => {
  const { t } = useTranslation()
  const { open, onToggle, onClose } = useDisclosure()

  return (
    <Box position="fixed" bottom="1.5rem" right="2rem" zIndex="docked">
      <Box position="relative">
        {open && (
          <Stack
            position="absolute"
            bottom="100%"
            left="50%"
            transform="translateX(-50%)"
            mb={4}
            gap={4}
            direction="column"
            align="center"
          >
            {actions.map(
              ({ id, icon, label, onClick, bgColor = 'fbuttons.blue', color = 'white' }) => (
                <Tooltip key={id} content={label} showArrow positioning={{ placement: 'left' }}>
                  <IconButton
                    aria-label={label}
                    size="md"
                    rounded="full"
                    bgColor={bgColor}
                    color={color}
                    onClick={() => {
                      onClick()
                      onClose()
                    }}
                    animation={`${fadeIn} 0.2s ease-out forwards`}
                    _hover={{ transform: 'scale(1.1)' }}
                    _active={{ transform: 'scale(0.95)' }}
                  >
                    {icon}
                  </IconButton>
                </Tooltip>
              ),
            )}
          </Stack>
        )}

        <Tooltip
          content={open ? t('components.speedDial.closeMenu') : t('components.speedDial.openMenu')}
          showArrow
        >
          <IconButton
            aria-label={
              open ? t('components.speedDial.closeMenu') : t('components.speedDial.openMenu')
            }
            bgColor={mainButtonBgColor}
            rounded="full"
            size="2xl"
            onClick={onToggle}
            transition="all 0.3s"
            _hover={{ transform: 'scale(1.1)' }}
            _active={{ transform: 'scale(0.95)' }}
            disabled={isLoading}
            animation={
              open
                ? `${rotateOpen} 0.3s ease-in-out forwards`
                : `${rotateClose} 0.3s ease-in-out forwards`
            }
          >
            {open ? (
              <VscClose color="white" />
            ) : isLoading ? (
              <Spinner size="md" color="white" />
            ) : (
              <VscAdd color="white" />
            )}
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  )
}

export default SpeedDial
