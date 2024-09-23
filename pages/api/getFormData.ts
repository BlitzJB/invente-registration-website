import { NextApiRequest, NextApiResponse } from 'next'
import fs from 'fs'
import path from 'path'
import Cors from 'cors'

// Initialize the cors middleware
const cors = Cors({
  methods: ['GET', 'HEAD'],
})

// Helper method to wait for a middleware to execute before continuing
// And to throw an error when an error happens in a middleware
function runMiddleware(req: NextApiRequest, res: NextApiResponse, fn: Function) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result: any) => {
      if (result instanceof Error) {
        return reject(result)
      }
      return resolve(result)
    })
  })
}

const fieldMapping = {
  1: 'name',
  2: 'phoneNumber',
  3: 'email',
  4: 'college',
  5: 'year',
  6: 'department',
  7: 'rollNumber',
  9: 'selectedEvents',
  11: 'paymentProof'
}

// Bearer token auth middleware
function bearerAuth(req: NextApiRequest, res: NextApiResponse): boolean {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ message: 'Authentication required' })
    return false
  }

  const token = authHeader.split(' ')[1]
  const validToken = process.env.BEARER_TOKEN

  if (token === validToken) {
    return true
  } else {
    res.status(401).json({ message: 'Invalid token' })
    return false
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Run the CORS middleware
  await runMiddleware(req, res, cors)

  // Check bearer auth
  if (!bearerAuth(req, res)) {
    return res.status(401).json({ message: 'Invalid token' })
  }

  if (req.method === 'GET') {
    try {
      const dataDir = path.join(process.cwd(), 'data')
      const files = fs.readdirSync(dataDir)

      const completedSessions = []
      const incompleteSessions = []

      files.forEach(file => {
        if (file.endsWith('.json')) {
          const filePath = path.join(dataDir, file)
          const fileContent = fs.readFileSync(filePath, 'utf-8')
          const sessionData = JSON.parse(fileContent)

          // Map the fields
          const mappedData = Object.entries(sessionData).reduce((acc, [key, value]) => {
            const mappedKey = fieldMapping[key as keyof typeof fieldMapping] || key
            acc[mappedKey] = value
            return acc
          }, {} as Record<string, any>)

          // Add sessionId to the mapped data
          mappedData.sessionId = path.basename(file, '.json')

          // Check if the session is complete (payment proof uploaded)
          if (mappedData.paymentProof) {
            completedSessions.push(mappedData)
          } else {
            incompleteSessions.push(mappedData)
          }
        }
      })

      res.status(200).json({
        completedSessions,
        incompleteSessions
      })
    } catch (error) {
      console.error('Error fetching form data:', error)
      res.status(500).json({ message: 'Error fetching form data' })
    }
  } else {
    res.setHeader('Allow', ['GET'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}