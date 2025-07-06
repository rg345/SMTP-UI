import {
  Box,
  Flex,
  VStack,
  HStack,
  Text,
  IconButton,
  useColorModeValue,
  Drawer,
  DrawerContent,
  useDisclosure,
  CloseButton,
} from '@chakra-ui/react'
import {
  FiMenu,
  FiHome,
  FiMail,
  FiSettings,
  FiList,
  FiLogOut,
} from 'react-icons/fi'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const NavItem = ({ icon, children, href, isActive }) => {
  const navigate = useNavigate()
  
  return (
    <Box
      as="button"
      w="full"
      p={3}
      borderRadius="lg"
      bg={isActive ? 'brand.500' : 'transparent'}
      color={isActive ? 'white' : 'gray.600'}
      _hover={{
        bg: isActive ? 'brand.600' : 'gray.100',
      }}
      onClick={() => navigate(href)}
      transition="all 0.2s"
    >
      <HStack spacing={3}>
        {icon}
        <Text fontWeight={isActive ? 'semibold' : 'medium'}>
          {children}
        </Text>
      </HStack>
    </Box>
  )
}

const SidebarContent = ({ onClose, ...rest }) => {
  const location = useLocation()
  const { logout } = useAuth()

  const navItems = [
    { icon: <FiHome />, label: 'Dashboard', href: '/dashboard' },
    { icon: <FiMail />, label: 'Compose', href: '/compose' },
    { icon: <FiList />, label: 'Logs', href: '/logs' },
    { icon: <FiSettings />, label: 'Settings', href: '/settings' },
  ]

  return (
    <Box
      bg={useColorModeValue('white', 'gray.900')}
      borderRight="1px"
      borderRightColor={useColorModeValue('gray.200', 'gray.700')}
      w={{ base: 'full', md: 60 }}
      pos="fixed"
      h="full"
      {...rest}
    >
      <Flex h="20" alignItems="center" mx="8" justifyContent="space-between">
        <Text fontSize="2xl" fontWeight="bold" color="brand.500">
          SMTP UI
        </Text>
        <CloseButton display={{ base: 'flex', md: 'none' }} onClick={onClose} />
      </Flex>
      
      <VStack spacing={2} align="stretch" px={4}>
        {navItems.map((item) => (
          <NavItem
            key={item.href}
            icon={item.icon}
            href={item.href}
            isActive={location.pathname === item.href}
          >
            {item.label}
          </NavItem>
        ))}
        
        <Box pt={4} borderTop="1px" borderTopColor="gray.200">
          <NavItem icon={<FiLogOut />} onClick={logout}>
            Logout
          </NavItem>
        </Box>
      </VStack>
    </Box>
  )
}

const MobileNav = ({ onOpen, ...rest }) => {
  const { user } = useAuth()
  
  return (
    <Flex
      ml={{ base: 0, md: 60 }}
      px={{ base: 4, md: 4 }}
      height="20"
      alignItems="center"
      bg={useColorModeValue('white', 'gray.900')}
      borderBottomWidth="1px"
      borderBottomColor={useColorModeValue('gray.200', 'gray.700')}
      justifyContent={{ base: 'space-between', md: 'flex-end' }}
      {...rest}
    >
      <IconButton
        display={{ base: 'flex', md: 'none' }}
        onClick={onOpen}
        variant="outline"
        aria-label="open menu"
        icon={<FiMenu />}
      />

      <Text
        display={{ base: 'flex', md: 'none' }}
        fontSize="2xl"
        fontWeight="bold"
        color="brand.500"
      >
        SMTP UI
      </Text>

      <HStack spacing={{ base: '0', md: '6' }}>
        <Flex alignItems={'center'}>
          <Text fontSize="sm" color="gray.600">
            Welcome, {user?.name}
          </Text>
        </Flex>
      </HStack>
    </Flex>
  )
}

const Layout = ({ children }) => {
  const { isOpen, onOpen, onClose } = useDisclosure()

  return (
    <Box minH="100vh" bg={useColorModeValue('gray.50', 'gray.900')}>
      <SidebarContent
        onClose={() => onClose}
        display={{ base: 'none', md: 'block' }}
      />
      <Drawer
        isOpen={isOpen}
        placement="left"
        onClose={onClose}
        returnFocusOnClose={false}
        onOverlayClick={onClose}
        size="full"
      >
        <DrawerContent>
          <SidebarContent onClose={onClose} />
        </DrawerContent>
      </Drawer>
      
      <MobileNav onOpen={onOpen} />
      
      <Box ml={{ base: 0, md: 60 }} p="4">
        {children}
      </Box>
    </Box>
  )
}

export default Layout 