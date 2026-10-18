const formatLog = (level, message, meta) => {
    const payload = {
        level,
        message,
        timestamp: new Date().toISOString(),
        ...meta,
    };
    // Mask sensitive fields if present
    if (payload.password)
        payload.password = '[REDACTED]';
    if (payload.token)
        payload.token = '[REDACTED]';
    if (payload.authorization)
        payload.authorization = '[REDACTED]';
    if (payload.cookie)
        payload.cookie = '[REDACTED]';
    return JSON.stringify(payload);
};
export const logger = {
    info: (message, meta) => {
        console.log(formatLog('info', message, meta));
    },
    warn: (message, meta) => {
        console.warn(formatLog('warn', message, meta));
    },
    error: (message, meta) => {
        console.error(formatLog('error', message, meta));
    },
    debug: (message, meta) => {
        if (process.env.NODE_ENV !== 'production') {
            console.debug(formatLog('debug', message, meta));
        }
    },
};
