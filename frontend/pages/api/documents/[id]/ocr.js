// pages/api/mock/documents/[id]/ocr.js
export default function handler(req, res) {
    const { id } = req.query;
    
    // In a real app, you'd look up the document and perform OCR.
    // Here, we'll just return some mock text.
    
    if (req.method === 'POST') {
      res.status(200).json({ 
        ocrText: `This is the mocked OCR text for document ${id}. 
        \n\nLorem ipsum dolor sit amet, consectetur adipiscing elit. 
        Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.` 
      });
    } else {
      res.setHeader('Allow', ['POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}