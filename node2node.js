const rclnodejs = require('rclnodejs');
var fs = require('fs');  // for read or write data
var atob = require('atob')
const sharp = require('sharp');
const { count } = require('console');
const {execute} = require('./parse_path')
var camera_selector = 1
console.log(camera_selector)
var base64Img
var positionLL = []
var path_list
let listOfCam = ['','/agribot/camera/rear/image_raw' , '/agribot/camera/weed1/image_raw','/agribot/camera/rs_front/color/image_raw']
let dumpObj = {}
var objectData = {"cam" : 1 , "get_path" : false , "path_list" : undefined , 'path_name' : undefined , 'rosout': []}
const rosNodeCommand = (objData) =>{
  // dumpObj[Object.keys(objData)] = Object.values(objData)[0]
  // console.log(dumpObj) = Object.values(objData)[0] 
  objectData[Object.keys(objData)] = Object.values(objData)[0]
  if(objData.path_name){
    console.log(objData.path_name , 'true line 20 node2nodejs' )
  }
  // console.log(objData.path_name)
  // objectData = {...objectData }
  // console.log('object', objectData)
}
/// Initial value ///
lat_0 = 14.08214719610437
lon_0 =  100.60713766385788
earth_radius = 6356752.3142    
var cameraTopic ='/agribot/camera/rs_front/color/image_raw'
exportData = [base64Img, positionLL]
var ObjectExportData = {"base64Img" :base64Img , "posinalLL" : positionLL , "PathList" : path_list , "state_follow" : false , 'rosout': ""}
const changeCam = (cam)=>{
  // console.log('Camera is changing ....  from ', camera_selector , ' to ' , cam)
  camera_selector = cam
}

const meter2lla = (x , y) =>{
  lat = y*180.0/(earth_radius*Math.PI) + lat_0
  b = Math.tan( x/(earth_radius*2) )**2
  a = b/(b+1)
  c = Math.asin( Math.sqrt( a / Math.cos(lat_0* Math.PI/180.0)**2 ) ) * 180.0 / (0.5* Math.PI)
  if (x>0){
    c = Math.abs(c)
  }else {
    c = -Math.abs(c)
  }
  lon = c + lon_0
  position = [lat,lon]
  return position
}

function image_processing(msg){
  // export inside this function 
  var raw = atob(msg.data)
  var array = new Uint8Array(new ArrayBuffer(raw.length))
  for (let i = 0; i < raw.length; i++) {
    array[i] = raw.charCodeAt(i)
  }
  var frameData = Buffer.alloc(msg.width * msg.height * 3)
  for (let i = 0; i < msg.width * msg.height; i++) {
    frameData[3 * i + 2] = array[3 * i + 0] // b
    frameData[3 * i + 1] = array[3 * i + 1] // g
    frameData[3 * i + 0] = array[3 * i + 2] // r
    
  }
  sharp(frameData, {
    // because the input does not contain its dimensions or how many channels it has
    // we need to specify it in the constructor options  BGR to RGB
    raw: {
      width: msg.width,
      height: msg.height,
      channels: 3
    }})
    .toFormat('jpeg')
    .toBuffer().then((data)=>{
     base64Img = data.toString('base64')
     //console.log(base64Img)
     ObjectExportData.base64Img = base64Img
 //    var t1 = performance.now();
     //total = ((t1-t0) + total)
     //avrage = total/start
   //  start = start+ 1
//      console.log("Call to find took " + (t1 - t0) + " milliseconds. total = "+ avrage + 'ms' );
    })
}


