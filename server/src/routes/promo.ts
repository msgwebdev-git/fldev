import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { AppError } from '../middleware/errorHandler.js';
import { promoService } from '../services/promo.js';

const router = Router();

const validateSchema = z.object({
  code: z.string().min(1),
  totalAmount: z.number().positive(),
});

// Validate promo code
router.post('/validate', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validation = validateSchema.safeParse(req.body);
    if (!validation.success) {
      throw new AppError('Invalid request', 400);
    }

    const { code, totalAmount } = validation.data;

    const result = await promoService.validatePromoCode(code, totalAmount);

    if (!result.valid) {
      res.json({
        success: false,
        error: result.error,
      });
      return;
    }

    res.json({
      success: true,
      data: {
        code: result.code,
        discountPercent: result.discountPercent,
        discountAmount: result.discountAmount,
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
