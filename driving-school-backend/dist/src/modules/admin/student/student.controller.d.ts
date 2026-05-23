import type { Request, Response } from "express";
export declare const getAllStudents: (req: Request, res: Response) => Promise<void>;
export declare const getStudentById: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const createStudent: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const updateStudent: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const deleteStudent: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=student.controller.d.ts.map