import React, {Component} from 'react';
import {Dimensions, StyleSheet, TextInput, View, Text, AsyncStorage, Keyboard, ScrollView, TouchableOpacity, KeyboardAvoidingView,} from 'react-native';
import {RNCamera} from 'react-native-camera';
import { SketchCanvas } from '@terrylinla/react-native-sketch-canvas';
import ViewShot from 'react-native-view-shot'
import ImageEditor from "@react-native-community/image-editor";
import Icon from 'react-native-vector-icons/MaterialIcons';
import { PieChart } from 'react-native-svg-charts'


var AWS = require('aws-sdk');
var s3 = new AWS.S3({accessKeyId:'AKIA3BSGO4O2CBIRNSMG', secretAccessKey:'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', region:'us-east-1'});

const colors = ["#4794dc", '#2168ab', '#143f67']

export default class Progress extends Component
{
    constructor(props) {
        super(props);
        this.state = {
          calGoal: 0, 
          totalCals: 0,
          tempCalGoal: 0,
          message: "",
          color: 'red',
          symbol: "",
          totalPro: 0,
          totalFat: 0,
          totalCarb: 0, 
          streak: 0,
          data: []
        };
      }

    componentDidMount = async () => {
    
      try {
        const value = await AsyncStorage.getItem('data');
        if (value !== null) {
          await this.setState({data: JSON.parse(value)})
          const data = this.state.data
          for (var i = 0; i < data.length; i++)
          {
            if (new Date(data[i].timestamp).toDateString() == new Date(Date.now()).toDateString())
            {
                this.setState({totalCals: this.state.totalCals + data[i].calories})
            }
            this.setState({
              totalCarb : this.state.totalCarb + parseInt(data[i].carbs),
              totalPro : this.state.totalPro + parseInt(data[i].protein),
              totalFat : this.state.totalFat + parseInt(data[i].fat),
            })
            
          }
        }
      } catch (error) {
        // Error saving data
      }

      try {
        const value = await AsyncStorage.getItem('calGoal');
        if (value !== null) {
          await this.setState({calGoal: parseInt(JSON.parse(value))})
          console.log(this.state.calGoal)
        }
      } catch (error) {
        // Error saving data
      }
      this.checkCalGoal()
      this.getStreak()
    }

    _storeData = async (obj) => {
        try {
            await AsyncStorage.setItem('calGoal', JSON.stringify(this.state.tempCalGoal));
            this.checkCalGoal()
        } catch (error) {
          console.log(error)
        }
      };

    getStreak = () => {
      var sum = 0;

      console.log(this.state.data)

      for (var i = this.state.data.length - 1; i >= 0; i--)
      {
        if (this.state.data[i].timestamp >= Date.now() - ((sum + 1) * 24 * 60 * 60 * 1000) &&
            this.state.data[i].timestamp <= Date.now() - ((sum) * 24 * 60 * 60 * 1000))
        {
          sum += 1;
        }
      }
     
      this.setState({streak: sum})
    }

    checkCalGoal = () => {
        if (parseInt(this.state.calGoal) < parseInt(this.state.totalCals))
        {
            this.setState({message: "You are over your calorie goal by " + parseInt(this.state.totalCals - this.state.calGoal) + " calories", symbol: ">"})
        }
        else if (parseInt(this.state.calGoal) > parseInt(this.state.totalCals))
        {
            this.setState({message: "You are under your calorie goal by " + parseInt(this.state.calGoal - this.state.totalCals) + " calories", symbol: "<"})
        }
        else
        {
            this.setState({message: "You are at your calorie goal of " + this.state.calGoal + " calories", symbol: "="})
        }

        if (Math.abs(this.state.calGoal - this.state.totalCals) <= 100)
        {
            this.setState({color: 'green'})
        }
        else if (Math.abs(this.state.calGoal - this.state.totalCals) <= 200)
        {
            this.setState({color: '#DFCA19'})
        }
        else
        {
            this.setState({color: '#DF0019'})
        }
    }
    
