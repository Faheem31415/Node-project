const fs=require('fs');
const path = require('path');
const rootDir = require('../utilities/pathutil.js');

const formdata = []; // Local fake DB

class Person {
    constructor(name, email) {
        this.name = name;
        this.email = email;
    }

    save() {
        formdata.push(this);
        const filePath = path.join(rootDir, 'data', 'persondata.json');
        fs.writeFile(filePath, JSON.stringify(formdata), (err) => {
            if (err) {
                console.error('Error writing to file', err);
            } else {
                console.log('Data saved successfully!');
            }
        });
    }

    static fetchAll() {
        const filePath = path.join(rootDir, 'data', 'persondata.json');
        fs.readFile(filePath, (err, data) => {
            if (err) {
                console.error('Error reading file', err);
                return [];
            }
            try {
                const parsedData = JSON.parse(data);
                formdata.push(parsedData); // Append to local array
            } catch (parseErr) {
                console.error('Error parsing JSON', parseErr);
            }
        });
        return formdata;
    }
}

module.exports = Person;
