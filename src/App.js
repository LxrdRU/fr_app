import logo from './logo.svg';
import Particles from 'react-particles-js';
import './App.css';
import React, { Component } from 'react';
import Navigation from './components/navigation/Navigation';
import FaceRecognition from './components/facerecognition/FaceRecognition';
import Logo from './components/logo/Logo';
import ImageLinkForm from './components/imagelinkform/ImageLinkForm';
import SignIn from './components/signin/SignIn';
import Register from './components/register/Register';
import Rank from './components/rank/Rank';


const particles = {
  particles: {
    number:{
      value: 60,
      density:{
        enable: true,
        value_area: 800
      }
    }
  }
}  
const initialState = {
      input:'',
      imageUrl:'',
      box:{},
      route: 'signin',
      isSignedIn: false,
      user:{
        id:'',
        name: '',
        email: '',
        password: '',
        entries: 0,
        joined: ''
      }
    }              
class App extends Component {
  constructor(){
    super();
    this.state = initialState;
  }

  loadUser = (data) => {
    this.setState({user: {
      id: data.id,
      name: data.name,
      email: data.email,
      entries: data.entries,
      joined: data.joined
    }})
  }


  getFaceLocation = (response) =>{
    const name = response.outputs[0].data.regions[0].data.concepts[0].name;
    const face = response.outputs[0].data.regions[0].region_info.bounding_box;
    const image = document.getElementById('inputimage');
    const width = Number(image.width);
    const height = Number(image.height);
    const value = face.right_col; 
    const partone = value * width;
    const calc = width - partone;
    return{
      name: name,
      leftCol: face.left_col * width,
      topRow: face.top_row * height,
      rightCol: calc,
      bottomRow: height - (face.bottom_row * height)
    }
  }

  showFaceBox = (box) => {
    this.setState({box:box});
  }

  onInputChange =(event) =>{
    this.setState({input: event.target.value});
  }
  onSubmit = () =>{
    this.setState({imageUrl:this.state.input});
    fetch('https://murmuring-lowlands-61880.herokuapp.com/imageurl',{
          method: 'post',
          headers: {'Content-Type': 'application/json',
          'Accept': 'application/json'},
          body: JSON.stringify({
            input: this.state.input
          })
        })
    .then(response => response.json())
    .then(response => {
      if (response) {
        fetch('https://murmuring-lowlands-61880.herokuapp.com/image',{
          method: 'put',
          headers: {'Content-Type': 'application/json',
          'Accept': 'application/json'},
          body: JSON.stringify({
            id: this.state.user.id
          })
        })
        .then(response => response.json())
        .then(count =>{
          this.setState(Object.assign(this.state.user, {entries: count}))
        })
        .catch(console.log)
      }
      this.showFaceBox(this.getFaceLocation(response))
    })
    .catch(err => console.log(err));
  }

  onRouteChange =(route) =>{
    if (route === 'signout'){
      this.setState(initialState)
    }else if(route === 'home'){
      this.setState({isSignedIn: true})
    }
    this.setState({route: route})
  }
  render(){
    return (
      <div className="App">
        <Particles className='particles'
          params={particles} 
        />
        <Navigation 
       isSignedIn={this.state.isSignedIn} 
       onRouteChange={this.onRouteChange}/>
        { this.state.route === 'home'
        ? <div>
            <Logo />
            <Rank name={this.state.user.name} entries={this.state.user.entries}/>
            <ImageLinkForm 
            onInputChange={this.onInputChange} 
            onSubmit={this.onSubmit}
            />
            <FaceRecognition box={this.state.box} imageUrl={this.state.imageUrl}/>
          </div>
        : (
          this.state.route === 'signin'
          ? <SignIn loadUser={this.loadUser} onRouteChange={this.onRouteChange} />
          : <Register loadUser={this.loadUser} onRouteChange={this.onRouteChange} />
          ) 
      }
      </div>
    );
  }  
}

export default App;
