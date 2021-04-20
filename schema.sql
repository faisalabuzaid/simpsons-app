DROP TABLE IF EXISTS quotes;
CREATE TABLE quotes (id SERIAL PRIMARY KEY, character VARCHAR(255),quote text, image text, direction VARCHAR(255));