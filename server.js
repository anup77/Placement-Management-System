// ACCQUIRING THE MODULES TO BE USED IN THE PROJECT

const express = require("express");
const mysql = require("mysql");
const ejs = require("ejs");
const app = express();
const bodyParser = require("body-parser");
const cors=require('cors');
const session = require('express-session');
var username="";
var temp=[];
var t=[];
var r=[];
var dept=[];


app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.set('view engine', 'ejs');


app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));

// CONNECTING THE DATABASE TO THE BACKEND (NODE JS)

var connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "mysql123",
    database: "sjce_placement",
    port: "3306"
})
app.use(cors());

// CONFIRMATION ON SUCCESSFULL CONNECTION OF THE DATABASE

connection.connect((err) => {
    if(err){
        throw err;
    }
    else{
        console.log("Connected!");
    }
})

// CONNECTING THE FRONTEND (WABPAGES IN ejs FORM) TO THE BACKEND

app.get("/", function(req,res){
    res.render("Login");
  });
app.get("/register", function(req,res){
    res.render("Registeration");
  });
app.get("/help", function(req,res){
  res.render("help");
});
app.get("/dlogin", function(req,res){
  res.render("dlogin");
});

 
app.post("/register",function(req,res){
    const name=req.body.fname;
    const usn=req.body.usn;
    var email=req.body.username;
    const spassword=req.body.password;
    const cpassword=req.body.cpassword;
    connection.query('SELECT Email_Address FROM student WHERE Email_Address=?',[email],(err,results,fields) => {
      r=results;
      if(err) throw err;
      //res.send(r);
      if(r.length===0){
        res.send('INVALID EMAIL ID');
      }  
      else{
        connection.query('INSERT into registration(fname,usn,username,password,cpassword)VALUES("'+name+'","'+usn+'","'+email+'","'+spassword+'","'+cpassword+'")');
        res.redirect('/');
  
      }
    });
});  


      

// app.get("/design",function(req,res){
//   connection.query("SELECT * FROM registration",(err,results,fields) => {
//     if(err) throw err;
//     //res.send(results);
//     res.render("design",{items:results});
//   });
// });

app.get("/home",function(req,res){
  connection.query("SELECT company.c_name,company.tier,company.test_date FROM student JOIN company WHERE student.CGPA_of_all_4_semesters>=company.cutoff AND student.Email_Address=? ",[username],(err,results,fields) => {
   
    temp=results;
    if(err) throw err;
    //res.send(results);
    res.render("home",{items:results});

  });
});


app.get("/department",function(req,res){
  connection.query("SELECT Full_name,USN,username,c_name FROM department",(err,results,fields) => {
    dept=results;
    if(err) throw err;
    //res.send(results);
    res.render("department",{items:results});

  });
  connection.query('INSERT INTO department SELECT student.Full_Name,student.USN,placement_admin.username,placement_admin.c_name,placement_admin.result_status FROM student JOIN placement_admin WHERE student.Email_Address=placement_admin.username AND placement_admin.result_status="SELECTED"');
   connection.query('UPDATE placement_admin SET result_status=" SELECTED" WHERE result_status="SELECTED"');
});
 

app.get("/details",function(req,res){
  connection.query('Delete FROM placement_admin WHERE id IN (SELECT id from (SELECT *,COUNT(*) as duplicate FROM placement_admin group by username,c_name,test_date having duplicate >1) as temp);');

  connection.query('SELECT c_name,test_date,result_status FROM placement_admin WHERE username=? ',[username],(err,results,fields) => {

    t=results;
    if(err) throw err;
    //res.send(results);
    res.render("details",{items:results});
  });

   connection.query('INSERT INTO department SELECT student.Full_Name,student.USN,placement_admin.username,placement_admin.c_name,placement_admin.result_status FROM student JOIN placement_admin WHERE student.Email_Address=placement_admin.username AND placement_admin.result_status="SELECTED"');
   connection.query('UPDATE placement_admin SET result_status=" SELECTED" WHERE result_status="SELECTED"');
});



app.post("/home",function(req,res){
  const x=req.body.company;
  const y=x.indexOf(",");
  const company_name=x.slice(0,y);
  const company_date=x.slice(y+1,);
  connection.query('INSERT into placement_admin(username,c_name,test_date)VALUES("'+username+'","'+company_name+'","'+company_date+'")');

});


app.post('/', function(request, response) {
	 username = request.body.username;
	var password = request.body.password;
	if (username && password) {
		connection.query('SELECT * FROM registration WHERE username = ? AND password = ?', [username, password], function(error, results, fields) {
			if (results.length > 0) {
				request.session.loggedin = true;
				request.session.username = username;
      
				response.redirect('/home');
        
			} else {
				response.send('Incorrect Username and/or Password!');
			}			
			response.end();
		});
	} 
  else {
		response.send('Please enter Username and Password!');
		response.end();
	}
});


app.post('/dlogin', function(sReq, sRes) {
  var username = sReq.body.dname;
  var password = sReq.body.dpassword;

  if (username=='ISE2019' && password == 'ise2023') {
    sRes.redirect('/department');

  } else { 
         sRes.send("INVALID USERNAME OR PASSWORD!");
}
});


// HOSTING THE PROJECT ON PORT 5000 FOR EASY ACCESS.

const port = process.env.PORT || 5000;
app.listen(port);

console.log("App is listening on port "+ port);
