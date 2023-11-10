


function checkVR(navigator) {
    if (navigator.xr) {
        navigator.xr.isSessionSupported('immersive-vr').then((supported) => {
            if (supported) {
                console.log('VR supported');
                EnterVR()
            } else {
                console.log('VR not supported');
            }
        });
    } else {
        if (window.isSecureContext === false) {
            console.log('WebXR needs HTTPS');
        } else {
            console.log('WebXR not supported');
        }
    }
}

let currentSession = null;

function EnterVR() {
    let sessionInit = {optionalFeatures: ['local-floor', 'bounded-floor']};
    navigator.xr.requestSession('immersive-vr', sessionInit).then(onSessionStarted);
}

function onSessionStarted(session) {
    session.addEventListener('end', onSessionEnded);
    renderer.xr.setSession(session);
    currentSession = session;
}

function onSessionEnded(event) {
    currentSession.removeEventListener('end', onSessionEnded);
    currentSession = null;
}

var VRButton = {
    createButton: function(renderer, options) {
        if (options && options.referenceSpaceType) {
            renderer.xr.setReferenceSpaceType(options.referenceSpaceType);
        }
    }
}

const vrEnter = document.getElementById('vr-enter');
const vrExit = document.getElementById('vr-exit');
vrExit.classList.add('hide');

vrEnter.addEventListener('click', () => {
    vrEnter.classList.add('hide');
    vrExit.classList.remove('hide');
    
});

vrExit.addEventListener('click', () => {
    vrExit.classList.add('hide');
    vrEnter.classList.remove('hide');
});

vrEnter.onclick = () => {
    if (currentSession === null) {
        let sessionInit = {optionalFeatures: ['local-floor', 'bounded-floor']};
        navigator.xr.requestSession('immersive-vr', sessionInit).then(onSessionStarted);
    } else {
        currentSession.end();
    }
}

export {VRButton};