let request =  "{}"
rclnodejs
  .init()
  .then(() => {
    console.log('test for loop')
    var node = rclnodejs.createNode('nodeJS');
    var warningStatus = node.createSubscription(
      'agribot_interfaces/msg/RobotStatus', // msg type
      '/agribot/driver/robot_status' ,// topic name 
    (status) => {
      console.log(status , "warning status")

      //console.log(positionLL)
    })
    var gnssData = node.createSubscription(
      'agribot_interfaces/msg/Odom', // msg type
      '/agribot/odom/odom_gnss' ,// topic name 
    (state) => {
      console.log(state)
      topicData = state
      lat = topicData.lat
      lon = topicData.lon
      positionLL = [lat, lon]
      ObjectExportData.posinalLL = positionLL
      //console.log(positionLL)
    })
    let camNode = node.createSubscription(
      'sensor_msgs/msg/Image', // msg type
      '/agribot/camera/rear/image_raw',// topic name agribot/camera/rear/image_raw 
      //'/image',
      async (msg) => { 
       
        if(objectData.cam == 1){
          //console.log('test',msg)
          image_processing(msg)
        }else 
        return 0 
      });

    let camNode2 = node.createSubscription(
      'sensor_msgs/msg/Image', // msg type
      '/agribot/camera/rs_front/color/image_raw', // topic name agribot/camera/rear/image_raw 
      
      async (msg) => { 
        
        if(objectData.cam == 2){
          // console.log('test 2', objectData.cam)
          image_processing(msg)
        }else 
        
        return 0 

      }
  );
  let camNode3 = node.createSubscription(
    'sensor_msgs/msg/Image', // msg type
    '/agribot/camera/weed1/image_raw', // topic name agribot/camera/rear/image_raw 
    
    async (msg) => { 
      
      if(objectData.cam === 3){
        // console.log('test 3')
        image_processing(msg)
      }else 
      
      return 0 

    }
      
  );
  let camNode4 = node.createSubscription(
    'sensor_msgs/msg/Image', // msg type
    '/image', // topic name agribot/camera/rear/image_raw 
    async (msg) => { 
    
      if(objectData.cam == 0){
        image_processing(msg)
      }
      else 
      
      return 0 

    }
  
);
let rosOut = node.createSubscription(
  'rcl_interfaces/msg/Log', // msg type
  '/rosout', // topic name agribot/camera/rear/image_raw 
  (state) => {
   let message = " Name : " +state.name +" Msg " + state.msg + " Func " + state.function
  //  console.log(message)
   if(ObjectExportData.rosout !== message){
    ObjectExportData.rosout = message
    console.log(ObjectExportData.rosout , 'true')
   }
   
  }
    
);
var waypoints ;
const getPathList=() =>{
  
  const client = node.createClient('agribot_interfaces/srv/GetPathList', 'agribot/path/get_path_list');
  console.log(`Sending: ${typeof request}`, request);
  client.sendRequest(request, (response) => {
    console.log('path list response ',response.result)
    try{
   
      filePath = response.file_path
      path_Name = response.name
      var arrayLength = path_Name.length;
      let temp_obj = {}
      for (var i = 0; i < arrayLength; i++) {
          pathN = path_Name[i].toString()
          temp_obj[pathN] = filePath[i]
      }
      console.log(temp_obj , 'temp_obj')
      ObjectExportData.PathList = temp_obj
      // console.log(temp_obj)
      // console.log("----------------------------------------------------")
      // console.log(temp_obj)
      // console.log("----------------------------------------------------")
      // console.log(`Result:`, filePath[0] , 'Path Name : ', path_Name[0]);
       fs.readFile(filePath[0] , (err, data) => {
        if (err) {
          console.error(err)
          return
        }
        waypoints = execute(data)
        objectData.get_path = false
        //console.log(waypoints.length)
        //console.log(waypoints)

      })
    }catch{
        console.log('error 214 node2node')
    }
  })

}
const startFollow=(request) =>{
  const client = node.createClient('agribot_interfaces/srv/StartFollowPath', 'agribot/path/start_follow');
  console.log(`Sending: ${typeof request}`, request);
  client.sendRequest(request, (response) => {
  
    try{
      console.log(response.result)

    }catch(e){
      console.log(e)
    }
  })
}
  
  

// node beat 
setInterval(()=>{
  // check if get path list true 
  if(objectData.path_name){
    console.log('something added!!');
   // send ros here and wait for response if response == 0 is ok 0 fail 
   // 
    console.log(objectData.path_name)
    request = {'name' : objectData.path_name}
    startFollow(request)
    objectData.path_name = undefined;
  }
  if(objectData.get_path == true){
    getPathList() 
    
   } 
  },200) 
    rclnodejs.spin(node);
  })
  .catch((e) => {
    console.log(e,'cant find some topic ');
});


exports.ObjectExportData = ObjectExportData;
exports.rosNodeCommand = rosNodeCommand;



    // setInterval(()=>{
    //   console.log('camera_selector', camera_selector ,'camera_current cam', currentCam)
    //   if(currentCam !== camera_selector){
    //     console.log('print test')
    //     if(camera_selector === 1){
    //       delete camNode
    //       currentCam = 1 
    //       createCameraSub('sensor_msgs/msg/Image' ,'/agribot/camera/rear/image_raw')
    //     }else if(camera_selector === 2) {
    //       delete camNode
    //       currentCam = 2
    //       createCameraSub('sensor_msgs/msg/Image',  '/agribot/camera/rs_front/color/image_raw')
    //     }else if(camera_selector === 3) {
    //       currentCam = 3
    //       createCameraSub('sensor_msgs/msg/Image',  '/agribot/camera/weed1/image_raw')
    //     }else if(camera_selector === 0) {
    //       currentCam = 0 
    //       createCameraSub('sensor_msgs/msg/Image',  '/image')
    //     }
    //   }else{
    //     console.log('same')
    //   }
    // },100)
