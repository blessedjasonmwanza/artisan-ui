/**
 * Utility functions for safe data validation and transformation
 * These functions ensure data is in the expected format before using it
 */

/**
 * Safely convert any value to an array
 * @param {any} value - The value to convert
 * @returns {Array} - An array, empty if value is not array-like
 */
export const toArray = (value) => {
  if (Array.isArray(value)) {
    return value
  }
  if (value && typeof value === 'object') {
    // Handle paginated responses from Laravel
    if (Array.isArray(value.data)) {
      return value.data
    }
    // Handle single object - wrap in array
    if (!Array.isArray(value) && typeof value === 'object') {
      return [value]
    }
  }
  return []
}

/**
 * Safely get a value from an object with default fallback
 * @param {any} obj - The object to get from
 * @param {string} path - The path to the value (supports dot notation)
 * @param {any} defaultValue - Default value if path doesn't exist
 * @returns {any} - The value at path or defaultValue
 */
export const safeGet = (obj, path, defaultValue = null) => {
  if (!obj || typeof obj !== 'object') {
    return defaultValue
  }

  const keys = path.split('.')
  let result = obj

  for (const key of keys) {
    if (result && typeof result === 'object' && key in result) {
      result = result[key]
    } else {
      return defaultValue
    }
  }

  return result !== null && result !== undefined ? result : defaultValue
}

/**
 * Safely filter an array
 * @param {any} array - The array to filter
 * @param {Function} predicate - The filter function
 * @returns {Array} - The filtered array
 */
export const safeFilter = (array, predicate) => {
  const arr = toArray(array)
  if (!Array.isArray(arr)) {
    return []
  }
  return arr.filter(predicate)
}

/**
 * Safely map an array
 * @param {any} array - The array to map
 * @param {Function} mapper - The map function
 * @returns {Array} - The mapped array
 */
export const safeMap = (array, mapper) => {
  const arr = toArray(array)
  if (!Array.isArray(arr)) {
    return []
  }
  return arr.map(mapper)
}

/**
 * Validate command object shape
 * @param {any} command - The command to validate
 * @returns {boolean} - True if command has required properties
 */
export const isValidCommand = (command) => {
  return (
    command &&
    typeof command === 'object' &&
    typeof command.name === 'string' &&
    typeof command.description === 'string'
  )
}

/**
 * Validate API response structure
 * @param {any} response - The response object to validate
 * @param {string} expectedDataType - 'array', 'object', or 'any'
 * @returns {boolean} - True if response is valid
 */
export const isValidResponse = (response, expectedDataType = 'any') => {
  if (!response || typeof response !== 'object') {
    return false
  }

  const data = response.data
  
  switch (expectedDataType) {
    case 'array':
      return Array.isArray(data) || (data && Array.isArray(data.data))
    case 'object':
      return typeof data === 'object'
    default:
      return data !== null && data !== undefined
  }
}
