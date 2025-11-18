import { useState } from 'react'
import PhotoUpload from './components/PhotoUpload'
import PhotoGallery from './components/PhotoGallery'
import PhotoMap from './components/PhotoMap'
import './App.css'

function App() {
  const [selectedPhoto, setSelectedPhoto] = useState(null)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const handleUploadComplete = () => {
    setRefreshTrigger(prev => prev + 1)
  }

  const handlePhotoSelect = (photo) => {
    setSelectedPhoto(photo)
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>📸 Photo Geolocation Viewer</h1>
        <p>Upload photos and explore their locations on the map</p>
      </header>

      <main className="app-main">
        <PhotoUpload onUploadComplete={handleUploadComplete} />

        <PhotoMap
          selectedPhoto={selectedPhoto}
          refreshTrigger={refreshTrigger}
        />

        <PhotoGallery
          onPhotoSelect={handlePhotoSelect}
          refreshTrigger={refreshTrigger}
        />
      </main>
    </div>
  )
}

export default App
