-- Create personal_access_tokens table if it doesn't exist
CREATE TABLE IF NOT EXISTS personal_access_tokens (
    id BIGSERIAL PRIMARY KEY,
    tokenable_type VARCHAR(255) NOT NULL,
    tokenable_id BIGINT NOT NULL,
    name VARCHAR(255) NOT NULL,
    token VARCHAR(64) NOT NULL,
    abilities TEXT NULL,
    last_used_at TIMESTAMP(0) NULL,
    expires_at TIMESTAMP(0) NULL,
    created_at TIMESTAMP(0) NULL,
    updated_at TIMESTAMP(0) NULL
);

-- Create the unique index for the token
CREATE UNIQUE INDEX IF NOT EXISTS personal_access_tokens_token_unique ON personal_access_tokens (token);

-- Create the index for tokenable fields
CREATE INDEX IF NOT EXISTS personal_access_tokens_tokenable_type_tokenable_id_index ON personal_access_tokens (tokenable_type, tokenable_id);

-- Create users table if it doesn't exist
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'blogUser',
    image VARCHAR(255) NULL,
    age INTEGER NULL,
    sex VARCHAR(50) NULL,
    phoneNumber VARCHAR(255) NULL,
    status VARCHAR(50) NULL,
    address VARCHAR(255) NULL,
    city VARCHAR(255) NULL,
    state VARCHAR(255) NULL,
    country VARCHAR(255) NULL,
    created_at TIMESTAMP(0) NULL,
    updated_at TIMESTAMP(0) NULL
);

-- Create unique index on email
CREATE UNIQUE INDEX IF NOT EXISTS users_email_unique ON users (email);

-- Create blogs table if it doesn't exist
CREATE TABLE IF NOT EXISTS blogs (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    user_id BIGINT NOT NULL,
    image VARCHAR(255) NULL,
    category VARCHAR(255) NULL,
    created_at TIMESTAMP(0) NULL,
    updated_at TIMESTAMP(0) NULL,
    CONSTRAINT blogs_user_id_foreign FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
); 