    render() {
        return (
          <ScrollView style = {{flex: 1, backgroundColor: '#fff', height: Dimensions.get('window').height}}>
             <View style = {{flexDirection: 'row'}}>
             <TextInput 
             keyboardType = "numeric"
             onChangeText = {(text) => {
                this.setState({
                    tempCalGoal: text
                })
             }}
             placeholder = "  Enter Calorie Goal"
             style = {{backgroundColor: '#fff', borderColor: 'lightgray', borderWidth: 0.5, height: 40, width: Dimensions.get('window').width - 70, color: '#2168ab'}}
             />
             <TouchableOpacity
             style = {{backgroundColor: '#fff', width: 70, borderColor: 'lightgray', borderWidth: 0.5, height: 40}}
             onPress = {() => {
                 this._storeData(this.state.tempCalGoal)
                 this.setState({calGoal: this.state.tempCalGoal})
                 Keyboard.dismiss()
             }}
             >
                 <Text style = {{textAlign: 'center', marginTop: 10, color: '#2168ab'}}>Set</Text>
             </TouchableOpacity>
             </View>
             <View style = {{flexDirection: 'row', justifyContent: 'space-around', width: Dimensions.get('window').width, marginTop: 10}}>
                <View>
                 <View style = {{backgroundColor: '#2168ab', borderRadius: 50, height: 100, width: 100}}>
                     <Text style = {{marginTop: 27, alignSelf: 'center', fontSize: 36, color: '#fff'}}>{parseInt(this.state.totalCals)}</Text>
                 </View>
                 <Text style = {{textAlign: 'center', color: '#2168ab', marginTop: 5}}>Today's Calories</Text>
                 </View>
                 
                 <Text style = {{color: '#2168ab', marginTop: 5, marginRight: 5, fontSize: 72, fontWeight: '200'}}>{this.state.symbol}</Text>

                 <View>
                 <View style = {{backgroundColor: '#2168ab', borderRadius: 50, height: 100, width: 100}}>
                     <Text style = {{marginTop: 27, alignSelf: 'center', fontSize: 36, color: '#fff'}}>{this.state.calGoal}</Text>
                 </View>
                 <Text style = {{textAlign: 'center', color: '#2168ab', marginTop: 5}}>Calorie Goal</Text>
                 </View>
                 
             </View>

             {/*<Text style = {{textAlign: 'center', color: '#fff', marginTop: 20}}>{this.state.message}</Text>*/}

             <View></View>

             <PieChart 
             innerRadius = "40%"
             padAngle = "0"
             style={{ height: 200, marginTop: 40 }} data={[this.state.totalCarb, this.state.totalFat, this.state.totalPro].filter((value) => value > 0)
                .map((value, index) => ({
                    value,
                    svg: {
                        fill: colors[index],
                        onPress: () => console.log('press', index),
                    },
                    key: `pie-${index}`,
                }))} />

             <View style = {{backgroundColor: '#fff', padding: 10, borderRadius: 10, marginTop: 40, width: 180, alignSelf: 'center', marginBottom: 10}}>
                
                <View style = {{flexDirection: 'row', justifyContent: 'space-between', marginTop: 2}}>
                  <View style = {{width: 20, height: 20, backgroundColor: colors[0], marginHorizontal: 5}}></View>
                  <Text style = {{color: colors[2]}}>Carbs: {((this.state.totalCarb / (this.state.totalCarb + this.state.totalFat + this.state.totalPro)) * 100).toFixed(1) + "%"}</Text>
                </View>
                
                <View style = {{flexDirection: 'row', justifyContent: 'space-between', marginTop: 2}}>
                  <View style = {{width: 20, height: 20, backgroundColor: colors[1], marginHorizontal: 5}}></View>
                  <Text style = {{color: colors[2]}}>Fat: {(this.state.totalFat / (this.state.totalCarb + this.state.totalFat + this.state.totalPro) * 100).toFixed(1) + "%"}</Text>
                </View>

                <View style = {{flexDirection: 'row', justifyContent: 'space-between', marginVertical: 2}}>
                  <View style = {{width: 20, height: 20, backgroundColor: colors[2], marginHorizontal: 5}}></View>
                  <Text style = {{color: colors[2]}}>Protein: {(this.state.totalPro / (this.state.totalCarb + this.state.totalFat + this.state.totalPro) * 100 ).toFixed(1) + "%"}</Text>
                </View>  
               
            </View>
              
            <View style = {{flexDirection: 'row', alignSelf: 'center'}}>
              <Icon name = "whatshot" color = '#2168ab' size = {30} style = {{marginTop: 10}}></Icon> 
              <Text style = {{fontSize: 24, color: colors[1], textAlign: 'center', fontWeight: '300', marginVertical: 10}}>Hot Streak: {this.state.streak}</Text>
              <Icon name = "whatshot" color = '#2168ab' size = {30} style = {{marginTop: 10}}></Icon>
            </View>

            <View style = {{alignSelf: 'center', width: Dimensions.get('window').width, height: 1, backgroundColor: '#2168ab', marginVertical: 10}}></View>

            <View>
              <Text style = {{fontSize: 24, color: colors[1], marginHorizontal: 10}}>Leaderboard</Text>
              <View style = {{flexDirection: 'row', justifyContent: 'space-between', margin: 10}}>
                <Text style = {{color: colors[1]}}>Noah</Text>
                <View style = {{flexDirection: 'row'}}>
                <Text style = {{color: colors[1]}}>4</Text>
                <Icon name = "whatshot" color = '#2168ab' size = {18}></Icon>
                </View>
              </View>
              <View style = {{flexDirection: 'row', justifyContent: 'space-between', margin: 10}}>
                <Text style = {{color: colors[1]}}>Sanil</Text>
                <View style = {{flexDirection: 'row'}}>
                <Text style = {{color: colors[1]}}>3</Text>
                <Icon name = "whatshot" color = '#2168ab' size = {18}></Icon>
                </View>
              </View>
              <View style = {{flexDirection: 'row', justifyContent: 'space-between', margin: 10}}>
                <Text style = {{color: colors[1]}}>Stacey</Text>
                <View style = {{flexDirection: 'row'}}>
                <Text style = {{color: colors[1]}}>2</Text>
                <Icon name = "whatshot" color = '#2168ab' size = {18}></Icon>
                </View>
              </View>
              <View style = {{flexDirection: 'row', justifyContent: 'space-between', margin: 10}}>
                <Text style = {{color: colors[1]}}>Justin</Text>
                <View style = {{flexDirection: 'row'}}>
                <Text style = {{color: colors[1]}}>1</Text>
                <Icon name = "whatshot" color = '#2168ab' size = {18}></Icon>
                </View>
              </View>
              <View style = {{flexDirection: 'row', justifyContent: 'space-between', margin: 10}}>
                <Text style = {{color: colors[1]}}>Abby</Text>
                <View style = {{flexDirection: 'row'}}>
                <Text style = {{color: colors[1]}}>1</Text>
                <Icon name = "whatshot" color = '#2168ab' size = {18}></Icon>
                </View>
              </View>
            </View>


            
          </ScrollView>
        );
      }

    }
  

    

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
    height: Dimensions.get('window').height - 200
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
