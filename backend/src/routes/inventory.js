import { Router } from 'express';
import { prisma } from '../prisma.js';

const router = Router();

// Helper: compute stock status from quantity vs threshold
function getStatus(quantity, threshold) {
  if (quantity <= 5) return 'Critical';
  if (quantity <= threshold) return 'Low Stock';
  return 'In Stock';
}

// GET /api/inventory — all medicines with computed status
router.get('/', async (req, res) => {
  try {
    const items = await prisma.inventory.findMany({
      orderBy: { medicineName: 'asc' }
    });
    const withStatus = items.map(i => ({
      ...i,
      status: getStatus(i.stockQuantity, i.lowStockThreshold)
    }));
    res.json(withStatus);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch inventory' });
  }
});

// GET /api/inventory/search?q= — search medicines (for autocomplete)
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    const medicines = await prisma.inventory.findMany({
      where: { medicineName: { contains: q || '', mode: 'insensitive' } },
      take: 10,
      orderBy: { medicineName: 'asc' }
    });
    res.json(medicines);
  } catch (err) {
    res.status(500).json({ error: 'Medicine search failed' });
  }
});

// GET /api/inventory/low-stock — items below their threshold
router.get('/low-stock', async (req, res) => {
  try {
    const items = await prisma.inventory.findMany({ orderBy: { stockQuantity: 'asc' } });
    const lowStock = items
      .filter(i => i.stockQuantity <= i.lowStockThreshold)
      .map(i => ({ ...i, status: getStatus(i.stockQuantity, i.lowStockThreshold) }));
    res.json(lowStock);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch low stock items' });
  }
});

// POST /api/inventory — add new medicine to stock
router.post('/', async (req, res) => {
  try {
    const { medicineName, brand, formulation, stockQuantity, unit, price, expiryDate, lowStockThreshold } = req.body;

    if (!medicineName || stockQuantity === undefined || !price) {
      return res.status(400).json({ error: 'Medicine name, stock quantity, and price are required' });
    }

    const item = await prisma.inventory.create({
      data: {
        medicineName,
        brand,
        formulation,
        stockQuantity: parseInt(stockQuantity),
        unit,
        price: parseFloat(price),
        expiryDate,
        lowStockThreshold: lowStockThreshold ? parseInt(lowStockThreshold) : 20
      }
    });
    res.status(201).json({ ...item, status: getStatus(item.stockQuantity, item.lowStockThreshold) });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add medicine' });
  }
});

// PATCH /api/inventory/:id — update stock quantity or details
router.patch('/:id', async (req, res) => {
  try {
    const { stockQuantity, brand, formulation, unit, price, expiryDate, lowStockThreshold } = req.body;

    const updated = await prisma.inventory.update({
      where: { id: req.params.id },
      data: {
        ...(stockQuantity !== undefined && { stockQuantity: parseInt(stockQuantity) }),
        ...(brand !== undefined && { brand }),
        ...(formulation !== undefined && { formulation }),
        ...(unit !== undefined && { unit }),
        ...(price !== undefined && { price: parseFloat(price) }),
        ...(expiryDate !== undefined && { expiryDate }),
        ...(lowStockThreshold !== undefined && { lowStockThreshold: parseInt(lowStockThreshold) })
      }
    });
    res.json({ ...updated, status: getStatus(updated.stockQuantity, updated.lowStockThreshold) });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update inventory' });
  }
});

// PATCH /api/inventory/:id/consume — decrease stock by 1 (dispense)
router.patch('/:id/consume', async (req, res) => {
  try {
    const item = await prisma.inventory.findUnique({ where: { id: req.params.id } });
    if (!item) return res.status(404).json({ error: 'Medicine not found' });
    if (item.stockQuantity <= 0) return res.status(400).json({ error: 'No stock remaining' });

    const updated = await prisma.inventory.update({
      where: { id: req.params.id },
      data: { stockQuantity: item.stockQuantity - 1 }
    });
    res.json({ ...updated, status: getStatus(updated.stockQuantity, updated.lowStockThreshold) });
  } catch (err) {
    res.status(500).json({ error: 'Failed to consume stock' });
  }
});

export default router;
