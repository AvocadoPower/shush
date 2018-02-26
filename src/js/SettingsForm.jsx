import React from 'react';
import TriggerRow from './TriggerRow.jsx'
import axios from 'axios'

class SettingsForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      cGate: null,
      cMessage: null,
      cClip: null,
      cPhone: null,
      cStart: null,
      cStop: null,
    };
  }

  onGChange(e) {
    this.setState({
      cGate: e.target.value
    });
  }
  onMChange(e) {
    this.setState({
      cMessage: e.target.value
    });
  }
  onPChange(e) {
    this.setState({
      cPhone: e.target.value
    });
  }
  onSChange(e) {
    console.log('changed start time: ', e.target.value)
    this.setState({
      cStart: e.target.value
    });
  }
  onEChange(e) {
    console.log('changed end time: ', e.target.value)
    this.setState({
      cStop: e.target.value
    });
  }
  onCChange(e) {
    this.setState({
      cClip: e.target.value
    });
  }
  onFChange(e) {
    const context = this;
    // when a file is selected, convert it to buffer array and send to server
    const formData = new FormData();
    const file = e.target.files[0]
    if(file){
      const fileReader = new FileReader();
      fileReader.onload = function(event){
        console.log(event.target.result);
        let myAudio = new Audio(event.target.result);
        myAudio.play();
        formData.append('name', file.name);
        formData.append('url', event.target.result);
        // TODO: UNCCOMMENT FOLLOWING LINES
        axios.post('/sound', formData)
        .then(response => {
          let {getSounds} = context.props;
          getSounds();
        })
        .catch((err) => {console.log(`got err: ${err} in axios request in settingsForm.jsx`)});
      }
      fileReader.readAsDataURL(file);
      // fileReader.readAsArrayBuffer(file);
    } else{
      console.log('no mp3 was selected');
    }
 
  }

  submitTrigger(gate, text, phone_number, clip, listen_start, listen_stop) {
    const newTrig = {
      gate: gate,
      message: text,
      phone_number: phone_number,
      clip: clip,
      listen_start: listen_start, 
      listen_stop: listen_stop,
    }
    console.log('submitting trigger\n', newTrig)
    this.props.addTrigger(newTrig);
  }
  render() {
    const { triggers , addTrigger , editTrigger , deleteTrigger, userMp3s} = this.props;
    const { cGate, cMessage, cPhone, cClip, cStart, cStop} = this.state;
    return (
      <div>
        <table className="table">
          <caption>my triggers</caption>
          <thead>
            <tr>
              <th>#</th>
              <th>noise limit</th>
              <th>text message</th>
              <th>phone number</th>
              <th>audio clip</th>
              <th>stop at</th>
              <th>resume at</th>
              <th>edit</th>
              <th>remove</th>
            </tr>
          </thead>
          <tbody>
            {triggers.map((trigger, index) => (
                <TriggerRow 
                  key={index} 
                  index={index + 1} 
                  trigger={trigger} 
                  addTrigger={addTrigger}
                  editTrigger={editTrigger}
                  deleteTrigger={deleteTrigger}
                />
            ))}
          </tbody>
        </table>
        create a new trigger
        <br/>
        <div className="form-inline">
          <div className="form-group">
            <label htmlFor="newNoiseLimit">noise limit*</label>
            &nbsp;
            <select className="form-control" onChange={this.onGChange.bind(this)}>
              <option value="">select limit</option>
              <option>10 dB - breathing</option>
              <option>20 dB - whisper</option>
              <option>50 dB - private conversation</option>
              <option>60 dB - group conversation</option>
              <option>80 dB - busy restaurant</option>
              <option>100 dB - jackhammer</option>
            </select>
          </div>
          &nbsp;&nbsp;
          <div className="form-group">
            <label htmlFor="newMessage">text message*</label>
            &nbsp;
            <input type="text" className="form-control" id="newMessage" placeholder="message" onChange={this.onMChange.bind(this)}/>
          </div>
          &nbsp;&nbsp;
          <div className="form-group">
            <label htmlFor="phoneNumber">phone number</label>
            &nbsp;
            <input type="text" className="form-control" id="phoneNumber" placeholder="phone number" onChange={this.onPChange.bind(this)}/>
          </div>
          &nbsp;&nbsp;
          <div className="form-group">
            <label htmlFor="newAudioClip">audio clip*</label>
            &nbsp;
            <select className="form-control" onChange={this.onCChange.bind(this)}>
              <option value="">select clip</option>
              <option>"shhhhhhh"</option>
              <option>pin drop</option>
              <option>horn honk</option>
              <option>radio interruption</option>
              <option>Sam says "stop right there"</option>
              <option>Sam says "be like Fonzie"</option>
              <option>Sam says "back off"</option>
              <option>Sam says "get the F out my face"</option>
              <option>Sam says "shut the F up"</option>
              {userMp3s.map((element) => {
                return <option>{element}</option>
              })}
            </select>
          </div>
          &nbsp;&nbsp;
          <div className="form-group">
            <label htmlFor="startTime">stop time</label>
            &nbsp;
            <input type="time" className="form-control" id="startTime" placeholder="select" onChange={this.onSChange.bind(this)}/>
          </div>
          &nbsp;&nbsp;
          <div className="form-group">
            <label htmlFor="endTime">resume time</label>
            &nbsp;
            <input type="time" className="form-control" id="endTime" placeholder="select" onChange={this.onEChange.bind(this)}/>
          </div>
          &nbsp;&nbsp;

          <div className="form-group">
            <label htmlFor="mp3upload">upload your own mp3</label>
            &nbsp;
            <input id="mp3upload" type="file" accept=".mp3" onChange={this.onFChange.bind(this)}></input>
          </div>
          &nbsp;&nbsp;&nbsp;
          <br/>
          {(!cGate || !cMessage || !cClip) && 
            <fieldset disabled="disabled">
              <button type="button" className="btn btn-success">add trigger</button>
            </fieldset>
          }
          {cGate && cMessage && cClip &&
            <fieldset>
              <button type="button" className="btn btn-success" onClick={this.submitTrigger.bind(this, cGate, cMessage, cPhone, cClip, cStart, cStop)}>add trigger</button>
            </fieldset>
          }
        </div>
      </div>
    )
  }
}

export default SettingsForm;
