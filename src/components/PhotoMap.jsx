import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import { supabase } from '../lib/supabase'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// Fix for default marker icons in React-Leaflet
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

export default function PhotoMap({ selectedPhoto, refreshTrigger }) {
  const [photos, setPhotos] = useState([])
  const [center, setCenter] = useState([37.7749, -122.4194]) // Default to San Francisco
  const [zoom, setZoom] = useState(12)

  useEffect(() => {
    fetchPhotosWithLocation()
  }, [refreshTrigger])

  useEffect(() => {
    if (selectedPhoto) {
      setCenter([selectedPhoto.latitude, selectedPhoto.longitude])
      setZoom(15)
    }
  }, [selectedPhoto])

  const fetchPhotosWithLocation = async () => {
    try {
      const { data, error } = await supabase
        .from('photos')
        .select('*')
        .not('latitude', 'is', null)
        .not('longitude', 'is', null)

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

      // If we have photos and no selected photo, center on first photo
      if (photosWithUrls.length > 0 && !selectedPhoto) {
        setCenter([photosWithUrls[0].latitude, photosWithUrls[0].longitude])
        setZoom(12)
      }
    } catch (err) {
      console.error('Error fetching photos:', err)
    }
  }

  return (
    <div className="map-container">
      <h2>Photo Locations</h2>
      {photos.length === 0 ? (
        <div className="no-locations">
          <p>No photos with GPS data yet. Upload photos taken with a camera or phone that includes location data.</p>
        </div>
      ) : (
        <MapContainer
          center={center}
          zoom={zoom}
          style={{ height: '500px', width: '100%' }}
          key={`${center[0]}-${center[1]}-${zoom}`}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {photos.map(photo => (
            <Marker
              key={photo.id}
              position={[photo.latitude, photo.longitude]}
            >
              <Popup>
                <div className="popup-content">
                  <img
                    src={photo.url}
                    alt={photo.filename}
                    style={{ width: '200px', height: 'auto', marginBottom: '10px' }}
                  />
                  <h4>{photo.filename}</h4>
                  <p>Lat: {photo.latitude.toFixed(6)}</p>
                  <p>Lon: {photo.longitude.toFixed(6)}</p>
                  {photo.altitude && <p>Alt: {photo.altitude.toFixed(2)}m</p>}
                  {photo.timestamp && (
                    <p>{new Date(photo.timestamp).toLocaleString()}</p>
                  )}
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      )}
    </div>
  )
}
