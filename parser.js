/*const fs = require('fs'); //Filesystem    

//const url = fs.readFileSync("src/test.html","utf-8");
const cheerio = require('cheerio');
const request = require('request');

module.exports = function (){
    request('src/test.html', function (err, response, html) {
        if(err) 
            console.log(err)
        else{
            const $ = cheerio.load(hmtl)
            const result = $(".product-details").map((i, element) => ({
                currency: $(element).find('origin-destination-hour').text().trim()
            })).get()
            console.log($)
        }
    });
 };  
    
 */