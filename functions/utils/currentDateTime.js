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
    const sanitizedFilename = formattedDateNoSpaces.replace(/[\/\\:]/g, '_').replace(/,/g, '_');

    return sanitizedFilename;
}

module.exports = getCurrentDateTime