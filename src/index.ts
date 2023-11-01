import { Hono } from 'hono';
const app = new Hono();
import * as fs from 'fs';
import csvParser from 'csv-parser';

interface Employee {
    name: string;
    department: string;
    salary: number;
    office: string;
    isManager: boolean;
    skills: string[];
}

interface Department {
    name: string;
    managerName: string;
    employees: Employee[];
}

interface Organization {
    departments: Department[];
}

function csvToJson(csvData: string): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const jsonArray: any[] = [];
  
      const lines = csvData.split('\n');
      const headers = lines[0].split(',').map(header => header.trim());
  
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',');
        const entry: any = {};
  
        for (let j = 0; j < headers.length; j++) {
          entry[headers[j]] = values[j].trim();
        }
  
        jsonArray.push(entry);
      } 
      resolve(jsonArray);
    });
  }

//function convertCsvToJson(csvFilePath: string): Promise<Organization> {
function convertCsvToJson(csvFilePath: string): Promise<Organization> {
        
    const departments: { [key: string]: Department } = {};

    return new Promise((resolve, reject) => {
        const readStream = fs.createReadStream(csvFilePath);
        //return "Inside csvtojson function..next step - "+csvFilePath;
        readStream
            .pipe(csvParser())
            .on('data', (row) => {
                const employee: Employee = {
                    name: row.name,
                    department: row.department,
                    salary: parseFloat(row.salary),
                    office: row.office,
                    isManager: row.isManager.toLowerCase() === 'true',
                    skills: [row.skill1, row.skill2, row.skill3].filter(Boolean)
                };

                if (!departments[row.department]) {
                    departments[row.department] = {
                        name: row.department,
                        managerName: '',
                        employees: []
                    };
                }

                if (employee.isManager) {
                    departments[row.department].managerName = employee.name;
                }

                departments[row.department].employees.push(employee);
            })
            .on('end', () => {
                const organization: Organization = {
                    departments: Object.values(departments)
                };
                resolve(organization);
            })
            .on('error', (error) => {
                reject(error);
            });

        readStream.on('error', (error) => {
            reject(error);
        });
    });
}

app.get("/", (ctx) => {
    return ctx.text(
        //creating a table of contents
        "This is the \n\n1) type in /orgchart to see the organization chart\n2)type in /me to get information in a json file about me!"
    )
});

app.get("/orgchart", async (ctx) => {

    // Include the entire CSV data here
    const csvData = `name,department,salary,office,isManager,skill1,skill2,skill3\nJohn,CDN,80,Lisbon,FALSE,Caching,C++,AI\nIbrahim Gould,Bots,262,Austin,FALSE,HTML,Performance,GoLang\nVioleta Cortes,Developer Platform,98,Austin,FALSE,Caching,C++,AI\nBanks Fitzpatrick,CDN,250,Singapore,FALSE,Typescript,Rust,GoLang\nAnnabella Velasquez,Accounting,172,San Francisco,FALSE,HTML,Performance,Postgres`; 
    
    //const jsonArray = csvToJson(csvData);
    //const jsonString = JSON.stringify(jsonArray);
    //console.log(jsonString); 

    //return ctx.text(jsonString);

    csvToJson(csvData)
      .then((jsonArray) => {
        console.log(jsonArray);
        const jsonString = JSON.stringify(jsonArray);
        console.log(jsonString);     
      })
      .catch((error) => {
        return ctx.text('ERROR organization chart data.'+error);        
      });

      return ctx.text(' ! !   S U C C E S S   ! ! ');

      /* OLD CODE
      const fs = require('fs');
      const csvFilePath = 'a.csv'; // Adjust the path as needed
  
      try {      
          
          const organizationData = await convertCsvToJson(csvFilePath); // Await the function call
          const s = await convertCsvToJson(csvFilePath);
          console.log(organizationData);
  
      } catch (error) {
          console.error('Error:', error);
          return ctx.text('Error occurred while processing the organization chart data.'+error);
  
        */

    }
);

app.get("/me", (ctx) => {
    return ctx.text(
        "this is a cloudfare test"
    );
});

export default app;


// import {Hono} from "hono";
// const app = new Hono();
// import * as fs from 'fs';
// import csvParser from 'csv-parser';


// app.get("/", (ctx) => {
//     return ctx.text(
//         //creating a table of contents
//         "This is the cloudfare general assessment\n\n1) type in /organization_chart to see the organization chart\n2)type in /me to get information in a json file about me!"
//     )
// })

// app.get("/organization_chart", (ctx) => {
//     //insert the json value here
//     return ctx.text("");
// })
// app.get("/me", (ctx) => {
//     return ctx.text(
//         "this is a cloudfare test"
//     )
// })
// export default app