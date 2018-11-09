
const moment = require('moment');
// on utilise moment en francais
moment.locale('fr');

const cheerio = require('cheerio');
const fs = require('fs');
let html = fs.readFileSync('src/test.html',  "utf8");
//on repare les nom de class
html = html.replace(new RegExp('\\\\\&quot;', 'g'), '');
//on va l'utilise pour convertir les prix en des nombres
let priceFilter = (str) => {
	str = str.replace(',', '.');
	str = str.substring(0, str.length - 1);
	return +str.trim();
}

let $ = cheerio.load(html);
//on recupere le code en utilise CSS selector
let code = $('tbody > tr > td > table > tbody > tr > td.pnr-ref > span').text().trim();
//on recupere le nom en utilise CSS selector
let name = $('tbody > tr > td > table > tbody > tr > td.pnr-name > span').text().trim();
//on recupere le prix en utilise CSS selector
let price = priceFilter($('tbody > tr > td > table > tbody > tr > td.very-important').text().trim());
let roundTrips = [];

//on recupere les dates du roundtrips
$('tbody > tr > td > table > tbody > tr > td.product-travel-date').each((i, elem) => {
  roundTrips.push({date: moment(elem.children[0].data.trim()), trains: []});
});
//on recupere les types
$('tbody > tr > td > table > tbody > tr > td.travel-way').each((i, elem) => {
  roundTrips[i].type = elem.children[0].data.trim();
});
//on recupere le temps de depart du train
$('tbody > tr > td > table > tbody > tr > td.origin-destination-hour').each((i, elem) => {
  roundTrips[i].trains.push({departureTime: elem.children[0].data.trim()});
});
//on recupere la station de depart du train
$('tbody > tr > td > table > tbody > tr > td.origin-destination-station').each((i, elem) => {
  roundTrips[i].trains[0].departureStation = elem.children[0].data.trim();
});
//on recupere le type et le number du voyage, le probleme ici c'est qu'on peux pas identifier les 2 separamenet
//alors on prends toujours le type puis le number
let typeMode = true;
let index = 0;
let skipMode = false;
$('tbody > tr > td > table > tbody > tr > td.segment').each((i, elem) => {
	if(skipMode){
		skipMode = false;
		return;
	}
	if(typeMode){
  		roundTrips[index].trains[0].type = elem.children[0].data.trim();
	}else{
		roundTrips[index].trains[0].number = elem.children[0].data.trim();
		index++;
		skipMode = true;
	}
  	typeMode = !typeMode;
});
let timeMode = true;
index = 0;
//on recupere le temp d'arrive du voyage et la station d'arriver, le probleme est le meme ici c'est qu'on peux pas identifier les 2 separamenet
//alors on prends toujours le temps puis la station

$('tbody > tr > td > table > tbody > tr > td.origin-destination-border').each((i, elem) => {
	if(timeMode){
  		roundTrips[index].trains[0].arrivalTime = elem.children[0].data.trim();
	}else{
		roundTrips[index].trains[0].arrivalStation = elem.children[0].data.trim();
		index++;
	}
  	timeMode = !timeMode;
});
//on recupere les prix

let prices = [];
$('.product-header td:last-child').each((i, elem) => {
	prices.push({value: priceFilter(elem.children[0].data.trim())});
});
let json = {
	status: "ok",
	result: {
			trips: [
				{
					code: code,
					name: name,
					details: {
						price: price,
						roundTrips: roundTrips
					}
				}
			],
			custom: {
				prices: prices
			}
		}
};
fs.writeFile('src/test-result.json', JSON.stringify(json), function (err) {
  if (err) return console.log(err);
});