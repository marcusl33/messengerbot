'use strict'
const http = require('http')
const Bot = require('messenger-bot')
var fs = require('fs'),
    request = require('request');

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

http.createServer(bot.middleware()).listen(443)