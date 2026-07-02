import { NotFoundException } from '@nestjs/common';

import { PurchaseService } from './purchase.service';

/**
 * Mocks: un manager transaccional cuyo callback se ejecuta de inmediato, y el
 * repositorio de compras para el findOne final.
 */
function createMocks() {
  const manager = {
    findOne: jest.fn(),
    create: jest.fn((_entity: unknown, data: unknown) => data),
    save: jest.fn((entity: unknown) => Promise.resolve(entity)),
  };
  const dataSource = {
    transaction: jest.fn((cb: (m: typeof manager) => unknown) => cb(manager)),
  };
  const purchaseRepo = {
    findOne: jest.fn(),
    createQueryBuilder: jest.fn(),
  };
  const service = new PurchaseService(purchaseRepo as any, dataSource as any);
  return { service, manager, dataSource, purchaseRepo };
}

describe('PurchaseService', () => {
  describe('create', () => {
    it('suma stock y actualiza el costo del producto, en transacción', async () => {
      const { service, manager, dataSource, purchaseRepo } = createMocks();
      const product = { id: 1, stock: 10, cost: null };
      manager.findOne
        .mockResolvedValueOnce({ id: 2 }) // proveedor
        .mockResolvedValueOnce(product); // producto
      purchaseRepo.findOne.mockResolvedValue({ id: 5, total: 100 });

      const result = await service.create({
        supplierId: 2,
        items: [{ productId: 1, quantity: 5, unitCost: 20 }],
      });

      expect(product.stock).toBe(15); // 10 + 5
      expect(product.cost).toBe(20); // costo actualizado
      expect(dataSource.transaction).toHaveBeenCalledTimes(1);
      expect(result).toEqual({ id: 5, total: 100 });
    });

    it('lanza NotFound (y revierte) si un producto no existe', async () => {
      const { service, manager } = createMocks();
      manager.findOne
        .mockResolvedValueOnce({ id: 2 }) // proveedor ok
        .mockResolvedValueOnce(null); // producto inexistente

      await expect(
        service.create({
          supplierId: 2,
          items: [{ productId: 99, quantity: 1, unitCost: 5 }],
        }),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('lanza NotFound si el proveedor no existe', async () => {
      const { service, manager } = createMocks();
      manager.findOne.mockResolvedValueOnce(null); // proveedor inexistente

      await expect(
        service.create({
          supplierId: 99,
          items: [{ productId: 1, quantity: 1, unitCost: 5 }],
        }),
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });
});
