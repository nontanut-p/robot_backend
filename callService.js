
const rclnodejs = require('rclnodejs');

// // const request = {
// //   a: Math.floor(Math.random() * 100),
// //   b: Math.floor(Math.random() * 100),
// // };
// var request = 0
// // console.log(`Sending: ${typeof request}`, request);


// var i = 0 

// rclnodejs.init().then(() => {
//     const node = rclnodejs.createNode('subscription_example_node');
  
//     node.createSubscription('std_msgs/msg/String', 'topic', (msg) => {
//       console.log(`Received message: ${typeof msg}`, msg);
//     });
//     client.sendRequest(request , (response) => {
//         console.log(`Result: ${typeof response}`, response);   
//         })
    
//     rclnodejs.spin(node);
//   });

var x = 1 
var y = 1


function makeid() {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  
    for (var i = 0; i < 5; i++)
      text += possible.charAt(Math.floor(Math.random() * possible.length));
  
    return text;
  }
  


const testCallServiceRecive = ()=>{
  // just test looping 

  console.log('hello from test call service !!')
}

var i = 1
let request =  "{}"
rclnodejs.init().then(() => {
    const node = rclnodejs.createNode('subscription_example_node');
  //ros2 service call /agribot/path/get_path_list agribot_interfaces/srv/GetPathList "{}"
    
    const callTurtle=() =>{
      const client = node.createClient('agribot_interfaces/srv/GetPathList', 'agribot/path/get_path_list');
      console.log(`Sending: ${typeof request}`, request);
      client.sendRequest(request,  async (response) => {
        try{
         await   console.log(`Result:`, response);
        }catch{
            console.log('error')
        }
      })

  }

  setInterval(()=>{
    callTurtle()

    testCallServiceRecive()
    console.log(i, 'No asyncronus sevice test ')
    i++
  },5000) 
    
    
    rclnodejs.spin(node);
  });