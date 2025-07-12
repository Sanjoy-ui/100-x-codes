/* 
1. Use the inquirer npm package to get user input.
2. Use the qr-image npm package to turn the user entered URL into a QR code image.
3. Create a txt file to save the user input using the native fs node module.
*/

import inquirer from 'inquirer';
import qr from 'qr-image';
import fs from "fs";
// inquirer.prompt([

// ]).then((answer) => {
//     //use feedback
// }).catch((error) =>{
//     if(error.isTryError){

//     } else{

//     }
// }); 

// // var qr = require('qr-image')



// var qr_svg = qr.image('i love qr!', {type :'svg'});

// qr_svg.pipe(require('fs').createWriteStream('i_love_qr.svg'))

// var svg_string= qr.imageSync('I love qr!', {type : 'svg'})

inquirer
  .prompt([
   [{
    message: "Type your url",
    name : "url",
   },]
  ])
  .then((answers) => {
    const url = answers.url;
    var qr_svg = qr.image(url);
qr_svg.pipe(fs.createWriteStream('i_love_qr.svg'));
  })
  .catch((error) => {
    if (error.isTtyError) {
      // Prompt couldn't be rendered in the current environment
    } else {
      // Something else went wrong
    }
  });