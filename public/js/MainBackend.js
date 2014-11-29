// ███╗   ███╗ █████╗ ██╗███╗   ██╗
// ████╗ ████║██╔══██╗██║████╗  ██║
// ██╔████╔██║███████║██║██╔██╗ ██║
// ██║╚██╔╝██║██╔══██║██║██║╚██╗██║
// ██║ ╚═╝ ██║██║  ██║██║██║ ╚████║
// ╚═╝     ╚═╝╚═╝  ╚═╝╚═╝╚═╝  ╚═══╝
//this function is called as soon as our page loads
function MainBackend() {
    showLogInWindow();
}


//...............................................................
// ███████╗ ██████╗  ██████╗██╗  ██╗███████╗████████╗██╗ ██████╗ 
// ██╔════╝██╔═══██╗██╔════╝██║ ██╔╝██╔════╝╚══██╔══╝██║██╔═══██╗
// ███████╗██║   ██║██║     █████╔╝ █████╗     ██║   ██║██║   ██║
// ╚════██║██║   ██║██║     ██╔═██╗ ██╔══╝     ██║   ██║██║   ██║
// ███████║╚██████╔╝╚██████╗██║  ██╗███████╗   ██║██╗██║╚██████╔╝
// ╚══════╝ ╚═════╝  ╚═════╝╚═╝  ╚═╝╚══════╝   ╚═╝╚═╝╚═╝ ╚═════╝                                                        
//.............................http://patorjk.com/software/taag/#p=display&f=Calvin%20S&t=SOCKET.IO

var socket=io();    //connect to socket.io
//connect to server through socket.io. the io function is defined in the socket.io library and it creates a connection at the specified address and port. 
//it returns a socket object which we can use to emit and respond to messages using socket.emit() and socket.on() respectively
//var socket=io('http://127.0.0.1:6789'); //connect to the local host [your own computer running node.js] [the local host is always identified by the reserved address 127.0.0.1]
//var socket=io('http://10.0.1.8:6789'); //connect to some computer in your local network. you can find the address by checking the IP address in the properties of your connection
//var socket=io('http://coopclass-22377.onmodulus.net'); //this is a server i have set up on the internet using modulus.io. 

function sendAddCubeMessage(point) {
    if (!me) return;
    socket.emit("requestAddCube", {point:point, user:me._id, color:me.color});
}

function sendRemoveCubeMessage(_id) {
    socket.emit("requestRemoveCube", {_id:_id});
}

function sendIncreaseCubeMessage(_id) {
    socket.emit("increaseCube", {_id:_id});
}

function sendGetAllCubesMessage() {
    socket.emit("requestGetAllCubes", {});
}

socket.on("welcome", function(data){
    console.log("your socket has been initiated!")
});

socket.on("serverAddedCube", function(data){
    addCubeModel(data.point, data.color, data._id, data.size);
});

socket.on("serverRemovedCube", function(data){
    removeCubeModel(data._id);
});

socket.on("serverIncreasedCube", function(data){
    increaseCubeModel(data);
});

socket.on("allCubesFromServer", function(data){
    for(var i in data) {
        addCubeModel(data[i].point, data[i].color, data[i]._id, data[i].size);
    }
});

//..................................................................
// ██╗   ██╗███████╗███████╗██████╗ ███████╗
// ██║   ██║██╔════╝██╔════╝██╔══██╗██╔════╝
// ██║   ██║███████╗█████╗  ██████╔╝███████╗
// ██║   ██║╚════██║██╔══╝  ██╔══██╗╚════██║
// ╚██████╔╝███████║███████╗██║  ██║███████║
//  ╚═════╝ ╚══════╝╚══════╝╚═╝  ╚═╝╚══════╝    
// socket.io user function                                    
//..................................................................

var me=null;

function User(name, _id) {
    this.name=name;
    this._id=_id;
}

function loginButtonClicked() {
    var nameInput=document.getElementById("nameInput");
    var passwordInput=document.getElementById("passwordInput");    
    login(nameInput.value, passwordInput.value);   
}

function login(name, password) {
    socket.emit("login", {name:name, password:password});
    console.log("login request has been sent!")
}

socket.on("loginFailed", function(data){
    console.log(data);
    alert(data.error);    
    showLogInWindow();
});

socket.on("needToLogin", function(data){
    console.log(data);
    alert("login needed");
    showLogInWindow();
});

socket.on("loggedin", function(data){
    me = new User(data.name, data._id, data.color);
    hideLogInWindow();
    Initialize();
});

socket.on("userJoined", function(data){
    console.log("JOINED:");
    console.log(data);
});

socket.on("userLeft", function(data){
    console.log("LEFT:");
    console.log(data);
});


var divlogin=null;
function showLogInWindow() {   
    divlogin=document.getElementById("divLogin"); 
    divlogin.style.visibility="visible";
}

function hideLogInWindow() {
    divlogin.style.visibility="collapse";
}