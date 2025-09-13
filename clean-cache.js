const fs = require('fs');
const path = require('path');

const cleanCache = () => {
  const cacheDirs = ['.next', 'node_modules/.cache'];
  
  cacheDirs.forEach(dir => {
    if (fs.existsSync(dir)) {
      console.log(`Cleaning ${dir}...`);
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });
  
  console.log('Cache cleaned successfully!');
};

cleanCache();
