import { createLogger,format as _format,transports as _transports } from 'winston';

const logger = createLogger({
  level: 'info',
  format: _format.combine(
    _format.timestamp(),
    _format.json()
  ),
  transports: [
    new _transports.File({ filename: 'error.log', level: 'error' }),
    new _transports.File({ filename: 'combined.log' })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new _transports.Console({
    format: _format.combine(
      _format.colorize(), // Adds color to log levels
      _format.simple() // Simple format to show log message
    )
  }));
}

export default logger;