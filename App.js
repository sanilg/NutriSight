import React, {Component} from 'react';
import {Dimensions, ImageBackground, StyleSheet, Text, View, Modal, AsyncStorage, ActivityIndicator, Alert, TouchableOpacity, KeyboardAvoidingView,} from 'react-native';
import {RNCamera} from 'react-native-camera';
import { SketchCanvas } from '@terrylinla/react-native-sketch-canvas';
import ViewShot from 'react-native-view-shot'
import ImageEditor from "@react-native-community/image-editor";
import Icon from 'react-native-vector-icons/MaterialIcons';
import List from './List'
import Progress from './Progress'
import {createSwitchNavigator, createAppContainer, SwitchNavigator, NavigationEvents} from "react-navigation";
import {createStackNavigator} from "react-navigation-stack"

import PieChart from 'react-native-chart-kit';

console.ignoredYellowBox = ['Warning: Each', 'Warning: Failed'];


var AWS = require('aws-sdk');
var s3 = new AWS.S3({accessKeyId:'AKIA3BSGO4O2CBIRNSMG', secretAccessKey:'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', region:'us-east-1'});

class Home extends Component
{
    constructor(props) {
        super(props);
        this.state = {
          camera: true,
          uri: "",
          base64: "",
          draw: false,
          minX: 0,
          minY: 0,
          maxX: Dimensions.get('window').width,
          maxY: Dimensions.get('window').height - 100,
          nutrition: {},
          food: "",
          viewModal: false,
          data: [],
          indicating: false
        };
      }

    componentDidMount = async () => {
      try {
        const value = await AsyncStorage.getItem('data');
        if (value !== null) {
          this.setState({data: JSON.parse(value)})
        }
      } catch (error) {
        // Error saving data
      }
    }

    _storeData = async (obj) => {
      try {
        var value = await AsyncStorage.getItem('data');
        if (value !== null) {
          value = JSON.parse(value)
          value.push(obj)
          await AsyncStorage.setItem('data', JSON.stringify(value));
        }
        else
        {
          await AsyncStorage.setItem('data', JSON.stringify([obj]));
        }
      } catch (error) {
        // Error saving data
      }
    };

    getNums = (str) => {
      var i = 0;
      tempStrX = ""
      tempStrY = ""
      while (str[i] != ",")
      {
        tempStrX += str[i]
        i++
      }
      i++
      while (i != str.length)
      {
        tempStrY += str[i]
        i++
      }
      var coords = {
        x: parseInt(tempStrX),
        y: parseInt(tempStrY)
      }
      return coords
    }

    clear = () => {
      this.pad.clear()
      this.setState({minX: 0, minY: 0, maxX: Dimensions.get('window').width, maxY:  Dimensions.get('window').height - 100 })
    }

    captureScreen = async (x, y) => {
      this.setState({indicating: true})
      const height = this.state.maxY - this.state.minY
      const width = this.state.maxX - this.state.minX
      const cropData = {
        offset: {x: x, y: y},
        size: {width: Dimensions.get('window').width, height: Dimensions.get('window').height - 100},
        resizeMode: 'contain',
      }

      console.log(x, y)
      await this.refs.viewShot.capture().then(async uri => {
        var tempImage = uri
          const urlKey = parseInt(Date.now())
          var params = {Bucket: 'flip-storage', Key: 'mhacks12/'+ urlKey + '/image.jpg', ContentType: 'image/jpeg'};
          s3.getSignedUrl('putObject', params, (err, url) => {
            const xhr = new XMLHttpRequest()
            xhr.open('PUT', url)
            xhr.onreadystatechange = () => {
                if (xhr.readyState === 4) {
                    if (xhr.status === 200) {
                        console.log("Success")
                        fetch("https://mhacks-12.herokuapp.com/checkFood", {
                          method: 'POST',
                          body: JSON.stringify({
                            imageURL: "https://flip-storage.s3.amazonaws.com/mhacks12/" + urlKey + "/image.jpg"
                          })
                        })
                        .then(response => response.json())
                        .then(async data => {
                          await this.clear() 
                          this.setState({
                            nutrition: data.nutrition,
                            food: data.food,
                            viewModal: true,
                            indicating: false
                          })
                        })
                  } else {
                    this.setState({indicating: false, viewModal: false})
                    alert('Error while sending the image to S3')
                } 
              } 
            }
          xhr.setRequestHeader('Content-Type', 'image/jpeg')
          xhr.send({ uri: uri, type: 'image/jpeg', name: 'profile.jpg'})
        });   
        });
    }
    
