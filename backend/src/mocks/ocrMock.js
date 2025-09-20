module.exports = (filePath) => {
    return Promise.resolve({
      text: 'This is a mock OCR result.',
      confidence: 0.95,
    });
  };
  