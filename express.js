import express from "express";
import pg from "pg";

const port = 3000;
const app = express();
app.use(express.json());

const pool = new pg.Pool({
  host: "localhost",
  port: 6432,
  user: "postgres",
  password: process.env.password,
  database: "carshop",
});

//getting all from cars
app.get("/cars", (req, res, next) => {
  pool
    .query(`SELECT * FROM cars`)
    .then((data) => {
      console.log("All cars: \n", data.rows);
      res.json(data.rows);
    })
    .catch((err) => {
      next(err);
    });
});
//getting all from owners
app.get("/owners", (req, res, next) => {
  pool
    .query(`SELECT * FROM owners`)
    .then((data) => {
      console.log("All cars: \n", data.rows);
      res.json(data.rows);
    })
    .catch((err) => {
      next(err);
    });
});
//getting all from id
app.get("/cars/:id", (req, res, next) => {
  const carId = Number.parseInt(req.params.id);
  console.log("Using car ID:", carId);

  pool
    .query(`SELECT make, model, year FROM cars WHERE id = $1`, [carId])
    .then((data) => {
      console.log("All cars: \n", data.rows);
      res.json(data.rows);
    })
    .catch((err) => {
      next(err);
    });
});

// add new car to DB
app.post("/cars", (req, res, next) => {
  const { make, model } = req.body;
  const year = Number.parseInt(req.body.year);
  console.log(`Make: ${make}, Model: ${model}, Year: ${year}`);
  if (!make || !model || !Number.isNaN(year)) {
    res.sendStatus(400);
    return;
  }
  pool
    .query(
      `INSERT INTO cars (make, model, year) VALUES ($1, $2, $3) RETURNING *`,
      [make, model, year]
    )
    .then((data) => {
      const newCar = data.rows[0];
      console.log("New car added: \n", newCar);
      delete newCar.id;
      res.json(newCar);
    })
    .catch((err) => {
      next(err);
    });
});

//update cars
app.patch("/cars/:carId", (req, res, next) => {
  const id = Number.parseInt(req.params.carId);
  console.log("Using car ID:", id);
  const make = req.body.make;
  const model = req.body.model;
  const year = req.body.year !== undefined ? Number(req.body.year) : null;
  console.log(model);
  if (id.isNaN) {
    res.sendStatus(400);
    return;
  }
  pool
    .query(
      `UPDATE cars SET 
            make = COALESCE($1, make),
            model = COALESCE($2, model),
            year = COALESCE($3, year) 
        WHERE id = $4 RETURNING *`, 
        [make, model, year, id])
    .then((data) => {
      if (data.rows.length == 0) {
        res.sendStatus(404);
        return;
      }
      console.log("Car updated:", (make, model, year));
      res.json(data.rows[0]);
    })
    .catch((err) => {
      next(err);
    });
});

app.delete("/cars/:carId", (req, res, next) => {
  const id = Number.parseInt(req.params.carId);
  console.log("Using car ID:", id);

  pool
    .query(`DELETE FROM cars WHERE id = $1 RETURNING*`, [id])
    .then((results) => {
      if (results.rows.length == 0) {
        console.log("No cars found with that ID");
        res.sendStatus(404);
        return;
      }
      console.log("Deleted: ", results.rows[0])
      res.send(results.rows[0]);
    })
    .catch((err) => {
      next(err);
    });
})

app.use((err, req, res, next) => {
  console.error(err);
  res.sendStatus(500);
});

app.listen(port, () => {
  console.log(`listening on port ${port}`);
});
