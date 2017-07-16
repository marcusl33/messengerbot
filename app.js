'use strict'
const http = require('http')
const Bot = require('messenger-bot')
var express = require('express');
var app = express();

var fs = require('fs'),
    request = require('request');

app.get('/', (req, res) => {
    deleteBillDynamo("testUserId", function(data){
        res.send(data);
    });
});

let bot = new Bot({
  token: 'EAAUvNzGGhXkBADTjO1a7cIDEg17OUpCJw3mjCaM7xAP1ShiUQriZBFTvf40JVRrqMrj6WmyFAkTdTKag7jHFSo3tUTcyTMcnfqg24tkY8LH58Y4twCHQZBtioX49QnNkmiOvrp3zBxnQXnoZAyUP8kDdjOJZBSmdU8ZBoxdQTegZDZD',
  verify: 'VERIFY_TOKEN'
})

bot.on('error', (err) => {
  console.log(err.message)
})

bot.on('message', (payload, reply) => {
  var sender = payload['sender']['id']
  console.log(sender)
  if ('attachments' in payload.message) {
    if (payload.message['attachments'][0]['type'] == 'image') {
      var attachment = payload.message.attachments
      let text = attachment[0]['payload']['url'] 

      //send api call to other service with sender and url
      

      bot.getProfile(payload.sender.id, (err, profile) => {
      if (err) throw err

      reply({ text }, (err) => {
        if (err) throw err

        console.log(`Echoed back to ${profile.first_name} ${profile.last_name}: ${text}`)
        })
      })
    }
  }

  if ('text' in payload.message) {
    let text = payload.message.text

    //send API call to other service with text and sender

    bot.getProfile(payload.sender.id, (err, profile) => {
      if (err) throw err

      reply({ text }, (err) => {
        if (err) throw err

        console.log(`Echoed back to ${profile.first_name} ${profile.last_name}: ${text}`)
      })
    })
  }
})

var getBillDynamo = function(id, callback){
    //list should be a JSON structure that you call .toString on

    var options = { method: 'GET',
        url: 'http://ec2-52-25-176-24.us-west-2.compute.amazonaws.com:3000/getBill',
        qs: { userId: id },
        headers:
            { 'postman-token': '485f8ea8-141c-20e0-ac78-5b0756961f53',
                'cache-control': 'no-cache',
                'x-fullcontact-apikey': '583052e807c0615d' } };

    request(options, function (error, response, body) {
        if (error) throw new Error(error);
        callback(body);
    });
};

var putBillDynamo = function(id, list, callback){
var options = { method: 'POST',
  url: 'http://ec2-52-25-176-24.us-west-2.compute.amazonaws.com:3000/putBill',
  body: { userId: id, list: list },
  json: true };

  request(options, function (error, response, body) {
    if (error) throw new Error(error);
      callback(body);
  });
}

var deleteBillDynamo = function(id, callback){
  var options = { method: 'DELETE',
  url: 'http://ec2-52-25-176-24.us-west-2.compute.amazonaws.com:3000/deleteBill',
  qs: { userId: 'tester' },
  headers: 
   { 'postman-token': '6c877626-45e8-bb7c-07c8-5cf108cfbdb5',
     'cache-control': 'no-cache',
     'content-type': 'application/json',
     'x-fullcontact-apikey': '583052e807c0615d' },
  body: { userId: '12345', list: 'dddd' },
  json: true };

request(options, function (error, response, body) {
  if (error) throw new Error(error);

  callback(body);
});
}

var incrementBillDynamo = function(id, callback) {
  var options = { method: 'POST',
  url: 'http://ec2-52-25-176-24.us-west-2.compute.amazonaws.com:3000/incrementBill',
  headers: 
   { 'postman-token': '14c37120-f902-e03e-7518-52060dffebfd',
     'cache-control': 'no-cache',
     'content-type': 'application/json',
     'x-fullcontact-apikey': '583052e807c0615d' },
  body: { userId: id },
  json: true };

request(options, function (error, response, body) {
  if (error) throw new Error(error);

  callback(body);
});

}

app.listen(process.env.PORT || 3000, process.env.IP || "0.0.0.0", function() {
  console.log("Server started");
});

// http.createServer(bot.middleware()).listen(3000)