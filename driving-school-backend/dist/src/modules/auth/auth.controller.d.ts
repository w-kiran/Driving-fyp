import type { Request, Response } from "express";
export declare const adminLogin: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const studentRegister: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const studentLogin: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const logout: (_req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=auth.controller.d.ts.map