const {SHA256} = require('crypto-js');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// const message = 'I am user number 3';
// const hash = SHA256(message).toString();

// console.log(`Message: ${message}`);
// console.log(`Hash: ${hash}`);

// const data = {
// 	id: 4
// };
// const token = {
// 	data,
// 	hash: SHA256(JSON.stringify(data) + 'as!32f&*123d').toString()
// }

// token.data.id = 5;
// token.hash = SHA256(JSON.stringify(data)).toString()

// const resultHash = SHA256(JSON.stringify(token.data) + 'as!32f&*123d').toString();

// if (resultHash === token.hash) {
// 	console.log('Data was not changed');
// }
// else {
// 	console.log('Data was changed. Do not trust!')
// }
// -------------------------------------------------
// const data = {
// 	id: 10
// };

// const token = jwt.sign(data, '123abc');
// console.log(token);
// const decoded = jwt.verify(token, '123abc');
// console.log(decoded);
// 
const password = '123abc!';
// bcrypt.genSalt(10, (err, salt) => {
// 	bcrypt.hash(password, salt, (err, hash) => {
// 		console.log(hash);
// 	});
// })

const hashedPassword = '$2a$10$ytZ3fwMtVpb9HNvOcAYx5OyBrCaIDm9FrWs8/ZcO2ZZm85IlK3pqK';

bcrypt.compare(password, hashedPassword, (err, res) => {
	console.log(res);
});