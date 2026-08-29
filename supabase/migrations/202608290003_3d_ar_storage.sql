update storage.buckets
set allowed_mime_types = array[
  'image/jpeg', 'image/png', 'image/webp', 'image/gif',
  'audio/mpeg', 'audio/mp4', 'audio/wav', 'audio/ogg', 'audio/webm',
  'model/gltf-binary', 'model/vnd.usdz+zip', 'application/octet-stream'
]
where id = 'media';
