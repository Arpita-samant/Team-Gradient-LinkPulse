import { Router } from 'express';
import { generateQRCode, downloadQRCode } from '../controllers/qrController.js';

const router = Router();

router.post('/generate', generateQRCode);
router.get('/download', downloadQRCode);

export default router;
