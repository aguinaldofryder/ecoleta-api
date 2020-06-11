import knex from '../database/connection';
import { Request, Response } from 'express';

export class PointController {
  async index(req: Request, res: Response) {
    const { items } = req.query;

    const query = knex('point')
      .innerJoin('point_item', 'point_item.point_id', '=', 'point.id')
      .select('point.*')
      .distinct();

    if (items) {
      const parsedItems = String(items)
        .split(',')
        .map((itemId) => Number(itemId));
      query.whereIn('point_item.item_id', parsedItems);
    }

    const points = await query;
    const serializedPoints = await Promise.all(
      points.map(async (point) => ({
        ...point,
        items: await knex('item')
          .innerJoin('point_item', 'point_item.item_id', '=', 'item.id')
          .where({ 'point_item.point_id': point.id })
          .select('item.*'),
      }))
    );

    return res.json(serializedPoints);
  }

  async show(req: Request, res: Response) {
    const { id } = req.params;
    const point = await knex('point').select('*').where({ id }).first();
    point.items = this.getItemsByPointId(point.id);
    console.log('Finding point: ', point);
    return res.json(point);
  }

  async getItemsByPointId(pointId: number) {
    return await knex('item')
      .innerJoin('point_item', 'point_item.item_id', '=', 'item.id')
      .where({ 'point_item.point_id': pointId })
      .select('item.*');
  }

  async create(req: Request, res: Response) {
    const {
      name,
      email,
      whatsapp,
      latitude,
      longitude,
      city,
      address,
      number,
      uf,
      items,
    } = req.body;
    const trx = await knex.transaction();
    const point = {
      image: req.file.filename,
      name,
      email,
      whatsapp,
      latitude,
      longitude,
      city,
      uf,
      address,
      number,
    };
    console.log(point);
    const [pointId] = await trx('point').insert(point);

    const pointItems = items
      .split(',')
      .map((item: string) => Number(item.trim()))
      .map((itemId: number) => ({
        item_id: itemId,
        point_id: pointId,
      }));

    await trx('point_item').insert(pointItems);

    await trx.commit();

    return res.json({ id: pointId, ...point });
  }
}
