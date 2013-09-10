module.exports = function(app) {

	var smtpTransport = require('nodemailer').createTransport("SMTP",{
	   service: "Zoho",
	   auth: {
	       user: "notifications@main.doob.io",
	       pass: "Carex615"
	   }
	});
	var mailOptions = {
		from: "notifications@main.doob.io", // sender address
		to: "amir@doob.io", // list of receivers
		subject: "Test Email", // Subject line
	   // text: "You got right? Thanks :)" // plaintext body
		// html: 
	};
	smtpTransport.sendMail(mailOptions, function(error, response){
	   if(error){
	       console.log(error);
	   }else{
	       console.log("Message sent: " + response.message);
	   }
	});
	
	var send = function(_from, _to, _email) {
		var mailOptions = {
		   from: "notifications@main.doob.io", // sender address
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