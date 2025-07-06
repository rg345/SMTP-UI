import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Grid,
  GridItem,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Card,
  CardBody,
  Heading,
  Text,
  Button,
  VStack,
  HStack,
  Icon,
  useColorModeValue,
  Spinner,
  Center,
} from '@chakra-ui/react'
import { FiMail, FiSettings, FiList, FiPlus } from 'react-icons/fi'
import { api } from '../services/api'
import toast from 'react-hot-toast'

const Dashboard = () => {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const cardBg = useColorModeValue('white', 'gray.700')

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await api.get('/logs/stats')
      setStats(response.data)
    } catch (error) {
      console.error('Error fetching stats:', error)
      toast.error('Failed to load dashboard statistics')
    } finally {
      setLoading(false)
    }
  }

  const quickActions = [
    {
      title: 'Compose Email',
      description: 'Send a new email',
      icon: FiMail,
      color: 'blue',
      action: () => navigate('/compose'),
    },
    {
      title: 'SMTP Settings',
      description: 'Manage your email configurations',
      icon: FiSettings,
      color: 'green',
      action: () => navigate('/settings'),
    },
    {
      title: 'View Logs',
      description: 'Check email sending history',
      icon: FiList,
      color: 'purple',
      action: () => navigate('/logs'),
    },
  ]

  if (loading) {
    return (
      <Center h="400px">
        <Spinner size="xl" color="brand.500" />
      </Center>
    )
  }

  return (
    <Box>
      <Heading size="lg" mb={6} color="brand.500">
        Dashboard
      </Heading>

      {/* Statistics Cards */}
      <Grid templateColumns={{ base: '1fr', md: 'repeat(4, 1fr)' }} gap={6} mb={8}>
        <Card bg={cardBg}>
          <CardBody>
            <Stat>
              <StatLabel>Total Emails</StatLabel>
              <StatNumber>{stats?.total?.total || 0}</StatNumber>
              <StatHelpText>
                <StatArrow type="increase" />
                23.36%
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card bg={cardBg}>
          <CardBody>
            <Stat>
              <StatLabel>Sent Successfully</StatLabel>
              <StatNumber color="green.500">{stats?.total?.sent || 0}</StatNumber>
              <StatHelpText>
                <StatArrow type="increase" />
                12.5%
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card bg={cardBg}>
          <CardBody>
            <Stat>
              <StatLabel>Failed</StatLabel>
              <StatNumber color="red.500">{stats?.total?.failed || 0}</StatNumber>
              <StatHelpText>
                <StatArrow type="decrease" />
                8.2%
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card bg={cardBg}>
          <CardBody>
            <Stat>
              <StatLabel>Pending</StatLabel>
              <StatNumber color="orange.500">{stats?.total?.pending || 0}</StatNumber>
              <StatHelpText>
                <StatArrow type="decrease" />
                3.1%
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>
      </Grid>

      {/* Quick Actions */}
      <Heading size="md" mb={4}>
        Quick Actions
      </Heading>
      
      <Grid templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }} gap={6}>
        {quickActions.map((action, index) => (
          <Card key={index} bg={cardBg} cursor="pointer" onClick={action.action} _hover={{ shadow: 'lg' }}>
            <CardBody>
              <VStack spacing={4} align="stretch">
                <HStack justify="space-between">
                  <Icon as={action.icon} boxSize={6} color={`${action.color}.500`} />
                  <Button size="sm" colorScheme={action.color} variant="ghost">
                    <Icon as={FiPlus} />
                  </Button>
                </HStack>
                <Box>
                  <Heading size="sm" mb={2}>
                    {action.title}
                  </Heading>
                  <Text fontSize="sm" color="gray.600">
                    {action.description}
                  </Text>
                </Box>
              </VStack>
            </CardBody>
          </Card>
        ))}
      </Grid>

      {/* Recent Activity */}
      <Box mt={8}>
        <Heading size="md" mb={4}>
          Recent Activity
        </Heading>
        <Card bg={cardBg}>
          <CardBody>
            <Text color="gray.600" textAlign="center">
              Your recent email activities will appear here
            </Text>
          </CardBody>
        </Card>
      </Box>
    </Box>
  )
}

export default Dashboard 