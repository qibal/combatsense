/**
 * Utility untuk standardisasi response dan error handling
 * Digunakan di semua repository untuk konsistensi response
 */

/**
 * Success Response Helper
 * @param {any} data - Data yang akan dikirim
 * @param {string} message - Pesan success (optional)
 * @returns {Object} - Standardized success response
 */
function successResponse(data, message = 'Operation successful') {
  return {
    success: true,
    message: message,
    data: data,
    timestamp: new Date().toISOString()
  };
}

/**
 * Error Response Helper
 * @param {string} message - Error message
 * @param {Error} error - Error object (optional)
 * @param {number} code - Error code (optional)
 * @returns {Object} - Standardized error response
 */
function errorResponse(message = 'Something went wrong', error = null, code = 500) {
  return {
    success: false,
    message: message,
    error: error?.message || null,
    code: code,
    timestamp: new Date().toISOString()
  };
}

/**
 * Database Error Handler
 * @param {Error} error - Database error object
 * @returns {Object} - Formatted error response
 */
function handleDatabaseError(error) {
  console.error('Database Error:', error);
  
  // Handle specific PostgreSQL errors
  if (error.code === '23505') {
    return errorResponse('Data already exists', error, 409);
  }
  
  if (error.code === '23503') {
    return errorResponse('Referenced data not found', error, 404);
  }
  
  if (error.code === '42P01') {
    return errorResponse('Table does not exist', error, 500);
  }
  
  // Generic database error
  return errorResponse('Database operation failed', error, 500);
}

/**
 * Validation Error Handler
 * @param {string} field - Field yang error
 * @param {string} message - Validation message
 * @returns {Object} - Formatted validation error
 */
function validationError(field, message) {
  return errorResponse(`Validation failed: ${field} - ${message}`, null, 400);
}

module.exports = {
  successResponse,
  errorResponse,
  handleDatabaseError,
  validationError
};

/**
 * Cara penggunaan:
 * 
 * // Success response
 * return successResponse(personnelData, 'Personnel created successfully');
 * 
 * // Error response
 * return errorResponse('Personnel not found', null, 404);
 * 
 * // Database error handling
 * try {
 *   const result = await db.insert(table).values(data);
 * } catch (error) {
 *   return handleDatabaseError(error);
 * }
 * 
 * // Validation error
 * if (!name) {
 *   return validationError('name', 'Name is required');
 * }
 */