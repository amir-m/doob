module.exports = function(app) {

/**
* invites modules!
*/

	var smtpTransport = require('nodemailer').createTransport("SMTP",{
	   service: "Zoho",
	   auth: {
	       user: "notifications@mail.doob.io",
	       pass: "Carex615"
	   }
	});
	var mailOptions = {
		from: "notifications@mail.doob.io", // sender address
		to: "amir@doob.io", // list of receivers
		subject: "Test Email" // Subject line
		// html: 
	};
	// smtpTransport.sendMail(mailOptions, function(error, response){
	//    if(error){
	//        console.log(error);
	//    }else{
	//        console.log("Message sent: " + response.message);
	//    }
	// });

	app.render('sendinvite', {from: 'Amir', to: 'Friend'}, function(error, html){
		mailOptions['html'] = html;
		// smtpTransport.sendMail(mailOptions, function(error, response){
		//    if(error){
		//        console.log(error);
		//    }else{
		//        console.log("Message sent: " + response.message);
		//    }
		// });
	console.log(html)
	});
	
	var send = function(_from, _to, _email) {
		var mailOptions = {
		   from: "notifications@mail.doob.io", // sender address
		   to: "amir@doob.io", // _email
		   subject: _from + " Invited You To Create Music Together!", // Subject line
		};	

		app.render('sendinvite', {from: _from, to: _to}, function(error, html){
			console.log(html);
		})

		// smtpTransport.sendMail(mailOptions, function(error, response){
		//    if(error){
		//        console.log(error);
		//    }else{
		//        console.log("Message sent: " + response.message);
		//    }
		// });
	}

	return {
		send: send
	}
}