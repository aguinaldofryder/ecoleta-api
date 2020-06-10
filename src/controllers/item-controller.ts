import knex from '../database/connection';
import { Request, Response } from 'express';

export class ItemController {
  async index(req: Request, res: Response) {
    const items = await knex('item').select('*');
    return res.json(items);
  }
}
