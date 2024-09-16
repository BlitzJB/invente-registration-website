import { NextApiRequest, NextApiResponse } from 'next'
import fs from 'fs'
import path from 'path'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const { sessionId, formData } = req.body

      // Ensure the data directory exists
      const dataDir = path.join(process.cwd(), 'data')
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir)
      }

      // Read existing data if the file exists
      const filePath = path.join(dataDir, `${sessionId}.json`)
      let existingData = {}
      if (fs.existsSync(filePath)) {
        existingData = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
      }

      // Check if payment proof is being uploaded
      if (formData['11'] && !existingData['11']) {
        // Payment proof is being uploaded for the first time
        formData.timestamp = Math.floor(Date.now() / 1000) // Unix timestamp
      }

      // Merge existing data with new form data
      const updatedData = { ...existingData, ...formData }

      // Write the updated form data to a JSON file
      fs.writeFileSync(filePath, JSON.stringify(updatedData, null, 2))

      res.status(200).json({ message: 'Form data updated successfully' })
    } catch (error) {
      console.error('Error updating form data:', error)
      res.status(500).json({ message: 'Error updating form data' })
    }
  } else {
    res.setHeader('Allow', ['POST'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}