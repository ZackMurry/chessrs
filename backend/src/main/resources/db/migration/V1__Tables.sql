CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS chessrs_user (
    id UUID NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
    username VARCHAR(20) NOT NULL,
    provider VARCHAR(32) NOT NULL,
    ease_factor FLOAT NOT NULL DEFAULT 3.0
);

CREATE TABLE IF NOT EXISTS move (
    id UUID NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL,
    FOREIGN KEY (user_id) REFERENCES chessrs_user(id) ON DELETE CASCADE,
    fen_before VARCHAR(90) NOT NULL UNIQUE, -- fen before move is played. can't just reference another move because of transpositions
    san VARCHAR(7) NOT NULL, -- Standard Algebraic Notation of the move
    uci CHAR(4) NOT NULL, -- UCI Notation of the move
    last_reviewed BIGINT NOT NULL, -- last reviewed using SRS
    time_created BIGINT NOT NULL,
    num_reviews INT NOT NULL DEFAULT 0,
    is_white BOOLEAN NOT NULL DEFAULT TRUE,
    due BIGINT NOT NULL, -- Time that the move is next due to review
    opening VARCHAR(256) NOT NULL
                                -- todo: add fen before without e.p. and 50 move rule indicators
);
