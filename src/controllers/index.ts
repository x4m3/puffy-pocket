import { Request, Response } from "express";

/**
 * GET /
 * home page
 */
export const index = (req: Request, res: Response) => {
  res.render("index", {
    title: "homepage",
    user: req.user
  });
};
