import { useState, useEffect } from 'react'
import {
  Box, Heading, Table, Thead, Tbody, Tr, Th, Td, Tag, Spinner, Alert, AlertIcon, Text, Button, HStack
} from '@chakra-ui/react'
import { api } from '../services/api'
import { format } from 'date-fns'

const statusColor = {
  sent: 'green',
  failed: 'red',
  pending: 'orange',
}

const Logs = () => {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)

  useEffect(() => {
    fetchLogs(page)
    // eslint-disable-next-line
  }, [page])

  const fetchLogs = async (pageNum = 1) => {
    setLoading(true)
    setError('')
    try {
      const res = await api.get(`/logs/list?page=${pageNum}&limit=10`)
      setLogs(res.data.logs)
      setPages(res.data.pagination.pages)
    } catch (err) {
      setError('Failed to load logs')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box maxW="900px" mx="auto" bg="white" p={8} borderRadius={8} boxShadow="md">
      <Heading size="md" mb={6} color="brand.500">Email Logs</Heading>
      {error && <Alert status="error" mb={4}><AlertIcon />{error}</Alert>}
      {loading ? <Spinner size="xl" color="brand.500" /> : (
        <>
          <Table variant="simple" size="md">
            <Thead>
              <Tr>
                <Th>Status</Th>
                <Th>Subject</Th>
                <Th>To</Th>
                <Th>Sent At</Th>
                <Th>Error</Th>
              </Tr>
            </Thead>
            <Tbody>
              {logs.length === 0 && (
                <Tr><Td colSpan={5}><Text>No logs found.</Text></Td></Tr>
              )}
              {logs.map(log => (
                <Tr key={log._id}>
                  <Td><Tag colorScheme={statusColor[log.status]}>{log.status}</Tag></Td>
                  <Td>{log.subject}</Td>
                  <Td>{log.to?.join(', ')}</Td>
                  <Td>{log.sentAt ? format(new Date(log.sentAt), 'PPpp') : '-'}</Td>
                  <Td>{log.errorMessage || '-'}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
          <HStack mt={4} justify="center">
            <Button onClick={() => setPage(p => Math.max(1, p - 1))} isDisabled={page === 1}>Previous</Button>
            <Text>Page {page} of {pages}</Text>
            <Button onClick={() => setPage(p => Math.min(pages, p + 1))} isDisabled={page === pages}>Next</Button>
          </HStack>
        </>
      )}
    </Box>
  )
}

export default Logs 