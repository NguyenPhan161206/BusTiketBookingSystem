/**
 * Instance Knex duy nhất của ứng dụng.
 *   const db = require('../../../db/knex');
 *   const rows = await db('table').where({ id });
 */
const knex = require('knex');
const { types } = require('pg');
const dbConfig = require('../config/database');

// BIGINT (int8, OID 20) mặc định trả về string; đổi sang number (an toàn tới 2^53).
types.setTypeParser(20, (value) => Number.parseInt(value, 10));

const db = knex(dbConfig);

module.exports = db;
