import Logo from '@/assets/Logo.svg'
import { useAuthContext } from '@/hooks/useAuthContext'
import { Flex, IconButton, Image } from '@chakra-ui/react'
import { Link } from '@tanstack/react-router'
import { useState } from 'react'
import { FiMenu } from 'react-icons/fi'
import Drawer from './Drawer'
import GuestModeNotice from './GuestModeNotice'

function Navbar() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const { isGuest } = useAuthContext()

  return (
    <>
      <Flex
        as="nav"
        position="fixed"
        top="0"
        left="0"
        right="0"
        px="4"
        py="2"
        align="center"
        zIndex="1000"
        pointerEvents="none"
        justifyContent="space-between"
      >
        <Link to="/collections" style={{ pointerEvents: 'auto' }}>
          <IconButton variant="ghost" aria-label="Home" size="md" _hover={{ bg: 'none' }}>
            <Image width="3rem" src={Logo} alt="Logo" />
          </IconButton>
        </Link>

        {isGuest && <GuestModeNotice />}

        <IconButton
          variant="ghost"
          aria-label="Menu"
          size="md"
          onClick={() => setIsDrawerOpen(true)}
          style={{ pointerEvents: 'auto' }}
          _hover={{ bg: 'none' }}
        >
          <FiMenu size="1.5rem" />
        </IconButton>
      </Flex>
      <Drawer isOpen={isDrawerOpen} setIsOpen={setIsDrawerOpen} />
    </>
  )
}

export default Navbar
