import { Hono } from "hono";
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

function convertCsvToJson(csvFilePath: string): Promise<Organization> {
    const departments: { [key: string]: Department } = {};

    return new Promise((resolve, reject) => {
        const readStream = fs.createReadStream(csvFilePath);

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
        "This is the \n\n1) type in /organization_chart to see the organization chart\n2)type in /me to get information in a json file about me!"
    )
});

app.get("/organization-chart", async (ctx) => {
    const csvFilePath = 'general_data.csv'; // Adjust the path as needed

    try {
        const organizationData = await convertCsvToJson(csvFilePath); // Await the function call
        console.log(organizationData);

    } catch (error) {
        console.error('Error:', error);
        return ctx.text('Error occurred while processing the organization chart data.');
    }
});

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