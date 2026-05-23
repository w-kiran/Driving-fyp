import type { Request, Response } from "express";
export declare const createPayment: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getAllPayments: (req: Request, res: Response) => Promise<void>;
export declare const getPaymentById: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const refundPayment: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=payment.controller.d.ts.map