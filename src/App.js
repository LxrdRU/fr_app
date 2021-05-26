import logo from './logo.svg';
import Particles from 'react-particles-js';
import Clarifai from 'clarifai';
import './App.css';
import React, { Component } from 'react';
import Navigation from './components/navigation/Navigation';
import FaceRecognition from './components/facerecognition/FaceRecognition';
import Logo from './components/logo/Logo';
import ImageLinkForm from './components/imagelinkform/ImageLinkForm';
import SignIn from './components/signin/SignIn';
import Register from './components/register/Register';
import Rank from './components/rank/Rank';

const app = new Clarifai.App({
  apiKey:'032e76a123a5484ca3613ecae12015e1'
});

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
class App extends Component {
  constructor(){
    super();
    this.state = {
      input:'',
      imageUrl:'',
      box:{},
      route: 'signin',
      isSignedIn: false
    }
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
    app.models
    .predict(
      Clarifai.CELEBRITY_MODEL,
      this.state.input)
    .then(response => this.showFaceBox(this.getFaceLocation(response)))
    .catch(err => console.log(err));
  }

  onRouteChange =(route) =>{
    if (route === 'signout'){
      this.setState({isSignedIn: false})
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
            <Rank />
            <ImageLinkForm 
            onInputChange={this.onInputChange} 
            onSubmit={this.onSubmit}
            />
            <FaceRecognition box={this.state.box} imageUrl={this.state.imageUrl}/>
          </div>
        : (
          this.state.route === 'signin'
          ? <SignIn onRouteChange={this.onRouteChange} />
          : <Register onRouteChange={this.onRouteChange} />
          ) 
      }
      </div>
    );
  }  
}

export default App;
