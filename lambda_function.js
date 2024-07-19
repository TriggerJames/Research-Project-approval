exports.handler = async (event) => {
    const file = event.file;
    const format = event.format;
  
    // Convert file using Unoconv
    unoconv.convert(file, format, (err, result) => {
      if (err) {
        console.error(err);
        throw new Error('Failed to convert file');
      } else {
        return { statusCode: 200, body: 'File converted successfully' };
      }
    });
  };