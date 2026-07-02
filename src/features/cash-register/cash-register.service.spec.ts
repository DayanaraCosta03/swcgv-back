import { BadRequestException, ConflictException } from '@nestjs/common';

import { CashRegisterService } from './cash-register.service';

/** Repos mockeados: solo los métodos que usa el servicio. */
function createMocks() {
  const qb = {
    select: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    getRawOne: jest.fn(),
  };
  const cashRepo = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    findAndCount: jest.fn(),
  };
  const saleRepo = {
    createQueryBuilder: jest.fn(() => qb),
  };
  const service = new CashRegisterService(cashRepo as any, saleRepo as any);
  return { service, cashRepo, saleRepo, qb };
}

describe('CashRegisterService', () => {
  describe('open', () => {
    it('abre una caja cuando el usuario no tiene ninguna abierta', async () => {
      const { service, cashRepo } = createMocks();
      cashRepo.findOne.mockResolvedValue(null);
      cashRepo.create.mockImplementation((data: unknown) => data);
      cashRepo.save.mockImplementation((data: unknown) =>
        Promise.resolve({ id: 1, ...(data as object) }),
      );

      const result = await service.open(7, { initialAmount: 100 });

      expect(cashRepo.save).toHaveBeenCalledTimes(1);
      expect(result).toMatchObject({
        userId: 7,
        initialAmount: 100,
        status: 'OPEN',
      });
    });

    it('lanza ConflictException si el usuario ya tiene una caja abierta', async () => {
      const { service, cashRepo } = createMocks();
      cashRepo.findOne.mockResolvedValue({ id: 1, status: 'OPEN' });

      await expect(
        service.open(7, { initialAmount: 100 }),
      ).rejects.toBeInstanceOf(ConflictException);
      expect(cashRepo.save).not.toHaveBeenCalled();
    });
  });

  describe('close', () => {
    it('calcula el arqueo: expected = inicial + efectivo, difference = final - expected', async () => {
      const { service, cashRepo, qb } = createMocks();
      cashRepo.findOne.mockResolvedValue({
        id: 1,
        userId: 7,
        openedAt: new Date('2026-07-02T08:00:00Z'),
        initialAmount: 100,
        status: 'OPEN',
      });
      qb.getRawOne.mockResolvedValue({ sum: '250' });
      cashRepo.save.mockImplementation((data: unknown) =>
        Promise.resolve(data),
      );

      const result = await service.close(7, { finalAmount: 345 });

      expect(result.expectedAmount).toBe(350); // 100 + 250
      expect(result.difference).toBe(-5); // 345 - 350 (faltante)
      expect(result.finalAmount).toBe(345);
      expect(result.status).toBe('CLOSED');
      expect(result.closedAt).toBeInstanceOf(Date);
    });

    it('lanza BadRequestException si no hay una caja abierta para cerrar', async () => {
      const { service, cashRepo } = createMocks();
      cashRepo.findOne.mockResolvedValue(null);

      await expect(
        service.close(7, { finalAmount: 345 }),
      ).rejects.toBeInstanceOf(BadRequestException);
      expect(cashRepo.save).not.toHaveBeenCalled();
    });
  });

  describe('current', () => {
    it('devuelve la caja abierta del usuario', async () => {
      const { service, cashRepo } = createMocks();
      const open = { id: 1, userId: 7, status: 'OPEN' };
      cashRepo.findOne.mockResolvedValue(open);

      await expect(service.current(7)).resolves.toBe(open);
    });
  });
});
