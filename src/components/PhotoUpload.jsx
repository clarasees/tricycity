import { useState } from 'react'
import * as exifr from 'exifr'
import { supabase } from '../lib/supabase'

export default function PhotoUpload({ onUploadComplete }) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState(null)

  const handleFileChange = async (event) => {
    try {
      setUploading(true)
      setError(null)

      const file = event.target.files[0]
      if (!file) return

      // Extract EXIF data
      const exifData = await exifr.parse(file, {
        gps: true,
        pick: ['Make', 'Model', 'DateTimeOriginal', 'GPSLatitude', 'GPSLongitude', 'GPSAltitude']
      })

      console.log('EXIF data:', exifData)

      // Upload file to Supabase Storage
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`
      const filePath = `${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('photos')
        .upload(filePath, file)

      if (uploadError) {
        throw uploadError
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('photos')
        .getPublicUrl(filePath)

      // Insert photo metadata into database
      const { error: dbError } = await supabase
        .from('photos')
        .insert({
          filename: file.name,
          storage_path: filePath,
          latitude: exifData?.latitude || null,
          longitude: exifData?.longitude || null,
          altitude: exifData?.GPSAltitude || null,
          timestamp: exifData?.DateTimeOriginal || null,
          camera_make: exifData?.Make || null,
          camera_model: exifData?.Model || null,
          file_size: file.size,
          mime_type: file.type
        })

      if (dbError) {
        throw dbError
      }

      // Reset input
      event.target.value = ''

      // Notify parent component
      if (onUploadComplete) {
        onUploadComplete()
      }

      alert('Photo uploaded successfully!')
    } catch (err) {
      console.error('Error uploading photo:', err)
      setError(err.message)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="upload-container">
      <h2>Upload Photo</h2>
      <div className="upload-box">
        <label htmlFor="photo-upload" className="upload-label">
          {uploading ? 'Uploading...' : 'Choose Photo'}
        </label>
        <input
          id="photo-upload"
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          disabled={uploading}
          style={{ display: 'none' }}
        />
      </div>
      {error && (
        <div className="error-message">
          Error: {error}
        </div>
      )}
      <p className="upload-hint">
        Select a photo with GPS data to see its location on the map
      </p>
    </div>
  )
}
