import express from "express";
import bodyParser from "body-parser";
import postgres from "pg-promise";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();
const port = process.env.PORT;
const pg_url = process.env.DB_URL;
const app = express();
const pgp = postgres();

app.use(cors(
    {
        origin: "https://employeeform-l0ua.onrender.com",
    }
));
app.use(bodyParser.json());

const db = pgp(pg_url);

const createEmployeeTableScript = `
CREATE TABLE IF NOT EXISTS employee (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    dob DATE NOT NULL,
    age INT NOT NULL,
    address VARCHAR(255) NOT NULL,
    state VARCHAR(255) NOT NULL,
    department VARCHAR(255) NOT NULL,
    designation VARCHAR(255) NOT NULL,
    join_date DATE NOT NULL,
    experience INT NOT NULL,
    salary DECIMAL(10, 2) NOT NULL,
    phone_no VARCHAR(20) NOT NULL
);
`;

const calculateAge = (dob) => {
    const today = new Date();
    const Dob = new Date(dob);
    let age = today.getFullYear() - Dob.getFullYear();
    const monthDiff = today.getMonth() - Dob.getMonth();

    if(monthDiff < 0 || (monthDiff === 0) && today.getDate() < Dob.getDate())
        age--;
    return age;
}

const calculateExperience = (doj) => {
    const today = new Date();
    const Doj = new Date(doj);
    let exp = today.getFullYear() - Doj.getFullYear();
    const monthDiff = today.getMonth() - Doj.getMonth();

    if(monthDiff < 0 || (monthDiff === 0) && today.getDate() < Doj.getDate())
        exp--;
    return exp;
}

app.get("/",(req,res) => {
    res.setHeader('Access-Control-Allow-Credentials' ,"true");
    res.send("Backend is working...");
});
    
app.get('/employees', async (req, res) => {
    try {
        const result = await db.any('SELECT * FROM employee');
        res.json(result);
    }catch(error){
        console.error("Error executing query", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
})


app.post('/',async(req,res) => {
    const formData = req.body;
    const age = calculateAge(formData.dob);
    const experience = calculateExperience(formData.joinDate);
    const fullAddress = formData.address2 ? `${formData.address1}, ${formData.address2}` : formData.address1;
    try{
        await db.none('INSERT INTO employee VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)',[
            formData.id,
            formData.name,
            formData.email,
            formData.dob,
            age,
            fullAddress,
            formData.state,
            formData.dept,
            formData.designation,
            formData.joinDate,
            experience,
            formData.salary,
            formData.phno
        ]);
        res.status(200).json({ message: "Data Inserted Successfully" });
    }catch(error){
        console.error("Error Inserting data",error);
        res.status(500).json({ message: "Internal Server Error" });
    }
})

db.none(createEmployeeTableScript)
  .then(() => {
    console.log('Employee table created successfully');
    app.listen(port, () => {
      console.log(`Server is running at http://localhost:${port}`);
    });
  })
  .catch((error) => {
    console.error('Error creating employee table', error);
  });


