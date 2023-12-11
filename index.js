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

app.use(cors());
app.use(bodyParser.json());

const db = pgp(pg_url);

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

app.listen(port, () => {
    console.log(`Server is listening on port ${port}`)
});


