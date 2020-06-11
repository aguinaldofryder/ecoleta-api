import express from 'express';
import { PointController } from './controllers/point-controller';
import knex from './database/connection';
import { ItemController } from './controllers/item-controller';
import multer from 'multer';
import multerConfig from './config/multer';
import { celebrate, Joi } from 'celebrate';

const routes = express.Router();
const upload = multer(multerConfig);

const pointController = new PointController();
const itemController = new ItemController();

routes.get('/items', itemController.index);

routes.get('/points', pointController.index);

routes.get('/points/:id', pointController.show);

routes.post(
  '/points',
  upload.single('image'),
  celebrate(
    {
      body: Joi.object().keys({
        name: Joi.string().required(),
        email: Joi.string().required().email(),
        whatsapp: Joi.string().required(),
        latitude: Joi.number().required(),
        longitude: Joi.number().required(),
        city: Joi.string().required(),
        uf: Joi.string().required().max(2),
        address: Joi.string(),
        number: Joi.string(),
        items: Joi.string()
          .required()
          .regex(/[0-9,]+$/),
      }),
    },
    { abortEarly: false }
  ),
  pointController.create
);

export default routes;
