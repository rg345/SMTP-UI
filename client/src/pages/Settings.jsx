import { useState, useEffect } from 'react'
import {
  Box, Button, FormControl, FormLabel, Input, VStack, Heading, Text, Select, HStack, Alert, AlertIcon, Spinner, useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter
} from '@chakra-ui/react'
import { api } from '../services/api'
import toast from 'react-hot-toast'

const Settings = () => {
  const [configs, setConfigs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    name: '', host: '', port: 587, secure: false, username: '', password: '', fromEmail: '', fromName: ''
  })
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState(null)
  const [adding, setAdding] = useState(false)
  const { isOpen, onOpen, onClose } = useDisclosure()

  useEffect(() => {
    fetchConfigs()
  }, [])

  const fetchConfigs = async () => {
    setLoading(true)
    try {
      const res = await api.get('/smtp/list')
      setConfigs(res.data.configs)
    } catch (err) {
      setError('Failed to load SMTP configs')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleAdd = async (e) => {
    e.preventDefault()
    setAdding(true)
    setError('')
    try {
      await api.post('/smtp/create', form)
      toast.success('SMTP config added!')
      setForm({ name: '', host: '', port: 587, secure: false, username: '', password: '', fromEmail: '', fromName: '' })
      fetchConfigs()
      onClose()
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add config')
      toast.error(err.response?.data?.error || 'Failed to add config')
    } finally {
      setAdding(false)
    }
  }

  const handleTest = async () => {
    setTesting(true)
    setTestResult(null)
    try {
      const res = await api.post('/smtp/test', form)
      setTestResult({ success: true, message: res.data.message })
      toast.success('SMTP test successful!')
    } catch (err) {
      setTestResult({ success: false, message: err.response?.data?.details || 'Test failed' })
      toast.error(err.response?.data?.details || 'Test failed')
    } finally {
      setTesting(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this SMTP config?')) return
    try {
      await api.delete(`/smtp/${id}`)
      toast.success('Config deleted')
      fetchConfigs()
    } catch (err) {
      toast.error('Failed to delete config')
    }
  }

  if (loading) return <Spinner size="xl" color="brand.500" />

  return (
    <Box maxW="700px" mx="auto" bg="white" p={8} borderRadius={8} boxShadow="md">
      <Heading size="md" mb={6} color="brand.500">SMTP Settings</Heading>
      {error && <Alert status="error" mb={4}><AlertIcon />{error}</Alert>}
      <Button colorScheme="brand" mb={4} onClick={onOpen}>Add SMTP Config</Button>
      <VStack align="stretch" spacing={4}>
        {configs.length === 0 && <Text>No SMTP configs found.</Text>}
        {configs.map(cfg => (
          <Box key={cfg._id} p={4} borderWidth={1} borderRadius={8} bg="gray.50">
            <HStack justify="space-between">
              <Box>
                <Text fontWeight="bold">{cfg.name}</Text>
                <Text fontSize="sm">{cfg.fromEmail} ({cfg.host}:{cfg.port})</Text>
              </Box>
              <Button colorScheme="red" size="sm" onClick={() => handleDelete(cfg._id)}>Delete</Button>
            </HStack>
          </Box>
        ))}
      </VStack>
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add SMTP Config</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <form id="add-smtp-form" onSubmit={handleAdd}>
              <VStack spacing={4} align="stretch">
                <FormControl isRequired>
                  <FormLabel>Name</FormLabel>
                  <Input name="name" value={form.name} onChange={handleChange} />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Host</FormLabel>
                  <Input name="host" value={form.host} onChange={handleChange} />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Port</FormLabel>
                  <Input name="port" type="number" value={form.port} onChange={handleChange} />
                </FormControl>
                <FormControl>
                  <FormLabel>Secure (SSL/TLS)</FormLabel>
                  <Select name="secure" value={form.secure} onChange={handleChange}>
                    <option value={false}>No</option>
                    <option value={true}>Yes</option>
                  </Select>
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Username</FormLabel>
                  <Input name="username" value={form.username} onChange={handleChange} />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Password</FormLabel>
                  <Input name="password" type="password" value={form.password} onChange={handleChange} />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>From Email</FormLabel>
                  <Input name="fromEmail" value={form.fromEmail} onChange={handleChange} />
                </FormControl>
                <FormControl>
                  <FormLabel>From Name</FormLabel>
                  <Input name="fromName" value={form.fromName} onChange={handleChange} />
                </FormControl>
                <Button colorScheme="blue" onClick={handleTest} isLoading={testing}>Test SMTP</Button>
                {testResult && (
                  <Alert status={testResult.success ? 'success' : 'error'}>
                    <AlertIcon />{testResult.message}
                  </Alert>
                )}
              </VStack>
            </form>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="brand" mr={3} type="submit" form="add-smtp-form" isLoading={adding}>Add</Button>
            <Button onClick={onClose}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  )
}

export default Settings 