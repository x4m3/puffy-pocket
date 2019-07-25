import { Request, Response, NextFunction } from "express";


// import sub controllers

/**
 * GET /admin
 * Display main admin page
 */
export const getIndex = (req: Request, res: Response, next: NextFunction) => {
  res.render("admin/index", {
    title: "admin panel"
  });
};
