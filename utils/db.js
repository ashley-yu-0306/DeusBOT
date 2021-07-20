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
  class: "classes",
  user: "users",
  guild: "servers"
}
exports.eTABLES = TABLES;

const PRIMARY_CLASSES = new Map();
const ADVANCED_CLASSES = new Map();
const EXP_REQ = [];
const NORMAL_EFFECTS = [];
const HARD_EFFECTS = [];
const ITEMS = new Map();
const ABILITY_DESCRIPTIONS = new Map();
const ABILITY_META = new Map();
const STAT_EFFECTS = new Map();
const DUNGEONS = new Map();

const MONSTERS = new Map();
const EQUIPMENTS = new Map();
const SETS = [];

const STATS = new Map();
exports.STATS_ORDER = ['warrior', 'mage', 'thief', 'holy knight', 'dark knight', 'sorcerer', 'priest', 'reaper', 'phantom'];

const seedStatEffects = function (entry, _) {
  STAT_EFFECTS.set(entry.stat_id, entry);
}

const seedDungeons = function (entry, _) {
  DUNGEONS.set(parseInt(entry.id), entry);
}

const seedADesc = function (entry, _) {
  ABILITY_DESCRIPTIONS.set(entry.move_id, entry);
}

const seedEquipment = function (entry, _) {
  EQUIPMENTS.set(entry.location_id, entry);
  SETS.push(entry.descriptor);
}

const seedAMeta = function (entry, _) {
  ABILITY_META.set(entry.move_id, entry);
}

const seedClasses = function (entry, table) {
  if (entry.level_req == 0) PRIMARY_CLASSES.set(entry.name, entry);
  else if (entry.level_req == 10) ADVANCED_CLASSES.set(entry.name, entry);
  updateEntry(table, entry);
}

const seedMonsters = function (entry, _) {
  var dungeon = MONSTERS.get(entry.dungeon);
  if (dungeon == undefined) {
    var obj = {
      lesser: new Map(),
      greater: new Map(),
      boss: new Map()
    };
    dungeon = obj;
  }
  if (entry.boss == "true") dungeon.boss.set(entry.name, entry);
  else if (entry.lesser == "true") dungeon.lesser.set(entry.name, entry);
  else dungeon.greater.set(entry.name, entry);
  MONSTERS.set(entry.dungeon, dungeon);
}

const seedEffects = function (entry, _) {
  if (entry.mode == 'normal') NORMAL_EFFECTS.push(entry);
  else if (entry.mode == 'hard') HARD_EFFECTS.push(entry);
}

const seedEXP = function (entry, _) {
  EXP_REQ.push(entry.exp);
}

const seedItems = function (entry, _) {
  ITEMS.set(parseInt(entry.item_id), entry);
}

const seedStats = function (entry, _) {
  var data = [];
  for (let [key, val] of Object.entries(entry)) {
    if (key.toString() != 'stat') data.push(parseInt(val));
  }
  STATS.set(entry.stat, data);
}

const parseCSV = function (path, method, table) {
  var results = [];
  fs.createReadStream(path)
    .pipe(csv({}))
    .on('data', (data) => results.push(data))
    .on('end', () => {
      for (let i = 0; i < results.length; i++) {
        method(results[i], table);
      }
      exports.primary = PRIMARY_CLASSES;
      exports.advanced = ADVANCED_CLASSES;
      exports.exp = EXP_REQ;
      exports.stats = STATS;
      exports.normal_effects = NORMAL_EFFECTS;
      exports.hard_effects = HARD_EFFECTS;
      exports.monsters = MONSTERS;
      exports.stat_effects = STAT_EFFECTS;
      exports.a_desc = ABILITY_DESCRIPTIONS;
      exports.a_meta = ABILITY_META;
      exports.items = ITEMS;
      exports.dungeons = DUNGEONS;
      exports.equipment = EQUIPMENTS;
      exports.sets = SETS;
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

exports.getEntryByName = async (name) => {
  const params = {
    TableName: TABLES.class,
    Key: {
      name
    }
  }
  return await dbClient.get(params).promise();
}

getClassByID = async (id) => {
  const params = {
    TableName: TABLES.user,
    ExpressionAttributeValues: {
      ":id": id
    },
    ExpressionAttributeNames: {
      "#c": "class"
    },
    KeyConditionExpression: "id = :id",
    ProjectionExpression: "#c"
  };
  return await dbClient.query(params).promise();
}
getLevelByID = async (id) => {
  const params = {
    TableName: TABLES.user,
    ExpressionAttributeValues: {
      ":id": id
    },
    ExpressionAttributeNames: {
      "#l": "level"
    },
    KeyConditionExpression: "id = :id",
    ProjectionExpression: "#l"
  };
  return await dbClient.query(params).promise();
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

const getAllEntries = async (table) => {
  const params = {
    TableName: table
  };
  const entries = await dbClient.scan(params).promise();
  return entries;
}

const updateEntry = async (table, entry) => {
  const params = {
    TableName: table,
    Item: entry
  };
  return await dbClient.put(params).promise();
}

exports.eUpdateEntry = updateEntry;
console.log("Parsing data files...")
console.log("\tParsing classes...");
parseCSV('./data/classes.csv', seedClasses, TABLES.class);
console.log("\tParsing EXP requirements...");
parseCSV('./data/exp.csv', seedEXP, -1);
console.log("\tParsing STATS...");
parseCSV('./data/stats.csv', seedStats, -1);
console.log("\tParsing floor effects...");
parseCSV('./data/floor_effects.csv', seedEffects, -1);
console.log("\tParsing dungeon monsters...");
parseCSV('./data/monsters.csv', seedMonsters, -1);
console.log("\tParsing ability descriptions...");
parseCSV('./data/ability_desc.csv', seedADesc, -1);
console.log("\tParsing ability meta data...");
parseCSV('./data/ability_meta.csv', seedAMeta, -1);
console.log("\tParsing status effects...");
parseCSV('./data/stat_effects.csv', seedStatEffects, -1);
console.log("\tParsing items...");
parseCSV('./data/items.csv', seedItems, -1);
console.log("\tParsing equipment...");
parseCSV('./data/equipment.csv', seedEquipment, -1);
console.log("\tParsing dungeon types...");
parseCSV('./data/dungeons.csv', seedDungeons, -1);