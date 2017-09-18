const User = require('./../models/user');

const authenticate = (req, res, next) => {
	const token = req.header('x-auth');

	User.findByToken(token)
		.then((user) => {
			if (!user) {
				res.status(400).send('User not found');
			}

			req.user = user;
			req.token = token;
			next();
		})
		.catch((err) => res.status(401).send(err))
}

module.exports = authenticate;
