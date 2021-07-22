const rclnodejs = require('rclnodejs');
var fs = require('fs');
var atob = require('atob')
var jpeg =require ('jpeg-js')
var unicode
var base64Img
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
          const node = rclnodejs.createNode('imageBase64');
          node.createSubscription(
              'sensor_msgs/msg/Image', // msg type
              '/image' ,// topic name 
            (state) => {
              //console.log(state);
              unicode = state
              //state.data
             // console.log('*************************---------------------------------------------------------------------------*************************')
              //console.log('Hey') 
              //console.log('*************************---------------------------------------------------------------------------*************************')
            }
          );
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
 const base64 = (database64) => {
    if(unicode !== undefined){
        //base64Img = rgb8ImageToBase64Jpeg(unicode)
        database64.img =rgb8ImageToBase64Jpeg(unicode)
    }
    
 }   


 const parseData = ()=>{
  return topicData
  
}



function rgb8ImageToBase64Jpeg(msg) {
    var raw = atob(msg.data)
    var array = new Uint8Array(new ArrayBuffer(raw.length))
    for (let i = 0; i < raw.length; i++) {
      array[i] = raw.charCodeAt(i)
    }
    var frameData = Buffer.alloc(msg.width * msg.height * 4)
    for (let i = 0; i < msg.width * msg.height; i++) {
      frameData[4 * i + 2] = array[3 * i + 0] // b
      frameData[4 * i + 1] = array[3 * i + 1] // g
      frameData[4 * i + 0] = array[3 * i + 2] // r
      frameData[4 * i + 3] = 0
    }
    var rawImageData = {
      data: frameData,
      width: msg.width,
      height: msg.height
    }
    //console.log(rawImageData)
    jpegImageData = jpeg.encode(rawImageData, 50)
    //fs.writeFileSync('image.jpg', jpegImageData.data);
    return jpegImageData.data.toString('base64')
  }


module.exports = { 
    base64 ,
    parseData
    //rgb8ImageToBase64Jpeg : rgb8ImageToBase64Jpeg(msg),
}