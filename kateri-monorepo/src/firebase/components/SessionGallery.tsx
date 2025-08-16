import React from 'react';

export function SessionGallery({ gallery }) {
  return (
    <div>
      <h2>{gallery.title}</h2>
      <div>
        {gallery.photos.map((photo) => (
          <img
            key={photo.url}
            src={photo.url}
            alt={photo.caption}
            style={{ width: 200, margin: 8 }}
          />
        ))}
      </div>
    </div>
  );
}
