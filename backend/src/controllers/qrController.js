import QRCode from 'qrcode';

export async function generateQRCode(req, res) {
  try {
    const { text, darkColor = '#000000', lightColor = '#ffffff', width = 350 } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ success: false, message: 'Please provide text or URL for QR code generation.' });
    }

    const qrDataUrl = await QRCode.toDataURL(text.trim(), {
      width: parseInt(width, 10) || 350,
      margin: 2,
      color: {
        dark: darkColor || '#000000',
        light: lightColor || '#ffffff'
      }
    });

    return res.json({
      success: true,
      qrDataUrl,
      text: text.trim(),
      darkColor,
      lightColor
    });
  } catch (err) {
    console.error('QR generation error:', err);
    return res.status(500).json({ success: false, message: 'Failed to generate QR code.' });
  }
}

export async function downloadQRCode(req, res) {
  try {
    const { text, darkColor = '#000000', lightColor = '#ffffff' } = req.query;

    if (!text) {
      return res.status(400).send('Text parameter is required.');
    }

    const buffer = await QRCode.toBuffer(text, {
      type: 'png',
      width: 600,
      margin: 3,
      color: {
        dark: darkColor,
        light: lightColor
      }
    });

    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Content-Disposition', 'attachment; filename="linkpulse-qrcode.png"');
    return res.send(buffer);
  } catch (err) {
    return res.status(500).send('Error generating downloadable QR code.');
  }
}
