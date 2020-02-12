//use path module
const path = require('path');   //
//use express module
const express = require('express');
//use hbs view engine
const hbs = require('hbs');
//use bodyParser middleware
const bodyParser = require('body-parser');
//use mysql database
const mysql = require('mysql');
const app = express();

//Create connection
const conn = mysql.createConnection({
  host: '127.0.0.1',
  user: 'root',
  port: '3307',
  password: 'dhanur123',
  insecureAuth : true,
  database: 'crosschargeportal'
});
 
//connect to database
conn.connect((err) =>{
  if(err) throw err;
  console.log('Mysql Connected...');
});

//set view engine
app.set('view engine', 'hbs');
//set views file
app.set('views',path.join(__dirname,'views'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
//set public folder as static folder for static file
app.use('/assets',express.static(__dirname + '/public'));
 
//route for homepage
app.get('/',(req, res) => {
  let sql = "SELECT * FROM viewrequests";
  let query = conn.query(sql, (err, results) => {
    if(err) throw err;
    res.render('admin_view.hbs',{
      results: results

    });
    //console.log(results);
  });
});

//global variable to initialise startdate and enddate
let startDate = '01/01/1972';
let endDate = '12/12/2100';

 
//route for insert data
app.post('/save',(req, res) => {
  let data = {transaction_id: req.body.transaction_id,
              bot_id: req.body.bot_id,
              bill_from_cost_center : "A956007643",
              bill_from_gl_account : "41105001",
              bill_from_company_code : "5069",
              bill_from_country_code : "UK Ltd",
              bill_from_contact_name : "Vivek Sharma",
              bill_from_department : "RPA",
              bill_from_location : "Bangalore",
              bill_to_cost_center: req.body.bill_to_cost_center, 
              bill_to_gl_account: req.body.bill_to_gl_account, 
              bill_to_company_code: req.body.bill_to_company_code,
              bill_to_country_code: req.body.bill_to_country_code,
              bill_to_currency: req.body.bill_to_currency,
              bill_to_amount: req.body.bill_to_amount,
              bill_to_approver_name: req.body.bill_to_approver_name,
              process_name: req.body.process_name,
              ul_el_name: req.body.ul_el_name,
              ul_el_email_id: req.body.ul_el_email_id,
              area: req.body.area,
              cost_type: req.body.selectPicker,
              request_type: req.body.selectPicker2,
              bmc_request: req.body.bmc_request,
              stat: req.body.stat,
              //date_time: req.body.date_time
            };
            
  let sql = "INSERT INTO viewrequests SET ?";
  let query = conn.query(sql, data,(err, results) => {
    if(err) throw err;
    res.redirect('/');
  });
  
});
 
//route for update data
app.post('/update',(req, res) => {
  let sql = "UPDATE viewrequests SET bot_id='"+req.body.bot_id+"', bill_to_cost_center='"+req.body.bill_to_cost_center+"', bill_to_gl_account='"+req.body.bill_to_gl_account+"', bill_to_company_code='"+req.body.bill_to_company_code+"', bill_to_country_code='"+req.body.bill_to_country_code+"', bill_to_currency='"+req.body.bill_to_currency+"', bill_to_amount='"+req.body.bill_to_amount+"', bill_to_approver_name='"+req.body.bill_to_approver_name+"', process_name='"+req.body.process_name+"', ul_el_name='"+req.body.ul_el_name+"', ul_el_email_id='"+req.body.ul_el_email_id+"', area='"+req.body.area+"', cost_type='"+req.body.selectPicker+"', request_type = '"+req.body.selectPicker2+"', bmc_request = '"+req.body.bmc+"'  WHERE bot_id="+req.body.bot_id; //doubt
  let query = conn.query(sql, (err, results) => {
    console.log('hello');
    console.log(sql);
    if(err) throw err;
    //res.send(req.body);
    res.redirect('/');
  });
});
 
//route for delete data
app.post('/delete',(req, res) => {
  let sql = "DELETE FROM viewrequests WHERE transaction_id="+req.body.transaction_id+"";
  let query = conn.query(sql, (err, results) => {
    if(err) throw err;
      res.redirect('/');
  });
});

//Route for filtering data
app.post('/filter', (req, res)=>{
  startDate = req.body.StartDate ? req.body.StartDate : startDate;
  endDate = req.body.EndDate ? req.body.EndDate : endDate;
  console.log(startDate, endDate);
  let Smon = startDate.slice(0,2);
  let Sday = startDate.slice(3,5);
  let Syear = startDate.slice(6,10);

  startDate = Syear+"-"+Smon+"-"+Sday;

  let emon = endDate.slice(0,2);
  let eday = endDate.slice(3,5);
  let eyear = endDate.slice(6,10);

  endDate = eyear+"-"+emon+"-"+eday;

  let sql = "SELECT * FROM viewrequests where date_time >= '"+startDate+"' and date_time <= '"+endDate+"'";
  
  let query = conn.query(sql, (err, results) => {
    if(err) throw err;
    res.render('admin_view.hbs',{
      results: results
    });
    //console.log(results);
  });
});

//route to export data as excel
app.post('/export',(req, res) => {
  if(startDate.indexOf('/') >= 1 && startDate.indexOf('-') < 0){
    let Smon = startDate.slice(0,2);
    let Sday = startDate.slice(3,5);
    let Syear = startDate.slice(6,10);

    startDate = Syear+"-"+Smon+"-"+Sday;

    let emon = endDate.slice(0,2);
    let eday = endDate.slice(3,5);
    let eyear = endDate.slice(6,10);

    endDate = eyear+"-"+emon+"-"+eday;
  }
  console.log("Here: ",startDate, endDate);
  let today = new Date();
  let filename = "file" + today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate()+"_"+today.getHours() + "_" + today.getMinutes() + "_" + today.getSeconds()+".csv";
  let exp = `SELECT 
  'transaction_id',
  'bot_id',
  'bill_from_cost_center', 
  'bill_from_gl_account', 
  'bill_from_company_code',
  'bill_from_country_code',
  'bill_from_contact_name',
  'bill_from_department',
  'bill_from_location',
  'bill_to_cost_center',
  'bill_to_gl_account',
  'bill_to_company_code',
  'bill_to_country_code',
  'bill_to_currency',
  'bill_to_amount',
  'bill_to_approver_name',
  'process_name',
  'ul_el_name',
  'ul_el_email_id',
  'area',
  'cost_type',
  'request_type',
  'bmc_request',
  'stat',
  'date_time'
  UNION ALL
  SELECT *
  from viewrequests where date_time>='${startDate}' and date_time<='${endDate}' into outfile 'C:/ProgramData/MySQL/MySQL Server 8.0/Uploads/${filename}' 
  FIELDS TERMINATED BY ',' ENCLOSED BY '"' LINES TERMINATED BY '\n'`;
  let query = conn.query(exp, (err, results) => {
    if (err) throw err;
    res.redirect('/');
  });
});

//server listening
app.listen(8000, () => {
  console.log('Server is running at port 8000');
});

// //Azure blob storage
// const { BlobServiceClient } = require('@azure/storage-blob');
// const uuidv1 = require('uuid/v1');

// async function main() {
//     const AZURE_STORAGE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING;

//     console.log('Azure Blob storage v12 - JavaScript quickstart sample');
//     // Quick start code goes here
//     // Create the BlobServiceClient object which will be used to create a container client
//     const blobServiceClient = await BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);

//     // Create a unique name for the container
//     const containerName = 'uploader' + uuidv1();

//     console.log('\nCreating container...');
//     console.log('\t', containerName);

//     // Get a reference to a container
//     const containerClient = await blobServiceClient.getContainerClient(containerName);

//     // Create the container
//     const createContainerResponse = await containerClient.create();
//     console.log("Container was created successfully. requestId: ", createContainerResponse.requestId);

//     // Create a unique name for the blob
//     const blobName = 'uploader' + uuidv1() + '.txt';

//     // Get a block blob client
//     const blockBlobClient = containerClient.getBlockBlobClient(blobName);

//     console.log('\nUploading to Azure storage as blob:\n\t', blobName);

//     // Upload data to the blob
//     const data = 'Hello, World!';
//     const uploadBlobResponse = await blockBlobClient.upload(data, data.length);
//     console.log("Blob was uploaded successfully. requestId: ", uploadBlobResponse.requestId);

//     console.log('\nListing blobs...');

//     // List the blob(s) in the container.
//     for await (const blob of containerClient.listBlobsFlat()) {
//         console.log('\t', blob.name);
//     }

//     // Get blob content from position 0 to the end
//     // In Node.js, get downloaded data by accessing downloadBlockBlobResponse.readableStreamBody
//     // In browsers, get downloaded data by accessing downloadBlockBlobResponse.blobBody
//     const downloadBlockBlobResponse = await blockBlobClient.download(0);
//     console.log('\nDownloaded blob content...');
//     console.log('\t', await streamToString(downloadBlockBlobResponse.readableStreamBody));

//     console.log('\nDeleting container...');

//     // Delete container
//     const deleteContainerResponse = await containerClient.delete();
//     console.log("Container was deleted successfully. requestId: ", deleteContainerResponse.requestId);
// }

// async function streamToString(readableStream) {
//   return new Promise((resolve, reject) => {
//     const chunks = [];
//     readableStream.on("data", (data) => {
//       chunks.push(data.toString());
//     });
//     readableStream.on("end", () => {
//       resolve(chunks.join(""));
//     });
//     readableStream.on("error", reject);
//   });
// }

// main().then(() => console.log('Done')).catch((ex) => console.log(ex.message));