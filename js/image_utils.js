/**
 * Utility functions for image handling
 */

/**
 * Extract image URL from API data fields
 * 
 * @param {Object} fields - The fields object from the API
 * @return {string} The extracted image URL or placeholder
 */
function extractImageUrl(fields) {
  let afbeelding = "img/placeholder.jpg";
  
  try {
    
    console.log('🔍 Extracting image URL, field keys:', Object.keys(fields));
    if (fields.image) {
      console.log('🖼️ Image field type:', typeof fields.image, 
                  Array.isArray(fields.image) ? 'array' : '', 
                  fields.image);
    }
    
    if (fields.image && typeof fields.image === 'object') {
      // Direct URL property
      if (fields.image.url) {
        afbeelding = fields.image.url;
        console.log('✅ Found image URL in image.url:', afbeelding);
      }
      // Handle array format
      else if (Array.isArray(fields.image) && fields.image.length > 0) {
        if (typeof fields.image[0] === 'object' && fields.image[0].url) {
          afbeelding = fields.image[0].url;
          console.log('✅ Found image URL in image[0].url:', afbeelding);
        } else if (typeof fields.image[0] === 'string') {
          afbeelding = fields.image[0];
          console.log('✅ Found image URL in image[0] string:', afbeelding);
        }
      }
    }
    // Otherwise try other possible image fields
    else {
      console.log('🔍 Trying fallback image fields');
      afbeelding = fields.photo || 
                  (typeof fields.image === 'string' ? fields.image : null) ||
                  fields.foto || fields.picture || 
                  fields.url_photo || fields.image_url || fields.photo_url ||
                  "img/placeholder.jpg";
      console.log('✅ Found image URL in fallback fields:', afbeelding);
    }
  } catch (error) {
    console.error('❌ Error extracting image URL:', error);
    afbeelding = "img/placeholder.jpg";
  }
  
  return afbeelding;
}

// Export function for use in other files
if (typeof window !== 'undefined') {
  window.extractImageUrl = extractImageUrl;
}
