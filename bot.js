//bot.js 

var phys;
var ment;
var name;
var Botkit = require('botkit');
var res = {}
var x = ''
var promise = ''

	var controller = Botkit.slackbot({})

	var bot = controller.spawn({
	  token: 'xoxb-22354931845-XT1OSyOxeY46SKQ3FT0EpK8v'
	});

	// use RTM
	bot.startRTM(function(err,bot,payload) {
	  // handle errors...
	});


  // reply to @bot hello
  controller.on('bot_message',function(bot,message) {

    bot.api.channels.list({},function(err,response) {
      chat.postMessage()

    })

    bot.startConversation(message,function(err,convo) {
/*
      convo.ask('Describe your physical ailments (bruises, rashes, swelling, etc...):',function(response,convo) {
        
        phys = response.text;

        convo.next();

      });

      convo.ask('Describe your mental conditions (tiredness, dizziness, unnaturaley cold/hot):',function(response,convo) {

        ment = response.text;

        convo.next();

    	});
*/    bot.replyPrivateDelayed('/sk sk-anton-relin What is you?')
      convo.ask('/sk sk-anton-relin What is your name?',function(response,convo) {

        name = response.text;

        var baseUrl = "https://open-ic.epic.com/FHIR/api/FHIR/DSTU2/"
        var patientSearchString = "/Patient?given="+name+"&family=Ragsdale"



        var request = require('request');
        var himalaya = require('himalaya');
        //Lets configure and request
        //Lets try to make a HTTP GET request to modulus.io's website.
        request(baseUrl + patientSearchString, function (error, response, body) {
          if (!error && response.statusCode == 200) {
            promise = himalaya.parse(body);
            //patient = promise.entry[0].resource
            //console.dir(promise, {colors: true, depth: null});
            convo.next();
            x = (promise[0].children[5].children[4].children[0].children[0].attributes.value)
            convo.ask('/sk Is your birthdate ' + x + '?' ,function(response,convo) {
              name = response.text;
              convo.next();
            });
            convo.say('/sk Thank you for your responses. We will return your diagnosis shortly.')
            convo.next();
          }
        });
      });
    });
  
  })


