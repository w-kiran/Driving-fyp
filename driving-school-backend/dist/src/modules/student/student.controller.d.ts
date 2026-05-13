import type { Request, Response } from "express";
export declare const requestNewLesson: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getMyBookings: (_req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const cancelBooking: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getMyLessons: (_req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=student.controller.d.ts.map