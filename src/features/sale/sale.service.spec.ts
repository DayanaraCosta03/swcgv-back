import { SaleService } from './sale.service';

function createMocks() {
  const saleRepo = {
    findOne: jest.fn(),
    createQueryBuilder: jest.fn(),
  };
  const dataSource = {
    transaction: jest.fn(),
  };
  const service = new SaleService(saleRepo as any, dataSource as any);
  return { service, saleRepo, dataSource };
}

describe('SaleService', () => {
  describe('create — idempotencia', () => {
    it('con una idempotencyKey ya registrada, devuelve la venta existente sin crear otra', async () => {
      const { service, saleRepo, dataSource } = createMocks();
      // 1) búsqueda por idempotencyKey → existe; 2) findOne(id) → venta completa
      saleRepo.findOne
        .mockResolvedValueOnce({ id: 9 })
        .mockResolvedValueOnce({ id: 9, totalAmount: '150.00' });

      const result = await service.create({
        idempotencyKey: 'key-abc',
        paymentMethod: 'EFECTIVO',
        documentType: 'TICKET',
        items: [{ productId: 1, quantity: 1 }],
      } as any);

      expect(dataSource.transaction).not.toHaveBeenCalled();
      expect(result).toEqual({ id: 9, totalAmount: '150.00' });
    });

    it('sin idempotencyKey previa, entra a la transacción para crear la venta', async () => {
      const { service, saleRepo, dataSource } = createMocks();
      dataSource.transaction.mockResolvedValue(10); // devuelve el id de la venta
      saleRepo.findOne.mockResolvedValue({ id: 10 }); // findOne final

      const result = await service.create({
        paymentMethod: 'EFECTIVO',
        documentType: 'TICKET',
        items: [{ productId: 1, quantity: 1 }],
      } as any);

      expect(dataSource.transaction).toHaveBeenCalledTimes(1);
      expect(result).toEqual({ id: 10 });
    });
  });
});
