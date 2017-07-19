'use strict'
const http = require('http')
const Bot = require('messenger-bot')
var express = require('express');
var app = express();

var fs = require('fs'),
  request = require('request');

app.get('/', (req, res) => {
  deleteBillDynamo("testUserId", function(data) {
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

  if ('attachments' in payload.message) {
    if (payload.message['attachments'][0]['type'] == 'image') {
      var attachment = payload.message.attachments
      let text = attachment[0]['payload']['url']

      //send api call to other service with sender and url


      bot.getProfile(payload.sender.id, (err, profile) => {
        if (err) throw err

        reply({
          text
        }, (err) => {
          if (err) throw err

          console.log(`Echoed back to ${profile.first_name} ${profile.last_name}: ${text}`)
        })
      })
    }
  }

  if ('text' in payload.message) {
    let text = "Hi!"
      //send API call to other service with text and sender
      // var testlist = [{'Item' : 'tomatoes', 'Price' : 3.00, 'Assignee' : 'john'}, {'Item' : 'chicken', 'Price' : 7.00, 'Assignee' : 'bill'}, {'Item' : 'salmon', 'Price' : 11.00, 'Assignee' : 'case'},
      // {'Item' : 'pesto', 'Price' : 5.50, 'Assignee' : 'bill'}]


    // var testjson = JSON.stringify(testlist)
    // console.log(testjson)
    // // console.log(testlist)
    // putBillDynamo(sender, testjson, function(data) {
    //   console.log(data);
    // }

    getBillDynamo(sender, function(data) {
      var setSource = function(callback) {
        if (data == "{}") {
          text = "Don't have an existing bill? Send a photo to start splitting a bill!"
        }
        else {
          let priceItemData = JSON.parse(data)
          let index = priceItemData['Item']['listIndex']
          console.log(index)

          let priceItemList = JSON.parse(priceItemData['Item']['itemList'])

          if (index >= priceItemList.length) {
            console.log(sender)
            deleteBillDynamo(sender, function(data) {

            })
            text = getSummary(priceItemList).toString()

          }
          else {
            let itemName = priceItemList[index]["Item"]
            let price = priceItemList[index]["Price"]
            priceItemList[index] = {
              "Item": itemName,
              "Price": price,
              "Assignee": payload.message['text']
            }

            updateListDynamo(sender, JSON.stringify(priceItemList), function(data) {
              //do nothing
            })

            incrementBillDynamo(sender, function(data) {
              //do nothing
            })

            index = index + 1
            if (index < priceItemList.length) {
              let nextItemName = priceItemList[index]["Item"]
              let nextPrice = priceItemList[index]["Price"]
              text = "Who do you want to assign " + itemName + " of price $" + price + "?"
            }
            else {
              text = JSON.stringify(getSummary(priceItemList))
            }
          }
        }
        callback();
      }
      setSource(function() {
        reply({
          text
        }, (err) => {
          if (err) throw err

        })
      })
    })
  }
})

function getSummary(itemPriceList) {
  var priceSummary = {}
  for (var i = 0; i < itemPriceList.length; i++) {
    var assignee = itemPriceList[i]['Assignee']
    if (assignee in priceSummary) {
      priceSummary[assignee] = priceSummary[assignee] + itemPriceList[i]['Price']
    }
    else {
      priceSummary[assignee] = itemPriceList[i]['Price']
    }
  }
  return priceSummary
}

var getBillDynamo = function(id, callback) {
  //list should be a JSON structure that you call .toString on

  var options = {
    method: 'GET',
    url: 'http://ec2-52-25-176-24.us-west-2.compute.amazonaws.com:3000/getBill',
    qs: {
      userId: id
    },
    headers: {
      'postman-token': '485f8ea8-141c-20e0-ac78-5b0756961f53',
      'cache-control': 'no-cache',
      'x-fullcontact-apikey': '583052e807c0615d'
    }
  };

  request(options, function(error, response, body) {
    if (error) throw new Error(error);
    callback(body);
  });
};

var updateListDynamo = function(id, list, callback) {
  var options = {
    method: 'POST',
    url: 'http://ec2-52-25-176-24.us-west-2.compute.amazonaws.com:3000/changeList',
    body: {
      userId: id,
      list: list
    },
    json: true
  };

  request(options, function(error, response, body) {
    console.log(body)
    if (error) throw new Error(error);
    callback(body);
  });
}

var putBillDynamo = function(id, list, tax, token, callback) {
  var options = {
    method: 'POST',
    url: 'http://ec2-52-25-176-24.us-west-2.compute.amazonaws.com:3000/putBill',
    body: {
      userId: id,
      list: list,
      friendToken: token,
      tax: tax
    },
    json: true
  };

  request(options, function(error, response, body) {
    console.log(body)
    if (error) throw new Error(error);
    callback(body);
  });
}

var deleteBillDynamo = function(id, callback) {
  var options = {
    method: 'DELETE',
    url: 'http://ec2-52-25-176-24.us-west-2.compute.amazonaws.com:3000/deleteBill',
    qs: {
      userId: id
    },
    headers: {
      'postman-token': '6c877626-45e8-bb7c-07c8-5cf108cfbdb5',
      'cache-control': 'no-cache',
      'content-type': 'application/json',
      'x-fullcontact-apikey': '583052e807c0615d'
    },
    json: true
  };

  request(options, function(error, response, body) {
    if (error) throw new Error(error);

    callback(body);
  });
}

var incrementBillDynamo = function(id, callback) {
  var options = {
    method: 'POST',
    url: 'http://ec2-52-25-176-24.us-west-2.compute.amazonaws.com:3000/incrementBill',
    headers: {
      'postman-token': '14c37120-f902-e03e-7518-52060dffebfd',
      'cache-control': 'no-cache',
      'content-type': 'application/json',
      'x-fullcontact-apikey': '583052e807c0615d'
    },
    body: {
      userId: id
    },
    json: true
  };

  request(options, function(error, response, body) {
    if (error) throw new Error(error);

    callback(body);
  });
};

var getPictureJson = function(url, callback) {
  var options = {
    method: 'POST',
    url: 'http://ec2-52-25-176-24.us-west-2.compute.amazonaws.com:3000/api/upload',
    headers: {
      'postman-token': '8d92b353-7c9f-991e-3b94-1f70e9847294',
      'cache-control': 'no-cache',
      'content-type': 'application/json'
    },
    body: {
      pictureUrl: url
    },
    json: true
  };

  request(options, function(error, response, body) {
    if (error) throw new Error(error);

    callback(body);
  });
}

// app.listen(process.env.PORT || 3000, process.env.IP || "0.0.0.0", function() {
//   console.log("Server started");
// });

http.createServer(bot.middleware()).listen(3000)
