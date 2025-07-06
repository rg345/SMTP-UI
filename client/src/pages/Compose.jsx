import { useState, useEffect, useRef } from 'react'
import {
  Box, Button, FormControl, FormLabel, Input, Select, VStack, Heading, Text, Spinner, Alert, AlertIcon, HStack, Tag, IconButton
} from '@chakra-ui/react'
import { useForm, Controller } from 'react-hook-form'
import { api } from '../services/api'
import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.snow.css'
import { FiX } from 'react-icons/fi'
import toast from 'react-hot-toast'

const Compose = () => {
  const [smtpConfigs, setSmtpConfigs] = useState([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const [attachments, setAttachments] = useState([])
  const fileInputRef = useRef()

  const { register, handleSubmit, control, reset, setValue, watch } = useForm({
    defaultValues: {
      smtpConfigId: '',
      to: '',
      cc: '',
      bcc: '',
      subject: '',
      body: ''
    }
  })

  useEffect(() => {
    fetchSmtpConfigs()
  }, [])

  const fetchSmtpConfigs = async () => {
    try {
      const res = await api.get('/smtp/list')
      setSmtpConfigs(res.data.configs)
    } catch (err) {
      setError('Failed to load SMTP configs')
    } finally {
      setLoading(false)
    }
  }

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files)
    setAttachments((prev) => [...prev, ...files])
    fileInputRef.current.value = ''
  }

  const removeAttachment = (index) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index))
  }

  const onSubmit = async (data) => {
    setSending(true)
    setError('')
    try {
      // Prepare form data for attachments
      const formData = new FormData()
      formData.append('smtpConfigId', data.smtpConfigId)
      formData.append('to', data.to)
      formData.append('cc', data.cc)
      formData.append('bcc', data.bcc)
      formData.append('subject', data.subject)
      formData.append('body', data.body)
      attachments.forEach((file, idx) => {
        formData.append('attachments', file)
      })
      // Send email
      const res = await api.post('/email/send', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      toast.success('Email sent!')
      reset()
      setAttachments([])
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send email')
      toast.error(err.response?.data?.error || 'Failed to send email')
    } finally {
      setSending(false)
    }
  }

  if (loading) {
    return <Spinner size="xl" color="brand.500" />
  }

  return (
    <Box maxW="700px" mx="auto" bg="white" p={8} borderRadius={8} boxShadow="md">
      <Heading size="md" mb={6} color="brand.500">Compose Email</Heading>
      {error && <Alert status="error" mb={4}><AlertIcon />{error}</Alert>}
      <form onSubmit={handleSubmit(onSubmit)}>
        <VStack spacing={4} align="stretch">
          <FormControl isRequired>
            <FormLabel>SMTP Config</FormLabel>
            <Select placeholder="Select SMTP Config" {...register('smtpConfigId', { required: true })}>
              {smtpConfigs.map((cfg) => (
                <option key={cfg._id} value={cfg._id}>{cfg.name} ({cfg.fromEmail})</option>
              ))}
            </Select>
          </FormControl>
          <FormControl isRequired>
            <FormLabel>To</FormLabel>
            <Input placeholder="Recipient emails (comma separated)" {...register('to', { required: true })} />
          </FormControl>
          <FormControl>
            <FormLabel>CC</FormLabel>
            <Input placeholder="CC emails (comma separated)" {...register('cc')} />
          </FormControl>
          <FormControl>
            <FormLabel>BCC</FormLabel>
            <Input placeholder="BCC emails (comma separated)" {...register('bcc')} />
          </FormControl>
          <FormControl isRequired>
            <FormLabel>Subject</FormLabel>
            <Input placeholder="Subject" {...register('subject', { required: true })} />
          </FormControl>
          <FormControl isRequired>
            <FormLabel>Body</FormLabel>
            <Controller
              name="body"
              control={control}
              render={({ field }) => (
                <ReactQuill theme="snow" value={field.value} onChange={field.onChange} />
              )}
            />
          </FormControl>
          <FormControl>
            <FormLabel>Attachments</FormLabel>
            <Input type="file" multiple ref={fileInputRef} onChange={handleFileChange} />
            <HStack mt={2} spacing={2} wrap="wrap">
              {attachments.map((file, idx) => (
                <Tag key={idx} size="md" colorScheme="blue" borderRadius="full">
                  {file.name}
                  <IconButton size="xs" ml={2} icon={<FiX />} onClick={() => removeAttachment(idx)} />
                </Tag>
              ))}
            </HStack>
          </FormControl>
          <Button type="submit" colorScheme="brand" isLoading={sending} loadingText="Sending...">Send Email</Button>
        </VStack>
      </form>
    </Box>
  )
}

export default Compose 