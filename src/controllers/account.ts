import { Request, Response, NextFunction } from "express";
import dateformat from "dateformat";
import Identicon from "identicon.js";

/**
 * GET /account
 * Display user account
 */
export const getAccount = (req: Request, res: Response) => {
  res.render("public/account", {
    title: "Your account",
    user: req.user,
    creationDate: dateformat(req.user.createdAt, "d/m/yyyy")
  });
};

/**
 * GET /account/avatar
 * Display user avatar as png image
 */
export const getAvatar = (req: Request, res: Response) => {
  const size: number = +req.query.size;

  // generate avatar from either requested size or fallback to 500 pixels
  const avatar: Buffer = Buffer.from(new Identicon(req.user.userId, size || 500).toString(), "base64");

  res.writeHead(200, {
    'Content-Type': 'image/png',
    'Content-Length': avatar.length
  });
  res.end(avatar);
};

