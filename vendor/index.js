'use strict';

const AWS = require('aws-sdk');
const AWS_REGION = 'us-west-2';
AWS.config.update({ region: AWS_REGION });

const sns = new AWS.SNS();
const { Consumer } = require('sqs-consumer');
const Chance = require('chance');
const chance = new Chance();

//FIFO SNS holds pick up
const AWS_PICKUP_SNS = 'arn:aws:sns:us-west-2:919132472542:PickupRequests-CAPS.fifo';
// const AWS_PICKUP_SQS = 'https://sqs.us-west-2.amazonaws.com/919132472542/pickupQueue.fifo';
const AWS_DELIVERED_SQS = 'https://sqs.us-west-2.amazonaws.com/919132472542/deliveredQueue';


function vendorRequests() {

  const packageToSend = {
    id: chance.guid(),
    customerName: chance.name(),
    vendorUrl: AWS_DELIVERED_SQS,
  };

  //send message to pickup SNS
  const payload = {
    Message: JSON.stringify(packageToSend),
    MessageGroupId: chance.guid(),
    TopicArn: AWS_PICKUP_SNS
  }

  sns.publish(payload).promise()
    .then(packages => {
      console.log('Package to pickup, ', packages);
    })
    .catch((e) => {
      console.log('Pickup request failed to send ', e);
    })


  // subsribe to delivered SQS Standard
  const app = Consumer.create({
    region: AWS_REGION,
    queueUrl: AWS_DELIVERED_SQS,
    handleMessage: async (message) => {
      try {
        let delivered = JSON.parse(message.Body);
        console.log(`${delivered}`);
      }
      catch (e) {
        console.log('MESSAGE RECEIPT ERROR, ', e);
      }
    }
  })

  app.start();
}

setInterval(vendorRequests, 30000);