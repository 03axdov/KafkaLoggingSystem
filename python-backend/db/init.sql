DROP TABLE IF EXISTS error_logs;
DROP TABLE IF EXISTS error_counts;

CREATE TABLE logs(
    id          SERIAL PRIMARY KEY,
    timestamp   TIMESTAMP,
    status      INT,
    message     TEXT,
    level       TEXT,
    service     TEXT
);

CREATE TABLE error_logs(
    id          SERIAL PRIMARY KEY,
    timestamp   TIMESTAMP,
    status      INT,
    message     TEXT,
    level       TEXT,   -- Slightly unnecessary but makes it easier to represent both logs & error logs
    service     TEXT
);

CREATE TABLE error_counts(
    service     TEXT PRIMARY KEY,
    count       INT
);