    render() {
        return (
          <View style={styles.container}>
    
          

          {this.state.camera && <RNCamera
            ref={ref => {
              this.camera = ref;
            }}
            style={styles.preview}
            type={RNCamera.Constants.Type.back}
            flashMode={RNCamera.Constants.FlashMode.off}
          >
            <View style={{flexDirection: 'row', width: Dimensions.get('window').width, justifyContent: 'space-evenly'}}>
            <TouchableOpacity onPress={() => {this.props.navigation.navigate("Progress")}} style={styles.capture}>
              <Icon size = {24} color = {'black'} name="star"></Icon>
            </TouchableOpacity>
            <TouchableOpacity onPress={this.takePicture.bind(this)} style={styles.capture}>
            <Icon size = {36} color = {'black'} name="camera-alt"></Icon>
           </TouchableOpacity>
            <TouchableOpacity onPress={() => {this.props.navigation.navigate("List")}} style={styles.capture}>
              <Icon size = {24} color = {'black'} name="list"></Icon>
            </TouchableOpacity>
            
            
          </View>
          </RNCamera>
          }
          {!this.state.camera && 
          <View>
          <ViewShot ref="viewShot" options={{ format: "jpg", quality: 0.9 }}>
           
          <Modal
            animationType="slide"
            transparent = {true}
            visible = {this.state.viewModal}
            >
            <View  style = {{width: 200, height: 200, justifyContent: 'center', alignSelf: 'center', backgroundColor: '#fff', borderRadius: 10, marginTop: 100}}>
            {this.state.indicating && <ActivityIndicator animating = {this.state.indicating}/>}
            {!this.state.indicating &&
            <View>
            <TouchableOpacity style = {{width: 100}}
              onPress = {() => this.setState({viewModal: false})}> 
                  <Icon size = {24} color = {'#143f67'} name="cancel"></Icon>
            </TouchableOpacity>
            <Text style = {{fontWeight: '700', textAlign: 'center', margin: 5}}>{(this.state.food).charAt(0).toUpperCase() + (this.state.food).slice(1)}</Text>
            <Text style = {{fontWeight: '300', textAlign: 'center', margin: 5}}>Calories: {parseInt(this.state.nutrition.calories)}</Text>
            <Text style = {{fontWeight: '300', textAlign: 'center', margin: 5}}>Carbs: {this.state.nutrition.carbs}g</Text>
            <Text style = {{fontWeight: '300', textAlign: 'center', margin: 5}}>Protein: {this.state.nutrition.protein}g</Text>
            <Text style = {{fontWeight: '300', textAlign: 'center', margin: 5}}>Fat: {this.state.nutrition.fat}g</Text>
            <View style = {{flexDirection: 'row', width: 200, height: 40, justifyContent: 'space-around'}}>
                <TouchableOpacity style = {{width: 100, height: 40, borderRadius: 10}}
                 onPress = {async () => {
                   await this.setState({viewModal: false})
                   await this._storeData({
                     food: this.state.food,
                     calories: this.state.nutrition.calories,
                     carbs: this.state.nutrition.carbs,
                     protein: this.state.nutrition.protein,
                     fat: this.state.nutrition.fat,
                     timestamp: Date.now()
                   })
                   await this.props.navigation.navigate("List")
                   }}>
                   <Icon size = {36} color = {'#4794dc'} name="add-circle" style = {{alignSelf: 'center'}}></Icon>
                </TouchableOpacity>
                </View>
                
            </View>
                  }
            </View>
            
            
            </Modal>
            
            <ImageBackground
             source = {{uri: this.state.uri}}
             style = {{width: Dimensions.get('window').width, height: Dimensions.get('window').height - 100}}>
            <SketchCanvas
              ref={ref => {
                this.pad = ref;
              }}
              eraseComponent={<View style={styles.functionButton}><Text style={{color: 'white'}}>Eraser</Text></View>}
              style={{position: 'relative', height: Dimensions.get('window').height - 100, opacity: 0.5}}
              strokeColor={'#1261a0'}
              strokeWidth={4}
              onStrokeEnd = {(path) => {
                var maxX = this.getNums(path.path.data[0]).x
                var minX = this.getNums(path.path.data[0]).x
                var maxY = this.getNums(path.path.data[0]).y
                var minY = this.getNums(path.path.data[0]).y
                
                for (var i = 0; i < path.path.data.length; i++)
                {
                  if (this.getNums(path.path.data[i]).x < minX)
                  {
                    minX = this.getNums(path.path.data[i]).x
                  }
                  if (this.getNums(path.path.data[i]).x > maxX)
                  {
                    maxX = this.getNums(path.path.data[i]).x
                  }
                  if (this.getNums(path.path.data[i]).y < minY)
                  {
                    minY = this.getNums(path.path.data[i]).y
                  }
                  if (this.getNums(path.path.data[i]).y > maxY)
                  {
                    maxY = this.getNums(path.path.data[i]).y
                  }
                }

                this.setState({minX: minX, minY: minY, maxX: maxX, maxY: maxY})

                console.log(minX, minY, maxX, maxY)

              }}
            />  
            <View style = {{width: this.state.minX, height: Dimensions.get('window').height - 100, backgroundColor: 'black', position: 'absolute', opacity: 0.9}}>
            </View>
            <View style = {{width: Dimensions.get('window').width - this.state.maxX, height: Dimensions.get('window').height - 100, backgroundColor: 'black', position: 'absolute', alignSelf: 'flex-end', opacity: 0.9}}>
            </View>
            <View style = {{width: Dimensions.get('window').width, height: this.state.minY, backgroundColor: 'black', position: 'absolute', opacity: 0.9}}>
            </View>
            <View style = {{width: Dimensions.get('window').width, height: Dimensions.get('window').height - 100 - this.state.maxY, backgroundColor: 'black', position: 'absolute', marginTop: this.state.maxY, opacity: 0.9}}>
            </View>
            <ViewShot ref="viewShot" options={{ format: "jpg", quality: 0.9 }}>
              
            </ViewShot>

            </ImageBackground> 
            </ViewShot>

            <View style={{flexDirection: 'row', justifyContent: 'center', flexDirection: 'row'}}>
            <TouchableOpacity onPress={this.takePicture.bind(this)} style={styles.capture}>
            <Icon size = {24} color = {'black'} name="camera-alt"></Icon>
            </TouchableOpacity>
            <TouchableOpacity onPress={this.uploadPicture.bind(this)} style={styles.capture}>
            <Icon size = {24} color = {'black'} name="cloud-upload"></Icon>
            </TouchableOpacity>
            </View>

            </View>
          }
      </View>
        );
      }
    
    
      takePicture = async() => {
        if (this.state.camera) {
          const options = { quality: 0.5, base64: true };
          const data = await this.camera.takePictureAsync(options);
          this.setState({camera: false, uri: data.uri, base64: data.base64})

          var uploadUri = Platform.OS === 'ios' ? data.uri.replace('file://', '') : uri
        }
          else
          {
            this.setState({camera: true})
            this.clear()
          }
        }

