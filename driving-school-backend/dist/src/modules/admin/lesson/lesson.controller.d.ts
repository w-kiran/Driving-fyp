import type { Request, Response } from "express";
export declare const getAllLessons: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getLessonById: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const updateLesson: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const deleteLesson: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const completeLesson: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=lesson.controller.d.ts.map