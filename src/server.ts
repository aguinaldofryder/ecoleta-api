import express from 'express';
import path from 'path';
import routes from './routes';
import cors from 'cors';
import { errors } from 'celebrate';
import knex from './database/connection';
import { MigratorConfig, SeederConfig } from 'knex';

const knexfile = require('../knexfile');

const app = express();

app.use(cors());
app.use(express.json());
app.use(routes);

app.use('/uploads', express.static(path.resolve(__dirname, '..', 'uploads')));

app.use(errors());

const PORT = process.env.PORT || 4000;

const config = knexfile[process.env.NODE_ENV || 'development'];

const configMigrations: MigratorConfig = {
  directory: config.migrations.directory,
};

const configSeeds: SeederConfig = {
  directory: config.seeds.directory,
};

knex.migrate
  .latest(configMigrations)
  .then(() => {
    return knex.seed.run(configSeeds);
  })
  .then(() => {
    app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
  });
