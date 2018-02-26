import React, { Component } from 'react';
import ReactDOM from 'react-dom';

import '../css/style.css';
import micImage from '../assets/Mic_NoMeter.png';
import '../meter/main';
import {loadVolume} from '../meter/volume-meter';

import LoginForm from './LoginForm.jsx';
import NewUserForm from './NewUserForm.jsx';
import SettingsForm from './SettingsForm.jsx';
import throttle from '../../node_modules/lodash.throttle';
import util from '../services/requestHelper';

// sound files
import shushFile from '../sounds/shush.mp3';  
import pinDropFile from '../sounds/pinDrop.mp3';
import hornHonkFile from '../sounds/hornHonk.mp3';
import radioInterruptFile from '../sounds/radioInterruption.mp3';
import fonzieFile from '../sounds/fonzie.mp3';  
import getOutMyFaceFile from '../sounds/getOutMyFace.mp3';  
import shutTheFUpFile from '../sounds/shutTheFUp.mp3';  
import stopRightThereFile from '../sounds/stopRightThere.mp3';  
import youBestBackOffFile from '../sounds/youBestBackOff.mp3';  

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoggedIn: false,
      rendMic: true,
      rendLogin: false,
      rendNewUser: false, 
      rendSettings: false,

      message: '',
      username: null,
      triggers: [],
      currentVol: 0,

      triggerBoolean: true,

      userMp3s: [],
      soundUrls: {},

    };
    
    this.timeout = 1500;
    this.triggerEvent = throttle(this.timedEventTrigger, this.timeout, { trailing: false });
    // this.triggerEvent = throttle(this.triggerEvent, this.timeout, { trailing: false });
    this.sounds = {
      shush: new Audio(shushFile),
      pinDrop: new Audio(pinDropFile),
      hornHonk: new Audio(hornHonkFile),
      radioInterrupt: new Audio(radioInterruptFile),
      stopRightThere: new Audio(stopRightThereFile),
      fonzie: new Audio(fonzieFile),
      youBestBackOff: new Audio(youBestBackOffFile),
      getOutMyFace: new Audio(getOutMyFaceFile),
      shutTheFUp: new Audio(shutTheFUpFile),
    };

    // convert trigger data to display these values
    // possibly create a duplicate triggers array with converted values
    this.gates = {
      0: 0,
      '10 dB - breathing': 0.001,
      '20 dB - whisper': 0.01,
      '50 dB - private conversation': 0.03,
      '60 dB - group conversation': 0.05,
      '80 dB - busy restaurant': 0.06,
      '100 dB - jackhammer': 0.5,
    };
    this.clips = {
      '"shhhhhhh"': 'shush',
      'pin drop': 'pinDrop',
      'horn honk': 'hornHonk',
      'radio interruption': 'radioInterrupt',
      'Sam says "stop right there"': 'stopRightThere',
      'Sam says "be like Fonzie"': 'fonzie',
      'Sam says "back off"': 'youBestBackOff',
      'Sam says "get the F out my face"': 'getOutMyFace',
      'Sam says "shut the F up"': 'shutTheFUp',
    };
  }
  // lol
  convertTrigger(trigger) {
    switch(trigger.gate) {
      case 0.001:
        trigger.gate = '10 dB - breathing';
        break;
      case 0.01:
        trigger.gate = '20 dB - whisper';
        break;
      case 0.03:
        trigger.gate = '50 dB - private conversation';
        break;
      case 0.05:
        trigger.gate = '60 dB - group conversation';
        break;
      case 0.06:
        trigger.gate = '80 dB - busy restaurant';
        break;
      case 0.5:
        trigger.gate = '100 dB - jackhammer';
        break;
      default:
        break;
    }
    switch(trigger.clip) {
      case 'shush':
        trigger.clip = '"shhhhhhh"';
        break;
      case 'pinDrop':
        trigger.clip = 'pin drop';
        break;
      case 'hornHonk':
        trigger.clip = 'horn honk';
        break;
      case 'radioInterrupt':
        trigger.clip = 'radio interruption';
        break;
      case 'stopRightThere':
        trigger.clip = 'Sam says "stop right there"';
        break;
      case 'fonzie':
        trigger.clip = 'Sam says "be like Fonzie"';
        break;
      case 'youBestBackOff':
        trigger.clip = 'Sam says "back off"';
        break;
      case 'getOutMyFace':
        trigger.clip = 'Sam says "get the F out my face"';
        break;
      case 'shutTheFUp':
        trigger.clip = 'Sam says "shut the F up"';
        break;
      default:
        break;
    }
    return trigger;
  }

  // make a database-ready copy of a trigger
  // converts user-friendly values into correct variables for db
  makeDbTrigger(trigger) {
    let dbTrigger = Object.assign({}, trigger);
    dbTrigger.gate = this.gates[trigger.gate];
    dbTrigger.clip = this.clips[trigger.clip] || trigger.clip;
    // dbTrigger.clip = this.clips[trigger.clip];
    return dbTrigger;
  }

  componentWillMount() {
    loadVolume((vol) => {
      let didTrigger = { gate: 0, message: '', clip: '', play: false };
      let play = false;
      this.state.triggers.forEach((trigger, i) => {
        const tGate = this.gates[trigger.gate];
        if (vol >= tGate) {
          if (!play) {
            play = true;
          }
          if (tGate > this.gates[didTrigger.gate]) {
            didTrigger = trigger;
          }
        }
      });
      if (play && this.state.isLoggedIn) {
        this.triggerEvent(didTrigger, vol);
      }
    });
  }

  timedEventTrigger(trigger, vol) {
    const context = this;
    //create conditional to fire depending on trigger times
    if(trigger.listen_start && trigger.listen_stop){
      let currentTime = util.getCurrentTime();
      // if times are checking same day, don't allow event to trigger between the times
      if (trigger.listen_start < trigger.listen_stop) {
        if(currentTime < trigger.listen_start || currentTime > trigger.listen_stop){
          context.triggeredEvent(trigger, vol);
        }
      // if times span 12:00 am , don't allow event to trigger between the times
      } else if (trigger.listen_start > trigger.listen_stop) {
        if(currentTime < trigger.listen_start && currentTime > trigger.listen_stop){
          context.triggeredEvent(trigger, vol);
        }
      } else{
        context.triggeredEvent(trigger, vol);
      }
    } else {
      context.triggeredEvent(trigger, vol);
    }
  }
  
  // fire off the trigger
  // sets displayed message and plays sound clip
  triggeredEvent(trigger, vol) {


    // TODO: wrap in set time out, so doesn't get message continuously forever
    // check to see if trigger has a phone number
    if(trigger.phone_number) {
      // if so, check format
      if(!isNaN(parseInt(trigger.phone_number)) && trigger.phone_number.toString().length === 10){
        // if good formatting make http req to /sms
        console.log('sending ', trigger.message);
        util.sendSMS(trigger.message, trigger.phone_number);
      } else {
        //else, alert user why can't send sms
        console.log('Sorry, we are having a difficult time understanding your phone number. Sometimes people forget to give all 10 digits or accidentally type non numeric characters. The format should be 0000000000');

      }
    }

    this.setState({
      message: trigger.message,
    });
    setTimeout(() => {
      this.setState({
        message: '',
      });
    }, this.timeout);

    if (this.sounds[this.clips[trigger.clip]]) {
      this.sounds[this.clips[trigger.clip]].play();
    } else if (this.sounds[trigger.clip]) {
        // TODO: call play on user audio url:
      this.sounds[trigger.clip].play();
      console.log(`trigger.clip is: ${trigger.clip}`);
    } else if (trigger.clip) {
      // TODO: get correct url from db
      const mp3Url = '';
      const fakeDataUrl = '';
      // add audio with html to this.sounds
      this.sounds[trigger.clip] = new Audio(fakeDataUrl);
    }
    
  }

  routeButtonClick(route) {
    if (route === 'settings' && this.state.rendSettings) {
      route = 'mic';
    }

    this.setState({
      rendMic: route === 'mic',
      rendLogin: route === 'login',
      rendNewUser: route === 'newUser',
      rendSettings: route === 'settings',
    });
  }

  submitLogin(username, password) {
    util.userLogin({ name: username, password }, (res) => {
      this.setState({
        username,
        isLoggedIn: true,
      });
      this.routeButtonClick('mic');
      this.getSoundNames()
      // this.getTriggers();
      
    });
  }

  submitNewUser(username, password) {
    util.userSignup({ name: username, password }, (res) => {
      this.setState({
        username,
        isLoggedIn: true,
      });
      this.routeButtonClick('mic');
    });
  }

  logout() {
    util.userLogout((res) => {
      this.setState({
        isLoggedIn: false,
        username: null,
        triggers: [],
      });
      this.routeButtonClick('mic');
    });
  }

  toggleTriggers(cb) {
    this.setState( prevState => { 
      return {triggerBoolean: !prevState.triggerBoolean}
    }, () => {
      cb();
    });
  }

  hideTriggers(cb) {
    this.setState({
      triggers: [],
    }, cb())
  }

  getSoundNames() {
    const context = this;
    util.getSounds((res) => {
      const soundUrlMap = {};
      res.data.forEach((sound) => {
        soundUrlMap[sound.name] = sound.url
      });
      const mp3s = res.data.map((sound) => sound.name);
      this.setState({
        userMp3s: mp3s,
        soundUrls: soundUrlMap,
      });
      this.getTriggers();
    });
  }

  getTriggers() {
    const context = this;
    if(this.state.triggerBoolean){
      util.getTriggers((res) => {
        // make trigger data user friendly
        const triggers = res.data.map((trigger) => this.convertTrigger(trigger));
        triggers.forEach((trigger) => {
          if(!context.sounds[context.clips[trigger.clip]] && trigger.clip){
            console.log(trigger.clip);
            // TODO: get correct url from db:
            const url = context.state.soundUrls[trigger.clip];
            const fakeDataUrl = '';
            context.sounds[trigger.clip] = new Audio(fakeDataUrl);
          }
        })
        console.log('pretty triggers is: ', triggers);
        this.setState({
          triggers,
        });
      });
    }
  }

  toggleAndGetTrigger() {
    const context = this;
    const boundGetTriggers = this.getTriggers.bind(this);
    const boundToggleTriggers = this.toggleTriggers.bind(this, boundGetTriggers);
    context.hideTriggers(boundToggleTriggers);
  }


  addTrigger(trigger) {
    util.addTrigger(this.makeDbTrigger(trigger), (res) => {
      // TODO: delete console.log:
      console.log('currently adding to trigger: ', trigger);
      this.getTriggers();
    });
  }

  editTrigger(newTrigger, index) {
    util.updateTrigger(this.makeDbTrigger(newTrigger), (res) => {
      this.getTriggers();
    });
  }

  deleteTrigger(trigger, index) {
    util.deleteTrigger(this.makeDbTrigger(trigger), (res) => {
      this.getTriggers();
    });
  }


  render() {
    const {isLoggedIn, rendMic, rendLogin, rendNewUser, rendSettings, username, triggers, message, userMp3s} = this.state;
    return (
      <div>
        <h1>{'shush'}</h1>
        {/* login/out button conditional rendering */}
        <div align="right">
          {username}
          <br/>
          {!isLoggedIn && <button type="button" className="btn btn-lg btn-primary" onClick={this.routeButtonClick.bind(this, 'login')}>login</button>}
          {isLoggedIn && 
            <div>
            <button type="button" className="btn btn-lg btn-toggle" onClick={this.toggleAndGetTrigger.bind(this)}>
              {this.state.triggerBoolean ? 'Notifications: on' : 'Notifications: off'}
            </button>
            &nbsp;&nbsp;
            <button type="button" className="btn btn-lg btn-success" onClick={this.routeButtonClick.bind(this, 'settings')}>
              {this.state.rendSettings ? 'hide triggers' : 'add triggers'}
            </button>
            &nbsp;&nbsp;
            <button type="button" className="btn btn-lg btn-danger" onClick={this.logout.bind(this)}>logout</button>
            </div>}
        </div>
        <br/>
        <canvas id="meter" width="300" height="50"></canvas>
        <br/>
        {/* main functional conditional rendering */}
        {rendMic && !message && <img src={micImage} alt='microphone' className="displayed" width="300px" />}
        {rendMic && message && <h1>{message}</h1>}
        {rendLogin && <LoginForm router={this.routeButtonClick.bind(this)} submitLogin={this.submitLogin.bind(this)}/>}
        {rendNewUser && <NewUserForm router={this.routeButtonClick.bind(this)} submitNewUser={this.submitNewUser.bind(this)}/>}
        {rendSettings && 
          <SettingsForm 
            getSounds={this.getSoundNames.bind(this)}
            userMp3s={userMp3s}
            triggers={triggers} 
            addTrigger={this.addTrigger.bind(this)}
            editTrigger={this.editTrigger.bind(this)}
            deleteTrigger={this.deleteTrigger.bind(this)}
          />
        }
      </div>
    );
  }
}

// {/* CONDITIONAL RENDERING SYNTAX --> {isLoggedIn && <LoggedInUser name={name} />} */}
ReactDOM.render(<App />, document.getElementById('app'));