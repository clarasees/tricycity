import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function PhotoGallery({ onPhotoSelect, refreshTrigger }) {
  const [photos, setPhotos] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPhotos()
  }, [refreshTrigger])

  const fetchPhotos = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('photos')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      // Get public URLs for all photos
      const photosWithUrls = data.map(photo => {
        const { data: { publicUrl } } = supabase.storage
          .from('photos')
          .getPublicUrl(photo.storage_path)

        return {
          ...photo,
          url: publicUrl
        }
      })

      setPhotos(photosWithUrls)
    } catch (err) {
      console.error('Error fetching photos:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (photoId, storagePath) => {
    if (!confirm('Are you sure you want to delete this photo?')) return

    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('photos')
        .remove([storagePath])

      if (storageError) throw storageError

      // Delete from database
      const { error: dbError } = await supabase
        .from('photos')
        .delete()
        .eq('id', photoId)

      if (dbError) throw dbError

      // Refresh photos
      fetchPhotos()
    } catch (err) {
      console.error('Error deleting photo:', err)
      alert('Failed to delete photo')
    }
  }

  if (loading) {
    return <div className="loading">Loading photos...</div>
  }

  if (photos.length === 0) {
    return (
      <div className="no-photos">
        <p>No photos uploaded yet. Upload your first photo!</p>
      </div>
    )
  }

  return (
    <div className="gallery-container">
      <h2>Photo Gallery ({photos.length})</h2>
      <div className="photo-grid">
        {photos.map(photo => (
          <div key={photo.id} className="photo-card">
            <img src={photo.url} alt={photo.filename} />
            <div className="photo-info">
              <h3>{photo.filename}</h3>
              {photo.latitude && photo.longitude ? (
                <div className="location-info">
                  <p>📍 Location:</p>
                  <p>Lat: {photo.latitude.toFixed(6)}</p>
                  <p>Lon: {photo.longitude.toFixed(6)}</p>
                  {photo.altitude && <p>Alt: {photo.altitude.toFixed(2)}m</p>}
                </div>
              ) : (
                <p className="no-location">No GPS data available</p>
              )}
              {photo.camera_make && (
                <p className="camera-info">
                  📷 {photo.camera_make} {photo.camera_model}
                </p>
              )}
              {photo.timestamp && (
                <p className="timestamp">
                  🕐 {new Date(photo.timestamp).toLocaleString()}
                </p>
              )}
              <div className="photo-actions">
                {photo.latitude && photo.longitude && (
                  <button
                    onClick={() => onPhotoSelect(photo)}
                    className="view-map-btn"
                  >
                    View on Map
                  </button>
                )}
                <button
                  onClick={() => handleDelete(photo.id, photo.storage_path)}
                  className="delete-btn"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
