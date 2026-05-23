import type { Request, Response } from "express";
export declare const getMyNotifications: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const markNotificationRead: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const markAllNotificationsRead: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const deleteNotification: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=notification.controller.d.ts.map