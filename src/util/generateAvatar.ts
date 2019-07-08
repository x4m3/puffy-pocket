import Identicon from "identicon.js";

/**
 * Generates avatar in base64
 * @param   {string} id Input to generate avatar for user
 * @param   {number} size Size of the avatar
 * @returns {Buffer} Avatar in base64 form, ready to be displayed
 */
export function generateAvatar(id: string, size: number): Buffer {
    const avatar: string = new Identicon(id, size).toString();
    return Buffer.from(avatar, 'base64');
};
