/**
 * Simple logger utility with timestamps
 */
class Logger {
  _formatMessage(level, message, meta = {}) {
    const timestamp = new Date().toISOString();
    const metaStr = Object.keys(meta).length > 0 ? JSON.stringify(meta) : '';
    return `[${timestamp}] [${level}] ${message} ${metaStr}`.trim();
  }

  info(message, meta) {
    console.log(this._formatMessage('INFO', message, meta));
  }

  error(message, meta) {
    console.error(this._formatMessage('ERROR', message, meta));
  }

  warn(message, meta) {
    console.warn(this._formatMessage('WARN', message, meta));
  }

  debug(message, meta) {
    if (process.env.NODE_ENV === 'development') {
      console.log(this._formatMessage('DEBUG', message, meta));
    }
  }
}

module.exports = new Logger();
