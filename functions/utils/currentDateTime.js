function getCurrentDateTime() {
    
    const now = new Date(); 

    // Options for US formatting
    const options = {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false // Use 24-hour format; set to true for 12-hour format
    };
    
    // Get the formatted date and time in US format
    const formattedDate = now.toLocaleString('en-US', options);
    
    // Replace spaces with no spaces
    const formattedDateNoSpaces = formattedDate.replace(/ /g, '');
    const sanitizedFilename = sanitizeFilename(formattedDateNoSpaces);

    return sanitizedFilename;
}

// don't export - we don't need in index.js
function sanitizeFilename(filename) {
    return filename
        .replace(/[\/\\:]/g, '_')  // Replace slashes and colons with underscores
        .replace(/,/g, '_');        // Replace commas with underscores
}

module.exports = getCurrentDateTime