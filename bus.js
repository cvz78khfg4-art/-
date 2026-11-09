// Общая шина событий — через неё модули общаются друг с другом
const EventEmitter = require('events');

module.exports = new EventEmitter();
