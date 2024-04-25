import { Sequelize } from 'sequelize';
import configuration from '../config.js';

const { database, username, password, host, port } = configuration;

const sequelize = new Sequelize(database, username, password, {
    host,
    dialect: 'mysql',
    port,
    pool: {
        max: 70,
        min: 0,
        acquire: 350,
        idle: 10000
    },
    logging: false
});

export default sequelize;
