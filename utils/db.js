const AWS = require('aws-sdk');
const csv = require('csv-parser');
const { setServers } = require('dns');
const fs = require('fs');
require('dotenv').config();

AWS.config.update({
  region: process.env.AWS_DEFAULT_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
})

const dbClient = new AWS.DynamoDB.DocumentClient();
const TABLES = {
  user: "users",
  guild: "servers"
}
exports.eTABLES = TABLES;

exports.p_stats_order = ['', 'warrior', 'mage', 'thief', 'holy knight', 'dark knight', 'sorcerer', 'priest', 'reaper', 'phantom'];
const p_pclasses = {};
const p_aclasses = {};
const p_stats = {};
const exp_req = [];

const fe_normal = [];
const fe_hard = [];
const a_desc = [];
const a_meta = [];
const se = [];
const dungeons = [];

const monsters = [];
const equipment = [];
const sets = [];
const items = [];

const seedData = function (entry, dataset, key_is_name, is_array) {
  if (is_array) dataset.push(entry);
  else {
    if (key_is_name) dataset[entry.name] = entry;
    else { dataset[entry.id] = entry; }
  }
}

const seedEffects = function (entry, _) {
  if (entry.mode == 'normal') fe_normal.push(entry);
  else if (entry.mode == 'hard') fe_hard.push(entry);
}

const seedEquipment = function (entry, _) {
  equipment[entry.location_id] = entry;
  sets.push(entry.descriptor);
}

const seedClasses = function (entry, _) {
  if (entry.level_req == 0) p_pclasses[entry.name] = entry;
  else if (entry.level_req == 10) p_aclasses[entry.name] = entry;
}

const seedMonsters = function (entry, _) {
  var dungeon = monsters[entry.dungeon];
  if (dungeon == undefined) dungeon = { lesser: {}, greater: {}, boss: {} };
  if (entry.boss == "true") dungeon.boss[entry.name] = entry;
  else if (entry.lesser == "true") dungeon.lesser[entry.name] = entry;
  else dungeon.greater[entry.name] = entry;
  monsters[entry.dungeon] = dungeon;
}

const parseCSV = function (path, method, dataset, key_is_name = false, is_array = false) {
  let results = [];
  fs.createReadStream(path)
    .pipe(csv({}))
    .on('data', (data) => results.push(data))
    .on('end', () => {
      for (let i = 0; i < results.length; i++) {
        method(results[i], dataset, key_is_name, is_array);
      }
      exports.p_pclasses = p_pclasses;
      exports.p_aclasses = p_aclasses;
      exports.exp_req = exp_req;
      exports.p_stats = p_stats;
      exports.fe_normal = fe_normal;
      exports.fe_hard = fe_hard;
      exports.monsters = monsters;
      exports.se = se;
      exports.a_desc = a_desc;
      exports.a_meta = a_meta;
      exports.items = items;
      exports.dungeons = dungeons;
      exports.equipment = equipment;
      exports.sets = sets;
    })
}

const deleteEntry = async (table, id) => {
  const params = {
    TableName: table,
    Key: {
      id
    }
  }
  return await dbClient.delete(params).promise();
}

exports.getEntryByID = async (id, table) => {
  const params = {
    TableName: table,
    ExpressionAttributeValues: {
      ":id": id
    },
    KeyConditionExpression: "id = :id"
  };
  return await dbClient.query(params).promise();
}

const updateEntry = async (table, entry) => {
  const params = {
    TableName: table,
    Item: entry
  };
  return await dbClient.put(params).promise();
}
exports.eUpdateEntry = updateEntry;

parseCSV('./data/exp.csv', seedData, exp_req, undefined, true);
parseCSV('./data/stat_effects.csv', seedData, se);
parseCSV('./data/dungeons.csv', seedData, dungeons);
parseCSV('./data/stats.csv', seedData, p_stats, true);
parseCSV('./data/ability_meta.csv', seedData, a_meta);
parseCSV('./data/ability_desc.csv', seedData, a_desc);
parseCSV('./data/items.csv', seedData, items);
parseCSV('./data/classes.csv', seedClasses, undefined);
parseCSV('./data/floor_effects.csv', seedEffects, undefined);
parseCSV('./data/monsters.csv', seedMonsters, undefined);
parseCSV('./data/equipment.csv', seedEquipment, undefined);