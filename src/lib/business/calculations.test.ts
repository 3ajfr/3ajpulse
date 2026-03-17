import { describe, it, expect } from "vitest";
import {
  sumAmounts,
  calculateTotalInvoiced,
  calculateInvoicePaidAmount,
  calculateTotalPaid,
  calculateRemainingDue,
  calculateInvoiceRemainingDue,
  resolveInvoicePaymentStatus,
  calculateInvoiceTotals,
  calculateInvoiceLineSubtotal,
  calculateInvoiceLineVat,
} from "./calculations";

describe("calculations", () => {
  describe("sumAmounts", () => {
    it("sums numbers", () => {
      expect(sumAmounts([1, 2, 3])).toBe(6);
    });
    it("handles string numbers", () => {
      expect(sumAmounts(["10", "20"])).toBe(30);
    });
    it("handles mixed and null", () => {
      expect(sumAmounts([10, null, "5", undefined])).toBe(15);
    });
  });

  describe("calculateTotalInvoiced", () => {
    it("sums invoice totalAmount", () => {
      const invoices = [
        { totalAmount: 1000, paymentAllocations: [] },
        { totalAmount: 2000, paymentAllocations: [] },
      ];
      expect(calculateTotalInvoiced(invoices)).toBe(3000);
    });
  });

  describe("calculateInvoicePaidAmount", () => {
    it("sums payment allocations", () => {
      const invoice = {
        totalAmount: 1000,
        paymentAllocations: [{ amount: 300 }, { amount: 200 }],
      };
      expect(calculateInvoicePaidAmount(invoice)).toBe(500);
    });
    it("returns 0 when no allocations", () => {
      const invoice = { totalAmount: 1000 };
      expect(calculateInvoicePaidAmount(invoice)).toBe(0);
    });
  });

  describe("calculateTotalPaid", () => {
    it("sums paid amounts across invoices", () => {
      const invoices = [
        { totalAmount: 1000, paymentAllocations: [{ amount: 500 }] },
        { totalAmount: 2000, paymentAllocations: [{ amount: 1000 }] },
      ];
      expect(calculateTotalPaid(invoices)).toBe(1500);
    });
  });

  describe("calculateRemainingDue", () => {
    it("returns total - paid", () => {
      const invoices = [
        { totalAmount: 1000, paymentAllocations: [{ amount: 400 }] },
        { totalAmount: 500, paymentAllocations: [] },
      ];
      expect(calculateRemainingDue(invoices)).toBe(1100);
    });
    it("returns 0 when overpaid", () => {
      const invoices = [
        { totalAmount: 1000, paymentAllocations: [{ amount: 1500 }] },
      ];
      expect(calculateRemainingDue(invoices)).toBe(0);
    });
  });

  describe("calculateInvoiceRemainingDue", () => {
    it("returns total - paid for single invoice", () => {
      const invoice = {
        totalAmount: 1000,
        paymentAllocations: [{ amount: 350 }],
      };
      expect(calculateInvoiceRemainingDue(invoice)).toBe(650);
    });
  });

  describe("resolveInvoicePaymentStatus", () => {
    it("returns CANCELLED when status is CANCELLED", () => {
      expect(
        resolveInvoicePaymentStatus({
          totalAmount: 1000,
          status: "CANCELLED",
          paymentAllocations: [{ amount: 500 }],
        })
      ).toBe("CANCELLED");
    });
    it("returns PAID when fully paid", () => {
      expect(
        resolveInvoicePaymentStatus({
          totalAmount: 1000,
          status: "SENT",
          paymentAllocations: [{ amount: 1000 }],
        })
      ).toBe("PAID");
    });
    it("returns PARTIALLY_PAID when partially paid", () => {
      expect(
        resolveInvoicePaymentStatus({
          totalAmount: 1000,
          status: "SENT",
          paymentAllocations: [{ amount: 400 }],
        })
      ).toBe("PARTIALLY_PAID");
    });
    it("returns DRAFT when draft and unpaid", () => {
      expect(
        resolveInvoicePaymentStatus({
          totalAmount: 1000,
          status: "DRAFT",
          paymentAllocations: [],
        })
      ).toBe("DRAFT");
    });
    it("returns PENDING when issued/sent and unpaid", () => {
      expect(
        resolveInvoicePaymentStatus({
          totalAmount: 1000,
          status: "SENT",
          paymentAllocations: [],
        })
      ).toBe("SENT");
    });
  });

  describe("calculateInvoiceLineSubtotal", () => {
    it("computes quantity * unitPrice", () => {
      expect(
        calculateInvoiceLineSubtotal({ quantity: 2, unitPrice: 150 })
      ).toBe(300);
    });
  });

  describe("calculateInvoiceLineVat", () => {
    it("computes VAT at given rate", () => {
      expect(
        calculateInvoiceLineVat({
          quantity: 1,
          unitPrice: 100,
          vatRate: 20,
        })
      ).toBe(20);
    });
  });

  describe("calculateInvoiceTotals", () => {
    it("sums subtotal, vat, total for lines", () => {
      const lines = [
        { quantity: 1, unitPrice: 100, vatRate: 20 },
        { quantity: 2, unitPrice: 50, vatRate: 20 },
      ];
      const result = calculateInvoiceTotals(lines);
      expect(result.subtotal).toBe(200);
      expect(result.vat).toBe(40);
      expect(result.total).toBe(240);
    });
  });
});
