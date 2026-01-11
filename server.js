const express = require("express");
const { exec } = require("child_process");
const app = express();

app.use(express.json());
app.use(express.static("public"));

app.post("/add", (req, res) => {
  const { id, type, arrival, priority } = req.body;

  exec(`traffic_simulation.exe add ${id} ${type} ${arrival} ${priority}`,
    (err, stdout) => {
      if (err) return res.send("C ERROR");
      res.send(stdout);
    }
  );
});

app.post("/remove", (req, res) => {
  exec(`traffic_simulation.exe remove`,
    (err, stdout) => res.send(stdout)
  );
});

app.get("/display", (req, res) => {
  exec(`traffic_simulation.exe display`,
    (err, stdout) => res.send(stdout)
  );
});

app.listen(3000, () => {
  console.log("Server running → http://localhost:3000");
});