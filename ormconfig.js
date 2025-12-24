const { DataSource } = require('typeorm');
const dotenv = require('dotenv');

dotenv.config();

module.exports = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'secretpassword',
    database: process.env.DB_NAME || 'tasks_db',
    entities: ['dist/**/*.entity.js'],
    migrations: ['dist/migrations/*.js'],
    synchronize: false,
});