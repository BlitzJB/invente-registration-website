'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Check, Upload, BookOpen, User, Users, Zap } from 'lucide-react'
import { Button } from "@/components/ui/button"
import toast, { Toaster } from 'react-hot-toast'
import { useDropzone } from 'react-dropzone'
import { v4 as uuidv4 } from 'uuid'
import debounce from 'lodash/debounce'
import mime from 'mime-types';

const rulebookPaths = {
  price_n_pitches: '/rulebooks/price_n_pitches.pdf',
  bizquiz: '/rulebooks/bizquiz.pdf',
  startup_showdown: '/rulebooks/startup_showdown.pdf',
  econexus: '/rulebooks/econexus.pdf',
  youth_economics_summit: '/rulebooks/youth_economics_summit.pdf',
  resume_roulette: '/rulebooks/resume_roulette.pdf',
  sense_and_sensibility: '/rulebooks/sense_and_sensibility.pdf',
}

const contentSections = [
  {
    type: 'content',
    title: 'Welcome to INVENTE\'24!',
    description: 'Get ready for an exhilarating journey through innovation and creativity. Let\'s kickstart your registration for the ultimate tech experience!',
    background: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1920&q=80',
  },
  {
    type: 'question',
    text: "What's your name, future innovator?",
    inputType: "text",
    placeholder: "Enter your full name",
    background: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1920&q=80',
  },
  {
    type: 'question',
    text: "How can we reach you?",
    inputType: "tel",
    placeholder: "Enter your phone number",
    background: 'https://images.unsplash.com/photo-1523966211575-eb4a01e7dd51?auto=format&fit=crop&w=1920&q=80',
  },
  {
    type: 'question',
    text: "Where should we send your event updates?",
    inputType: "email",
    placeholder: "Enter your email address",
    background: 'https://images.unsplash.com/photo-1596526131083-e8c633c948d2?auto=format&fit=crop&w=1920&q=80',
  },
  {
    type: 'question',
    text: "Which college are you representing?",
    inputType: "text",
    placeholder: "Enter your college name",
    background: 'https://images.unsplash.com/photo-1527269534026-c86f4009eace?auto=format&fit=crop&w=1920&q=80',
  },
  {
    type: 'cardRadio',
    text: "What year are you in?",
    multiple: false,
    background: 'https://images.unsplash.com/photo-1527269534026-c86f4009eace?auto=format&fit=crop&w=1920&q=80',
    options: [
      { id: '1', text: '1st Year', description: 'Fresh and eager', image: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=800&q=80' },
      { id: '2', text: '2nd Year', description: 'Getting into the groove', image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=800&q=80' },
      { id: '3', text: '3rd Year', description: 'Hitting your stride', image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80' },
      { id: '4', text: '4th Year', description: 'Ready to conquer', image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80' },
    ],
  },
  {
    type: 'question',
    text: "What's your department?",
    inputType: "text",
    placeholder: "E.g., Computer Science, Electrical Engineering",
    background: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1920&q=80',
  },
  {
    type: 'question',
    text: "What's your college roll number?",
    inputType: "text",
    placeholder: "Enter your roll number",
    background: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1920&q=80',
  },
  {
    type: 'content',
    title: 'Technical Pass Information',
    description: 'Our technical pass gives you access to all technical events at INVENTE\'24. It\'s your gateway to showcasing your skills and competing with the best!',
    background: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1920&q=80',
    infoCards: [
      {
        icon: 'User',
        title: 'Individual Registration',
        description: 'The Technical Pass is valid only for individual registration.'
      },
      {
        icon: 'Users',
        title: 'Team Events',
        description: 'For team events, each member must purchase their own Technical Pass to participate.'
      },
      {
        icon: 'Zap',
        title: 'Event Participation',
        description: 'With one Technical Pass, you can participate in a maximum of 4 Technical Events across different departments.'
      }
    ]
  },
  {
    type: 'cardRadio',
    text: "Which events are you most excited about?",
    multiple: true,
    background: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1920&q=80',
    options: [
      { id: 'price_n_pitches', text: 'Price \'n\' Pitches', description: 'Test your price-guessing skills and marketing creativity', image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80', hasRulebook: true, eventType: 'technical' },
      { id: 'bizquiz', text: 'BizQuiz', description: 'Put your business trivia to the test', image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=800&q=80', hasRulebook: true, eventType: 'technical' },
      { id: 'startup_showdown', text: 'Startup Showdown', description: 'Pitch your futuristic business ideas', image: 'https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&w=800&q=80', hasRulebook: true, eventType: 'technical' },
      { id: 'econexus', text: 'EcoNexus', description: 'Apply economic concepts to real-world scenarios', image: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=800&q=80', hasRulebook: true, eventType: 'technical' },
      { id: 'youth_economics_summit', text: 'Youth Economics Summit', description: 'Showcase your economic research and ideas', image: 'https://images.unsplash.com/photo-1591115765373-5207764f72e7?auto=format&fit=crop&w=800&q=80', hasRulebook: true, eventType: 'technical' },
      { id: 'resume_roulette', text: 'Resume Roulette', description: 'Create resumes for surprise job descriptions', image: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&w=800&q=80', hasRulebook: true, eventType: 'non-technical' },
      { id: 'sense_and_sensibility', text: 'Sense and Sensibility: Media Edition', description: 'Test your communication and pop culture knowledge', image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80', hasRulebook: true, eventType: 'non-technical' },
    ],
  },
  {
    type: 'content',
    title: 'Technical Pass Payment',
    description: 'To participate in the technical events, you need to purchase a technical pass. Click the button below to proceed to our secure payment gateway.',
    background: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1920&q=80',
    actionButton: {
      text: 'Pay for Technical Pass',
      link: 'https://rzp.io/l/ssn-snuc-Invente-2024',
    },
  },
  {
    type: 'fileUpload',
    text: "Upload Your Payment Confirmation",
    description: "After completing your payment, please upload the confirmation receipt here. This helps us verify your registration quickly.",
    background: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1920&q=80',
    acceptedFileTypes: '.jpg,.jpeg,.png,.pdf',
  },
  {
    type: 'content',
    title: 'You\'re all set!',
    description: 'Thanks for registering for INVENTE\'24. We can\'t wait to see you showcase your skills and creativity. Get ready for an unforgettable experience!',
    background: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1920&q=80',
  },
]

export function EnhancedDynamicForm() {
  const [currentSection, setCurrentSection] = useState(0)
  const [previousSection, setPreviousSection] = useState(0)
  const [answers, setAnswers] = useState<Record<number, any>>({})
  const [filePreview, setFilePreview] = useState<string | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const [isValid, setIsValid] = useState(false)
  const [sessionId, setSessionId] = useState('')

  useEffect(() => {
    // Generate a unique session ID when the form is opened
    setSessionId(uuidv4())
  }, [])

  useEffect(() => {
    setPreviousSection(currentSection)
  }, [currentSection])

  useEffect(() => {
    validateCurrentSection()
  }, [currentSection, answers])

  // Debounced function to update form data
  const debouncedUpdateFormData = useCallback(
    debounce((formData: Record<number, any>) => {
      updateFormData(formData)
    }, 500),
    [sessionId]
  )

  useEffect(() => {
    if (sessionId) {
      debouncedUpdateFormData(answers)
    }
  }, [answers, sessionId, debouncedUpdateFormData])

  const updateFormData = async (formData: Record<number, any>) => {
    try {
      const response = await fetch('/api/updateFormData', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionId, formData }),
      })

      if (!response.ok) {
        throw new Error('Failed to update form data')
      }
    } catch (error) {
      console.error('Error updating form data:', error)
      toast.error('Failed to save form data. Please try again.')
    }
  }

  const validateCurrentSection = () => {
    const section = contentSections[currentSection]
    let valid = false

    switch (section.type) {
      case 'content':
        valid = true
        break
      case 'question':
        valid = !!answers[currentSection] && answers[currentSection].trim() !== ''
        break
      case 'cardRadio':
        if (section.multiple) {
          valid = Array.isArray(answers[currentSection]) && answers[currentSection].length > 0
        } else {
          valid = !!answers[currentSection]
        }
        break
      case 'fileUpload':
        valid = !!answers[currentSection]
        break
    }

    setIsValid(valid)
  }

  const handleNext = () => {
    if (isValid && currentSection < contentSections.length - 1) {
      setCurrentSection(currentSection + 1)
    } else if (!isValid) {
      toast.error('Please complete the current section before proceeding.', {
        duration: 3000,
        position: 'top-center',
      })
    }
  }

  const handlePrevious = () => {
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAnswers({ ...answers, [currentSection]: e.target.value })
  }

  const handleCardSelection = (id: string) => {
    const currentQuestion = contentSections[currentSection]
    if (currentQuestion.type === 'cardRadio' && currentQuestion.multiple) {
      setAnswers(prev => {
        const currentSelection = prev[currentSection] || []
        if (currentSelection.includes(id)) {
          return {
            ...prev,
            [currentSection]: currentSelection.filter((item: string) => item !== id)
          }
        } else {
          if (currentSelection.length >= 4) {
            toast.error('You can select a maximum of 4 events with one Technical Pass.', {
              duration: 3000,
              position: 'top-center',
            })
            return prev
          }
          return {
            ...prev,
            [currentSection]: [...currentSelection, id]
          }
        }
      })
    } else {
      setAnswers(prev => ({ ...prev, [currentSection]: id }))
    }
  }

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file) {
      const fileExtension = file.name.split('.').pop()
      const fileName = `${uuidv4()}.${fileExtension}`

      // Create a FormData object to send the file
      const formData = new FormData()
      formData.append('file', file, fileName)

      try {
        const response = await fetch('/api/uploadFile', {
          method: 'POST',
          body: formData,
        })

        if (!response.ok) {
          throw new Error('Failed to upload file')
        }

        const { fileUrl } = await response.json()

        setAnswers({ ...answers, [currentSection]: fileUrl })
        setFilePreview(fileUrl)
      } catch (error) {
        console.error('Error uploading file:', error)
        toast.error('Failed to upload file. Please try again.')
      }
    }
  }, [answers, currentSection])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': [],
      'application/pdf': ['.pdf'],
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: false,
  })

  useEffect(() => {
    setDragActive(isDragActive)
  }, [isDragActive])

  const handleReadRulebook = (eventId: string) => {
    const rulebookPath = rulebookPaths[eventId as keyof typeof rulebookPaths]
    if (rulebookPath) {
      window.open(rulebookPath, '_blank')
    }
  }

  const renderSection = (section: typeof contentSections[number]) => {
    if (section.type === 'content') {
      return (
        <div className="space-y-6">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight text-white">{section.title}</h2>
          <p className="text-lg md:text-xl lg:text-2xl mb-8 text-white">{section.description}</p>
          {section.infoCards && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {section.infoCards.map((card, index) => (
                <div key={index} className="bg-white/10 backdrop-blur-md rounded-lg p-6 shadow-lg">
                  <div className="flex items-center mb-4">
                    {card.icon === 'User' && <User className="w-8 h-8 text-blue-400 mr-3" />}
                    {card.icon === 'Users' && <Users className="w-8 h-8 text-green-400 mr-3" />}
                    {card.icon === 'Zap' && <Zap className="w-8 h-8 text-yellow-400 mr-3" />}
                    <h3 className="text-xl font-semibold text-white">{card.title}</h3>
                  </div>
                  <p className="text-sm text-white">{card.description}</p>
                </div>
              ))}
            </div>
          )}
          {section.actionButton && (
            <Button
              variant="default"
              size="lg"
              className="mt-8"
              onClick={() => window.open(section.actionButton.link, '_blank')}
            >
              {section.actionButton.text}
            </Button>
          )}
        </div>
      )
    } else if (section.type === 'question') {
      return (
        <div className="space-y-8">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight text-white">{section.text}</h2>
          <div className="relative">
            <input
              type={section.inputType}
              value={answers[currentSection] || ''}
              onChange={handleInputChange}
              className="w-full text-xl md:text-2xl lg:text-3xl p-4 bg-transparent border-b-2 border-white/50 focus:outline-none focus:border-white transition-all duration-300 text-white placeholder-white/50"
              placeholder={section.placeholder}
              required
            />
            <motion.div 
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-white"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: isValid ? 1 : 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            />
          </div>
        </div>
      )
    } else if (section.type === 'cardRadio' && section.options) {
      return (
        <div className="space-y-8">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight text-white">{section.text}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {section.options.map((option) => {
              const isSelected = section.multiple
                ? answers[currentSection]?.includes(option.id)
                : answers[currentSection] === option.id
              return (
                <motion.div
                  key={option.id}
                  className={`rounded-lg cursor-pointer overflow-hidden relative border-3 ${isSelected ? ' border-dark-green' : 'border-neutral-700'}`}
                  onClick={() => handleCardSelection(option.id)}
                  style={{
                    backgroundImage: `url(${option.image})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                  initial={{ filter: isSelected ? 'grayscale(0%)' : 'grayscale(100%)' }}
                  animate={{ filter: isSelected ? 'grayscale(0%)' : 'grayscale(100%)' }}
                  whileHover={{ filter: 'grayscale(0%) brightness(1.1)' }}
                  transition={{ duration: 0.3 }}
                >
                  {isSelected && (
                    <div className="absolute top-0 right-0 bg-dark-green text-white px-2 py-1 rounded-bl-lg z-50">
                      <Check size={16} />
                    </div>
                  )}
                  <div className="relative z-10 p-4 bg-gradient-to-b from-black/70 via-black/50 to-transparent h-full flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-xl font-semibold text-white">{option.text}</h3>
                        {'eventType' in option && (
                          <span className={`text-xs font-semibold px-2 py-1 rounded-full whitespace-nowrap ${option.eventType === 'technical' ? 'bg-blue-500' : 'bg-yellow-500'}`}>
                            {option.eventType === 'technical' ? 'Technical' : 'Non-Technical'}
                          </span>
                        )}
                      </div>
                      <p className="mt-2 text-sm text-white">{option.description}</p>
                    </div>
                    {'hasRulebook' in option && option.hasRulebook && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-4 bg-white text-black hover:bg-white/90 border-white shadow-md hover:shadow-lg transition-all duration-300 font-semibold"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleReadRulebook(option.id)
                        }}
                      >
                        <BookOpen className="mr-2 h-4 w-4" />
                        Read Rulebook
                      </Button>
                    )}
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      )
    } else if (section.type === 'fileUpload') {
      return (
        <div className="space-y-8">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight text-white">{section.text}</h2>
          <p className="text-lg md:text-xl lg:text-2xl text-white">{section.description}</p>
          <div className={`flex ${filePreview ? 'space-x-8' : ''}`}>
            <div className={filePreview ? 'w-1/2' : 'w-full'}>
              <div
                {...getRootProps()}
                className={`relative flex items-center justify-center w-full h-32 px-4 transition border-2 border-dashed rounded-md appearance-none cursor-pointer
                  ${dragActive ? 'border-white bg-white/10' : 'border-gray-300 hover:border-gray-400'}
                  ${filePreview ? 'bg-white/5' : 'bg-white'}`}
              >
                <input {...getInputProps()} />
                <div className="flex flex-col items-center space-y-2">
                  <Upload className={`w-6 h-6 ${dragActive || filePreview ? 'text-white' : 'text-gray-600'}`} />
                  <span className={`font-medium text-center ${dragActive || filePreview ? 'text-white' : 'text-gray-600'}`}>
                    {filePreview
                      ? 'File uploaded. Drop or click to replace.'
                      : dragActive
                      ? 'Drop the file here'
                      : 'Drop files to Attach, or browse. (Max size: 10MB)'}
                  </span>
                </div>
              </div>
            </div>
            {filePreview && (
              <div className="w-1/2">
                {mime.lookup(answers[currentSection])?.startsWith('image/') ? (
                  <img src={filePreview} alt="Preview" className="max-w-full h-auto object-contain" />
                ) : (
                  <iframe 
                    src={filePreview} 
                    className="w-full h-[500px] border-0"
                    title="PDF Preview"
                  />
                )}
              </div>
            )}
          </div>
        </div>
      )
    }
  }

  return (
    <div className="relative min-h-screen flex flex-col justify-between overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-black"></div>
        <motion.div 
          key={`bg-${previousSection}`}
          className="absolute inset-0 bg-cover bg-center opacity-50"
          style={{ backgroundImage: `url(${contentSections[previousSection].background})` }}
          initial={{ opacity: 0.5 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        />
        <motion.div 
          key={`bg-${currentSection}`}
          className="absolute inset-0 bg-cover bg-center opacity-50"
          style={{ backgroundImage: `url(${contentSections[currentSection].background})` }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          transition={{ duration: 0.5 }}
        />
      </div>

      <div className="relative z-10 w-full max-w-4xl mx-auto px-4 py-8 md:px-8 flex-grow flex items-center">
        <div className="w-full pl-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSection}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="w-full"
            >
              {renderSection(contentSections[currentSection])}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
      
      {/* Navigation and progress bar */}
      <div className="relative z-10 w-full px-4 py-6 flex justify-between items-center bg-black/10 backdrop-blur-sm">
        <motion.div
          className="cursor-pointer"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handlePrevious}
        >
          <ChevronLeft 
            size={36} 
            className={`transition-opacity text-white/90 duration-300 ${currentSection === 0 ? 'opacity-30' : 'opacity-100'}`}
          />
        </motion.div>

        {/* Subtle progress indicator */}
        <div className="flex items-center space-x-2">
          <div className="w-40 h-1 bg-white/20 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-white"
              initial={{ width: 0 }}
              animate={{ width: `${((currentSection + 1) / contentSections.length) * 100}%` }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            />
          </div>
          <span className="text-xs text-white/70">
            {currentSection + 1}/{contentSections.length}
          </span>
        </div>

        <motion.div
          className={`cursor-pointer ${!isValid && 'opacity-50 cursor-not-allowed'}`}
          whileHover={isValid ? { scale: 1.1 } : {}}
          whileTap={isValid ? { scale: 0.9 } : {}}
          onClick={handleNext}
        >
          <ChevronRight 
            size={36} 
            className={`transition-opacity text-white/90 duration-300 ${currentSection === contentSections.length - 1 ? 'opacity-30' : 'opacity-100'}`}
          />
        </motion.div>
      </div>
      <Toaster />
    </div>
  )
}