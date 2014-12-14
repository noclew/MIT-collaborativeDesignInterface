//..................initialize required modules
var express = require('express');
var app=express();
var http=require('http');

//map exrress default file folder to the subfolder /public under the folder that contains app.js [__dirname]
app.use(express.static(__dirname + '/public'));


//start the server listening at port 6789 when running locally or to the default remote port when deploying online
var server = app.listen(process.env.PORT || 6789, function() {
    console.log('Listening on port %d', server.address().port);
});

//................................Socket.io
//initialize socket.io to listen to the same server as express
var io = require('socket.io').listen(server);

//create an empty list of objects. Here we will store each 3d object in order for the server to act as a persistent storage. Even if all clients disconnect the server will still have a record of the created geometry
var objects={};
var points={};
//this is a counter. Each time a new tripod is added to the server it gets this unique id that increases by one. Therefore each tripod has a unique identifying number. The clients receive this number for each object from the server so that for example when a client deletes an object it can ask the server to delete the object with the same id 
var id=1;
var pt1;
var pt2;

//each time a client is connected to socket.io this callback function is run
//within this functio nwe can set up the message listeners for the connections from each client
io.sockets.on('connection', function (socket) {
  console.log("CONNECTION");

  //when a client disconnects this message is received
  socket.on('disconnect', function(){
  });

  //......................................................custom messages
  //these are the messages we receive from the clients. For each message we setup a callback function that processes the data of the message and possibly replies to one or all the connected clients

  //a client sends this message when it needs to add a new model
  //the data contain just the transformation matrix of the object that the client wants to add
   socket.on('requestAddPoint', function(data){   
 
    //we attach a unique id to the data
    data.id=id;
    //store the data to our objects storage. We store objects by their id so that we can find them easily later
    objects[id]=data;

    //increase the id. Therefore the next object to be added will get a new unique id number
    id++;

    //emit the data to all connected clients so that they are all notified and create the newly added geometry. these data now contains both the matrix and the id of the newly added element
    io.sockets.emit('serverAddedPoint', data);
  });

  socket.on('request2Point', function(data){

    if (objects.length >= 2){
     pt1 = objects[objects.length-1];
     pt2 = objects[objects.length-2];
    }
    
    io.socket.emit('serverGotPoints', data);
  })

  //a client sends this message when it needs to remove a model
  socket.on('requestRemovePoint', function(data){   
 
    delete objects[data.id];                //delete the object with the requested id from the storage

    io.sockets.emit('serverRemovedPoint', data);  //notify all clients that object was removed
  });

  //a client sends this message when they first connect in order to get all the existing models
  socket.on('requestGetAllPoints', function(data){   
 
    socket.emit('allPointsFromServer', objects);  //simply send all the stored objects to the client
  });
  
});


/*
// //................................................................
// ███╗   ███╗ ██████╗ ███╗   ██╗ ██████╗  ██████╗    ██████╗ ██████╗ 
// ████╗ ████║██╔═══██╗████╗  ██║██╔════╝ ██╔═══██╗   ██╔══██╗██╔══██╗
// ██╔████╔██║██║   ██║██╔██╗ ██║██║  ███╗██║   ██║   ██║  ██║██████╔╝
// ██║╚██╔╝██║██║   ██║██║╚██╗██║██║   ██║██║   ██║   ██║  ██║██╔══██╗
// ██║ ╚═╝ ██║╚██████╔╝██║ ╚████║╚██████╔╝╚██████╔╝██╗██████╔╝██████╔╝
// ╚═╝     ╚═╝ ╚═════╝ ╚═╝  ╚═══╝ ╚═════╝  ╚═════╝ ╚═╝╚═════╝ ╚═════╝                                                                   
//...................................................................
//.............serverSide MongoDB....................................

var mongo = require('mongodb'),
MongoServer = mongo.Server,
Db = mongo.Db,
ObjectID = mongo.ObjectID;

//.................open a connection to the mongodb server
var mdbserver = new MongoServer('localhost', 27017, {auto_reconnect: true});
//.................ask the server for the database named "DBASE" this databse will be created if it doesn't exist already
var db = new Db('DBASE', mdbserver,{safe:true});

//.................get or create a collection in cubeDB to store objects
//global variable that will be set to the object collection as soon as it is created or returned from the database

var userCollection=null;
//.................open the database
db.open(function(err, db) {
  if(!err) {
    //if all went well [that is mongoDB is alive and listening]
    console.log("We are connected to mongoDB");
    //create a collection named theCollection and if it succeeds set the global variable theCollection to 
    //point to the newly created or opened collection

    db.createCollection(
      'userCollection',         //name of collection to open
      {safe:false},           //unsafe mode, if the collection already exists just give us the existing one
      function(err, collection) {   //this function is called as soon as the databse has either found or created a collection with the requested name
        userCollection=collection;  //set the global variable theCollection to the newly found collection
      });
  }
});

//.............End of mongo DB..........................................

*/