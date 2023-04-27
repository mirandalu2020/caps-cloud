'use strict';
const Chance = require('chance');
const chance = new Chance();
const { Consumer } = require('sqs-consumer');
const { Producer } = require('sqs-producer');
const AWS_REGION = 'us-west-2';

//subscribe to pickupSQS FIFO

const AWS_PICKUP_SQS = 'https://sqs.us-west-2.amazonaws.com/919132472542/pickupQueue.fifo';
// const AWS_DELIVERED_SQS = 'https://sqs.us-west-2.amazonaws.com/919132472542/deliveredQueue';
let AWS_DELIVERED_SQS;

const app = Consumer.create({
  region: AWS_REGION,
  queueUrl: AWS_PICKUP_SQS,

  handleMessage: async (message) => {
    try {
      let delivered = JSON.parse(message.Body);
      AWS_DELIVERED_SQS = JSON.parse(delivered.Message).vendorUrl
      console.log(`DELIVERED, ${JSON.parse(delivered.Message).vendorUrl}`);

      //publish messages to deliveredSQS Standard
      const producer = Producer.create({
        queueUrl: AWS_DELIVERED_SQS,
        region: AWS_REGION,
      });

      producer.send({
        id: chance.guid(),
        body: JSON.stringify(`Package Delivered`)
      }).then(data => {
        console.log('Delivery completed. \n SQS MESSAGE DATA: ', data);
      })
        .catch(err => {
          console.log('SQS PRODUCER ERROR: ', err);
        })

    }
    catch (e) {
      console.log('MESSAGE RECEIPT ERROR, ', e);
    }
  }
})

app.start();

//publish messages to deliveredSQS Standard

// const producer = Producer.create({
//   queueUrl: AWS_DELIVERED_SQS,
//   region: AWS_REGION,
// });

// producer.send({
//   id: chance.guid(),
//   body: JSON.stringify(`Package Delivered`)
// }).then(data => {
//   console.log('SQS MESSAGE DATA: ', data);
// })
//   .catch(err => {
//     console.log('SQS PRODUCER ERROR: ', err);
//   })

