const rclnodejs = require('rclnodejs');
var topicData = {
  lat : 0,
  lon : 0,
  alt : 0,
  dir : 0,
  velo : 0,
  x: 0,
  y : 0,
  dis : 0
}
rclnodejs
        .init()
        .then(() => {
          const node = rclnodejs.createNode('gnss2nodejs');
          node.createSubscription(
              'tutorial_interfaces/msg/Num', // msg type
              '/topic' ,// topic name 
            (state) => {
              topicData = state 
              
            }
          );
          rclnodejs.spin(node);
        })
        .catch((e) => {
          console.log(e);
      });


const parseData = (gnssData)=>{
  gnssData = topicData
  console.log(topicData, 'test')
}





 module.exports =  {
  parseData
 } 