      uploadPicture = async() => {
        this.pad.clear()
        this.setState({viewModal: true})
        await this.captureScreen(this.state.minX, this.state.minY)
      };
    }
  

  const AppNavigator = createStackNavigator({

    Home : {
      screen : Home,
      navigationOptions : {
        header: null,
      }
    },
    List : {
      screen : List,
      navigationOptions : {
        headerStyle: {
          backgroundColor: '#2168ab',
          borderBottomColor: '#1e1e1e',
          borderBottomWidth: 1
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        headerTitle: "Nutrition Log"
      }
    },
    Progress : {
      screen : Progress,
      navigationOptions : {
        headerStyle: {
          backgroundColor: '#2168ab',
          borderBottomColor: '#1e1e1e',
          borderBottomWidth: 0
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        headerTitle: "Goals"
      }
    }
  });

  class App extends Component
  {
  render() {
    return (
        <AppNavigator />
    );
  } 
  }

  App = createAppContainer(AppNavigator);


export default App
    
    

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: 'black',
    position: 'relative'
  },
  preview: {
    justifyContent: 'flex-end',
    alignItems: 'center',
    height: Dimensions.get('window').height
  },
  capture: {
    flex: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 20,
    padding: 15,
    paddingHorizontal: 20,
    alignSelf: 'center',
    margin: 20,

  },
  functionButton: {
    marginHorizontal: 2.5, marginVertical: 8, height: 30, width: 60,
    backgroundColor: '#39579A', justifyContent: 'center', alignItems: 'center', borderRadius: 5,
  }
});
