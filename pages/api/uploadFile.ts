import { NextApiRequest, NextApiResponse } from 'next'
import formidable from 'formidable'
import fs from 'fs'
import path from 'path'

export const config = {
  api: {
    bodyParser: false,
  },
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const form = formidable({
        uploadDir: path.join(process.cwd(), 'public', 'uploads'),
        keepExtensions: true,
      });

      form.parse(req, (err, fields, files) => {
        if (err) {
          console.error('Error parsing form:', err)
          return res.status(500).json({ error: 'Error uploading file' })
        }

        const file = files.file as formidable.File
        const fileName = path.basename(file.filepath)
        const fileUrl = `/uploads/${fileName}`

        res.status(200).json({ fileUrl })
      })
    } catch (error) {
      console.error('Error uploading file:', error)
      res.status(500).json({ error: 'Error uploading file' })
    }
  } else {
    res.setHeader('Allow', ['POST'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}