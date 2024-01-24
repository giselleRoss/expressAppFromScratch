DROP TABLE IF EXISTS owners; 
DROP TABLE IF EXISTS cars;

CREATE TABLE owners(
    id SERIAL PRIMARY KEY,
    name TEXT,
    job TEXT,
    age INTEGER
);
CREATE TABLE cars(
    id SERIAL PRIMARY KEY,
    make TEXT,
    model TEXT,
    year INT,
    owners_id INT NOT NULL REFERENCES owners (id)
);