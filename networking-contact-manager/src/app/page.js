'use client'

import {
  Box,
  Container,
  Heading,
  Input,
  Button,
  VStack,
  HStack,
  Text,
  Card,
  CardBody,
  IconButton,
  Tooltip,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Avatar,
  Badge,
  Flex,
  useToast,
  Spinner,
} from '@chakra-ui/react'
import { useState, useEffect } from 'react'
import { EditIcon } from '@chakra-ui/icons'

const inputStyles = {
  border: "3px solid",
  borderColor: "gray.300",
  _focus: {
    borderColor: "blue.500",
    boxShadow: "0 0 0 1px blue.500"
  },
  _placeholder: {
    color: "gray.600"
  }
}

const formLabelStyles = {
  color: "gray.800"
}

export default function Home() {
  const [contacts, setContacts] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const { isOpen: isAddOpen, onOpen: onAddOpen, onClose: onAddClose } = useDisclosure()
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure()
  const toast = useToast()
  
  const emptyContact = {
    name: '',
    role: '',
    company: '',
    email: '',
    tags: '',
    notes: '',
  }

  const [newContact, setNewContact] = useState(emptyContact)
  const [editingContact, setEditingContact] = useState(null)

  useEffect(() => {
    fetchContacts()
  }, [])

  const fetchContacts = async () => {
    try {
      const response = await fetch('/api/contacts')
      const data = await response.json()
      setContacts(data)
    } catch (error) {
      toast({
        title: 'Error fetching contacts',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddContact = async () => {
    try {
      setIsSaving(true)
      const response = await fetch('/api/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newContact,
          tags: newContact.tags,
        }),
      })
      
      if (!response.ok) throw new Error('Failed to add contact')
      
      await fetchContacts()
      toast({
        title: 'Contact added.',
        description: "We've added your new contact.",
        status: 'success',
        duration: 3000,
        isClosable: true,
      })

      onAddClose()
      setNewContact(emptyContact)
    } catch (error) {
      toast({
        title: 'Error adding contact',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    } finally {
      setIsSaving(false)
    }
  }

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.tags.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (isLoading) {
    return (
      <Container maxW="container.xl" py={8}>
        <Flex justify="center" align="center" h="50vh">
          <Spinner size="xl" />
        </Flex>
      </Container>
    )
  }

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        <Flex justify="space-between" align="center">
          <Heading size="lg" mb={4} color="gray.900">
            Networking Contacts
          </Heading>
          <Button
            onClick={onAddOpen}
            colorScheme="blue"
            size="md"
            _hover={{ transform: "translateY(-2px)" }}
            transition="all 0.2s"
          >
            Add Contact
          </Button>
        </Flex>

        <Input
          placeholder="Search contacts by name, company, or tags..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          size="lg"
          bg="white"
          borderRadius="lg"
          boxShadow="sm"
          {...inputStyles}
        />

        <VStack spacing={4} align="stretch">
          {filteredContacts.map((contact) => (
            <Card
              key={contact.id}
              borderRadius="lg"
              overflow="hidden"
              boxShadow="xl"
              border="3px solid"
              borderColor="gray.300"
              _hover={{
                transform: "translateY(-2px)",
                borderColor: "gray.400",
                boxShadow: "2xl",
              }}
              transition="all 0.2s"
            >
              <CardBody>
                <Flex justify="space-between" align="center">
                  <HStack spacing={4}>
                    <Avatar name={contact.name} size="md" bg="blue.500" />
                    <Box>
                      <Heading size="md" color="gray.900">{contact.name}</Heading>
                      <Text color="gray.800">
                        {contact.role} at {contact.company}
                      </Text>
                      <Text color="gray.700" fontSize="sm">
                        {contact.email}
                      </Text>
                      <HStack mt={2} spacing={2}>
                        {contact.tags.split(",").map((tag, index) => (
                          <Badge
                            key={index}
                            colorScheme="blue"
                            borderRadius="full"
                            px={2}
                            border="2px solid"
                            borderColor="blue.300"
                            color="gray.800"
                          >
                            {tag.trim()}
                          </Badge>
                        ))}
                      </HStack>
                    </Box>
                  </HStack>
                  <Flex direction="column" align="flex-end">
                    <Text color="gray.800" fontSize="sm">
                      Last Contact:{" "}
                      {new Date(contact.lastContact).toLocaleDateString()}
                    </Text>
                    {contact.notes && (
                      <Text color="gray.700" fontSize="sm" mt={1}>
                        {contact.notes}
                      </Text>
                    )}
                    <Tooltip label="Edit Contact" placement="top">
                      <IconButton
                        icon={<EditIcon />}
                        variant="ghost"
                        size="sm"
                        mt={2}
                        border="2px solid"
                        borderColor="gray.300"
                        color="gray.700"
                        _hover={{
                          borderColor: "gray.400",
                          bg: "gray.50",
                          color: "gray.900"
                        }}
                        onClick={() => {
                          setEditingContact({
                            ...contact,
                            tags: contact.tags,
                          });
                          onEditOpen();
                        }}
                        aria-label="Edit contact"
                      />
                    </Tooltip>
                  </Flex>
                </Flex>
              </CardBody>
            </Card>
          ))}
        </VStack>
      </VStack>

      {/* Add Contact Modal */}
      <Modal isOpen={isAddOpen} onClose={onAddClose}>
        <ModalOverlay />
        <ModalContent border="3px solid" borderColor="gray.300" boxShadow="2xl">
          <ModalHeader color="gray.900">Add New Contact</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel {...formLabelStyles}>Name</FormLabel>
                <Input
                  value={newContact.name}
                  onChange={(e) =>
                    setNewContact({ ...newContact, name: e.target.value })
                  }
                  placeholder="Full name"
                  {...inputStyles}
                />
              </FormControl>

              <FormControl>
                <FormLabel {...formLabelStyles}>Role</FormLabel>
                <Input
                  value={newContact.role}
                  onChange={(e) =>
                    setNewContact({ ...newContact, role: e.target.value })
                  }
                  placeholder="Job title"
                  {...inputStyles}
                />
              </FormControl>

              <FormControl>
                <FormLabel {...formLabelStyles}>Company</FormLabel>
                <Input
                  value={newContact.company}
                  onChange={(e) =>
                    setNewContact({ ...newContact, company: e.target.value })
                  }
                  placeholder="Company name"
                  {...inputStyles}
                />
              </FormControl>

              <FormControl>
                <FormLabel {...formLabelStyles}>Email</FormLabel>
                <Input
                  value={newContact.email}
                  onChange={(e) =>
                    setNewContact({ ...newContact, email: e.target.value })
                  }
                  placeholder="Email address"
                  {...inputStyles}
                />
              </FormControl>

              <FormControl>
                <FormLabel {...formLabelStyles}>Tags (comma-separated)</FormLabel>
                <Input
                  value={newContact.tags}
                  onChange={(e) =>
                    setNewContact({ ...newContact, tags: e.target.value })
                  }
                  placeholder="Design, Engineering, Marketing"
                  {...inputStyles}
                />
              </FormControl>

              <FormControl>
                <FormLabel {...formLabelStyles}>Notes</FormLabel>
                <Input
                  value={newContact.notes}
                  onChange={(e) =>
                    setNewContact({ ...newContact, notes: e.target.value })
                  }
                  placeholder="Add any notes about this contact"
                  {...inputStyles}
                />
              </FormControl>

              <Button
                colorScheme="blue"
                width="full"
                onClick={handleAddContact}
                isLoading={isSaving}
              >
                Add Contact
              </Button>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Edit Contact Modal */}
      <Modal isOpen={isEditOpen} onClose={onEditClose}>
        <ModalOverlay />
        <ModalContent border="3px solid" borderColor="gray.300" boxShadow="2xl">
          <ModalHeader color="gray.900">Edit Contact</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel {...formLabelStyles}>Name</FormLabel>
                <Input
                  value={editingContact?.name || ""}
                  onChange={(e) =>
                    setEditingContact({
                      ...editingContact,
                      name: e.target.value,
                    })
                  }
                  placeholder="Full name"
                  {...inputStyles}
                />
              </FormControl>

              <FormControl>
                <FormLabel {...formLabelStyles}>Role</FormLabel>
                <Input
                  value={editingContact?.role || ""}
                  onChange={(e) =>
                    setEditingContact({
                      ...editingContact,
                      role: e.target.value,
                    })
                  }
                  placeholder="Job title"
                  {...inputStyles}
                />
              </FormControl>

              <FormControl>
                <FormLabel {...formLabelStyles}>Company</FormLabel>
                <Input
                  value={editingContact?.company || ""}
                  onChange={(e) =>
                    setEditingContact({
                      ...editingContact,
                      company: e.target.value,
                    })
                  }
                  placeholder="Company name"
                  {...inputStyles}
                />
              </FormControl>

              <FormControl>
                <FormLabel {...formLabelStyles}>Email</FormLabel>
                <Input
                  value={editingContact?.email || ""}
                  onChange={(e) =>
                    setEditingContact({
                      ...editingContact,
                      email: e.target.value,
                    })
                  }
                  placeholder="Email address"
                  {...inputStyles}
                />
              </FormControl>

              <FormControl>
                <FormLabel {...formLabelStyles}>Tags (comma-separated)</FormLabel>
                <Input
                  value={editingContact?.tags || ""}
                  onChange={(e) =>
                    setEditingContact({
                      ...editingContact,
                      tags: e.target.value,
                    })
                  }
                  placeholder="Design, Engineering, Marketing"
                  {...inputStyles}
                />
              </FormControl>

              <FormControl>
                <FormLabel {...formLabelStyles}>Notes</FormLabel>
                <Input
                  value={editingContact?.notes || ""}
                  onChange={(e) =>
                    setEditingContact({
                      ...editingContact,
                      notes: e.target.value,
                    })
                  }
                  placeholder="Add any notes about this contact"
                  {...inputStyles}
                />
              </FormControl>

              <Button
                colorScheme="blue"
                width="full"
                isLoading={isSaving}
                onClick={async () => {
                  try {
                    setIsSaving(true);
                    const response = await fetch("/api/contacts", {
                      method: "PUT",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        ...editingContact,
                        tags: editingContact.tags,
                      }),
                    });

                    if (!response.ok)
                      throw new Error("Failed to update contact");

                    await fetchContacts();
                    onEditClose();
                    setEditingContact(null);
                    toast({
                      title: "Contact updated.",
                      description: "We've updated the contact information.",
                      status: "success",
                      duration: 3000,
                      isClosable: true,
                    });
                  } catch (error) {
                    toast({
                      title: "Error updating contact",
                      description: error.message,
                      status: "error",
                      duration: 3000,
                      isClosable: true,
                    });
                  } finally {
                    setIsSaving(false);
                  }
                }}
              >
                Save Changes
              </Button>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Container>
  );
}
