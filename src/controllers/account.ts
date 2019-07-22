import { Request, Response, NextFunction } from "express";
import dateformat from "dateformat";
import Identicon from "identicon.js";

/**
 * GET /account
 * Display user account
 */
export const getAccount = (req: Request, res: Response) => {
  res.render("account", {
    title: "Your account",
    user: req.user,
    creationDate: dateformat(req.user.createdAt, "dddd, mmmm dS, yyyy, h:MM:ss TT"),
    UpdateDate: dateformat(req.user.updatedAt, "dddd, mmmm dS, yyyy, h:MM:ss TT")
  });
};

/**
 * GET /account/avatar
 * Display user avatar as png image
 */
export const getAvatar = (req: Request, res: Response) => {
  const avatar: Buffer = Buffer.from(new Identicon(req.user.userId, 500).toString(), "base64");

  res.writeHead(200, {
    'Content-Type': 'image/png',
    'Content-Length': avatar.length
  });
  res.end(avatar);
};

