CREATE TABLE keys (
    id BIGSERIAL PRIMARY KEY,
    license_key TEXT UNIQUE,
    hwid TEXT,
    expires_at TIMESTAMP,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    license_key TEXT,
    hwid TEXT,
    ip_address TEXT,
    login_time TIMESTAMP DEFAULT NOW()
);
