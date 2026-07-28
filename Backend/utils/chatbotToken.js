const crypto = require('crypto');

const generateToken = function() {
    const fixedPart = 'A1ED-';
    
    const randomPart1 = crypto.randomBytes(4).toString('hex').toUpperCase().slice(0, 8);
    const randomPart2 = crypto.randomBytes(4).toString('hex').toUpperCase().slice(0, 8);
    
    const token = `${fixedPart}${randomPart1}-${randomPart2}`;
    
    return token;
};


module.exports = { generateToken };
