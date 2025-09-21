const fs = require("fs");
const path = require("path");
const rootDir = require("../utilities/pathutil.js");

class Home {
  constructor(name, location, price, image) {
    this.name = name;
    this.location = location;
    this.price = price;
    this.image = image;
  }

  save(callback) {
    this.id=Math.random().toString();
    const filePath = path.join(rootDir, "data", "homedata.json");

    fs.readFile(filePath, "utf8", (err, data) => {
      let homes = [];

      if (!err && data.trim().length > 0) {
        try {
          homes = JSON.parse(data);
        } catch (parseErr) {
          console.error("Error parsing existing JSON data:", parseErr.message);
          // Optionally reset the file if data is corrupted
          homes = [];
        }
      }

      homes.push(this);

      fs.writeFile(filePath, JSON.stringify(homes, null, 2), (err) => {
        if (err) {
          console.error("Error writing to file", err);
        }
        if (callback) {
          callback();
        }
      });
    });
  }

  static fetchAll(callback) {
    const filePath = path.join(rootDir, "data", "homedata.json");

    fs.readFile(filePath, "utf8", (err, data) => {
      if (err) {
        console.error("Error reading file:", err.message);
        return callback([]);
      }

      try {
        const parsedData = data.trim().length > 0 ? JSON.parse(data) : [];
        callback(parsedData);
      } catch (parseErr) {
        console.error("Error parsing JSON:", parseErr.message);
        // Optionally reset the file if data is corrupted
        fs.writeFileSync(filePath, "[]");
        callback([]);
      }
    });
  }

  static findById=(homeid,callback)=>{
    this.fetchAll(homes=>{
      const homeFound=homes.find(home=> home.id===homeid);
      callback(homeFound);
    })
  }

} 



module.exports = Home;
