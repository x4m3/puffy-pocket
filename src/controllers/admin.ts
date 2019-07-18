import { Request, Response, NextFunction } from "express";

/**
 * GET /admin
 * Display main admin page
 */
export const getAdmin = (req: Request, res: Response, next: NextFunction) => {
    res.send("sup");
};
