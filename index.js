const {app, BrowserWindow} = require('electron') 
const url = require('url') 
const path = require('path')  
const fs = require('fs');

let win  

function log(type, func, message){
    //type = what type of thing are you trying to log, is it a change? update? error?
    //func = what function was it in
    //message = i dont think it requires an explanation

    var currentdate = new Date(); 
    var datetime = currentdate.getDate() + "/"
                + (currentdate.getMonth()+1)  + "/" 
                + currentdate.getFullYear() + " @ "  
                + currentdate.getHours() + ":"  
                + currentdate.getMinutes() + ":" 
                + currentdate.getSeconds();
    
    console.log(`[${datetime}] (${type}) {${func}} : ${message}`)
}

function welcomeWindow() { 
   win = new BrowserWindow({
    width: 1920, 
    height: 1080,
    autoHideMenuBar: true,
    backgroundColor:'#151515',
    webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
    }
  }) 
   win.loadURL(url.format ({ 
      pathname: path.join(__dirname, '/setup/WelcomePage.html'), 
      protocol: 'file:', 
      slashes: true 
   })) 

   log(`success`, `welcomeWindow`, `Window created`)
}

function mainWindow() { 
    win = new BrowserWindow({
        width: 1920, 
        height: 1080,
        autoHideMenuBar: true,
        backgroundColor:'#151515',
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        }
      }) 
    win.loadURL(url.format ({ 
       pathname: path.join(__dirname, '/main/Landing.html'), 
       protocol: 'file:', 
       slashes: true 
    })) 

    log(`success`, `mainWindow`, `Window created`)
}

//Check if the application was already ran
const unlocked = require('./localData/unlocked.json');
const { start } = require('repl');
if(unlocked.appRan === false){
    app.on('ready', welcomeWindow)
    log(`success`, `windowCreation`, `welcomeWindow function ran`)

    const fileName = './localData/unlocked.json';
    const file = require(fileName);
    
    file.appRan = true
    
    fs.writeFile(fileName, JSON.stringify(file), function writeJSON(err) {
        if (err) return log(`error`, `windowCreation`, err);
        log(`fileChange`, `windowCreation`, `Updated "appRan" to true in ${fileName}`)
    });
} else {
    app.on('ready', mainWindow)
    log(`success`, `windowCreation`, `mainWindow function ran`)
}

function startFocus(id) { 
    log(`info`, `startFocus`, `Function started`)

    const focuses = require('./localData/focuses.json')
    focuses.list.forEach(async (element) => {
        if(element.id === id){
            log(`success`, `startFocus`, `Found '${id}' in focuses`);

            if(element.functions['screen-lockdown'] === true){
                makeALockedScreen(element)
            }
    
            ipcMain.on('getFocusData', (event, arg) => {
                event.sender.send('returnFocusData', element)
            })
        } else {
            log('loop', 'startFocus', `Looking for '${id}' - Skipping on '${element.id}'`)
            return;
        }
    });
}

function makeALockedScreen(focus){
    win = new BrowserWindow({
        width: 1920, 
        height: 1080,
        fullscreen:true,
        alwaysOnTop:true,
        //closable:false,
        minimizable:false,
        autoHideMenuBar: true,
        backgroundColor:'#151515',
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        }
      }) 
    win.loadURL(url.format ({ 
       pathname: path.join(__dirname, '/main/LockedScreen.html'), 
       protocol: 'file:', 
       slashes: true 
    })) 

    win.setFullScreenable(false)

    log(`success`, `makeALockedScreen`, `Locked the screen for focus '${focus.id}'`)
}

const {ipcMain} = require('electron')

ipcMain.on('setFocus', (event, arg) => {
    startFocus(arg)
})